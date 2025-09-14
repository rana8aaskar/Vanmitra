const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse/sync');

async function testCsvDirect() {
  console.log('=== Testing CSV Reading Directly ===\n');

  const csvPath = path.join(__dirname, '../Faker/pipeline/fra_data.csv');
  console.log('CSV path:', csvPath);

  try {
    const csvContent = await fs.readFile(csvPath, 'utf8');
    console.log('CSV Content:\n', csvContent);

    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log('\n=== Parsed Records ===');
    console.log(JSON.stringify(records, null, 2));

    if (records.length > 0) {
      console.log('\n=== Mapped to Database Fields ===');
      const mapped = mapCsvToDatabase(records[0]);
      console.log(JSON.stringify(mapped, null, 2));
    }
  } catch (err) {
    console.error('Error reading CSV:', err);
  }
}

function mapCsvToDatabase(csvRow) {
  return {
    name: csvRow.CLAIMANT_NAME || '',
    spouse_name: csvRow.SPOUSE_NAME || '',
    patta_title_no: csvRow.PATTA_TITLE_NO || '',
    aadhaar_no: csvRow.AADHAAR_NO || '',
    category: csvRow.CATEGORY || '',
    village: csvRow.VILLAGE || '',
    gram_panchayat: csvRow.GRAM_PANCHAYAT || '',
    panchayat: csvRow.GRAM_PANCHAYAT || '',
    tehsil: csvRow.TEHSIL || '',
    district: csvRow.DISTRICT || '',
    state: csvRow.STATE || '',
    claim_type: csvRow.CLAIM_TYPE || '',
    land_claimed: csvRow.LAND_CLAIMED || '',
    area_of_land: csvRow.LAND_CLAIMED || '',
    land_use: csvRow.LAND_USE || '',
    annual_income: csvRow.ANNUAL_INCOME || '',
    tax_payer: csvRow.TAX_PAYER || '',
    boundary_description: csvRow.BOUNDARY_DESCRIPTION || '',
    geo_coordinates: csvRow.GEO_COORDINATES || '',
    status_of_claim: csvRow.STATUS_OF_CLAIM || '',
    date_of_submission: csvRow.DATE_OF_SUBMISSION || null,
    date_of_decision: csvRow.DATE_OF_DECISION || null,
    water_body: csvRow.WATER_BODY || '',
    irrigation_source: csvRow.IRRIGATION_SOURCE || '',
    infrastructure_present: csvRow.INFRASTRUCTURE_PRESENT || '',
    father_husband_name: csvRow.SPOUSE_NAME || '',
    khasra_number: csvRow.PATTA_TITLE_NO || '',
    nature_of_possession: csvRow.LAND_USE || '',
    address: csvRow.BOUNDARY_DESCRIPTION || '',
    status: 'pending'
  };
}

testCsvDirect();