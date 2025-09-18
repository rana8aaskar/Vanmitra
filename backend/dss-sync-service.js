const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { spawn } = require('child_process');
const { Pool } = require('pg');
require('dotenv').config();

class DSSSyncService {
  constructor() {
    this.pool = null;
    this.isDbConnected = false;
    this.initializePool();
  }

  initializePool() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      this.pool = new Pool({
        connectionString: connectionString,
        ssl: connectionString.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : false,
        connectionTimeoutMillis: 5000,
        max: 5
      });

      // Test connection
      this.pool.query('SELECT 1')
        .then(() => {
          this.isDbConnected = true;
          console.log('✅ Database connected for DSS sync');
        })
        .catch(err => {
          console.log('⚠️ Database not available, using CSV-only mode');
          this.isDbConnected = false;
        });
    }
  }

  // Create DSS table in database
  async createDSSTable() {
    if (!this.isDbConnected || !this.pool) {
      console.log('⚠️ Database not connected, skipping table creation');
      return false;
    }

    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS dss_recommendations (
          id SERIAL PRIMARY KEY,
          claim_id INTEGER UNIQUE NOT NULL,
          claimant_name VARCHAR(255),
          age NUMERIC,
          gender VARCHAR(20),
          state VARCHAR(255),
          district VARCHAR(255),
          block_tehsil VARCHAR(255),
          gram_panchayat VARCHAR(255),
          village VARCHAR(255),
          category VARCHAR(50),
          tax_payer VARCHAR(10),
          claim_type VARCHAR(50),
          status_of_claim VARCHAR(50),
          annual_income NUMERIC,
          jal_jeevan_mission_priority NUMERIC,
          dajgua_priority NUMERIC,
          mgnrega_priority NUMERIC,
          pm_kisan_priority NUMERIC,
          pmay_priority NUMERIC,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await this.pool.query('CREATE INDEX IF NOT EXISTS idx_dss_claim_id ON dss_recommendations(claim_id)');
      await this.pool.query('CREATE INDEX IF NOT EXISTS idx_dss_state ON dss_recommendations(state)');
      await this.pool.query('CREATE INDEX IF NOT EXISTS idx_dss_district ON dss_recommendations(district)');
      await this.pool.query('CREATE INDEX IF NOT EXISTS idx_dss_village ON dss_recommendations(village)');

      console.log('✅ DSS table created/verified');
      return true;
    } catch (error) {
      console.error('Error creating DSS table:', error.message);
      return false;
    }
  }

  // Read CSV file
  async readCSV(csvPath) {
    return new Promise((resolve, reject) => {
      const results = [];

      if (!fsSync.existsSync(csvPath)) {
        console.log(`⚠️ CSV file not found: ${csvPath}`);
        return resolve([]);
      }

      fsSync.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Import CSV to database
  async importCSVToDatabase(csvPath) {
    if (!this.isDbConnected || !this.pool) {
      console.log('⚠️ Database not connected, skipping import');
      return { success: false, message: 'Database not connected' };
    }

    try {
      const records = await this.readCSV(csvPath);
      console.log(`📊 Found ${records.length} records in CSV`);

      let inserted = 0;
      let updated = 0;
      let errors = 0;

      for (const record of records) {
        try {
          // Check if claim_id exists
          const checkResult = await this.pool.query(
            'SELECT id FROM dss_recommendations WHERE claim_id = $1',
            [record.claim_id]
          );

          if (checkResult.rows.length > 0) {
            // Update existing record
            await this.pool.query(`
              UPDATE dss_recommendations SET
                claimant_name = $2, age = $3, gender = $4, state = $5,
                district = $6, block_tehsil = $7, gram_panchayat = $8,
                village = $9, category = $10, tax_payer = $11,
                claim_type = $12, status_of_claim = $13, annual_income = $14,
                jal_jeevan_mission_priority = $15, dajgua_priority = $16,
                mgnrega_priority = $17, pm_kisan_priority = $18,
                pmay_priority = $19, updated_at = CURRENT_TIMESTAMP
              WHERE claim_id = $1
            `, [
              record.claim_id,
              record['Claimant Name'],
              parseFloat(record.Age) || null,
              record.Gender,
              record.State,
              record.District,
              record['Block/Tehsil'],
              record['Gram Panchayat'],
              record.Village,
              record.Category,
              record['Tax Payer'],
              record['Claim Type'],
              record['Status of Claim'],
              parseFloat(record['Annual Income']) || null,
              parseFloat(record.Jal_Jeevan_Mission_Priority) || 0,
              parseFloat(record.DAJGUA_Priority) || 0,
              parseFloat(record.MGNREGA_Priority) || 0,
              parseFloat(record.PM_KISAN_Priority) || 0,
              parseFloat(record.PMAY_Priority) || 0
            ]);
            updated++;
          } else {
            // Insert new record
            await this.pool.query(`
              INSERT INTO dss_recommendations (
                claim_id, claimant_name, age, gender, state, district,
                block_tehsil, gram_panchayat, village, category, tax_payer,
                claim_type, status_of_claim, annual_income,
                jal_jeevan_mission_priority, dajgua_priority, mgnrega_priority,
                pm_kisan_priority, pmay_priority
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            `, [
              record.claim_id,
              record['Claimant Name'],
              parseFloat(record.Age) || null,
              record.Gender,
              record.State,
              record.District,
              record['Block/Tehsil'],
              record['Gram Panchayat'],
              record.Village,
              record.Category,
              record['Tax Payer'],
              record['Claim Type'],
              record['Status of Claim'],
              parseFloat(record['Annual Income']) || null,
              parseFloat(record.Jal_Jeevan_Mission_Priority) || 0,
              parseFloat(record.DAJGUA_Priority) || 0,
              parseFloat(record.MGNREGA_Priority) || 0,
              parseFloat(record.PM_KISAN_Priority) || 0,
              parseFloat(record.PMAY_Priority) || 0
            ]);
            inserted++;
          }
        } catch (error) {
          console.error(`Error processing claim_id ${record.claim_id}:`, error.message);
          errors++;
        }
      }

      console.log(`✅ Import complete: ${inserted} inserted, ${updated} updated, ${errors} errors`);
      return { success: true, inserted, updated, errors };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, error: error.message };
    }
  }

  // Run DSS Python engine
  async runDSSEngine() {
    return new Promise((resolve, reject) => {
      const pythonPath = 'python3';
      const scriptPath = path.join(__dirname, '../DSS/DSS.py');
      const workingDir = path.join(__dirname, '../DSS');

      console.log('🐍 Running DSS engine...');

      // Check if Python script exists
      if (!fsSync.existsSync(scriptPath)) {
        return reject({ success: false, message: 'DSS.py not found' });
      }

      const pythonProcess = spawn(pythonPath, [scriptPath], {
        cwd: workingDir
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('DSS:', data.toString().trim());
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('DSS Error:', data.toString().trim());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ DSS engine completed successfully');
          resolve({
            success: true,
            message: 'DSS engine ran successfully',
            output: output
          });
        } else {
          console.error('❌ DSS engine failed with code:', code);
          reject({
            success: false,
            message: 'DSS engine failed',
            error: errorOutput || 'Unknown error',
            code: code
          });
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start DSS engine:', error);
        reject({
          success: false,
          message: 'Failed to start DSS engine',
          error: error.message
        });
      });
    });
  }

  // Main sync function - run DSS engine and sync to database
  async syncDSSData() {
    try {
      console.log('🔄 Starting DSS sync process...');

      // Step 1: Ensure table exists
      await this.createDSSTable();

      // Step 2: Run DSS engine to generate/update CSV
      try {
        await this.runDSSEngine();
        console.log('✅ DSS engine completed');
      } catch (error) {
        console.error('⚠️ DSS engine failed, using existing CSV:', error.message);
      }

      // Step 3: Import CSV to database
      const csvPath = path.join(__dirname, '../DSS/dss_definitive_master_db_new.csv');
      const importResult = await this.importCSVToDatabase(csvPath);

      console.log('🎉 DSS sync process complete!');
      return importResult;
    } catch (error) {
      console.error('❌ DSS sync failed:', error);
      throw error;
    }
  }

  // Get recommendations from database or CSV
  async getRecommendations(filters = {}) {
    // Try database first
    if (this.isDbConnected && this.pool) {
      try {
        let query = 'SELECT * FROM dss_recommendations WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.claim_id) {
          query += ` AND claim_id = $${paramIndex++}`;
          params.push(filters.claim_id);
        }
        if (filters.state) {
          query += ` AND state = $${paramIndex++}`;
          params.push(filters.state);
        }
        if (filters.district) {
          query += ` AND district = $${paramIndex++}`;
          params.push(filters.district);
        }
        if (filters.village) {
          query += ` AND village = $${paramIndex++}`;
          params.push(filters.village);
        }

        query += ' ORDER BY claim_id';

        const result = await this.pool.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Database query failed, falling back to CSV:', error.message);
      }
    }

    // Fallback to CSV
    const csvPath = path.join(__dirname, '../DSS/dss_definitive_master_db_new.csv');
    const records = await this.readCSV(csvPath);

    // Convert and filter CSV records
    let filteredRecords = records.map(record => ({
      claim_id: parseInt(record.claim_id),
      claimant_name: record['Claimant Name'],
      age: parseFloat(record.Age) || null,
      gender: record.Gender,
      state: record.State,
      district: record.District,
      block_tehsil: record['Block/Tehsil'],
      gram_panchayat: record['Gram Panchayat'],
      village: record.Village,
      category: record.Category,
      tax_payer: record['Tax Payer'],
      claim_type: record['Claim Type'],
      status_of_claim: record['Status of Claim'],
      annual_income: parseFloat(record['Annual Income']) || null,
      jal_jeevan_mission_priority: parseFloat(record.Jal_Jeevan_Mission_Priority) || 0,
      dajgua_priority: parseFloat(record.DAJGUA_Priority) || 0,
      mgnrega_priority: parseFloat(record.MGNREGA_Priority) || 0,
      pm_kisan_priority: parseFloat(record.PM_KISAN_Priority) || 0,
      pmay_priority: parseFloat(record.PMAY_Priority) || 0
    }));

    // Apply filters
    if (filters.claim_id) {
      filteredRecords = filteredRecords.filter(r => r.claim_id === parseInt(filters.claim_id));
    }
    if (filters.state) {
      filteredRecords = filteredRecords.filter(r => r.state === filters.state);
    }
    if (filters.district) {
      filteredRecords = filteredRecords.filter(r => r.district === filters.district);
    }
    if (filters.village) {
      filteredRecords = filteredRecords.filter(r => r.village === filters.village);
    }

    return filteredRecords;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Create singleton instance
const dssSyncService = new DSSSyncService();

// Run if executed directly
if (require.main === module) {
  dssSyncService.syncDSSData()
    .then(result => {
      console.log('✅ DSS sync completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ DSS sync failed:', error);
      process.exit(1);
    });
}

module.exports = dssSyncService;