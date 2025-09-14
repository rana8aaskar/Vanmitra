const fs = require('fs');
const path = require('path');
const db = require('./index');

async function initDatabase() {
  try {
    console.log('Initializing database schema...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await db.query(schema);

    console.log('✓ Database tables created successfully!');
    console.log('✓ Tables created:');
    console.log('  - users');
    console.log('  - claims');
    console.log('  - documents');
    console.log('  - claim_history');
    console.log('✓ Indexes and triggers created');

    // Verify tables were created
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nExisting tables in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();