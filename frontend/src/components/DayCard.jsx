import { getWeatherIcons } from '../utils/WeatherIcons';
import { getOrdinal } from '../utils/ordinal';
import { formatDate } from '../utils/formatDate';

function DayCard({ day, dayNumber }) {
  return (
    <div className="day-card">
      <p className="day-number">{getOrdinal(dayNumber)} day</p>
      <h3>{formatDate(day.date)}</h3>
      <img src={getWeatherIcons(day.weather.weatherCode)} alt="weather icon" className="weather-icon-img" />
      <p>{day.weather.minTemp}° – {day.weather.maxTemp}°C · {day.weather.precipitationChance}% rain</p>
      <p><span className="label">Attractions</span> {day.attractions.length ? day.attractions.map(a => a.name).join(', ') : 'Coming soon'}</p>
      <p><span className="label">Restaurants</span> {day.restaurants.length ? day.restaurants.join(', ') : 'Coming soon'}</p>
    </div>
  );
}

export default DayCard;