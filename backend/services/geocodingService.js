const axios = require('axios');

async function getCoordinates(destination) {
  const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: {
      name: destination,
      count: 1, 
    },
  });

  const results = response.data.results;

  if (!results || results.length === 0) {
    throw new Error(`Could not find coordinates for "${destination}"`);
  }

  const place = results[0];
  return {
    latitude: place.latitude,
    longitude: place.longitude,
    resolvedName: place.name,
    country: place.country,
  };
}

module.exports = { getCoordinates };