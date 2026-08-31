const express = require('express');
const router = express.Router();
const { extractTripDetails } = require('../services/extractionService');
const { getCoordinates } = require('../services/geocodingService');
const { getWeatherForecast } = require('../services/weatherService');
const { getAttractions } = require('../services/attractionsService');

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

module.exports = router;