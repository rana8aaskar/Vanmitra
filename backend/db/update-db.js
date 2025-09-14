const fs = require('fs');
const path = require('path');
const db = require('./index');

async function updateDatabase() {
  try {
    console.log('Updating database schema...');

    // Read the update SQL file
    const schemaPath = path.join(__dirname, 'update-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema updates
    const statements = schema.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      }
    }

    console.log('✓ Database schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateDatabase();