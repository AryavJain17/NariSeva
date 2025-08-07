import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { COMPLAINT_STATUS_LABELS } from '../../utils/constants';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const HRComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getHRComplaints();
      setComplaints(response || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus, flagReason = '') => {
    try {
      await complaintService.updateComplaintStatus(complaintId, { status: newStatus, flagReason });
      toast.success('Complaint status updated successfully');
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReportToNGO = async (complaintId, ngoReportDetails) => {
    try {
      await complaintService.reportToNGO(complaintId, { ngoReportDetails });
      toast.success('Complaint reported to NGO successfully');
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report to NGO');
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesFilter = filter === 'all' || complaint.status === filter;
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.perpetratorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.incidentLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <Loading message="Loading complaints..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchComplaints} />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Complaint Management</h2>
        <div className="flex flex-wrap gap-4">
          <StatCard label="Total Complaints" value={complaints.length} />
          <StatCard label="Pending" value={complaints.filter(c => c.status === 'pending').length} />
          <StatCard label="Under Review" value={complaints.filter(c => c.status === 'under_review').length} />
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="flagged">Flagged</option>
        </select>

        <input
          type="text"
          placeholder="Search complaints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-64"
        />
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="text-gray-600 text-center">No complaints found matching your criteria.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              onStatusUpdate={handleStatusUpdate}
              onReportToNGO={handleReportToNGO}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow text-center min-w-[150px]">
    <div className="text-xl font-semibold">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const ComplaintCard = ({ complaint, onStatusUpdate, onReportToNGO }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNGOModal, setShowNGOModal] = useState(false);
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [flagReason, setFlagReason] = useState('');
  const [ngoReportDetails, setNgoReportDetails] = useState('');

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{complaint.title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeClass(complaint.status)}`}>
          {COMPLAINT_STATUS_LABELS[complaint.status]}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Submitted:</strong> {formatDate(complaint.createdAt)}</p>
        <p><strong>Incident:</strong> {formatDate(complaint.incidentDate)}</p>
        <p><strong>Location:</strong> {complaint.incidentLocation}</p>
        {!complaint.isAnonymous && <p><strong>Perpetrator:</strong> {complaint.perpetratorName}</p>}
        <p><strong>Anonymous:</strong> {complaint.isAnonymous ? 'Yes' : 'No'}</p>
      </div>

      <p className="text-gray-800 text-sm">{complaint.description.substring(0, 150)}...</p>

      <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
        {complaint.files?.images?.length > 0 && <span>📷 {complaint.files.images.length} image(s)</span>}
        {complaint.files?.videos?.length > 0 && <span>🎥 {complaint.files.videos.length} video(s)</span>}
        {complaint.files?.audios?.length > 0 && <span>🎵 {complaint.files.audios.length} audio(s)</span>}
        {complaint.files?.pdf?.length > 0 && <span>📄 {complaint.files.pdf.length} document(s)</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={`/complaints/${complaint._id}`} className="btn btn-sm bg-blue-600 text-white rounded px-3 py-1">
          View Details
        </Link>
        <button
          onClick={() => setShowStatusModal(true)}
          className="btn btn-sm bg-gray-200 text-gray-800 rounded px-3 py-1"
        >
          Update Status
        </button>
        <button
          onClick={() => setShowNGOModal(true)}
          className="btn btn-sm bg-yellow-400 text-white rounded px-3 py-1"
        >
          Report to NGO
        </button>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Complaint Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="flagged">Flagged</option>
            </select>

            {newStatus === 'flagged' && (
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="Reason for flagging"
              />
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowStatusModal(false)} className="btn btn-sm bg-gray-300 px-3 py-1 rounded">
                Cancel
              </button>
              <button onClick={() => {
                onStatusUpdate(complaint._id, newStatus, flagReason);
                setShowStatusModal(false);
              }} className="btn btn-sm bg-blue-600 text-white px-3 py-1 rounded">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showNGOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Report to NGO</h3>
            <textarea
              value={ngoReportDetails}
              onChange={(e) => setNgoReportDetails(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Details to include in NGO report"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNGOModal(false)} className="btn btn-sm bg-gray-300 px-3 py-1 rounded">
                Cancel
              </button>
              <button onClick={() => {
                onReportToNGO(complaint._id, ngoReportDetails);
                setShowNGOModal(false);
              }} className="btn btn-sm bg-yellow-500 text-white px-3 py-1 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRComplaintList;
