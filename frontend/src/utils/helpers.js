import { COMPLAINT_STATUS_LABELS, MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from './constants';

// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date for input fields
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Get status label
export const getStatusLabel = (status) => {
  return COMPLAINT_STATUS_LABELS[status] || status;
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    pending: 'status-pending',
    under_review: 'status-under-review',
    resolved: 'status-resolved',
    flagged: 'status-flagged'
  };
  return colors[status] || 'status-default';
};

// Validate file size
export const validateFileSize = (file) => {
  return file.size <= MAX_FILE_SIZE;
};

// Validate file type
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Get file size in readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate random ID (for temporary use)
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if user is HR
export const isHR = (user) => {
  return user?.role === 'hr';
};

// Check if user is regular user
export const isUser = (user) => {
  return user?.role === 'user';
};

// Format complaint reference number
export const formatComplaintRef = (id) => {
  if (!id) return '';
  return `WH-${id.substring(id.length - 6).toUpperCase()}`;
};

// Get file type from filename
export const getFileType = (filename) => {
  if (!filename) return 'unknown';
  const extension = filename.split('.').pop().toLowerCase();
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv'];
  const audioExts = ['mp3', 'wav', 'aac', 'ogg'];
  const pdfExts = ['pdf'];
  
  if (imageExts.includes(extension)) return 'image';
  if (videoExts.includes(extension)) return 'video';
  if (audioExts.includes(extension)) return 'audio';
  if (pdfExts.includes(extension)) return 'pdf';
  
  return 'unknown';
};

// Validate email format
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const re = /^\d{10}$/;
  return re.test(phone);
};
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'badge badge-warning';
    case 'under_review':
      return 'badge badge-info';
    case 'resolved':
      return 'badge badge-success';
    case 'flagged':
      return 'badge badge-danger';
    default:
      return 'badge badge-secondary';
  }
};
