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
    <div className="app-shell">
      <div className="hero">
        <h1>Hey, I'm your AI trip planner</h1>
        <p>Describe your trip in plain words — I'll sort the days, the weather, and the details.</p>
      </div>

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
