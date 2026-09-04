function DayCard({ day }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
      <h3>{day.date}</h3>
      <p>
        🌡️ {day.weather.minTemp}°C – {day.weather.maxTemp}°C
        {' · '}
        🌧️ {day.weather.precipitationChance}% chance of rain
      </p>
      <p>
        <strong>Attractions:</strong>{' '}
        {day.attractions.length > 0
          ? day.attractions.map(a => a.name).join(', ')
          : 'Coming soon'}
      </p>
      <p>
        <strong>Hotel:</strong> {day.hotel ? day.hotel.name : 'Coming soon'}
      </p>
    </div>
  );
}

export default DayCard;