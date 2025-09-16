const fs = require('fs');
const csv = require('csv-parse');
const pool = require('./db');
const path = require('path');

// Path to your CSV file
const CSV_FILE_PATH = path.join(__dirname, '..', 'forms.csv');

// Function to parse date strings
function parseDate(dateStr) {
  if (!dateStr || dateStr === '') return null;

  // Handle DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
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


    // Set default user_id to 1 (you may want to change this)
    user_id: 1,

    // Set timestamps
    created_at: new Date(),
    updated_at: new Date()
  };
}

async function importCSVToDatabase() {
  console.log('Starting CSV import process...');

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

      let successCount = 0;
      let errorCount = 0;

      // Process each record
      for (const record of records) {
        try {
          const data = prepareData(record);

          // Build the INSERT query
          const columns = Object.keys(data).filter(key => data[key] !== undefined);
          const values = columns.map((_, index) => `$${index + 1}`);
          const query = `
            INSERT INTO claims (${columns.join(', ')})
            VALUES (${values.join(', ')})
            ON CONFLICT DO NOTHING
            RETURNING id, claimant_name
          `;

          const queryValues = columns.map(col => data[col]);

          const result = await pool.query(query, queryValues);
          if (result.rows.length > 0) {
            console.log(`✓ Imported: ${result.rows[0].claimant_name} (ID: ${result.rows[0].id})`);
          } else {
            console.log(`⚠ Skipped (duplicate): ${record['Claimant Name']}`);
          }
          successCount++;

        } catch (error) {
          console.error(`✗ Error importing record for ${record['Claimant Name']}:`, error.message);
          errorCount++;
        }
      }

      // Summary
      console.log('\n=== Import Summary ===');
      console.log(`Total records: ${records.length}`);
      console.log(`Successfully imported: ${successCount}`);
      console.log(`Errors: ${errorCount}`);

      // Verify the import
      const countResult = await pool.query('SELECT COUNT(*) FROM claims');
      console.log(`Total claims in database: ${countResult.rows[0].count}`);

      // Show sample data
      const sampleResult = await pool.query(`
        SELECT id, claimant_name, state, district, status_of_claim
        FROM claims
        LIMIT 5
      `);
      console.log('\nSample imported data:');
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