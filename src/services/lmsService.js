import { apiRequest } from './apiClient';

export const fetchMyTasks = (token) => apiRequest('/projects', { token });
export const uploadSubmission = (payload, token) => apiRequest('/submissions', { method: 'POST', body: payload, token });
export const fetchTeacherSubmissions = (token) => apiRequest('/submissions', { token });
export const reviewSubmission = (id, payload, token) => apiRequest(`/submissions/${id}/review`, { method: 'PUT', body: payload, token });
export const fetchCompletedCourses = (token) => apiRequest('/completed', { token });
export const createTask = (payload, token) => apiRequest('/projects', { method: 'POST', body: payload, token });
