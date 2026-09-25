const express = require('express');
const router = express.Router();
const { extractTripDetails, getMissingFields } = require('../services/extractionService');
const { getCoordinates } = require('../services/geocodingService');
const { getWeatherForecast } = require('../services/weatherService');
const { getAttractions } = require('../services/attractionsService');
const { buildItinerary } = require('../services/itineraryService');
const { saveTrip, getTrip, markTripSaved, getSavedTrips, deleteTrip } = require('../services/tripStore');
const crypto = require('crypto'); // built into Node, no install needed
const { interpretUpdateRequest } = require('../services/chatUpdateService');
const { getHotels } = require('../services/hotelsService');

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

  if (!text || typeof text !== 'string'){
    return res.status(400).json({ error: 'Please provide a "text" field describing your trip.'});
  }

  try {
    // 1. Extract structured details from the free text
    const tripDetails = await extractTripDetails(text);
    const missing = getMissingFields(tripDetails);

    if(missing.length > 0){
      if(missing.includes("destination") == true){
        return res.json({
          needsClarification: true,
          message: 'Please tell me the travel destination for your trip.'
        });
      }
      if(missing.includes("dates") == true){
        return res.json({
          needsClarification: true,
          message: 'Please also tell me when you plan to trip the travel.'
        });
      }
      if(missing.includes("budget") == true){
        return res.json({
          needsClarification: true,
          message: 'Please tell me the budget of this trip.'
        })
      }
    }

    // 2. Geocode the destination
    const coords = await getCoordinates(tripDetails.destination);

    // 3. Get weather for the trip dates (falls back to a default 5-day window if the AI didn't extract dates)
    const startDate = tripDetails.startDate;
    const endDate = tripDetails.endDate; 
    const forecast = await getWeatherForecast(coords.latitude, coords.longitude, startDate, endDate);
    
    // 4. Hotels are non-critical — if this fails, we still want the itinerary to succeed
    let hotels = [];
    try {
      hotels = await getHotels(tripDetails.destination, startDate, endDate);
    } catch (hotelErr) {
      console.error('Hotel fetch failed, continuing without hotels:', hotelErr.response?.data || hotelErr.message);
    }

    // 5. Compile everything into one itinerary object
    const itinerary = buildItinerary(tripDetails, forecast, hotels);
    
    // Merge daily attraction/restaurant suggestions (from the same extraction call) into each day, matched by position
    if (Array.isArray(tripDetails.dailySuggestions)) {
      itinerary.days.forEach((day, index) => {
        const match = tripDetails.dailySuggestions.find(s => Number(s.day) === index + 1);
        if (match) {
          day.attractions = (match.attractions || []).map(name => ({ name }));
          day.restaurants = match.restaurants || [];
        }
      });
    }

    // 6. Store it so we can patch it later via chat updates
    const tripId = crypto.randomUUID();
    await saveTrip(tripId, itinerary);

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

  const itinerary = await getTrip(tripId);
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
      day.restaurants = [suggestion ];
    }
    else if (field === 'attractions') {
      day.attractions = [suggestion];
    } 

    await saveTrip(tripId, itinerary); // persist the change back into the store

    res.json({ updatedDay: day, interpretation });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/test-hotels', async (req, res) => {
  try {
    const { destination, checkIn, checkOut } = req.query;
    const hotels = await getHotels(destination, checkIn, checkOut);
    res.json({ hotels });
  } catch (err) {
    console.error('Hotels test error:', err.response?.data || err.message);
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

module.exports = router;