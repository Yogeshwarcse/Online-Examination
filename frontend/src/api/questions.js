import { apiClient } from './client';

export const getQuestionsByExam = (examId) => apiClient.get(`/questions/by-exam/${examId}`);
export const createQuestion = (payload) => apiClient.post('/questions', payload);
export const updateQuestion = (id, payload) => apiClient.put(`/questions/${id}`, payload);
export const deleteQuestion = (id) => apiClient.del(`/questions/${id}`);


