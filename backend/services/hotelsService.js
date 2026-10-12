const axios = require('axios');

const BASE_URL = 'https://api.stayingapi.com/v1';

async function waitForJob(jobId) {
    const res = await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${process.env.STAYINGAPI_KEY}` } });
    const job = res.data.result;

    if (job.status === 'completed') return job.result;

    if (job.status === 'failed') throw new Error(job.error?.message || 'Hotel search job failed');
}

async function getHotels(destination, checkIn, checkOut, { adults = 2, currency = 'EUR' } = {}) {
  const response = await axios.get(`${BASE_URL}/search`, {
    headers: { Authorization: `Bearer ${process.env.STAYINGAPI_KEY}` },
    params: {
      location: destination,
      checkIn,
      checkOut,
      adults,
      currency,
      platform: 'booking',  
      limit: 5,
    },
  });

  let listings = response.data.data;

  if (!Array.isArray(listings)) {
    if (!listings?.jobId) throw new Error('Unexpected response from StayingAPI');
    listings = await waitForJob(listings.jobId);
  }

  return (listings || []).map(listing => ({
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