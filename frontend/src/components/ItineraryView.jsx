import DayCard from './DayCard';

function ItineraryView({ itinerary }) {
  return (
    <div>
      <h2>
        {itinerary.destination} — {itinerary.travelers} traveler(s), {itinerary.currency} {itinerary.budget}
      </h2>
      <p><strong>Preferences:</strong> {itinerary.preferences.join(', ') || 'None specified'}</p>

      {itinerary.days.map(day => (
        <DayCard key={day.date} day={day} />
      ))}
    </div>
  );
}

export default ItineraryView;