function HotelsCard({ hotels }) {
  return (
    <div className="hotels-card">
      <h3>Hotels</h3>
      {hotels.length > 0 ? (
        <ul>
          {hotels.map(hotel => (
            <li key={hotel.id}>
              <strong>{hotel.name}</strong> — {hotel.currency} {hotel.pricePerNight}/night
            </li>
          ))}
        </ul>
      ) : (
        <p>No hotels found.</p>
      )}
    </div>
  );
}

export default HotelsCard;