const { Pool } = require('pg');
require('dotenv').config();

// Use the DATABASE_URL as is
const connectionString = process.env.DATABASE_URL;

console.log('Attempting to connect to database...');

// Try connecting without SSL object, just true
const pool = new Pool({
  connectionString: connectionString,
  ssl: true
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Connected to NeonDB successfully');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect()
};