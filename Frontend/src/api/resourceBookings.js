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
    throw new Error(payload?.message || payload?.error || fallbackMessage);
  }

  return payload;
}

export async function getMyResourceBookings(type) {
  const response = await fetchFromApi(`/resource-bookings/me?type=${encodeURIComponent(type)}`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load your bookings.');
}

export async function getResourceBookingsByDate(type, date) {
  const query = date
    ? `?type=${encodeURIComponent(type)}&date=${encodeURIComponent(date)}`
    : `?type=${encodeURIComponent(type)}`;

  const response = await fetchFromApi(`/resource-bookings${query}`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load booking conflicts.');
}

export async function createResourceBooking(bookingData) {
  const response = await fetchFromApi('/resource-bookings', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData)
  });

  return parseResponse(response, 'Failed to create booking.');
}

export async function updateResourceBooking(id, bookingData) {
  const response = await fetchFromApi(`/resource-bookings/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData)
  });

  return parseResponse(response, 'Failed to update booking.');
}

export async function deleteResourceBooking(id) {
  const response = await fetchFromApi(`/resource-bookings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    await parseResponse(response, 'Failed to delete booking.');
  }
}
