const axios = require('axios');

const BASE_URL = 'https://api.stayingapi.com/v1';

async function getHotels(destination, checkIn, checkOut) {
  const response = await axios.get(`${BASE_URL}/search`, {
    headers: { Authorization: `Bearer ${process.env.STAYINGAPI_KEY}` },
    params: {
      location: destination,
      checkIn,
      checkOut,
    },
  });

  // Reshape into a clean, consistent object per listing
  return response.data.data.map(listing => ({
    name: listing.name,
    platform: listing.platform,
    rating: listing.guestRating,
    ratingScale: listing.ratingScale,
    pricePerNight: listing.price?.nightlyPrice ?? null,
    totalPrice: listing.price?.totalPrice ?? null,
    currency: listing.price?.currency ?? null,
    url: listing.url,
    image: listing.images?.[0] ?? null,
  }));
}

module.exports = { getHotels };