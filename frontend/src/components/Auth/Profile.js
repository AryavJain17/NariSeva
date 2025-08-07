import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { hrService } from '../../services/hrService';
import { validateProfile } from '../../utils/validation';
import Loading from '../Common/Loading';

const Profile = () => {
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

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
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateProfile(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (user.role === 'hr') {
        const updateData = {
          organization: formData.organization,
          position: formData.position,
          department: formData.department,
          isNGO: formData.isNGO
        };
        await hrService.updateProfile(user._id, updateData);
      }
      
      await updateUser(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
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
    setErrors({});
    setEditing(false);
  };

  if (loading) return <Loading message="Updating profile..." />;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <div className="profile-actions">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary">
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={handleCancel} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="disabled"
                />
                <small className="help-text">Email cannot be changed</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={user?.role === 'hr' ? 'HR/NGO' : 'User'}
                  disabled={true}
                  className="disabled"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing}
                className={errors.address ? 'error' : ''}
                rows="3"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          {user?.role === 'hr' && (
            <div className="profile-section">
              <h3>Organization Information</h3>
              
              <div className="form-group">
                <label>Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={!editing}
                  className={errors.organization ? 'error' : ''}
                />
                {errors.organization && <span className="error-text">{errors.organization}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    disabled={!editing}
                    className={errors.position ? 'error' : ''}
                  />
                  {errors.position && <span className="error-text">{errors.position}</span>}
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!editing}
                    className={errors.department ? 'error' : ''}
                  />
                  {errors.department && <span className="error-text">{errors.department}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isNGO"
                    checked={formData.isNGO}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                  This is an NGO
                </label>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h3>Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Member Since:</span>
                <span className="stat-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Updated:</span>
                <span className="stat-value">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;