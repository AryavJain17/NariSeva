import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusColor, truncateText } from '../../utils/helpers';
import { COMPLAINT_STATUS_LABELS } from '../../utils/constants';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { user } = useAuth();

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (user.role === 'hr') {
        data = await complaintService.getHRComplaints();
      } else {
        data = await complaintService.getUserComplaints();
      }
      setComplaints(data.complaints || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus, flagReason = '') => {
    try {
      await complaintService.updateComplaintStatus(complaintId, { status: newStatus, flagReason });
      toast.success('Complaint status updated successfully');
      loadComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  if (loading) return <Loading message="Loading complaints..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadComplaints} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {user.role === 'hr' ? 'Assigned Complaints' : 'My Complaints'}
        </h2>
        {user.role !== 'hr' && (
          <Link to="/complaints/new" className="btn btn-primary">
            File New Complaint
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-select">
            <option value="all">All Complaints</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select">
            <option value="createdAt">Date Created</option>
            <option value="incidentDate">Incident Date</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-xl font-bold"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {sortedComplaints.length === 0 ? (
        <div className="text-center text-gray-500 space-y-4">
          <p>No complaints found.</p>
          {user.role !== 'hr' && (
            <Link to="/complaints/new" className="btn btn-primary">
              File Your First Complaint
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedComplaints.map(complaint => (
            <div key={complaint._id} className="bg-white shadow rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{complaint.title}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(complaint.status)}`}>
                  {COMPLAINT_STATUS_LABELS[complaint.status]}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                {truncateText(complaint.description, 150)}
              </p>

              <div className="space-y-1 text-sm text-gray-700">
                <div><strong>Incident Date:</strong> {formatDate(complaint.incidentDate)}</div>
                <div><strong>Location:</strong> {complaint.incidentLocation}</div>
                <div><strong>Submitted:</strong> {formatDate(complaint.createdAt)}</div>
                {complaint.isAnonymous && (
                  <div className="text-red-500 font-medium">Anonymous</div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link 
                  to={`/complaints/${complaint._id}`} 
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Details
                </Link>

                {user.role === 'hr' && complaint.status === 'pending' && (
                  <button 
                    onClick={() => handleStatusUpdate(complaint._id, 'under_review')}
                    className="btn btn-secondary text-xs"
                  >
                    Start Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
