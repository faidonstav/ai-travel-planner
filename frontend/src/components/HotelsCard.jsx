function HotelsCard({ hotel }) {
  return (
    <a
      href={hotel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hotel-card"
    >
      <div className="hotel-card-body">
        <h4>{hotel.name}</h4>
        <p className="hotel-platform">{hotel.platform}</p>
        <p className="hotel-rating"> {hotel.rating} / {hotel.ratingScale} ⭐</p>
        <p className="hotel-price"> {hotel.pricePerNight} {hotel.currency}/ night {"->"} {hotel.totalPrice} {hotel.currency} </p>
      </div>
    </a>
  );
}

export default HotelsCard;