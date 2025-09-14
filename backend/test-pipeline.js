const PipelineProcessor = require('./utils/pipelineProcessor');
const path = require('path');

async function testPipeline() {
  // Use a test image path - replace with your actual image
  const testImagePath = path.join(__dirname, 'uploads', 'test.png');

  console.log('Testing pipeline with image:', testImagePath);

  try {
    const result = await PipelineProcessor.processImage(testImagePath);
    console.log('Pipeline result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✓ Pipeline successful!');
      console.log('Extracted data:', result.data);
    } else {
      console.log('\n✗ Pipeline failed:', result.error);
    }
  } catch (error) {
    console.error('Error testing pipeline:', error);
  }
}

testPipeline();