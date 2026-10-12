const axios = require('axios');

const BASE_URL = 'https://api.stayingapi.com/v1';

function authHeaders() {
  return { Authorization: `Bearer ${process.env.STAYINGAPI_KEY}` };
}

// A live search that needs a scrape returns 202 + a jobId instead of the results.
// Poll that job (polling is free) until it completes, then return its payload.
async function waitForJob(jobId) {
    const res = await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers: authHeaders() });
    const job = res.data.result;

    if (job.status === 'completed') return job.result;
    // A failed job still comes back as HTTP 200, so check the status field
    if (job.status === 'failed') throw new Error(job.error?.message || 'Hotel search job failed');
}

async function getHotels(destination, checkIn, checkOut, { adults = 2, currency = 'EUR' } = {}) {
  const response = await axios.get(`${BASE_URL}/search`, {
    headers: authHeaders(),
    params: {
      location: destination,
      checkIn,
      checkOut,
      adults,
      currency,
      platform: 'booking',  // hotels only: fewer credits and a faster scrape
      limit: 5,
    },
  });

  let listings = response.data.data;

  // 202: the scrape was started and the results arrive later via the job
  if (!Array.isArray(listings)) {
    if (!listings?.jobId) throw new Error('Unexpected response from StayingAPI');
    listings = await waitForJob(listings.jobId);
  }

  // Reshape into a clean, consistent object per listing
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







/*
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
*/



