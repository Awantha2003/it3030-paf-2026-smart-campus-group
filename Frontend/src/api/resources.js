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

export async function getResourceTypes() {
  const response = await fetchFromApi('/resources/types', {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load resource types.');
}

export async function getResources(type) {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const response = await fetchFromApi(`/resources${query}`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load resources.');
}

export async function createResource(resourceData) {
  const response = await fetchFromApi('/admin/resources', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resourceData)
  });

  return parseResponse(response, 'Failed to create resource.');
}

export async function updateResource(id, resourceData) {
  const response = await fetchFromApi(`/admin/resources/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(resourceData)
  });

  return parseResponse(response, 'Failed to update resource.');
}

export async function deleteResource(id) {
  const response = await fetchFromApi(`/admin/resources/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    await parseResponse(response, 'Failed to delete resource.');
  }
}
