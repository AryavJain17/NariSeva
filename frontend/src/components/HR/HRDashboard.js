import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { COMPLAINT_STATUS_LABELS } from '../../utils/constants';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const HRDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    flagged: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [perpetrators, setPerpetrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load complaints
      const complaintsData = await complaintService.getHRComplaints();
      const complaints = complaintsData.complaints || [];
      
      // Calculate statistics
      const statsData = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        underReview: complaints.filter(c => c.status === 'under_review').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        flagged: complaints.filter(c => c.status === 'flagged').length
      };
      setStats(statsData);
      
      // Get recent complaints (last 5)
      const recent = complaints
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentComplaints(recent);
      
      // Load perpetrators list
      const perpetratorsData = await complaintService.getPerpetrators();
      setPerpetrators(perpetratorsData.perpetrators || []);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadDashboardData} />;

  return (
    <div className="p-6 space-y-8">
      <div className="mb-6">
        {/* <h1 className="text-3xl font-bold text-gray-800">HR Dashboard</h1> */}
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>
  
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
          <span className="text-3xl">📊</span>
          <div>
            <h3 className="text-xl font-bold">{stats.total}</h3>
            <p className="text-gray-500 text-sm">Total Complaints</p>
          </div>
        </div>
  
        <div className="bg-yellow-100 rounded-2xl shadow p-4 flex items-center gap-4">
          <span className="text-3xl">⏳</span>
          <div>
            <h3 className="text-xl font-bold">{stats.pending}</h3>
            <p className="text-gray-600 text-sm">Pending Review</p>
          </div>
        </div>
  
        <div className="bg-blue-100 rounded-2xl shadow p-4 flex items-center gap-4">
          <span className="text-3xl">🔍</span>
          <div>
            <h3 className="text-xl font-bold">{stats.underReview}</h3>
            <p className="text-gray-600 text-sm">Under Review</p>
          </div>
        </div>
  
        <div className="bg-green-100 rounded-2xl shadow p-4 flex items-center gap-4">
          <span className="text-3xl">✅</span>
          <div>
            <h3 className="text-xl font-bold">{stats.resolved}</h3>
            <p className="text-gray-600 text-sm">Resolved</p>
          </div>
        </div>
  
        <div className="bg-red-100 rounded-2xl shadow p-4 flex items-center gap-4">
          <span className="text-3xl">🔴</span>
          <div>
            <h3 className="text-xl font-bold">{stats.flagged}</h3>
            <p className="text-gray-600 text-sm">Flagged</p>
          </div>
        </div>
      </div>
  
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
          {recentComplaints.length === 0 ? (
            <p className="text-gray-500">No recent complaints.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Complainant</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td className="px-4 py-2 font-mono text-sm text-gray-700">
                        {complaint._id.slice(-6)}
                      </td>
                      <td className="px-4 py-2">{complaint.complainant?.name || 'N/A'}</td>
                      <td className="px-4 py-2">{formatDate(complaint.createdAt)}</td>
                      <td className="px-4 py-2 font-semibold" style={{ color: getStatusColor(complaint.status) }}>
                        {COMPLAINT_STATUS_LABELS[complaint.status]}
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/hr/complaints/${complaint._id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
  
        {/* Perpetrators */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Perpetrators</h2>
          {perpetrators.length === 0 ? (
            <p className="text-gray-500">No perpetrators found.</p>
          ) : (
            <ul className="space-y-2">
              {perpetrators.map((person) => (
                <li key={person._id} className="text-gray-700">
                  <strong>{person.name}</strong> — {person.role}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default HRDashboard;
