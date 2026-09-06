import DayCard from './DayCard';

function ItineraryView({ itinerary }) {
  return (
    <div className="itinerary glass-panel">
      <h2> {itinerary.destination} </h2>
      <p className = "itinerary-meta">
         {itinerary.travelers} traveler(s) · {itinerary.currency} {itinerary.budget} · {itinerary.preferences.join(', ') || 'No preferences specified'}
      </p>
      <div className= "day-list">
      {itinerary.days.map(day => (
        <DayCard key={day.date} day={day} />
      ))}
      </div>
    </div>
  );
}

export default ItineraryView;