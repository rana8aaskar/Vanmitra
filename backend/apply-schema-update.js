const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function applySchemaUpdate() {
  console.log('Applying schema updates...');

  try {
    // Read the schema update SQL
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'db', 'update-claims-schema.sql'), 'utf8');

    // Split by semicolon to execute statements one by one
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.query(statement);
      }
    }

    console.log('Schema updated successfully!');

    // Verify the columns
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'claims'
      ORDER BY ordinal_position
    `);

    console.log('\nClaims table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

applySchemaUpdate();