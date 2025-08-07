import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { draftService } from '../../services/draftService';
import { formatDate, truncateText } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const DraftList = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState('');

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await draftService.getUserDrafts();
      setDrafts(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;

    setDeleting(draftId);
    try {
      await draftService.deleteDraft(draftId);
      toast.success('Draft deleted successfully');
      setDrafts(drafts.filter(draft => draft._id !== draftId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete draft');
    } finally {
      setDeleting('');
    }
  };

  if (loading) return <Loading message="Loading drafts..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadDrafts} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Drafts</h2>
        <Link to="/complaints/new" className="btn btn-primary">
          Create New Complaint
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center border border-dashed border-gray-300 p-6 rounded-lg">
          <div className="text-4xl mb-2">📝</div>
          <h3 className="text-lg font-semibold">No drafts found</h3>
          <p className="text-gray-500 mb-4">You haven't saved any complaint drafts yet.</p>
          <Link to="/complaints/new" className="btn btn-primary">
            Create Your First Complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drafts.map((draft) => (
            <div key={draft._id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{draft.title || 'Untitled Draft'}</h3>
                <span className="text-xs text-white bg-yellow-500 px-2 py-1 rounded">DRAFT</span>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                {draft.description
                  ? truncateText(draft.description, 150)
                  : 'No description provided'}
              </p>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <div>
                  <strong>Created:</strong> {formatDate(draft.createdAt)}
                </div>
                <div>
                  <strong>Last Modified:</strong> {formatDate(draft.updatedAt)}
                </div>
                {draft.incidentDate && (
                  <div>
                    <strong>Incident Date:</strong> {formatDate(draft.incidentDate)}
                  </div>
                )}
                {draft.incidentLocation && (
                  <div>
                    <strong>Location:</strong> {draft.incidentLocation}
                  </div>
                )}
                {draft.isAnonymous && (
                  <div className="text-blue-600 font-semibold">
                    <span>Anonymous</span>
                  </div>
                )}
              </div>

              {(draft.images?.length > 0 ||
                draft.videos?.length > 0 ||
                draft.audios?.length > 0 ||
                draft.pdf) && (
                <div className="text-sm text-gray-700 mb-4">
                  <span className="font-semibold">Attachments:</span>
                  <div className="flex gap-2 mt-1">
                    {draft.images?.length > 0 && (
                      <span>📷 {draft.images.length}</span>
                    )}
                    {draft.videos?.length > 0 && (
                      <span>🎥 {draft.videos.length}</span>
                    )}
                    {draft.audios?.length > 0 && (
                      <span>🎵 {draft.audios.length}</span>
                    )}
                    {draft.pdf && <span>📄 1</span>}
                  </div>
                </div>
              )}

              {/* <div className="flex flex-wrap gap-2">
                <Link to={`http://localhost:5000/api/drafts/${draft._id}`} className="btn btn-outline">
                  View Details
                </Link>
                <Link to={`http://localhost:5000/api/drafts/${draft._id}/edit`} className="btn btn-secondary">
                  Edit Draft
                </Link>
                <Link to={`http://localhost:5000/api/drafts/${draft._id}/submit`} className="btn btn-primary">
                  Submit as Complaint
                </Link>
                <button
                  onClick={() => handleDeleteDraft(draft._id)}
                  className="btn btn-danger"
                  disabled={deleting === draft._id}
                >
                  {deleting === draft._id ? 'Deleting...' : 'Delete'}
                </button>
              </div> */}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">About Drafts</h3>
        <p className="text-sm text-gray-700 mb-2">
          Drafts allow you to save your complaint information without submitting it immediately.
          You can come back later to edit and complete your complaint when you're ready.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Drafts are automatically saved as you type</li>
          <li>You can upload files and attach evidence to drafts</li>
          <li>Convert drafts to complaints when you're ready to submit</li>
          <li>Drafts are private and only visible to you</li>
        </ul>
      </div>
    </div>
  );
};

export default DraftList;
