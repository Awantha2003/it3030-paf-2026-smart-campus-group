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

export async function getEquipmentsByFacility(facilityId) {
  const response = await fetchFromApi(`/equipments/facility/${facilityId}`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load equipments for this facility.');
}

export async function createEquipment(equipmentData) {
  const response = await fetchFromApi('/equipments', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(equipmentData)
  });

  return parseResponse(response, 'Failed to create equipment.');
}

export async function updateEquipment(id, equipmentData) {
  const response = await fetchFromApi(`/equipments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(equipmentData)
  });

  return parseResponse(response, 'Failed to update equipment.');
}

export async function updateEquipmentStatus(id, status) {
  const response = await fetchFromApi(`/equipments/${id}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    return parseResponse(response, 'Failed to update equipment status.');
  }
}

export async function deleteEquipment(id) {
  const response = await fetchFromApi(`/equipments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    return parseResponse(response, 'Failed to delete equipment.');
  }
}
