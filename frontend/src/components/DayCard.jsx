function DayCard({ day }) {
  return (
    <div className="day-card">
      <h3>{day.date}</h3>
      <p>{day.weather.minTemp}° – {day.weather.maxTemp}°C · {day.weather.precipitationChance}% rain</p>
      <p><span className="label">Attractions</span> {day.attractions.length ? day.attractions.map(a => a.name).join(', ') : 'Coming soon'}</p>
      <p><span className="label">Restaurants</span> {day.restaurants.length ? day.restaurants.join(', ') : 'Coming soon'}</p>
      <p><span className="label">Hotel</span> {day.hotel ? day.hotel.name : 'Coming soon'}</p>
    </div>
  );
}

export default DayCard;