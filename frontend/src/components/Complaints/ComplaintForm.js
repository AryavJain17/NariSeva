import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/complaintService';
import { hrService } from '../../services/hrService';
import { draftService } from '../../services/draftService';
import { validateComplaint } from '../../utils/validation';
import FileUpload from '../Common/FileUpload';
import Loading from '../Common/Loading';
import { useAuth } from '../../context/AuthContext'; // ✅ Import AuthContext

const ComplaintForm = ({ isDraft = false, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isAnonymous: false,
    perpetratorName: '',
    perpetratorDetails: '',
    incidentDate: '',
    incidentLocation: '',
    hrId: '',
    images: [],
    videos: [],
    audios: [],
    pdf: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hrList, setHrList] = useState([]);
  const [loadingHR, setLoadingHR] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth(); // ✅ Get logged-in user

  useEffect(() => {
    loadHRList();
    if (isEdit && id) {
      loadDraftData();
    }
  }, [isEdit, id]);

  const loadHRList = async () => {
    setLoadingHR(true);
    try {
      const data = await hrService.getAllHR();
      setHrList(data || []);
    } catch (error) {
      toast.error('Failed to load HR/NGO list');
    } finally {
      setLoadingHR(false);
    }
  };

  const loadDraftData = async () => {
    setLoading(true);
    try {
      const draft = await draftService.getDraftById(id);
      setFormData({
        title: draft.title || '',
        description: draft.description || '',
        isAnonymous: draft.isAnonymous || false,
        perpetratorName: draft.perpetratorName || '',
        perpetratorDetails: draft.perpetratorDetails || '',
        incidentDate: draft.incidentDate ? draft.incidentDate.split('T')[0] : '',
        incidentLocation: draft.incidentLocation || '',
        hrId: draft.hrId || '',
        images: [],
        videos: [],
        audios: [],
        pdf: null
      });
    } catch (error) {
      toast.error('Failed to load draft');
      navigate('/drafts');
    } finally {
      setLoading(false);
    }
  };

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

  const handleFileChange = (fileType, files) => {
    setFormData(prev => ({
      ...prev,
      [fileType]: fileType === 'pdf' ? files[0] : files
    }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const draftData = { ...formData };
      if (isEdit) {
        draftData.draftId = id;
      }
      await draftService.saveDraft(draftData);
      toast.success('Draft saved successfully!');
      navigate('/drafts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    const validationErrors = validateComplaint(formData, !isDraft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (isDraft && isEdit) {
        await draftService.submitDraft(id, { hrId: formData.hrId });
        toast.success('Draft submitted as complaint successfully!');
        navigate('/complaints');
      } else {
        const complaintPayload = {
          ...formData,
          user: user._id // ✅ Inject user ID here
        };

        await complaintService.createComplaint(complaintPayload);
        toast.success('Complaint submitted successfully!');
        navigate('/complaints');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingHR) {
    return <Loading message={loading ? "Processing..." : "Loading HR list..."} />;
  }

  return (
    <div className="complaint-form-container">
      <div className="form-header">
        <h2>
          {isDraft 
            ? (isEdit ? 'Edit Draft' : 'Save as Draft') 
            : (isEdit ? 'Submit Draft as Complaint' : 'File Complaint')
          }
        </h2>
        <p className="form-subtitle">
          Please provide all necessary details about the incident
        </p>
      </div>

      <form onSubmit={handleSubmitComplaint} className="complaint-form">
        <div className="form-section">
          <h3>Complaint Details</h3>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Brief title of the incident"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Detailed description of the incident..."
              rows="6"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
              />
              Submit anonymously
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Incident Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Incident Date *</label>
              <input
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                className={errors.incidentDate ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.incidentDate && <span className="error-text">{errors.incidentDate}</span>}
            </div>

            <div className="form-group">
              <label>Incident Location *</label>
              <input
                type="text"
                name="incidentLocation"
                value={formData.incidentLocation}
                onChange={handleChange}
                className={errors.incidentLocation ? 'error' : ''}
                placeholder="Where did the incident occur?"
              />
              {errors.incidentLocation && <span className="error-text">{errors.incidentLocation}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Perpetrator Information</h3>

          <div className="form-group">
            <label>Perpetrator Name</label>
            <input
              type="text"
              name="perpetratorName"
              value={formData.perpetratorName}
              onChange={handleChange}
              className={errors.perpetratorName ? 'error' : ''}
              placeholder="Name of the person (if known)"
            />
            {errors.perpetratorName && <span className="error-text">{errors.perpetratorName}</span>}
          </div>

          <div className="form-group">
            <label>Additional Details</label>
            <textarea
              name="perpetratorDetails"
              value={formData.perpetratorDetails}
              onChange={handleChange}
              className={errors.perpetratorDetails ? 'error' : ''}
              placeholder="Department, position, physical description, etc."
              rows="3"
            />
            {errors.perpetratorDetails && <span className="error-text">{errors.perpetratorDetails}</span>}
          </div>
        </div>

        {!isDraft && (
          <div className="form-section">
            <h3>HR/NGO Assignment</h3>

            <div className="form-group">
              <label>Select HR/NGO *</label>
              <select
                name="hrId"
                value={formData.hrId}
                onChange={handleChange}
                className={errors.hrId ? 'error' : ''}
              >
                <option value="">Select HR/NGO to handle this complaint</option>
                {hrList.map(hr => (
                  <option key={hr._id} value={hr._id}>
                    {hr.name} - {hr.organization} {hr.isNGO ? '(NGO)' : '(HR)'}
                  </option>
                ))}
              </select>
              {errors.hrId && <span className="error-text">{errors.hrId}</span>}
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>Supporting Evidence</h3>

          <FileUpload
            label="Images"
            fileTypes="image/*"
            multiple={true}
            onFileChange={(files) => handleFileChange('images', files)}
            helpText="Upload any relevant images (max 5MB each)"
          />

          <FileUpload
            label="Videos"
            fileTypes="video/*"
            multiple={true}
            onFileChange={(files) => handleFileChange('videos', files)}
            helpText="Upload any relevant videos (max 50MB each)"
          />

          <FileUpload
            label="Audio Files"
            fileTypes="audio/*"
            multiple={true}
            onFileChange={(files) => handleFileChange('audios', files)}
            helpText="Upload any relevant audio files (max 25MB each)"
          />

          <FileUpload
            label="PDF Document"
            fileTypes=".pdf"
            multiple={false}
            onFileChange={(files) => handleFileChange('pdf', files)}
            helpText="Upload any relevant PDF document (max 10MB)"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn-outline"
          >
            Cancel
          </button>

          {!isDraft && (
            <button 
              type="button" 
              onClick={handleSaveDraft} 
              className="btn-secondary"
              disabled={loading}
            >
              Save as Draft
            </button>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading 
              ? 'Submitting...' 
              : (isDraft ? 'Submit Complaint' : 'Submit Complaint')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
