const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('PostgreSQL connection successful');
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  testConnection,
};
