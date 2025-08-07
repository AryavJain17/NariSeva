import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { draftService } from '../../services/draftService';
import { hrService } from '../../services/hrService';
import { validateComplaint } from '../../utils/validation';
import FileUpload from '../Common/FileUpload';
import Loading from '../Common/Loading';

const DraftForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isAnonymous: false,
    perpetratorName: '',
    perpetratorDetails: '',
    incidentDate: '',
    incidentLocation: ''
  });

  const [files, setFiles] = useState({
    images: [],
    videos: [],
    audios: [],
    pdf: []
  });

  const [hrList, setHrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    fetchHRList();
    if (isEditing) {
      fetchDraft();
    }
    
    // Auto-save draft every 30 seconds
    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [isEditing, id]);

  const fetchHRList = async () => {
    try {
      const response = await hrService.getAllHR();
      setHrList(response.hrList || []);
    } catch (err) {
      console.error('Failed to fetch HR list:', err);
    }
  };

  const fetchDraft = async () => {
    try {
      setLoading(true);
      const response = await draftService.getDraftById(id);
      const draft = response.draft;
      
      setFormData({
        title: draft.title || '',
        description: draft.description || '',
        isAnonymous: draft.isAnonymous || false,
        perpetratorName: draft.perpetratorName || '',
        perpetratorDetails: draft.perpetratorDetails || '',
        incidentDate: draft.incidentDate ? draft.incidentDate.split('T')[0] : '',
        incidentLocation: draft.incidentLocation || ''
      });

      // Note: Files from existing draft are already stored on server
      // We'll just show the file names/counts
      if (draft.files) {
        setFiles({
          images: draft.files.images ? draft.files.images.map(f => ({ name: f, existing: true })) : [],
          videos: draft.files.videos ? draft.files.videos.map(f => ({ name: f, existing: true })) : [],
          audios: draft.files.audios ? draft.files.audios.map(f => ({ name: f, existing: true })) : [],
          pdf: draft.files.pdf ? draft.files.pdf.map(f => ({ name: f, existing: true })) : []
        });
      }
    } catch (err) {
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

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (fileType, newFiles) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: newFiles
    }));
  };

  const handleAutoSave = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      return; // Don't auto-save empty drafts
    }

    try {
      setAutoSaving(true);
      const draftData = {
        ...formData,
        ...files,
        draftId: isEditing ? id : undefined
      };
      
      await draftService.saveDraft(draftData);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  };
  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const draftData = { ...formData };
      if (isEditing) {
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

  const handleSubmitAsComplaint = async (selectedHRId) => {
    if (!selectedHRId) {
      toast.error('Please select an HR/NGO to submit the complaint to');
      return;
    }

    // Validate the form
    const validationErrors = validateComplaint({
      ...formData,
      hrId: selectedHRId
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      await draftService.submitDraftAsComplaint(id, { hrId: selectedHRId });
      toast.success('Draft submitted as complaint successfully');
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <Loading message="Loading draft..." />;
  }

  return (
    <div className="draft-form-container">
      <div className="form-header">
        <h2>{isEditing ? 'Edit Draft' : 'Create New Draft'}</h2>
        <div className="auto-save-indicator">
          {autoSaving && <span className="auto-save-text">Auto-saving...</span>}
        </div>
      </div>

      <form onSubmit={handleSaveDraft} className="draft-form">
        <div className="form-section">
          <h3>Incident Details</h3>
          
          <div className="form-group">
            <label htmlFor="title">Complaint Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title describing the incident"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed description of the incident..."
              rows="6"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="incidentDate">Incident Date</label>
              <input
                type="date"
                id="incidentDate"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                className={errors.incidentDate ? 'error' : ''}
              />
              {errors.incidentDate && <span className="error-text">{errors.incidentDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="incidentLocation">Incident Location</label>
              <input
                type="text"
                id="incidentLocation"
                name="incidentLocation"
                value={formData.incidentLocation}
                onChange={handleChange}
                placeholder="Where did the incident occur?"
                className={errors.incidentLocation ? 'error' : ''}
              />
              {errors.incidentLocation && <span className="error-text">{errors.incidentLocation}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Perpetrator Information</h3>
          
          <div className="form-group checkbox-group">
            <label htmlFor="isAnonymous" className="checkbox-label">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Submit this complaint anonymously
            </label>
            <small className="help-text">
              Anonymous complaints will not reveal your identity to the perpetrator
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="perpetratorName">Perpetrator Name</label>
              <input
                type="text"
                id="perpetratorName"
                name="perpetratorName"
                value={formData.perpetratorName}
                onChange={handleChange}
                placeholder="Name of the person involved"
                className={errors.perpetratorName ? 'error' : ''}
              />
              {errors.perpetratorName && <span className="error-text">{errors.perpetratorName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="perpetratorDetails">Additional Details</label>
              <input
                type="text"
                id="perpetratorDetails"
                name="perpetratorDetails"
                value={formData.perpetratorDetails}
                onChange={handleChange}
                placeholder="Department, position, etc."
                className={errors.perpetratorDetails ? 'error' : ''}
              />
              {errors.perpetratorDetails && <span className="error-text">{errors.perpetratorDetails}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Supporting Evidence</h3>
          
          <FileUpload
            label="Images"
            fileType="images"
            accept="image/*"
            multiple
            files={files.images}
            onChange={(newFiles) => handleFileChange('images', newFiles)}
            error={errors.images}
          />

          <FileUpload
            label="Videos"
            fileType="videos"
            accept="video/*"
            multiple
            files={files.videos}
            onChange={(newFiles) => handleFileChange('videos', newFiles)}
            error={errors.videos}
          />

          <FileUpload
            label="Audio Files"
            fileType="audios"
            accept="audio/*"
            multiple
            files={files.audios}
            onChange={(newFiles) => handleFileChange('audios', newFiles)}
            error={errors.audios}
          />

          <FileUpload
            label="Documents (PDF)"
            fileType="pdf"
            accept=".pdf"
            multiple
            files={files.pdf}
            onChange={(newFiles) => handleFileChange('pdf', newFiles)}
            error={errors.pdf}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Draft' : 'Save Draft')}
          </button>

          {isEditing && (
            <SubmitComplaintModal
              hrList={hrList}
              onSubmit={handleSubmitAsComplaint}
              loading={loading}
            />
          )}

          <button
            type="button"
            onClick={() => navigate('/drafts')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const SubmitComplaintModal = ({ hrList, onSubmit, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedHR, setSelectedHR] = useState('');

  const handleSubmit = () => {
    onSubmit(selectedHR);
    setShowModal(false);
    setSelectedHR('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="btn btn-success"
        disabled={loading}
      >
        Submit as Complaint
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Draft as Complaint</h3>
            <p>Select the HR/NGO organization to submit this complaint to:</p>
            
            <div className="form-group">
              <select
                value={selectedHR}
                onChange={(e) => setSelectedHR(e.target.value)}
                required
              >
                <option value="">Select HR/NGO...</option>
                {hrList.map((hr) => (
                  <option key={hr._id} value={hr._id}>
                    {hr.name} - {hr.organization} {hr.isNGO ? '(NGO)' : '(HR)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={!selectedHR || loading}
              >
                Submit Complaint
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DraftForm;