const express = require('express');
const router = express.Router();
const { generateDailySuggestions } = require('../services/extractionService');
const { getCoordinates } = require('../services/geocodingService');
const { getWeatherForecast } = require('../services/weatherService');
const { buildItinerary, applySuggestions } = require('../services/itineraryService');
const { saveTrip, getTrip, markTripSaved, getSavedTrips, deleteTrip } = require('../services/tripStore');
const crypto = require('crypto'); // built into Node, no install needed
const { applyChatUpdate } = require('../services/chatUpdateService');
const { getHotels } = require('../services/hotelsService');
const { getDateRange } = require('../dateRange');

const MAX_TRIP_DAYS = 14


router.post('/plan', async (req, res) => {
  const { destination, startDate, endDate, budget, currency = 'EUR', travelers = 1, preferences = [] } = req.body;

  // 1. Validate the form input
  if (typeof destination !== 'string' || !destination.trim() ){
    return res.status(400).json({ error: 'Please enter a destination.' });
  }

  const dates = getDateRange(startDate, endDate);
  if (dates.length === 0) {
    return res.status(400).json({ error: 'Please choose a valid date range.' });
  }
  if (dates.length > MAX_TRIP_DAYS) {
    return res.status(400).json({ error: `Trips can be at most ${MAX_TRIP_DAYS} days long. `});
  }

  const budgetNumber = Number(budget);
  if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
    return res.status(400).json({ error: 'Please enter a valid budget.' });
  }

  try {
    // 2. Geocode,This works best with just the place name, so anything after a comma is ignored
    const coords = await getCoordinates(destination.split(',')[0].trim());
    const placeLabel = `${coords.resolvedName}, ${coords.country}`;

    // 3. Weather is non-critical: the free forecast only reaches about 16 days ahead
    let forecast;
    try {
      forecast = await getWeatherForecast(coords.latitude, coords.longitude, startDate, endDate);
    } catch (weatherErr) {
      console.error('Weather fetch failed, continuing without it:', weatherErr.response?.data || weatherErr.message);
      forecast = dates.map(date => ({
        date, maxTemp: null, minTemp: null, precipitationChance: null, weatherCode: null,
      }));
    }

    // 4. Hotels are non-critical too
    let hotels = [];
    try {
      hotels = await getHotels(destination, startDate, endDate, {
        adults: Number(travelers) || 1,
        currency,
      });
    } catch (hotelErr) {
      console.error('Hotel fetch failed, continuing without hotels:', hotelErr.response?.data || hotelErr.message);
    }

    // 5. Build the itinerary
    const tripDetails = {
      destination: coords.resolvedName,
      travelers: Number(travelers) || 1,
      budget: budgetNumber,
      currency,
      preferences: Array.isArray(preferences) ? preferences : [],
    };
    const itinerary = buildItinerary(tripDetails, forecast, hotels);

    // 6. Suggestions are non-critical as well: if gemini fails or hits its quota, day keep empty lists
    try {
      const suggestions = await generateDailySuggestions(placeLabel, tripDetails.preferences, dates.length, currency);
      applySuggestions(itinerary, suggestions);
    } catch (suggestErr) {
      console.error('Suggestions failed, continuing without them: ', suggestErr.message);
    }

    // 7. Store and respond
    const tripId = crypto.randomUUID();
    await saveTrip(tripId, itinerary);
    
    // 8. Return the trip ID, coordinates, and itinerary to the client
    res.json({ tripId, coords, itinerary });
  } catch (err) {
    console.error('Plan error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message});
  }
});

router.post('/:tripId/update', async (req, res) => {
  const { tripId } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Please provide a "message" field.'});
  }

  const itinerary = await getTrip(tripId);
  if (!itinerary) {
    return res.status(404).json({ error: 'Trip not found. Plan a trip first.'});
  }
    try {
    const { reply } = await applyChatUpdate(message, itinerary);
    await saveTrip(tripId, itinerary);
    res.json({ updatedItinerary: itinerary, reply });
  } catch (err) {
    console.error('Update error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

router.post('/:tripId/save', async (req, res) => {
  const { tripId } = req.params;
  try {
    const result = await markTripSaved(tripId);
    if (!result) {
      return res.status(404).json({ error: 'Trip not found.' });      
    }
    res.json({ saved: true, tripId});
  } catch (err) {
    console.error('Save trip error:', err.message);
    res.status(500).json({ error: err.message});
  }
});

router.get('/saved', async (req, res) => {
  try {
    const trips = await getSavedTrips();
    res.json({ trips});
  } catch (err) {
    console.error('Get saved trips error:', err.message);
    res.status(500).json({ error: err.message});
  }
});

router.get('/:tripId', async (req, res) => {
  const { tripId } = req.params;
  try{
    const itinerary = await getTrip(tripId);
    if(!itinerary) {
      return res.status(404).json({ error: 'Trip not found.'});
    }
    res.json({ tripId, itinerary});
  } catch (err) {
    console.error('Get trip error:', err.message);
    res.status(500).json({ error: err.message});
  }
});

router.delete('/:tripId', async (req,res) => {
  const { tripId } = req.params;
  try {
    const deleted = await deleteTrip(tripId);
    if(!deleted) {
      return res.status(404).json({ error: 'Trip not found.'});
    }
    res.json({ deleted: true, tripId});
  } catch (err) {
    console.error('Delete trip error: ', err.message);
    res.status(500).json({ error: err.message});
  }
})

router.put('/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const { itinerary } = req.body;

  if (!itinerary || typeof itinerary !== 'object') {
    return res.status(400).json({ error: 'Please provide an "itinerary" object.' });
  }

  try {
    await saveTrip(tripId, itinerary);
    res.json({ tripId, itinerary });
  } catch (err) {
    console.error('Update itinerary error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;