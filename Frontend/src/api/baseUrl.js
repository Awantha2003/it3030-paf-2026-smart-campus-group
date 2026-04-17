const runtimeProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const normalizedRuntimeHost = runtimeHost === '0.0.0.0' ? 'localhost' : runtimeHost;

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

const candidateBases = [
  configuredApiBase,
  `${runtimeProtocol}//${normalizedRuntimeHost}:8080/api`,
  `${runtimeProtocol}//localhost:8080/api`,
  `${runtimeProtocol}//127.0.0.1:8080/api`
].filter(Boolean);

export const API_BASE_CANDIDATES = Array.from(new Set(candidateBases));
export const API_BASE_URL = API_BASE_CANDIDATES[0];

export const SERVER_BASE_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4) || '/'
  : API_BASE_URL;

export async function fetchFromApi(path, options = {}) {
  let lastError = null;

  for (const baseUrl of API_BASE_CANDIDATES) {
    try {
      return await fetch(`${baseUrl}${path}`, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to fetch');
}
