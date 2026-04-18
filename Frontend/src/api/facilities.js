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

export async function getAllFacilities() {
  const response = await fetchFromApi('/facilities', {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load facilities catalogue.');
}

export async function getFacilityByCode(code) {
  const response = await fetchFromApi(`/facilities/${code}`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, `Failed to load facility: ${code}`);
}

export async function createFacility(facilityData) {
  const response = await fetchFromApi('/facilities', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(facilityData)
  });

  return parseResponse(response, 'Failed to create facility.');
}

export async function updateFacility(id, facilityData) {
  const response = await fetchFromApi(`/facilities/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(facilityData)
  });

  return parseResponse(response, 'Failed to update facility.');
}

export async function deleteFacility(id) {
  const response = await fetchFromApi(`/facilities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    return parseResponse(response, 'Failed to delete facility.');
  }
}
