import { fetchFromApi } from './baseUrl';

function getAuthHeaders(includeJson = true) {
  const headers = {};
  const token = localStorage.getItem('token');

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || fallbackMessage);
  }

  return payload;
}

export async function getFacilityLectureHalls() {
  const response = await fetchFromApi('/facility-bookings/lecture-halls', {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load lecture hall options.');
}

export async function getAvailableFacilitySpaces(date, time, durationHours) {
  const params = new URLSearchParams();
  if (date) {
    params.set('date', date);
  }
  if (time) {
    params.set('time', time);
  }
  if (durationHours) {
    params.set('durationHours', String(durationHours));
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchFromApi(`/facility-bookings/availability${query}`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load available facility spaces.');
}

export async function getMyFacilityBookings() {
  const response = await fetchFromApi('/facility-bookings/me', {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load your facility bookings.');
}

export async function createFacilityBooking(bookingData) {
  const response = await fetchFromApi('/facility-bookings', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData)
  });

  return parseResponse(response, 'Failed to create facility booking.');
}

export async function updateFacilityBooking(id, bookingData) {
  const response = await fetchFromApi(`/facility-bookings/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData)
  });

  return parseResponse(response, 'Failed to update facility booking.');
}

// Admin Endpoints
export async function getAllFacilityBookings() {
  const response = await fetchFromApi('/facility-bookings/all', {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load all facility bookings.');
}

export async function updateFacilityBookingStatus(id, statusData) {
  const response = await fetchFromApi(`/facility-bookings/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(statusData)
  });

  return parseResponse(response, 'Failed to update facility booking status.');
}

export async function deleteFacilityBooking(id) {
  const response = await fetchFromApi(`/facility-bookings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    await parseResponse(response, 'Failed to delete facility booking.');
  }
}
