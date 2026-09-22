require('dotenv').config();
const pool = require('../db');

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trips (
      trip_id TEXT PRIMARY KEY,
      itinerary JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(` 
    ALTER TABLE trips ADD COLUMN IF NOT EXISTS saved BOOLEAN DEFUALT FALSE;
    `);
    
  console.log('trips table is ready');
  await pool.end();
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});