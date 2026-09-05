const express = require('express');
const router = express.Router();
const { extractTripDetails } = require('../services/extractionService');
const { getCoordinates } = require('../services/geocodingService');
const { getWeatherForecast } = require('../services/weatherService');
const { getAttractions } = require('../services/attractionsService');
const { buildItinerary } = require('../services/itineraryService');
const { saveTrip, getTrip } = require('../services/tripStore');
const crypto = require('crypto'); // built into Node, no install needed
const { interpretUpdateRequest } = require('../services/chatUpdateService');

// Temporary test route - we'll remove this later
router.get('/test-weather', async (req, res) => {
  try {
    const { destination, startDate, endDate } = req.query;
    const coords = await getCoordinates(destination);
    const forecast = await getWeatherForecast(coords.latitude, coords.longitude, startDate, endDate);
    res.json({ coords, forecast });
  } catch (err) {
    console.error('Weather test error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/extract', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Please provide a "text" field describing your trip.' });
  }

  try {
    const tripDetails = await extractTripDetails(text);
    res.json(tripDetails);
  } catch (err) {
    console.error('Extraction error:', err);
    res.status(500).json({ error: 'Failed to extract trip details.' });
  }
});

router.get('/test-attractions', async (req, res) => {
  try {
    const { destination } = req.query;
    const coords = await getCoordinates(destination);
    const attractions = await getAttractions(coords.latitude, coords.longitude);
    res.json({ coords, attractions });
  } catch (err) {
    console.error('Attractions test error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/plan', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Please provide a "text" field describing your trip.' });
  }

  try {
    // 1. Extract structured details from the free text
    const tripDetails = await extractTripDetails(text);

    // 2. Geocode the destination
    const coords = await getCoordinates(tripDetails.destination);

    // 3. Get weather for the trip dates (falls back to a default 5-day window if the AI didn't extract dates)
    const startDate = tripDetails.startDate || new Date().toISOString().split('T')[0];
    const endDate = tripDetails.endDate || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];
    const forecast = await getWeatherForecast(coords.latitude, coords.longitude, startDate, endDate);

    // 4. Compile everything into one itinerary object
    const itinerary = buildItinerary(tripDetails, forecast);
    
    // 5. Store it so we can patch it later via chat updates
    const tripId = crypto.randomUUID();
    saveTrip(tripId, itinerary);

    res.json({ tripId, coords, itinerary });

  } catch (err) {
    console.error('Plan error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:tripId/update', async (req, res) => {
  const { tripId } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Please provide a "message" field.' });
  }

  const itinerary = getTrip(tripId);
  if (!itinerary) {
    return res.status(404).json({ error: 'Trip not found. Plan a trip first to get a tripId.' });
  }

  try {
    const interpretation = await interpretUpdateRequest(message, itinerary);
    const { targetDate, field, suggestion } = interpretation;

    const day = itinerary.days.find(d => d.date === targetDate);
    if (!day) {
      return res.status(400).json({ error: 'Could not determine which day you meant.', interpretation });
    }

    if (field === 'restaurants') {
      day.restaurants = [suggestion];
    } else if (field === 'attractions') {
      day.attractions = [{ name: suggestion }];
    } else if (field === 'hotel') {
      day.hotel = { name: suggestion };
    }

    saveTrip(tripId, itinerary); // persist the change back into the store

    res.json({ updatedDay: day, interpretation });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;