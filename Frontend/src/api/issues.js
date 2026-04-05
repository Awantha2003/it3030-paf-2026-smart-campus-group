const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function parseResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export async function createIssueReport(issueData) {
  const response = await fetch(`${API_BASE_URL}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(issueData)
  });

  return parseResponse(response, 'Failed to submit issue report.');
}

export async function getStudentIssueReports(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/issues?studentId=${encodeURIComponent(studentId)}`
  );

  return parseResponse(response, 'Failed to load issue reports.');
}

export async function getIssueReportById(id) {
  const response = await fetch(`${API_BASE_URL}/issues/${id}`);

  return parseResponse(response, 'Failed to load issue report.');
}

export async function getAllIssueReports() {
  const response = await fetch(`${API_BASE_URL}/issues/admin/all`);

  return parseResponse(response, 'Failed to load admin issue reports.');
}

export async function assignIssueReport(id, technicianId) {
  const response = await fetch(`${API_BASE_URL}/issues/admin/${id}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ technicianId })
  });

  return parseResponse(response, 'Failed to assign issue report.');
}

export async function updateIssueReportStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/issues/admin/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });

  return parseResponse(response, 'Failed to update issue report status.');
}

export async function updateIssueReportAdminNote(id, adminNote) {
  const response = await fetch(`${API_BASE_URL}/issues/admin/${id}/note`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ adminNote })
  });

  return parseResponse(response, 'Failed to save admin note.');
}
