const API_BASE_URL = 'http://localhost:5000/api/trips';

export async function planTrip(text) {
  const response = await fetch(`${API_BASE_URL}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function updateTrip(tripId, message) {
  const response = await fetch(`${API_BASE_URL}/${tripId}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function saveTripPermanently(tripId) {
  const response = await fetch(`${API_BASE_URL}/${tripId}/save`, { method: 'POST'});
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function getSavedTrips() {
  const response = await fetch(`${API_BASE_URL}/saved`, { method: 'POST'});
  if (!response.ok) throw new Error('Failed to load saved trips.');
  return response.json();
}

export async function getTripById(tripId) {
  const response = await fetch(`${API_BASE_URL}/${tripId}`);
  if (!response.ok) throw new Error('Failed to load trip.');
  return response.json();
}