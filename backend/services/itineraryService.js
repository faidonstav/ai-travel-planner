function buildItinerary(tripDetails, weatherForecast, hotels = []) {
  const topHotel = hotels.length > 0 
  ? [...hotels].sort((a, b) => (b.rating  || 0) - (a.rating || 0))[0] 
  : null;
  
  const days = weatherForecast.map(dayWeather => ({
    date: dayWeather.date,
    weather: {
      maxTemp: dayWeather.maxTemp,
      minTemp: dayWeather.minTemp,
      precipitationChance: dayWeather.precipitationChance,
    },
    attractions: [],   // placeholder — fill in once an attractions API is wired up
    restaurants: [],   // placeholder — same idea, could reuse attractions API later
    hotel: topHotel,     
  }));

  return {
    destination: tripDetails.destination,
    travelers: tripDetails.travelers,
    budget: tripDetails.budget,
    currency: tripDetails.currency,
    preferences: tripDetails.preferences,
    hotelOptions: hotels,
    days,
  };
}

module.exports = { buildItinerary };