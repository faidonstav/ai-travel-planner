import { useState } from 'react';
import TripInputForm from './components/TripInputForm';
import ItineraryView from './components/ItineraryView';

function App() {
  const [tripResult, setTripResult] = useState(null);

  return (
    <div>
      <h1>AI Travel Planner</h1>
      <TripInputForm onPlanReady={setTripResult} />

      {tripResult && <ItineraryView itinerary={tripResult.itinerary} />}
    </div>
  );
}

export default App;