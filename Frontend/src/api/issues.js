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

async function parseResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const firstValidationError =
      payload && typeof payload === 'object'
        ? Object.values(payload).find((value) => typeof value === 'string' && value.trim())
        : '';

    throw new Error(payload?.message || payload?.error || firstValidationError || fallbackMessage);
  }

  return payload;
}

export async function createIssueReport(issueData) {
  const response = await fetch(`${API_BASE_URL}/issues`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(issueData)
  });

  return parseResponse(response, 'Failed to submit issue report.');
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData
  });

  return parseResponse(response, 'Failed to upload file.');
}

export async function getStudentIssueReports(studentId) {
  if (!studentId) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/issues?studentId=${encodeURIComponent(studentId)}`,
    {
      headers: getAuthHeaders(false)
    }
  );

  return parseResponse(response, 'Failed to load issue reports.');
}

export async function getTechnicianIssueReports(technicianId) {
  if (!technicianId) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/issues/technician?technicianId=${encodeURIComponent(technicianId)}`,
    {
      headers: getAuthHeaders(false)
    }
  );

  return parseResponse(response, 'Failed to load technician scheduled tasks.');
}

export async function getIssueReportById(id) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load issue report.');
}

export async function getAllIssueReports() {
  const response = await fetch(`${API_BASE_URL}/issues/admin/all`, {
    headers: getAuthHeaders(false)
  });

  return parseResponse(response, 'Failed to load admin issue reports.');
}

export async function assignIssueReport(id, technicianId) {
  const response = await fetch(`${API_BASE_URL}/issues/admin/${id}/assign`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ technicianId })
  });

  return parseResponse(response, 'Failed to assign issue report.');
}

export async function updateIssueReportStatus(id, status, rejectionReason = '') {
  const response = await fetch(`${API_BASE_URL}/issues/admin/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, rejectionReason })
  });

  return parseResponse(response, 'Failed to update issue report status.');
}

export async function updateIssueReportAdminNote(id, adminNote) {
  const response = await fetch(`${API_BASE_URL}/issues/admin/${id}/note`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ adminNote })
  });

  return parseResponse(response, 'Failed to save admin note.');
}

export async function updateIssueReportFeedback(id, feedbackData) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}/feedback`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(feedbackData)
  });

  return parseResponse(response, 'Failed to submit feedback.');
}
