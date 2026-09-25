import { useState } from 'react';
import TripInputForm from './components/TripInputForm';
import ItineraryView from './components/ItineraryView';
import ChatPanel from './components/ChatPanel';
import SavedTripsView from './components/SavedTripsView';
import { getTripById } from './api';


function App() {
  const [view, setView] = useState('plan');
  const [tripId, setTripId] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [viewedTrip, setViewedTrip] = useState(null);

  function handlePlanReady(result) {
    setTripId(result.tripId);
    setItinerary(result.itinerary);
    setView('plan');
  }

  function handleDayUpdated(updatedDay) {
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => d.date === updatedDay.date ? updatedDay : d),
    }));
  }

  async function handleSelectSavedTrip(id) {
    const result = await getTripById(id);
    setViewedTrip({tripId: result.tripId, itinerary: result.itinerary });
    setView('trip-detail');
  }

  function handleViewedTripDayUpdated(updatedDay) {
    setViewedTrip(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary,
        days: prev.itinerary.days.map(d => d.date === updatedDay.date ? updatedDay : d),
      },
    }));
  }

  return (
    <div className="app-shell">
      <div className="nav-tabs">
        <button className={view === 'plan' ? 'active' : ''} onClick={() => setView('plan')}>Plan a trip</button>
        <button className={view === 'saved' ? 'active' : ''} onClick={() => setView('saved')}>My trips</button>
      </div>

      {view === 'plan' && (
        <>
          <div className="hero">
            <h1>Hey, I'm your AI trip planner</h1>
            <p>Describe your trip in plain words — I'll sort the days, the weather, and the details.</p>
          </div>

          <TripInputForm onPlanReady={handlePlanReady} />

          {itinerary && (
            <>
              <ItineraryView itinerary={itinerary} tripId={tripId} />
              <ChatPanel tripId={tripId} onDayUpdated={handleDayUpdated} />
            </>
          )}
        </>
      )}

      {view === 'saved' && (
        <div className="saved-trips-wrapper">
          <h2>My saved trips</h2>
          <SavedTripsView onSelectTrip={handleSelectSavedTrip} />
        </div>
      )}

      {view === 'trip-detail' && viewedTrip && (
        <div className="trip-detail-wrapper">
          <button className="back-btn" onClick={() => setView('saved')}>← Back to my trips</button>
          <ItineraryView itinerary={viewedTrip.itinerary} tripId={viewedTrip.tripId} />
          <ChatPanel tripId={viewedTrip.tripId} onDayUpdated={handleViewedTripDayUpdated} />
        </div>
      )}
    </div>
  );
}

export default App;
