import { mockUsers } from '../data/mockData';
import { API_BASE_URL } from './baseUrl';

const STUDENT_DEMO_PASSWORD = 'Student123@';

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || 'Login failed.');
  }

  return payload;
}

export async function loginTechnician(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/technician/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  return parseResponse(response);
}

export async function loginAdmin(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  return parseResponse(response);
}

export async function loginStudent(credentials) {
  const username = credentials?.username?.trim().toLowerCase();
  const password = credentials?.password ?? '';

  if (username !== mockUsers.user.email.toLowerCase() || password !== STUDENT_DEMO_PASSWORD) {
    throw new Error('Invalid student email or password.');
  }

  return {
    message: 'Student login successful',
    user: mockUsers.user
  };
}
