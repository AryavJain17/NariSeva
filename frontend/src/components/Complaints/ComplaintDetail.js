import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusColor, formatFileSize } from '../../utils/helpers';
import { COMPLAINT_STATUS_LABELS } from '../../utils/constants';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const ComplaintDetail = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [ngoReportDetails, setNgoReportDetails] = useState('');
  const [showNgoModal, setShowNgoModal] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data.complaint);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    setUpdating(true);
    try {
      await complaintService.updateComplaintStatus(id, { 
        status: newStatus, 
        flagReason: newStatus === 'flagged' ? flagReason : undefined 
      });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      setNewStatus('');
      setFlagReason('');
      loadComplaint();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReportToNGO = async () => {
    if (!ngoReportDetails.trim()) {
      toast.error('Please provide report details');
      return;
    }
    
    setUpdating(true);
    try {
      await complaintService.reportToNGO(id, { ngoReportDetails });
      toast.success('Complaint reported to NGO successfully');
      setShowNgoModal(false);
      setNgoReportDetails('');
      loadComplaint();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report to NGO');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileDownload = async (fileType, filename) => {
    try {
      await complaintService.downloadFile(id, fileType, filename);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (loading) return <Loading message="Loading complaint details..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadComplaint} />;
  if (!complaint) return <ErrorMessage message="Complaint not found" />;

  const canUpdateStatus = user.role === 'hr' && user._id === complaint.hrId?._id;

  return (
    <div className="complaint-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <div className="header-info">
          <h2>{complaint.title}</h2>
          <span className={`status-badge ${getStatusColor(complaint.status)}`}>
            {COMPLAINT_STATUS_LABELS[complaint.status]}
          </span>
        </div>
        
        {canUpdateStatus && (
          <div className="header-actions">
            <button 
              onClick={() => setShowStatusModal(true)}
              className="btn-secondary"
            >
              Update Status
            </button>
            {!complaint.reportedToNGO && (
              <button 
                onClick={() => setShowNgoModal(true)}
                className="btn-outline"
              >
                Report to NGO
              </button>
            )}
          </div>
        )}
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Complaint Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Complaint ID:</label>
              <span>{complaint._id}</span>
            </div>
            <div className="info-item">
              <label>Submitted By:</label>
              <span>
                {complaint.isAnonymous ? 'Anonymous' : complaint.userId?.name || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <label>Submitted On:</label>
              <span>{formatDate(complaint.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Assigned HR:</label>
              <span>{complaint.hrId?.name || 'Not assigned'}</span>
            </div>
            <div className="info-item">
              <label>Organization:</label>
              <span>{complaint.hrId?.organization || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{formatDate(complaint.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Incident Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Incident Date:</label>
              <span>{formatDate(complaint.incidentDate)}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{complaint.incidentLocation}</span>
            </div>
            {complaint.perpetratorName && (
              <div className="info-item">
                <label>Perpetrator:</label>
                <span>{complaint.perpetratorName}</span>
              </div>
            )}
          </div>
          
          <div className="description-section">
            <label>Description:</label>
            <div className="description-content">
              {complaint.description}
            </div>
          </div>

          {complaint.perpetratorDetails && (
            <div className="description-section">
              <label>Perpetrator Details:</label>
              <div className="description-content">
                {complaint.perpetratorDetails}
              </div>
            </div>
          )}
        </div>

        {(complaint.images?.length > 0 || complaint.videos?.length > 0 || 
          complaint.audios?.length > 0 || complaint.pdf) && (
          <div className="detail-section">
            <h3>Attachments</h3>
            
            {complaint.images?.length > 0 && (
              <div className="attachment-group">
                <h4>Images ({complaint.images.length})</h4>
                <div className="file-list">
                  {complaint.images.map((image, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{image}</span>
                      <button 
                        onClick={() => handleFileDownload('image', image)}
                        className="download-btn"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complaint.videos?.length > 0 && (
              <div className="attachment-group">
                <h4>Videos ({complaint.videos.length})</h4>
                <div className="file-list">
                  {complaint.videos.map((video, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{video}</span>
                      <button 
                        onClick={() => handleFileDownload('video', video)}
                        className="download-btn"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complaint.audios?.length > 0 && (
              <div className="attachment-group">
                <h4>Audio Files ({complaint.audios.length})</h4>
                <div className="file-list">
                  {complaint.audios.map((audio, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{audio}</span>
                      <button 
                        onClick={() => handleFileDownload('audio', audio)}
                        className="download-btn"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complaint.pdf && (
              <div className="attachment-group">
                <h4>PDF Document</h4>
                <div className="file-list">
                  <div className="file-item">
                    <span className="file-name">{complaint.pdf}</span>
                    <button 
                      onClick={() => handleFileDownload('pdf', complaint.pdf)}
                      className="download-btn"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {complaint.flagReason && (
          <div className="detail-section">
            <h3>Flag Reason</h3>
            <div className="description-content">
              {complaint.flagReason}
            </div>
          </div>
        )}

        {complaint.reportedToNGO && complaint.ngoReportDetails && (
          <div className="detail-section">
            <h3>NGO Report</h3>
            <div className="info-item">
              <label>Reported On:</label>
              <span>{formatDate(complaint.ngoReportDate)}</span>
            </div>
            <div className="description-content">
              {complaint.ngoReportDetails}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Complaint Status</h3>
            <div className="form-group">
              <label>New Status:</label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            
            {newStatus === 'flagged' && (
              <div className="form-group">
                <label>Flag Reason:</label>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Explain why this complaint is being flagged..."
                  rows="3"
                />
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowStatusModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleStatusUpdate}
                className="btn-primary"
                disabled={updating || !newStatus}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NGO Report Modal */}
      {showNgoModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Report to NGO</h3>
            <div className="form-group">
              <label>Report Details:</label>
              <textarea
                value={ngoReportDetails}
                onChange={(e) => setNgoReportDetails(e.target.value)}
                placeholder="Provide details about why this complaint is being reported to NGO..."
                rows="4"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowNgoModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleReportToNGO}
                className="btn-primary"
                disabled={updating || !ngoReportDetails.trim()}
              >
                {updating ? 'Reporting...' : 'Report to NGO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;