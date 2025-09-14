const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function testPipelineDirectly() {
  console.log('=== Testing Python Pipeline Directly ===\n');

  const pipelineDir = path.join(__dirname, '../Faker/pipeline');
  const pythonScript = path.join(pipelineDir, 'pipeline.py');
  const testImage = path.join(pipelineDir, 'output_new.png');
  const csvPath = path.join(pipelineDir, 'fra_data.csv');

  console.log('Pipeline directory:', pipelineDir);
  console.log('Python script:', pythonScript);
  console.log('Test image:', testImage);
  console.log('Expected CSV output:', csvPath);

  // Check if files exist
  try {
    await fs.access(pythonScript);
    console.log('✓ Pipeline script exists');
  } catch {
    console.error('✗ Pipeline script not found at:', pythonScript);
    return;
  }

  try {
    await fs.access(testImage);
    console.log('✓ Test image exists');
  } catch {
    console.error('✗ Test image not found at:', testImage);
    console.log('Creating a sample test image...');

    // Try to use generate_test_csv.py to create sample data
    const generateScript = path.join(pipelineDir, 'generate_test_csv.py');
    try {
      await fs.access(generateScript);
      console.log('Running generate_test_csv.py to create sample data...');

      return new Promise((resolve) => {
        const python = spawn('python', [generateScript], {
          cwd: pipelineDir
        });

        python.stdout.on('data', (data) => {
          console.log('Generate output:', data.toString());
        });

        python.stderr.on('data', (data) => {
          console.error('Generate error:', data.toString());
        });

        python.on('close', async (code) => {
          if (code === 0) {
            console.log('✓ Sample CSV created');

            // Read and display the CSV
            try {
              const csvContent = await fs.readFile(csvPath, 'utf8');
              console.log('\n=== Sample CSV Content ===');
              console.log(csvContent);
              console.log('========================\n');

              console.log('Sample data is available at:', csvPath);
              console.log('You can now upload an image through the frontend to test the pipeline.');
            } catch (err) {
              console.error('Failed to read CSV:', err);
            }
          } else {
            console.error('Failed to generate sample data');
          }
          resolve();
        });
      });
    } catch {
      console.log('Generate script not found. Please ensure you have a test image at:', testImage);
      return;
    }
  }

  // Delete existing CSV
  try {
    await fs.unlink(csvPath);
    console.log('✓ Deleted existing CSV');
  } catch {
    console.log('✓ No existing CSV to delete');
  }

  console.log('\n--- Running Pipeline ---\n');

  // Check for venv python
  const venvPython = path.join(pipelineDir, 'venv', 'Scripts', 'python.exe');
  let pythonExe = 'python';

  try {
    await fs.access(venvPython);
    pythonExe = venvPython;
    console.log('✓ Using venv Python:', venvPython);
  } catch {
    console.log('⚠ Venv not found, using system Python');
  }

  return new Promise((resolve) => {
    const python = spawn(pythonExe, [pythonScript], {
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

    python.on('close', async (code) => {
      console.log('\n--- Pipeline Finished ---\n');
      console.log('Exit code:', code);

      if (code !== 0) {
        console.error('✗ Pipeline failed');
        console.error('Error output:', stderr);

        console.log('\n=== Troubleshooting ===');
        console.log('1. Make sure Python dependencies are installed:');
        console.log('   cd ../Faker/pipeline');
        console.log('   pip install -r requirements.txt');
        console.log('\n2. Ensure the model files exist in:');
        console.log('   ../Faker/pipeline/model-best/');
        console.log('\n3. Check that output_new.png exists in:');
        console.log('   ../Faker/pipeline/');
      } else {
        console.log('✓ Pipeline completed successfully');

        // Check if CSV was created
        try {
          const csvContent = await fs.readFile(csvPath, 'utf8');
          console.log('\n=== Generated CSV Content ===');
          console.log(csvContent);
          console.log('============================\n');

          // Parse CSV to show extracted data
          const lines = csvContent.split('\n');
          if (lines.length > 1) {
            const headers = lines[0].split(',');
            const values = lines[1].split(',');

            console.log('=== Extracted Data ===');
            headers.forEach((header, i) => {
              if (values[i]) {
                console.log(`${header}: ${values[i]}`);
              }
            });
            console.log('====================\n');
          }

          console.log('✓ Pipeline is working correctly!');
          console.log('✓ Data extraction successful');
          console.log('\nThe extracted data will be mapped to the database when you upload through the frontend.');
        } catch (err) {
          console.error('✗ CSV file not created');
          console.error('The pipeline ran but did not produce output');
        }
      }

      resolve();
    });
  });
}

// Run the test
testPipelineDirectly().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('Test failed:', err);
});