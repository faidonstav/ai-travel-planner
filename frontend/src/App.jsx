import { useState } from 'react';
import TripInputForm from './components/TripInputForm';
import ItineraryView from './components/ItineraryView';
import ChatPanel from './components/ChatPanel';

function App() {
  const [tripId, setTripId] = useState(null);
  const [itinerary, setItinerary] = useState(null);

  function handlePlanReady(result) {
    setTripId(result.tripId);
    setItinerary(result.itinerary);
  }

  function handleDayUpdated(updatedDay) {
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => d.date === updatedDay.date ? updatedDay : d),
    }));
  }

  return (
    <div>
      <h1>AI Travel Planner</h1>
      <TripInputForm onPlanReady={handlePlanReady} />

      {itinerary && (
        <>
          <ItineraryView itinerary={itinerary} />
          <ChatPanel tripId={tripId} onDayUpdated={handleDayUpdated} />
        </>
      )}
    </div>
  );
}

export default App;
