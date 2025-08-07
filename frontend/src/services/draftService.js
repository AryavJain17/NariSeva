// src/services/draftService.js
import api, { createFormData } from './api';

// Helper to get token and set headers
const authHeaders = () => {
  const token = localStorage.getItem('token'); // or use context/store
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const draftService = {
  // Save draft
  saveDraft: async (draftData) => {
    const token = localStorage.getItem('token');
    const formData = createFormData(draftData);
    const response = await api.post('http://localhost:5000/api/drafts', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  

  // Get user drafts
  getUserDrafts: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('http://localhost:5000/api/drafts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },


  // Get draft by ID
  getDraftById: async (id) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`http://localhost:5000/api/drafts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  submitDraftAsComplaint: async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await api.post(`http://localhost:5000/api/drafts/${id}/submit`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  },

  // Delete draft
  deleteDraft: async (id) => {
    const response = await api.delete(`http://localhost:5000/api/drafts/${id}`, {
      headers: authHeaders(),
    });
    return response.data;
  }

  // Submit draft as complaint
 
};
