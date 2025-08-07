import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { hrService } from '../../services/hrService';
import { validateProfile } from '../../utils/validation';
import Loading from '../Common/Loading';

const HRProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    organization: '',
    position: '',
    department: '',
    isNGO: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        organization: user.organization || '',
        position: user.position || '',
        department: user.department || '',
        isNGO: user.isNGO || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProfile(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await hrService.updateHRProfile(user._id, formData);
      updateUser(response.hr);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      setErrors(err.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      organization: user.organization || '',
      position: user.position || '',
      department: user.department || '',
      isNGO: user.isNGO || false
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">HR Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-6"
      >
        <div>
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
              <label className="block mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <div>
              <label className="block mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Organization Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Organization Name *</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded ${errors.organization ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.organization && <p className="text-red-500 text-sm">{errors.organization}</p>}
            </div>
            <div>
              <label className="block mb-1">Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>
            <div>
              <label className="block mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                name="isNGO"
                checked={formData.isNGO}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <label>This is an NGO organization</label>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Your Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{user.totalComplaints || 0}</p>
            <p className="text-gray-600 text-sm">Total Complaints Handled</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user.pendingComplaints || 0}</p>
            <p className="text-gray-600 text-sm">Pending Complaints</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user.resolvedComplaints || 0}</p>
            <p className="text-gray-600 text-sm">Resolved Complaints</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user.ngoReports || 0}</p>
            <p className="text-gray-600 text-sm">NGO Reports Sent</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Account Type:</p>
            <p>{formData.isNGO ? 'NGO Representative' : 'HR Representative'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since:</p>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated:</p>
            <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Profile Status:</p>
            <p className="text-green-600 font-semibold">Active</p>
          </div>
        </div>
      </div>

      {loading && <Loading message="Updating profile..." />}
    </div>
  );
};

export default HRProfile;
