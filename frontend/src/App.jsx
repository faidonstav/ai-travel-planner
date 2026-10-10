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

  function goHome() {
    setTripId(null);
    setItinerary(null);
    setView('plan');
  }

  function handlePlanReady(result) {
    setTripId(result.tripId);
    setItinerary(result.itinerary);
    setView('plan');
  }

  async function handleSelectSavedTrip(id) {
    const result = await getTripById(id);
    setViewedTrip({tripId: result.tripId, itinerary: result.itinerary });
    setView('trip-detail');
  }

  function handleViewedTripDeleted() {
    // If the deleted trip is also the one open in the "Plan a trip" tab, clear it,
    // otherwise that tab would keep showing a trip that no longer exists
    if (viewedTrip?.tripId === tripId) {
      setTripId(null);
      setItinerary(null);
    }
    setViewedTrip(null);
    setView('saved');
  }

  function handleItineraryUpdated(updatedItinerary) {
    setItinerary(updatedItinerary);
  }

  function handleViewedTripItineraryUpdated(updatedItinerary) {
    setViewedTrip(prev => ({ ...prev, itinerary: updatedItinerary}));
  }

  return (
    <div className="app-shell">
      <div className="nav-tabs">
        <button className={view === 'plan' && !itinerary ? 'active' : ''} onClick={goHome}>Plan a trip</button>
        {itinerary && (
          <button className={view === 'plan' && itinerary ? 'active' : ''} onClick={() => setView('plan')}>
        {itinerary.destination}
          </button>
        )}
        <button className={view === 'saved' ? 'active' : ''} onClick={() => setView('saved')}>My trips</button>
      </div>

      {view === 'plan' && (
        <>
        {!itinerary ? (
          <>
            <div className="hero">
            <h1>Hey, I'm your AI trip planner</h1>
            <p>Tell me where, when, and your budget — I'll sort the days, the weather, and the details.</p>
            </div>

            <TripInputForm onPlanReady={handlePlanReady} />
          </>
        ) : (
          <>
              <ItineraryView itinerary={itinerary} tripId={tripId} onItineraryChange={handleItineraryUpdated}/>
              <ChatPanel tripId={tripId} onItineraryUpdated={handleItineraryUpdated}/>
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
          <button className="back-btn" onClick={() => setView('saved')}>Back</button>
          <ItineraryView 
          itinerary={viewedTrip.itinerary} 
          tripId={viewedTrip.tripId}
          onDelete={handleViewedTripDeleted} 
          onItineraryChange={handleViewedTripItineraryUpdated}
          />
          <ChatPanel tripId={viewedTrip.tripId} onItineraryUpdated={handleViewedTripItineraryUpdated}/>
        </div>
      )}
    </div>
  );
}

export default App;
