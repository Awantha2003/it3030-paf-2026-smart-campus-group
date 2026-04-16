import { API_BASE_URL } from './baseUrl';

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

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.errors?.email ||
      'Request failed while communicating with the technician service.';
    throw new Error(message);
  }

  return payload;
}

export async function fetchTechnicians() {
  const response = await fetch(`${API_BASE_URL}/admin/technicians`, {
    headers: getAuthHeaders(false)
  });
  return parseResponse(response);
}

export async function createTechnician(technicianData) {
  const response = await fetch(`${API_BASE_URL}/admin/technicians`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(technicianData)
  });

  return parseResponse(response);
}

export async function updateTechnicianStatus(id, active) {
  const response = await fetch(`${API_BASE_URL}/admin/technicians/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ active })
  });

  return parseResponse(response);
}

export async function updateTechnicianLocation(id, locationData) {
  const response = await fetch(`${API_BASE_URL}/technicians/${id}/location`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(locationData)
  });

  return parseResponse(response);
}

export async function deleteTechnician(id) {
  const response = await fetch(`${API_BASE_URL}/admin/technicians/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    await parseResponse(response);
  }
}
