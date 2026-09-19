import HotelCard from './HotelsCard';

function HotelsSection({ hotels }) {
    if (!hotels || hotels.length === 0) return null;

    return (
        <div className="hotels-section">
            <h3>Suggestion Hotels</h3>
            <div className="hotels-list">
                {hotels.map(hotel => (
                    <HotelCard key={hotel.url} hotel={hotel} />
                ))}
            </div>
        </div>
    );
}

export default HotelsSection;