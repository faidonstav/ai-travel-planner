// In-memory storage — resets when the server restarts.
// Fine for development; we'd swap this for a real database later.
const trips = new Map();

function saveTrip(tripId, itinerary) {
  trips.set(tripId, itinerary);
}

function getTrip(tripId) {
  return trips.get(tripId);
}

module.exports = { saveTrip, getTrip };