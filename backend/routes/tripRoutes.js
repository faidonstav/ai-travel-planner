const express = require('express');
const router = express.Router();
const { extractTripDetails } = require('../services/extractionService');
const { getCoordinates } = require('../services/geocodingService');
const { getWeatherForecast } = require('../services/weatherService');
const { getAttractions } = require('../services/attractionsService');
const { buildItinerary } = require('../services/itineraryService');

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

    res.json({ coords, itinerary });
  } catch (err) {
    console.error('Plan error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;