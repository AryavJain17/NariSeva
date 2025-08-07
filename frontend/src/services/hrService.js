import api from './api';

export const hrService = {
  // Get all HR/NGO
  getAllHR: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('http://localhost:5000/api/hr', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
  // Get HR by ID
  getHRById: async (id) => {
    const response = await api.get(`http://localhost:5000/api/hr/${id}`);
    return response.data;
  },

  // Update HR profile
  updateHRProfile: async (id, hrData) => {
    const response = await api.put(`http://localhost:5000/api/hr/${id}`, hrData);
    return response.data;
  }
};