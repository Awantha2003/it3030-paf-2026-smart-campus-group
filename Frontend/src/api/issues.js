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
