// Use environment variable if set, otherwise use relative path for Vite proxy in development
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

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
        // Handle validation errors (array of errors)
        if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
          message = err.errors.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
        } else if (err.message) {
          message = err.message;
        } else if (err.error) {
          message = err.error;
        } else {
          // Provide default messages for common status codes
          switch (res.status) {
            case 400:
              message = 'Invalid request. Please check your input.';
              break;
            case 401:
              message = 'Unauthorized. Please check your credentials.';
              break;
            case 403:
              message = 'Access forbidden.';
              break;
            case 404:
              message = 'Resource not found.';
              break;
            case 409:
              message = 'Conflict. This resource already exists.';
              break;
            case 500:
              message = 'Server error. Please try again later.';
              break;
            default:
              message = `Request failed with status ${res.status}`;
          }
        }
      } catch {
        message = `Request failed with status ${res.status}`;
      }
      throw new Error(message);
    }
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) return res.json();
    return null;
  } catch (error) {
    // Handle network errors, CORS errors, connection refused, etc.
    if (error instanceof TypeError && (
      error.message === 'Failed to fetch' || 
      error.message.includes('fetch') ||
      error.message.includes('NetworkError')
    )) {
      throw new Error(`Unable to connect to the server. Please check if the backend is running at ${API_BASE}`);
    }
    // Re-throw other errors (like our custom errors from above)
    throw error;
  }
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};


