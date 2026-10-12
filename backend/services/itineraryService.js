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
      weatherCode: dayWeather.weatherCode,
    },
    attractions: [],   
    restaurants: [],   
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

function applySuggestions(itinerary, suggestions) {
  const clean = item => ({ name: item.name, pricePerPerson: Number(item.pricePerPerson) || 0 });
  itinerary.days.forEach((day, index) => {
    const match = suggestions.find(s => Number(s.day) === index + 1);
    if (match) {
      day.attractions = (match.attractions || []).map(clean);
      day.restaurants = (match.restaurants || []).map(clean);
      day.localTransportPerPerson = Number(match.localTransportPerPerson) || 0;
    }
  });
}

module.exports = { buildItinerary, applySuggestions};