import { useState } from 'react';
import DayCard from './DayCard';
import HotelsSection from './HotelsSection';
import { saveTripPermanently, deleteTrip } from '../api';

function ItineraryView({ itinerary, tripId, onDelete }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
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

  async function handleDelete() {
    if (!window.confirm("Delete this saved trip? This can't be undone.")) return;

    setDeleting(true);
    try {
      await deleteTrip(tripId);
      onDelete();
    } catch (err) {
      alert(err.message);
      setDeleting(false);
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
        
        {onDelete ? (
          <button className="save-btn delete-trip-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deliting...' : 'Delete trip'}
          </button>
        ) : (
          <button className="save-btn" onClick={handleSave} disabled={saving || saved}>
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save trip'}
          </button>
        )}
      </div>

      <HotelsSection hotels={itinerary.hotelOptions} />

      <div className="day-list">
        {itinerary.days.map((day, index) => (
          <DayCard key={day.date} day={day} dayNumber={index +1}/>
        ))}
      </div>
    </div>
  );
}

export default ItineraryView;