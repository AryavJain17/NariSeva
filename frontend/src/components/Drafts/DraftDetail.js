import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { draftService } from '../../services/draftService';
import { hrService } from '../../services/hrService';
import { formatDate } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const DraftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [hrList, setHrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHR, setSelectedHR] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDraft();
    fetchHRList();
  }, [id]);

  const fetchDraft = async () => {
    try {
      setLoading(true);
      const response = await draftService.getDraftById(id);
      setDraft(response.draft);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load draft');
      toast.error('Failed to load draft');
    } finally {
      setLoading(false);
    }
  };

  const fetchHRList = async () => {
    try {
      const response = await hrService.getAllHR();
      setHrList(response.hrList || []);
    } catch (err) {
      console.error('Failed to fetch HR list:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      await draftService.deleteDraft(id);
      toast.success('Draft deleted successfully');
      navigate('/drafts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete draft');
    }
  };

  const handleSubmitAsComplaint = async () => {
    if (!selectedHR) {
      toast.error('Please select an HR/NGO to submit the complaint to');
      return;
    }

    try {
      setSubmitting(true);
      await draftService.submitDraftAsComplaint(id, { hrId: selectedHR });
      toast.success('Draft submitted as complaint successfully');
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading) return <Loading message="Loading draft details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDraft} />;
  if (!draft) return <ErrorMessage message="Draft not found" />;

  return (
    <div className="draft-detail-container">
      <div className="detail-header">
        <div className="header-content">
          <h2>{draft.title}</h2>
          <div className="draft-meta">
            <span className="draft-date">
              Created: {formatDate(draft.createdAt)}
            </span>
            <span className="draft-updated">
              Last updated: {formatDate(draft.updatedAt)}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <Link to={`/drafts/${id}/edit`} className="btn btn-primary">
            Edit Draft
          </Link>
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-success"
          >
            Submit as Complaint
          </button>
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete Draft
          </button>
        </div>
      </div>

      <div className="draft-content">
        <div className="content-section">
          <h3>Incident Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Title:</label>
              <span>{draft.title}</span>
            </div>
            <div className="detail-item">
              <label>Description:</label>
              <div className="description-text">{draft.description}</div>
            </div>
            <div className="detail-item">
              <label>Incident Date:</label>
              <span>{draft.incidentDate ? formatDate(draft.incidentDate) : 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <label>Incident Location:</label>
              <span>{draft.incidentLocation || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <label>Anonymous Submission:</label>
              <span className={`status-badge ${draft.isAnonymous ? 'anonymous' : 'identified'}`}>
                {draft.isAnonymous ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h3>Perpetrator Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Perpetrator Name:</label>
              <span>{draft.perpetratorName || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <label>Additional Details:</label>
              <span>{draft.perpetratorDetails || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h3>Supporting Evidence</h3>
          <div className="evidence-grid">
            {draft.files?.images && draft.files.images.length > 0 && (
              <div className="evidence-item">
                <label>Images ({draft.files.images.length}):</label>
                <div className="file-list">
                  {draft.files.images.map((image, index) => (
                    <div key={index} className="file-item">
                      <span className="file-icon">📷</span>
                      <span className="file-name">{image}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draft.files?.videos && draft.files.videos.length > 0 && (
              <div className="evidence-item">
                <label>Videos ({draft.files.videos.length}):</label>
                <div className="file-list">
                  {draft.files.videos.map((video, index) => (
                    <div key={index} className="file-item">
                      <span className="file-icon">🎥</span>
                      <span className="file-name">{video}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draft.files?.audios && draft.files.audios.length > 0 && (
              <div className="evidence-item">
                <label>Audio Files ({draft.files.audios.length}):</label>
                <div className="file-list">
                  {draft.files.audios.map((audio, index) => (
                    <div key={index} className="file-item">
                      <span className="file-icon">🎵</span>
                      <span className="file-name">{audio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draft.files?.pdf && draft.files.pdf.length > 0 && (
              <div className="evidence-item">
                <label>Documents ({draft.files.pdf.length}):</label>
                <div className="file-list">
                  {draft.files.pdf.map((doc, index) => (
                    <div key={index} className="file-item">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!draft.files || 
              (!draft.files.images?.length && 
               !draft.files.videos?.length && 
               !draft.files.audios?.length && 
               !draft.files.pdf?.length)) && (
              <div className="no-evidence">
                <p>No supporting evidence attached to this draft.</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-section">
          <h3>Draft Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Created:</label>
              <span>{formatDate(draft.createdAt)}</span>
            </div>
            <div className="detail-item">
              <label>Last Modified:</label>
              <span>{formatDate(draft.updatedAt)}</span>
            </div>
            <div className="detail-item">
              <label>Status:</label>
              <span className="status-badge draft-status">Draft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit as Complaint Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Submit Draft as Complaint</h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="modal-close"
                disabled={submitting}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <p>
                Select the HR/NGO organization to submit this complaint to. 
                Once submitted, this draft will become an official complaint and 
                will be permanently removed from your drafts.
              </p>
              
              <div className="form-group">
                <label>Select HR/NGO Organization:</label>
                <select
                  value={selectedHR}
                  onChange={(e) => setSelectedHR(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Choose an organization...</option>
                  {hrList.map((hr) => (
                    <option key={hr._id} value={hr._id}>
                      {hr.name} - {hr.organization} 
                      {hr.isNGO ? ' (NGO)' : ' (HR)'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedHR && (
                <div className="selected-hr-info">
                  {(() => {
                    const selected = hrList.find(hr => hr._id === selectedHR);
                    return selected ? (
                      <div className="hr-details">
                        <h4>Selected Organization:</h4>
                        <p><strong>Name:</strong> {selected.name}</p>
                        <p><strong>Organization:</strong> {selected.organization}</p>
                        <p><strong>Type:</strong> {selected.isNGO ? 'NGO' : 'HR Department'}</p>
                        {selected.department && <p><strong>Department:</strong> {selected.department}</p>}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={handleSubmitAsComplaint}
                className="btn btn-primary"
                disabled={!selectedHR || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftDetail;