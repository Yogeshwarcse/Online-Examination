import { apiClient } from './client';

export const submitResult = (payload) => apiClient.post('/results/submit', payload);
export const getMyResults = () => apiClient.get('/results/my');
export const getResultById = (id) => apiClient.get(`/results/${id}`);
export const getAllResults = () => apiClient.get('/results');


