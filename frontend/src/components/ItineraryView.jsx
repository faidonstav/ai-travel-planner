import { useState } from 'react';
import DayCard from './DayCard';
import HotelsSection from './HotelsSection';
import { saveTripPermanently } from '../api';

function ItineraryView({ itinerary, tripId }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  async function handleSave() {
    setSaving(true);
    try {
      await saveTripPermanently(tripId);
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="itinerary glass-panel">
      <div className="itinerary-header">
        <div>
          <h2>{itinerary.destination}</h2>
          <p className="itinerary-meta">
            {itinerary.travelers} traveler(s) · {itinerary.currency} {itinerary.budget} · {itinerary.preferences.join(', ') || 'No preferences specified'}
          </p>
        </div>
        <button className="save-btn" onClick={handleSave} disabled={saving || saved}>
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save trip'}
        </button>
      </div>

      <HotelsSection hotels={itinerary.hotelOptions} />

      <div className="day-list">
        {itinerary.days.map(day => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}

export default ItineraryView;