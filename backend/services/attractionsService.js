const axios = require('axios');

const BASE_URL = 'https://api.opentripmap.com/0.1/en/places';

async function getAttractions(latitude, longitude, radiusMeters = 5000, limit = 10) {
  const response = await axios.get(`${BASE_URL}/radius`, {
    params: {
      apikey: process.env.OPENTRIPMAP_API_KEY,
      lat: latitude,
      lon: longitude,
      radius: radiusMeters,
      limit,
      rate: 2, // 2 = only fairly well-known places, cuts out obscure/low-quality entries
      format: 'json',
    },
  });

  // Reshape into a clean, consistent object per attraction
  return response.data.map(place => ({
    name: place.name,
    category: place.kinds ? place.kinds.split(',')[0] : 'unknown',
    distanceMeters: Math.round(place.dist),
    xid: place.xid, // OpenTripMap's unique ID, useful if we fetch full details later
  }))
  .filter(place => place.name && place.name.trim() !== ''); // drop unnamed entries — common in this API
}

module.exports = { getAttractions };