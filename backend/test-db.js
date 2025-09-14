const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  // Try different SSL configurations
  const configs = [
    { name: 'SSL true', ssl: true },
    { name: 'SSL with rejectUnauthorized false', ssl: { rejectUnauthorized: false } },
    { name: 'No SSL', ssl: false },
    { name: 'SSL require mode', ssl: { require: true, rejectUnauthorized: false } }
  ];

  for (const config of configs) {
    console.log(`\nTrying configuration: ${config.name}`);
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: config.ssl
    });

    try {
      const result = await pool.query('SELECT NOW()');
      console.log(`✓ SUCCESS with ${config.name}:`, result.rows[0]);
      await pool.end();
      return;
    } catch (error) {
      console.log(`✗ FAILED with ${config.name}:`, error.message);
      await pool.end();
    }
  }
}

testConnection().catch(console.error);