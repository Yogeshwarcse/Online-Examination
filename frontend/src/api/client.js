const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: finalHeaders });
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const err = await res.json();
      message = err.message || message;
    } catch {}
    throw new Error(message);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) return res.json();
  return null;
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};


