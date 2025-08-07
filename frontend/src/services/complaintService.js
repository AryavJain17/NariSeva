import api from './api'; // your axios instance

// Utility to convert plain data to FormData
const createFormData = (data) => {
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

export const complaintService = {
  // Create a new complaint with token
  createComplaint: async (complaintData) => {
    const token = localStorage.getItem('token');
    const formData = createFormData(complaintData);

    const response = await api.post('http://localhost:5000/api/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
  getUserComplaints: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('http://localhost:5000/api/complaints/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Optionally add this if you want to fetch complaints with token too
  getMyComplaints: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('http://localhost:5000/api/complaints', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  // ✅ NEW: Get all HR-related complaints
  getHRComplaints: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('http://localhost:5000/api/complaints/hr', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Optional: Update complaint status
  updateComplaintStatus: async (id, statusData) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`http://localhost:5000/api/complaints/${id}/status`, statusData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Optional: Report to NGO
  reportToNGO: async (id, reportData) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`http://localhost:5000/api/complaints/${id}/report-to-ngo`, reportData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getPerpetrators: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('http://localhost:5000/api/complaints/perpetrators', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
};