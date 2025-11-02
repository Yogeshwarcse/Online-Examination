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
  // Ensure name is a non-empty string
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Name is required and must be a valid string');
  }
  
  // Ensure email is valid
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Valid email address is required');
  }
  
  // Ensure password meets requirements
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  // Ensure role is valid if provided
  if (role && !['admin', 'student'].includes(role)) {
    throw new Error('Role must be either "admin" or "student"');
  }

  const data = await apiClient.post('/auth/signup', { 
    name: name.trim(), 
    email: email.trim().toLowerCase(), 
    password, 
    role: role || 'student' 
  });

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
