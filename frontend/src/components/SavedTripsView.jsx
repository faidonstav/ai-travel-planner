import { useState, useEffect } from "react";
import { getSavedTrips, deleteTrip } from "../api";

function SavedTripsView({ onSelectTrip }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getSavedTrips()
            .then(data => setTrips(data.trips))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(e, tripId) {
        e.stopPropagation(); // prevents the card's onClick (open trip) from also firing

        if (!window.confirm('Delete this saved trip? This can\'t be undone.')) return;
        try {
            await deleteTrip(tripId);
            setTrips(prev => prev.filter(t => t.trip_id !== tripId));
        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) return <p className="notice-text">Loading saved trips.. </p>;
    if (error) return <p className="error-text">{error}</p>;
    if (trips.length === 0) return <p className="notice-text">No saved trips yet.</p>;

    return (
        <div className="saved-trips-list">
        {trips.map(trip => (
            <div
            key={trip.trip_id}
            className="saved-trip-card glass-panel"
            onClick={() => onSelectTrip(trip.trip_id)}
            >
            <button className="delete-btn" onClick={(e) => handleDelete(e, trip.trip_id)}>✕</button>
            <h3>{trip.itinerary.destination}</h3>
            <p>{trip.itinerary.days[0]?.date} → {trip.itinerary.days.at(-1)?.date}</p>
            <p>{trip.itinerary.currency} {trip.itinerary.budget} · {trip.itinerary.travelers} traveler(s)</p>
            </div>
        ))}
        </div>
    );
}

export default SavedTripsView;