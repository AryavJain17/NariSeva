import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { complaintService } from '../../services/complaintService';
import { formatDate } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const PerpetratorsList = () => {
  const [perpetrators, setPerpetrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('complaintCount');

  useEffect(() => {
    fetchPerpetrators();
  }, []);

  const fetchPerpetrators = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getPerpetrators();
      setPerpetrators(Array.isArray(response) ? response : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch perpetrators');
      toast.error('Failed to fetch perpetrators data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPerpetrators = perpetrators
    .filter((p) =>
      typeof p._id === 'string' &&
      p._id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'complaintCount':
          return b.count - a.count;
        case 'name':
          return a._id.localeCompare(b._id);
        case 'recent':
          return new Date(b.latestIncident) - new Date(a.latestIncident);
        default:
          return 0;
      }
    });

  if (loading) return <Loading message="Loading perpetrators data..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPerpetrators} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Perpetrators List</h2>
          <p className="text-gray-500">Track and monitor reported perpetrators</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search perpetrators..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="complaintCount">Sort by Complaint Count</option>
          <option value="name">Sort by Name</option>
          <option value="recent">Sort by Most Recent</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{perpetrators.length}</div>
          <div className="text-gray-600">Total Perpetrators</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-yellow-500">
            {perpetrators.filter((p) => p.count > 1).length}
          </div>
          <div className="text-gray-600">Repeat Offenders</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-red-500">
            {perpetrators.reduce((sum, p) => sum + p.count, 0)}
          </div>
          <div className="text-gray-600">Total Complaints</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPerpetrators.length === 0 ? (
          <p className="text-gray-500">No perpetrators found matching your search.</p>
        ) : (
          filteredAndSortedPerpetrators.map((p) => (
            <div key={p._id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-1">{p._id}</h3>
              <p className="text-gray-600">{p.count} complaint(s)</p>
              <p className="text-gray-500 text-sm mb-2">
                Last reported: {formatDate(p.latestIncident)}
              </p>
              {p.count > 1 && (
                <p className="text-red-600 font-semibold text-sm">⚠️ Repeat Offender — Escalation might be required.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PerpetratorsList;
