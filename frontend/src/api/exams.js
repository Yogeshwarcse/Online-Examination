import { apiClient, getApiBase } from './client';

export const listExams = () => apiClient.get('/exams');
export const getExam = (id) => apiClient.get(`/exams/${id}`);
export const createExam = (payload) => apiClient.post('/exams', payload);
export const updateExam = (id, payload) => apiClient.put(`/exams/${id}`, payload);
export const deleteExam = (id) => apiClient.del(`/exams/${id}`);

export const uploadExamImage = async (examId, imageFile) => {
  const API_BASE = getApiBase();
  const token = localStorage.getItem('token') || '';
  
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('examId', examId);
  
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(`${API_BASE}/exams/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    // Check content type to handle HTML error pages
    const contentType = res.headers.get('content-type');
    
    if (!res.ok) {
      let errorMessage = 'Failed to upload image';
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const error = await res.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
      } else {
        // If server returned HTML (error page), provide a helpful message
        errorMessage = `Server error (${res.status}). Please check if the backend server is running and try again.`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Ensure response is JSON before parsing
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned invalid response. Expected JSON but got: ' + contentType);
    }
    
    return await res.json();
  } catch (error) {
    // Re-throw if it's already our error, otherwise wrap it
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: ' + error);
  }
};
