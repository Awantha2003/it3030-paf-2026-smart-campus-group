const runtimeApiHost =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : 'http://localhost:8080';

const configuredApiBase = import.meta.env.VITE_API_BASE_URL || `${runtimeApiHost}/api`;

export const API_BASE_URL = configuredApiBase.replace(/\/+$/, '');

export const SERVER_BASE_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4) || '/'
  : API_BASE_URL;
