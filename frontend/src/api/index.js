import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  getUsers: () => API.get('/auth/users'),
};

// Projects
export const projectAPI = {
  getAll: () => API.get('/projects'),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  addMember: (id, userId) => API.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => API.delete(`/projects/${id}/members/${userId}`),
  addTeam: (id, teamId) => API.post(`/projects/${id}/teams`, { teamId }),
  removeTeam: (id, teamId) => API.delete(`/projects/${id}/teams/${teamId}`),
};

// Teams
export const teamAPI = {
  getAll: () => API.get('/teams'),
  getById: (id) => API.get(`/teams/${id}`),
  create: (data) => API.post('/teams', data),
  update: (id, data) => API.put(`/teams/${id}`, data),
  delete: (id) => API.delete(`/teams/${id}`),
  addMember: (id, userId) => API.put(`/teams/${id}/members`, { userId }),
  removeMember: (id, userId) => API.delete(`/teams/${id}/members/${userId}`),
};

// Tasks
export const taskAPI = {
  getAll: (params) => API.get('/tasks', { params }),
  getById: (id) => API.get(`/tasks/${id}`),
  create: (data) => API.post('/tasks', data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
  getDashboard: () => API.get('/tasks/dashboard'),
};

export default API;
