const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const db = require('../db');
const DSSRecommendationEngine = require('./dssRecommendationEngine');

class DSSEngineService {
  /**
   * Run the DSS.py script to generate updated recommendations
   */
  static async runDSSEngine() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting DSS Engine...');

      const dssScriptPath = path.join(__dirname, '..', '..', 'DSS', 'DSS.py');
      const dssWorkDir = path.join(__dirname, '..', '..', 'DSS');

      // Use venv Python on Windows, regular python3 on Linux
      const isWindows = process.platform === 'win32';
      const pythonExecutable = isWindows
        ? path.join(__dirname, '..', '..', 'Faker', 'pipeline', 'venv', 'Scripts', 'python.exe')
        : 'python3';

      const pythonProcess = spawn(pythonExecutable, [dssScriptPath], {
        cwd: dssWorkDir,
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('DSS Engine:', output.trim());
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        console.error('DSS Engine Error:', error.trim());
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`DSS Engine exited with code ${code}: ${stderr}`));
        } else {
          console.log('✅ DSS Engine completed successfully');
          resolve({ stdout, stderr, success: true });
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('Failed to start DSS Engine:', err);
        reject(err);
      });
    });
  }

  /**
   * Import updated DSS data from CSV to database
   */
  static async importDSSDataToDatabase() {
    const csvFilePath = path.join(__dirname, '..', '..', 'DSS', 'dss_definitive_master_db_new.csv');

    try {
      // Check if CSV file exists
      await fs.access(csvFilePath);

      // Run the batch import script
      const importScript = require('../import-dss-batch');
      await importScript();

      console.log('✅ DSS data imported to database successfully');
      return { success: true };
    } catch (error) {
      console.error('Error importing DSS data:', error);
      throw error;
    }
  }

  /**
   * Get recommendations for a specific claim based on priorities
   * Now uses the expert recommendation engine
   */
  static async getRecommendationsForClaim(claimId) {
    try {
      // Use the new recommendation engine for detailed analysis
      const detailedRecommendations = await DSSRecommendationEngine.generateRecommendations(claimId);

      if (detailedRecommendations.error) {
        return null;
      }

      // Transform to maintain backward compatibility while adding new features
      const schemes = detailedRecommendations.recommendations
        .filter(scheme => scheme.status === 'recommended')
        .map(scheme => ({
          name: scheme.name,
          priority: scheme.priority,
          description: scheme.description,
          eligibility: scheme.reasoning,
          type: scheme.type,
          benefits: scheme.benefits
        }));

      return {
        claimId: detailedRecommendations.claimId,
        claimantName: detailedRecommendations.claimantName,
        location: detailedRecommendations.location,
        demographics: detailedRecommendations.demographics,
        priorities: detailedRecommendations.dssScores,
        recommendedSchemes: schemes,
        maxPriority: Math.max(...Object.values(detailedRecommendations.dssScores)),
        // New detailed analysis
        detailedAnalysis: detailedRecommendations.analysis,
        summary: detailedRecommendations.summary,
        allSchemes: detailedRecommendations.recommendations
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Get detailed expert recommendations (new method)
   */
  static async getDetailedRecommendations(claimId) {
    return await DSSRecommendationEngine.generateRecommendations(claimId);
  }

  /**
   * Get top priority villages for different schemes
   */
  static async getTopPriorityVillages(scheme, limit = 10) {
    try {
      let priorityColumn;
      switch (scheme.toLowerCase()) {
        case 'jal_jeevan':
        case 'jal jeevan mission':
          priorityColumn = 'jal_jeevan_mission_priority';
          break;
        case 'dajgua':
          priorityColumn = 'dajgua_priority';
          break;
        case 'mgnrega':
          priorityColumn = 'mgnrega_priority';
          break;
        case 'pm_kisan':
        case 'pm-kisan':
          priorityColumn = 'pm_kisan_priority';
          break;
        case 'pmay':
        case 'pm awas yojana':
          priorityColumn = 'pmay_priority';
          break;
        default:
          throw new Error('Invalid scheme name');
      }

      const query = `
        SELECT
          state,
          district,
          village,
          COUNT(*) as beneficiary_count,
          AVG(${priorityColumn}) as avg_priority,
          AVG(annual_income) as avg_income
        FROM dss_recommendations
        WHERE ${priorityColumn} > 0
        GROUP BY state, district, village
        ORDER BY avg_priority DESC
        LIMIT $1
      `;

      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting top priority villages:', error);
      throw error;
    }
  }

  /**
   * Full pipeline: Run DSS engine and sync to database
   */
  static async runFullPipeline() {
    try {
      console.log('🔄 Starting full DSS pipeline...');

      // Step 1: Run DSS.py to generate updated CSV
      await this.runDSSEngine();

      // Step 2: Import CSV data to database
      await this.importDSSDataToDatabase();

      console.log('✅ Full DSS pipeline completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in DSS pipeline:', error);
      throw error;
    }
  }
}

module.exports = DSSEngineService;