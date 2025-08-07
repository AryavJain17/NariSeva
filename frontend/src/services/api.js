// src/services/api.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or get from context/store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utility: Convert plain data to FormData
export const createFormData = (data) => {
  const formData = new FormData();
  for (let key in data) {
    if (Array.isArray(data[key])) {
      data[key].forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, data[key]);
    }
  }
  return formData;
};

export default api;
