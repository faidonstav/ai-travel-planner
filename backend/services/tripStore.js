const pool = require('../db');

const trips = new Map();

async function saveTrip(tripId, itinerary) {
  await pool.query(
    `INSERT INTO trips (trip_id, itinerary)
      VALUES ($1, $2)
      ON CONFLICT (trip_id) DO UPDATE SET itinerary = $2`, 
      [tripId, itinerary]
  );
}

async function getTrip(tripId) {
  const result = await pool.query(
    `SELECT itinerary FROM trips 
    WHERE trip_id = $1`,
    [tripId]);
  return result.rows[0]?.itinerary || null;
}

async function markTripSaved(tripId) {
  const result = await pool.query(
    `UPDATE trips SET saved = TRUE 
    WHERE trip_id = $1 
    RETURNING trip_id, saved`
  );
  return result.rows[0] || null;
}

async function getSavedTrips() {
  const result = await pool.query(
    `SELECT trip_id, itinerary, created_at FROM trips
    WHERE saved = TRUE
    ORDER BY created_at DESC`
  );
  return result.rows;
}

module.exports = { saveTrip, getTrip, markTripSaved, getSavedTrips };