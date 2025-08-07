import api from './api';

export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('http://localhost:5000/api/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('http://localhost:5000/api/auth/login', { email, password });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('http://localhost:5000/api/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('http://localhost:5000/api/auth/profile', userData);
    return response.data;
  },

  // Logout (client-side only for now)
  logout: () => {
    localStorage.removeItem('token');
  }
};