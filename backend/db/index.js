const { Pool } = require('pg');
require('dotenv').config();

// Use the DATABASE_URL as is
const connectionString = process.env.DATABASE_URL;

console.log('Attempting to connect to database...');
console.log('Database URL:', connectionString ? 'Set' : 'Not set');

// Configure SSL based on environment and connection string
let sslConfig = false;

if (process.env.NODE_ENV === 'production') {
  sslConfig = { rejectUnauthorized: false };
} else if (connectionString && connectionString.includes('sslmode=require')) {
  sslConfig = { rejectUnauthorized: false };
} else {
  sslConfig = false;
}

console.log('SSL Configuration:', sslConfig);

const pool = new Pool({
  connectionString: connectionString,
  ssl: sslConfig
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