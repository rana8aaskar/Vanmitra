const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse/sync');

// Add logging
const DEBUG = true;

class PipelineProcessor {
  static async processImage(imagePath) {
    try {
      if (DEBUG) console.log('Processing image:', imagePath);

      // Copy image to pipeline directory
      const pipelineDir = path.join(__dirname, '../../Faker/pipeline');
      const targetImagePath = path.join(pipelineDir, 'output_new.png');
      const csvPath = path.join(pipelineDir, 'fra_data.csv');

      if (DEBUG) {
        console.log('Pipeline dir:', pipelineDir);
        console.log('Target image path:', targetImagePath);
        console.log('CSV path:', csvPath);
      }

      // Copy image to pipeline directory for processing
      console.log('Copying image to pipeline directory...');
      try {
        await fs.copyFile(imagePath, targetImagePath);
        console.log('✓ Image copied to:', targetImagePath);
      } catch (err) {
        console.error('Failed to copy image:', err.message);
        return {
          success: false,
          error: 'Failed to copy image for processing',
          data: null
        };
      }

      // Delete existing CSV to force new processing
      try {
        await fs.unlink(csvPath);
        console.log('✓ Deleted old CSV file');
      } catch (e) {
        // No existing CSV, that's fine
      }

      // Run the REAL pipeline.py - NO FALLBACKS
      const pythonPath = path.join(pipelineDir, 'venv', 'Scripts', 'python.exe');
      const scriptPath = path.join(pipelineDir, 'pipeline.py');

      console.log('Running REAL pipeline.py for image processing...');

      // Check if venv python exists, otherwise use system python
      let pythonExe;
      try {
        await fs.access(pythonPath);
        pythonExe = pythonPath;
      } catch {
        pythonExe = 'python';
      }

      return new Promise((resolve, reject) => {
        // Convert WSL path to Windows path
        const windowsPipelineDir = pipelineDir.replace('/mnt/c/', 'C:\\').replace(/\//g, '\\');
        const windowsPythonPath = `${windowsPipelineDir}\\venv\\Scripts\\python.exe`;
        const windowsScriptPath = `${windowsPipelineDir}\\pipeline.py`;

        console.log('Running pipeline.py with Windows Python...');
        console.log('Python:', windowsPythonPath);
        console.log('Script:', windowsScriptPath);

        // Use cmd.exe to run Windows Python from WSL
        const python = spawn('cmd.exe', ['/c', windowsPythonPath, windowsScriptPath], {
          cwd: pipelineDir
        });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
          stdout += data.toString();
          console.log('Pipeline output:', data.toString());
        });

        python.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('Pipeline error:', data.toString());
        });

        python.on('error', (err) => {
          console.error('Failed to start pipeline:', err);
          resolve({
            success: false,
            error: 'Pipeline failed to start: ' + err.message,
            data: null
          });
        });

        python.on('close', async (code) => {
          if (code !== 0) {
            console.error('Pipeline failed with code:', code);
            console.error('Error output:', stderr);
            resolve({
              success: false,
              error: stderr || 'Pipeline processing failed',
              data: null
            });
            return;
          }

          try {
            // Read the generated CSV
            const csvContent = await fs.readFile(csvPath, 'utf8');
            const records = csv.parse(csvContent, {
              columns: true,
              skip_empty_lines: true
            });

            if (records.length > 0) {
              // Get the LAST row (most recent extraction)
              const latestRecord = records[records.length - 1];
              const extractedData = this.mapCsvToDatabase(latestRecord);
              console.log('✓ Extracted data from pipeline:', latestRecord.CLAIMANT_NAME || 'Unknown');
              resolve({
                success: true,
                data: extractedData,
                rawCsv: latestRecord,
                method: 'pipeline'
              });
            } else {
              resolve({
                success: false,
                error: 'No data extracted from image',
                data: null
              });
            }
          } catch (error) {
            console.error('Error reading CSV:', error);
            resolve({
              success: false,
              error: 'Failed to read extracted data',
              data: null
            });
          }
        });
      });
    } catch (error) {
      console.error('Pipeline processor error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  static mapCsvToDatabase(csvRow) {
    // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
    const convertDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return null;
    };

    // Direct mapping from CSV to database columns (lowercase)
    return {
      claimant_name: csvRow.CLAIMANT_NAME || '',
      spouse_name: csvRow.SPOUSE_NAME || '',
      age: csvRow.AGE || null,
      gender: csvRow.GENDER || 'Not Specified',
      patta_title_no: csvRow.PATTA_TITLE_NO || '',
      aadhaar_no: csvRow.AADHAAR_NO || '',
      category: csvRow.CATEGORY || '',
      village: csvRow.VILLAGE || '',
      gram_panchayat: csvRow.GRAM_PANCHAYAT || '',
      tehsil: csvRow.TEHSIL || '',
      district: csvRow.DISTRICT || '',
      state: csvRow.STATE || '',
      claim_type: csvRow.CLAIM_TYPE || '',
      land_claimed: csvRow.LAND_CLAIMED || '',
      land_use: csvRow.LAND_USE || '',
      annual_income: csvRow.ANNUAL_INCOME || '',
      tax_payer: csvRow.TAX_PAYER || '',
      boundary_description: csvRow.BOUNDARY_DESCRIPTION || '',
      geo_coordinates: csvRow.GEO_COORDINATES || '',
      status_of_claim: csvRow.STATUS_OF_CLAIM || '',
      date_of_submission: convertDate(csvRow.DATE_OF_SUBMISSION),
      date_of_decision: convertDate(csvRow.DATE_OF_DECISION),
      water_body: csvRow.WATER_BODY || '',
      irrigation_source: csvRow.IRRIGATION_SOURCE || '',
      infrastructure_present: csvRow.INFRASTRUCTURE_PRESENT || '',

      // System status field
      claim_status: 'pending'
    };
  }
}

module.exports = PipelineProcessor;