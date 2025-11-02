// ✅ client.js

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  const authToken = getToken();
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers: finalHeaders });

    if (!res.ok) {
      let message = 'Request failed';
      try {
        const err = await res.json();
        message = err.message || err.error || message;
      } catch {
        message = `Request failed with status ${res.status}`;
      }
      throw new Error(message);
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) return res.json();
    return null;
  } catch (error) {
    if (
      error instanceof TypeError &&
      (error.message.includes('fetch') || error.message.includes('NetworkError'))
    ) {
      throw new Error(`Unable to connect to the server at ${API_BASE}`);
    }
    throw error;
  }
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export const getApiBase = () => API_BASE;
