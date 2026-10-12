import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import DayCard from './DayCard';
import HotelsSection from './HotelsSection';
import { saveTripPermanently, deleteTrip, updateItinerary } from '../api';
import TripCostSummary from './TripCostSummary';

function ItineraryView({ itinerary, tripId, onDelete, onItineraryChange }) {
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

  function handleDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const [sourceField, sourceDate] = source.droppableId.split('|');
    const [destField, destDate] = destination.droppableId.split('|');

    if (sourceField !== destField) return;

    const updatedDays = itinerary.days.map(day => ({
      ...day,
      attractions: [...day.attractions],
      restaurants: [...day.restaurants],
    }));

    const sourceDay = updatedDays.find(d => d.date === sourceDate);
    const destDay = updatedDays.find(d => d.date === destDate);
    if (!sourceDay || !destDay) return;

    const [movedItem] = sourceDay[sourceField].splice(source.index, 1);
    destDay[destField].splice(destination.index, 0, movedItem);

    const updatedItinerary = { ...itinerary, days: updatedDays };
    onItineraryChange(updatedItinerary); 

    updateItinerary(tripId, updatedItinerary).catch(err => {
      console.error('Failed to save reordered itinerary:', err.message);
    });
  }

  function handleDeleteItem(date, field, index) {
    const updatedDays = itinerary.days.map(day => {
      if (day.date !== date) return day;
      const updatedList = [...day[field]];
      updatedList.splice(index, 1);
      return { ...day, [field]: updatedList };
    });

    const updatedItinerary = { ...itinerary, days: updatedDays };
    onItineraryChange(updatedItinerary);

    updateItinerary(tripId, updatedItinerary).catch(err => {
      console.error('Failed to save after deleting item:', err.message);
    });
  }

  return (
    <div className="itinerary glass-panel">
      <div className="itinerary-header">
        <div>
          <h2>{itinerary.destination}</h2>
          <p className="itinerary-meta">
            {itinerary.travelers} traveler(s) · {itinerary.budget} {itinerary.currency} · {itinerary.preferences.join(', ') || 'No preferences specified'}
          </p>
        </div>
        
        {onDelete ? (
          <button className="save-btn delete-trip-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete trip'}
          </button>
        ) : (
          <button className="save-btn" onClick={handleSave} disabled={saving || saved}>
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save trip'}
          </button>
        )}
      </div>

      <HotelsSection hotels={itinerary.hotelOptions} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="day-list">
          {itinerary.days.map((day, index) => (
            <DayCard 
            key={day.date} 
            day={day} 
            dayNumber={index + 1} 
            travelers={itinerary.travelers}
            currency={itinerary.currency}
            isLastDay={index === itinerary.days.length - 1}
            hotelOptions={itinerary.hotelOptions}
            onDeleteItem={handleDeleteItem} 
            />
          ))}
        </div>
      </DragDropContext>
      <TripCostSummary itinerary={itinerary} />
    </div>
  );
}

export default ItineraryView;