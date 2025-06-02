// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://novelsync-2q34.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  validateToken: () => api.get('/user/validate'),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  logout: () => api.post('/user/logout'),
};

// Project API calls
export const projectAPI = {
  // Get all public projects (for homepage stories section)
  getAllProjects: () => api.get('/projects'),
  
  // Get user's own projects
  getUserProjects: () => api.get('/projects/my'),
  
  // Create new project
  createProject: (projectData) => api.post('/projects', projectData),
  
  // Get specific project
  getProject: (id) => api.get(`/projects/${id}`),
  
  // Update project
  updateProject: (id, updates) => api.put(`/projects/${id}`, updates),
  
  // Delete project
  deleteProject: (id) => api.delete(`/projects/${id}`),
  
  // Save project data (elements/diagram)
  saveProjectData: (id, projectData) => api.put(`/projects/${id}/save`, { project_data: projectData }),
  
  // Auto-save
  autoSave: (id, elements) => api.post(`/projects/${id}/autosave`, { elements }),
};

// Search API (if you want to implement search)
export const searchAPI = {
  searchProjects: (query) => api.get(`/projects?search=${encodeURIComponent(query)}`),
};

export default api;
