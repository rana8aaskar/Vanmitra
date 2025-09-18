const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { spawn } = require('child_process');
const db = require('../db');

class DSSService {
  constructor() {
    this.dssDataCache = null;
    this.lastCacheUpdate = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Load DSS data from CSV file (fallback when DB is not available)
  async loadDSSDataFromCSV() {
    const csvPath = path.join(__dirname, '../../DSS/dss_definitive_master_db_new.csv');
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            claim_id: parseInt(data.claim_id),
            claimant_name: data['Claimant Name'],
            age: parseFloat(data.Age) || null,
            gender: data.Gender,
            state: data.State,
            district: data.District,
            block_tehsil: data['Block/Tehsil'],
            gram_panchayat: data['Gram Panchayat'],
            village: data.Village,
            category: data.Category,
            tax_payer: data['Tax Payer'],
            claim_type: data['Claim Type'],
            status_of_claim: data['Status of Claim'],
            annual_income: parseFloat(data['Annual Income']) || null,
            jal_jeevan_mission_priority: parseFloat(data.Jal_Jeevan_Mission_Priority) || 0,
            dajgua_priority: parseFloat(data.DAJGUA_Priority) || 0,
            mgnrega_priority: parseFloat(data.MGNREGA_Priority) || 0,
            pm_kisan_priority: parseFloat(data.PM_KISAN_Priority) || 0,
            pmay_priority: parseFloat(data.PMAY_Priority) || 0
          });
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Load DSS data from database (preferred method)
  async loadDSSDataFromDB() {
    try {
      const query = `
        SELECT * FROM dss_recommendations
        ORDER BY claim_id
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error loading DSS data from database:', error);
      // Fallback to CSV
      return this.loadDSSDataFromCSV();
    }
  }

  // Get DSS data with caching
  async getDSSData() {
    const now = Date.now();

    // Check if cache is valid
    if (this.dssDataCache && this.lastCacheUpdate &&
        (now - this.lastCacheUpdate) < this.cacheTimeout) {
      return this.dssDataCache;
    }

    // Load fresh data
    try {
      this.dssDataCache = await this.loadDSSDataFromDB();
      this.lastCacheUpdate = now;
      return this.dssDataCache;
    } catch (error) {
      console.error('Error getting DSS data:', error);
      throw error;
    }
  }

  // Get recommendations for a specific claim or filter
  async getRecommendations(filters = {}) {
    const dssData = await this.getDSSData();

    let filteredData = dssData;

    // Apply filters
    if (filters.claim_id) {
      filteredData = filteredData.filter(d => d.claim_id === parseInt(filters.claim_id));
    }
    if (filters.state) {
      filteredData = filteredData.filter(d => d.state === filters.state);
    }
    if (filters.district) {
      filteredData = filteredData.filter(d => d.district === filters.district);
    }
    if (filters.village) {
      filteredData = filteredData.filter(d => d.village === filters.village);
    }

    // Sort by priorities
    const recommendations = filteredData.map(record => {
      // Calculate overall priority score
      const priorityScores = [
        { scheme: 'Jal Jeevan Mission', priority: record.jal_jeevan_mission_priority },
        { scheme: 'DAJGUA', priority: record.dajgua_priority },
        { scheme: 'MGNREGA', priority: record.mgnrega_priority },
        { scheme: 'PM-KISAN', priority: record.pm_kisan_priority },
        { scheme: 'PMAY', priority: record.pmay_priority }
      ];

      // Sort schemes by priority for this record
      priorityScores.sort((a, b) => b.priority - a.priority);

      return {
        ...record,
        recommended_schemes: priorityScores.filter(s => s.priority > 0),
        top_scheme: priorityScores[0]?.scheme || 'None',
        overall_priority: Math.max(...priorityScores.map(s => s.priority))
      };
    });

    // Sort by overall priority
    recommendations.sort((a, b) => b.overall_priority - a.overall_priority);

    return recommendations;
  }

  // Run DSS Python script to update data
  async runDSSEngine() {
    return new Promise((resolve, reject) => {
      const pythonPath = 'python3';
      const scriptPath = path.join(__dirname, '../../DSS/DSS.py');

      console.log('Running DSS engine:', scriptPath);

      const pythonProcess = spawn(pythonPath, [scriptPath], {
        cwd: path.join(__dirname, '../../DSS')
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('DSS Engine:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('DSS Engine Error:', data.toString());
      });

      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          console.log('DSS Engine completed successfully');

          // Reload the data after update
          try {
            // Import the updated CSV to database
            const { syncDSSData } = require('../import-dss-data');
            await syncDSSData();

            // Clear cache to force reload
            this.dssDataCache = null;
            this.lastCacheUpdate = null;

            resolve({
              success: true,
              message: 'DSS engine ran successfully',
              output: output
            });
          } catch (error) {
            console.error('Error syncing DSS data after engine run:', error);
            resolve({
              success: true,
              message: 'DSS engine ran but sync failed',
              output: output,
              syncError: error.message
            });
          }
        } else {
          reject({
            success: false,
            message: 'DSS engine failed',
            error: errorOutput || 'Unknown error',
            code: code
          });
        }
      });

      pythonProcess.on('error', (error) => {
        reject({
          success: false,
          message: 'Failed to start DSS engine',
          error: error.message
        });
      });
    });
  }

  // Get statistics for dashboard
  async getStatistics() {
    const dssData = await this.getDSSData();

    const stats = {
      total_claims: dssData.length,
      by_state: {},
      by_scheme: {
        jal_jeevan_mission: 0,
        dajgua: 0,
        mgnrega: 0,
        pm_kisan: 0,
        pmay: 0
      },
      high_priority_claims: 0
    };

    // Calculate statistics
    dssData.forEach(record => {
      // State statistics
      if (!stats.by_state[record.state]) {
        stats.by_state[record.state] = 0;
      }
      stats.by_state[record.state]++;

      // Scheme eligibility
      if (record.jal_jeevan_mission_priority > 0.5) stats.by_scheme.jal_jeevan_mission++;
      if (record.dajgua_priority > 0.5) stats.by_scheme.dajgua++;
      if (record.mgnrega_priority > 0.5) stats.by_scheme.mgnrega++;
      if (record.pm_kisan_priority > 0.5) stats.by_scheme.pm_kisan++;
      if (record.pmay_priority > 0.5) stats.by_scheme.pmay++;

      // High priority claims
      const maxPriority = Math.max(
        record.jal_jeevan_mission_priority,
        record.dajgua_priority,
        record.mgnrega_priority,
        record.pm_kisan_priority,
        record.pmay_priority
      );
      if (maxPriority > 0.7) stats.high_priority_claims++;
    });

    return stats;
  }
}

module.exports = new DSSService();