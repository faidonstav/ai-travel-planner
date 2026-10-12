const axios = require('axios');

async function getWeatherForecast(latitude, longitude, startDate, endDate) {
  const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude,
      longitude,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode',
      timezone: 'auto',
      start_date: startDate,
      end_date: endDate,
    },
  });

  const daily = response.data.daily;

  return daily.time.map((date, i) => ({
    date,
    maxTemp: daily.temperature_2m_max[i],
    minTemp: daily.temperature_2m_min[i],
    precipitationChance: daily.precipitation_probability_max[i],
    weatherCode: daily.weathercode[i],
  }));
}

module.exports = { getWeatherForecast };