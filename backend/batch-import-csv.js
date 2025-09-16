const fs = require('fs');
const csv = require('csv-parse');
const pool = require('./db');
const path = require('path');

// Path to your CSV file
const CSV_FILE_PATH = path.join(__dirname, '..', 'forms.csv');
const BATCH_SIZE = 100; // Process 100 records at a time

// Function to parse date strings
function parseDate(dateStr) {
  if (!dateStr || dateStr === '') return null;

  // Handle DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  }
  return null;
}

// Function to clean and prepare data
function prepareData(row) {
  return {
    claimant_name: row['Claimant Name'] || null,
    spouse_name: row['Spouse Name'] || null,
    age: row['Age'] ? parseInt(row['Age']) : null,
    gender: row['Gender'] || null,
    aadhaar_no: row['Aadhaar No'] || null,
    category: row['Category'] || null,
    village: row['Village'] || null,
    gram_panchayat: row['Gram Panchayat'] || null,
    block_tehsil: row['Block/Tehsil'] || null,
    district: row['District'] || null,
    state: row['State'] || null,
    claim_type: row['Claim Type'] || null,
    land_claimed: row['Area of Land Claimed'] || null,
    land_use: row['Land Use'] || null,
    annual_income: row['Annual Income'] || null,
    tax_payer: row['Tax Payer'] || null,
    boundary_description: row['Boundary Description'] || null,
    geo_coordinates: row['Geo-Coordinates'] || null,
    verified_by_gram_sabha: row['Verified by Gram Sabha'] || null,
    status_of_claim: row['Status of Claim'] || 'pending',
    claim_status: row['Status of Claim'] ? row['Status of Claim'].toLowerCase() : 'pending',
    date_of_submission: parseDate(row['Date of Submission']),
    date_of_decision: parseDate(row['Date of Decision']),
    patta_title_no: row['Patta Title No'] || null,
    water_body: row['Nearby Water Body'] || null,
    nearby_water_body: row['Nearby Water Body'] || null,
    irrigation_source: row['Irrigation Source'] || null,
    infrastructure_present: row['Infrastructure Present'] || null,
    claimant_signature: row['Claimant Signature/Thumb'] || null,
    gram_sabha_chairperson: row['Gram Sabha Chairperson'] || null,
    forest_dept_officer: row['Forest Dept Officer'] || null,
    revenue_dept_officer: row['Revenue Dept Officer'] || null,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  };
}

async function importBatch(records) {
  if (records.length === 0) return { success: 0, error: 0 };

  const firstRecord = prepareData(records[0]);
  const columns = Object.keys(firstRecord).filter(key => firstRecord[key] !== undefined);

  // Build multi-row INSERT query
  const values = [];
  const queryRows = [];

  records.forEach((record, recordIndex) => {
    const data = prepareData(record);
    const rowValues = [];
    columns.forEach((col, colIndex) => {
      const paramNum = recordIndex * columns.length + colIndex + 1;
      rowValues.push(`$${paramNum}`);
      values.push(data[col]);
    });
    queryRows.push(`(${rowValues.join(', ')})`);
  });

  const query = `
    INSERT INTO claims (${columns.join(', ')})
    VALUES ${queryRows.join(', ')}
    ON CONFLICT DO NOTHING
    RETURNING id, claimant_name
  `;

  try {
    const result = await pool.query(query, values);
    return { success: result.rowCount, error: 0 };
  } catch (error) {
    console.error('Batch insert error:', error.message);
    return { success: 0, error: records.length };
  }
}

async function importCSVToDatabase() {
  console.log('Starting batch CSV import process...');
  console.log(`Batch size: ${BATCH_SIZE} records`);

  try {
    // Check if CSV file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error('CSV file not found at:', CSV_FILE_PATH);
      process.exit(1);
    }

    // Read and parse CSV file
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');

    csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, async (err, records) => {
      if (err) {
        console.error('Error parsing CSV:', err);
        process.exit(1);
      }

      console.log(`Found ${records.length} records in CSV file`);

      let totalSuccess = 0;
      let totalError = 0;
      let batchCount = 0;

      // Process in batches
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        batchCount++;

        process.stdout.write(`\rProcessing batch ${batchCount}/${Math.ceil(records.length / BATCH_SIZE)}...`);

        const result = await importBatch(batch);
        totalSuccess += result.success;
        totalError += result.error;
      }

      console.log('\n\n=== Import Summary ===');
      console.log(`Total records processed: ${records.length}`);
      console.log(`Successfully imported: ${totalSuccess}`);
      console.log(`Errors/Skipped: ${totalError + (records.length - totalSuccess - totalError)}`);
      console.log(`Batches processed: ${batchCount}`);

      // Verify the import
      const countResult = await pool.query('SELECT COUNT(*) FROM claims');
      console.log(`\nTotal claims in database: ${countResult.rows[0].count}`);

      // Show statistics by state
      const statsResult = await pool.query(`
        SELECT state, COUNT(*) as count,
               SUM(CASE WHEN claim_status = 'approved' THEN 1 ELSE 0 END) as approved,
               SUM(CASE WHEN claim_status = 'pending' THEN 1 ELSE 0 END) as pending,
               SUM(CASE WHEN claim_status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM claims
        WHERE state IS NOT NULL
        GROUP BY state
        ORDER BY count DESC
        LIMIT 10
      `);

      console.log('\nTop 10 states by number of claims:');
      console.table(statsResult.rows);

      // Show sample data
      const sampleResult = await pool.query(`
        SELECT id, claimant_name, state, district, claim_type, status_of_claim
        FROM claims
        WHERE claimant_name IS NOT NULL
        ORDER BY id DESC
        LIMIT 5
      `);

      console.log('\nSample of recently imported data:');
      console.table(sampleResult.rows);

      process.exit(0);
    });

  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  }
}

// Check if the script is being run directly
if (require.main === module) {
  importCSVToDatabase();
}

module.exports = { importCSVToDatabase };