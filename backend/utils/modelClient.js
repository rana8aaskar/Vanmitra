const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class ModelClient {
  // Process file with AI model
  static async processFile(filePath) {
    try {
      // Check if using local model or API endpoint
      if (process.env.MODEL_TYPE === 'LOCAL') {
        return this.processWithLocalModel(filePath);
      } else {
        return this.processWithAPIEndpoint(filePath);
      }
    } catch (error) {
      console.error('Model processing error:', error);
      // Return error state but don't fail completely
      return {
        success: false,
        error: error.message,
        extracted_data: this.getEmptyTemplate(),
        raw_text: 'Processing failed'
      };
    }
  }

  // Process with local AI model (if available)
  static async processWithLocalModel(filePath) {
    try {
      // Try to use the process_image_simple.py script (works without spacy)
      const modelPath = path.join(__dirname, '../../../Faker/pipeline/process_image_simple.py');
      const venvPython = path.join(__dirname, '../../../Faker/pipeline/venv/Scripts/python.exe');

      // Execute Python script
      const { spawn } = require('child_process');

      return new Promise((resolve, reject) => {
        // Try venv python first, fall back to system python
        const pythonExe = fs.existsSync(venvPython) ? venvPython : 'python';
        const python = spawn(pythonExe, [modelPath, filePath]);
        let dataString = '';
        let errorString = '';

        python.stdout.on('data', (data) => {
          dataString += data.toString();
        });

        python.stderr.on('data', (data) => {
          errorString += data.toString();
          console.error(`Python error: ${data}`);
        });

        python.on('close', (code) => {
          if (code !== 0) {
            console.error('Python script failed:', errorString);
            resolve({
              success: false,
              extracted_data: this.getEmptyTemplate(),
              raw_text: 'Processing failed: ' + errorString
            });
          } else {
            try {
              const result = JSON.parse(dataString);
              resolve({
                success: result.success,
                extracted_data: result.extracted_data || this.getEmptyTemplate(),
                raw_text: result.raw_text || ''
              });
            } catch (e) {
              console.error('Failed to parse Python output:', e);
              resolve({
                success: false,
                extracted_data: this.getEmptyTemplate(),
                raw_text: dataString
              });
            }
          }
        });
      });
    } catch (error) {
      console.error('Local model error:', error);
      return {
        success: false,
        extracted_data: this.getEmptyTemplate(),
        raw_text: 'Local model not available'
      };
    }
  }

  // Process with external API endpoint
  static async processWithAPIEndpoint(filePath) {
    try {
      const modelEndpoint = process.env.MODEL_ENDPOINT || 'http://localhost:5001/process';

      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      // Send to model API
      const response = await axios.post(modelEndpoint, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000 // 30 second timeout
      });

      // Parse response
      if (response.data) {
        return {
          success: true,
          extracted_data: this.parseModelResponse(response.data),
          raw_text: response.data.raw_text || JSON.stringify(response.data)
        };
      }

      return {
        success: false,
        extracted_data: this.getEmptyTemplate(),
        raw_text: 'No data returned from model'
      };
    } catch (error) {
      console.error('API endpoint error:', error);

      // Return error - no mock data
      console.error('API endpoint failed:', error.message);

      return {
        success: false,
        extracted_data: this.getEmptyTemplate(),
        raw_text: error.message
      };
    }
  }

  // Parse model response into structured format
  static parseModelResponse(data) {
    return {
      claimant_name: data.claimant_name || data.name || '',
      father_husband_name: data.father_husband_name || data.father_name || '',
      aadhaar_no: data.aadhaar_no || data.aadhaar || '',
      category: data.category || '',
      village: data.village || '',
      panchayat: data.panchayat || '',
      block: data.block || data.tehsil || '',
      district: data.district || '',
      state: data.state || '',
      land_type: data.land_type || data.type_of_land || '',
      land_area: data.land_area || data.area || '',
      land_use: data.land_use || data.use || '',
      income: data.income || data.annual_income || '',
      taxpayer: data.taxpayer || false,
      boundary_desc: data.boundary_desc || data.boundaries || '',
      geo_coordinates: data.geo_coordinates || data.coordinates || '',
      patta_no: data.patta_no || data.patta || '',
      assets: data.assets || '',
      date_submitted: data.date_submitted || new Date().toISOString().split('T')[0]
    };
  }

  // Get empty template for failed processing
  static getEmptyTemplate() {
    return {
      claimant_name: '',
      father_husband_name: '',
      aadhaar_no: '',
      category: '',
      village: '',
      panchayat: '',
      block: '',
      district: '',
      state: '',
      land_type: '',
      land_area: '',
      land_use: '',
      income: '',
      taxpayer: false,
      boundary_desc: '',
      geo_coordinates: '',
      patta_no: '',
      assets: '',
      date_submitted: new Date().toISOString().split('T')[0]
    };
  }

  // Return error instead of mock data
  static getMockData(filePath) {
    const filename = path.basename(filePath);
    console.error('❌ Pipeline processing failed - Python environment not configured');
    console.error('Please ensure:');
    console.error('1. Python environment is activated');
    console.error('2. Dependencies are installed (pip install -r Faker/pipeline/requirements.txt)');
    console.error('3. The pipeline script exists at Faker/pipeline/pipeline.py');

    return {
      success: false,
      extracted_data: this.getEmptyTemplate(),
      raw_text: `Pipeline processing failed for: ${filename}`,
      error: 'Pipeline not configured. Please set up the Python environment and install dependencies.'
    };
  }
}

module.exports = ModelClient;