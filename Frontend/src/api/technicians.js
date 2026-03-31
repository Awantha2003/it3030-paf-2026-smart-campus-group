const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
  const response = await fetch(`${API_BASE_URL}/admin/technicians`);
  return parseResponse(response);
}

export async function createTechnician(technicianData) {
  const response = await fetch(`${API_BASE_URL}/admin/technicians`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(technicianData)
  });

  return parseResponse(response);
}

export async function updateTechnicianStatus(id, active) {
  const response = await fetch(`${API_BASE_URL}/admin/technicians/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ active })
  });

  return parseResponse(response);
}

export async function deleteTechnician(id) {
  const response = await fetch(`${API_BASE_URL}/admin/technicians/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    await parseResponse(response);
  }
}
