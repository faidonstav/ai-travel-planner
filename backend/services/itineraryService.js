function buildItinerary(tripDetails, weatherForecast) {
  const days = weatherForecast.map(dayWeather => ({
    date: dayWeather.date,
    weather: {
      maxTemp: dayWeather.maxTemp,
      minTemp: dayWeather.minTemp,
      precipitationChance: dayWeather.precipitationChance,
    },
    attractions: [],   // placeholder — fill in once an attractions API is wired up
    restaurants: [],   // placeholder — same idea, could reuse attractions API later
    hotel: null,       // placeholder — fill in once a hotels API is wired up
  }));

  return {
    destination: tripDetails.destination,
    travelers: tripDetails.travelers,
    budget: tripDetails.budget,
    currency: tripDetails.currency,
    preferences: tripDetails.preferences,
    days,
  };
}

module.exports = { buildItinerary };