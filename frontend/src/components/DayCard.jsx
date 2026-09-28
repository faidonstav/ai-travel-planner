import { getWeatherIcons } from '../utils/WeatherIcons';
import { getOrdinal } from '../utils/ordinal';
import { formatDate } from '../utils/formatDate';

function DayCard({ day, dayNumber }) {
  return (
    <div className="day-card">
      <p className="day-number">{getOrdinal(dayNumber)} day</p>
      <div className= "weather-icons">
        <h3>{formatDate(day.date)}</h3>
        <img src={getWeatherIcons(day.weather.weatherCode)} alt="weather icon" className="weather-icon-img" />
      </div>
      <p><span className="label">Min Temperature:</span> {day.weather.minTemp}°C</p>
      <p><span className="label">Max Temperature:</span> {day.weather.maxTemp}°C</p>
      <p><span className="label">Rain propability:</span> {day.weather.precipitationChance}% rain</p>
      <div className="section">
        <span className="label">Attractions</span>
        {day.attractions.length ? (
          <ul className="item-list">
            {day.attractions.map((a, i) => <li key={i}>{a.name}</li>)}
          </ul>
        ) : (
          <p className="coming-soon">Coming soon</p>
        )}
      </div>

      <div className="section">
        <span className="label">Restaurants</span>
        {day.restaurants.length ? (
          <ul className="item-list">
            {day.restaurants.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        ) : (
          <p className="coming-soon">Coming soon</p>
        )}
      </div>
    </div>
  );
}

export default DayCard;