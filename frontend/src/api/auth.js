import { apiClient } from './client.js';

export async function signIn({ email, password }) {
  const data = await apiClient.post('/auth/login', { email, password });

  // ✅ Save token for future API calls
  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data.user || data;
}

export async function signUp({ name, email, password, role }) {
  const data = await apiClient.post('/auth/signup', { name, email, password, role });

  // ✅ Save token after signup too
  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data.user || data;
}

export async function getMe() {
  return apiClient.get('/profiles/me');
}

export async function signOut() {
  // Optional: if backend has logout route
  localStorage.removeItem('token');
}
