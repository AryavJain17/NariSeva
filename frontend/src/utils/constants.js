export const COMPLAINT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  FLAGGED: 'flagged'
};

export const COMPLAINT_STATUS_LABELS = {
  [COMPLAINT_STATUS.PENDING]: 'Pending',
  [COMPLAINT_STATUS.UNDER_REVIEW]: 'Under Review',
  [COMPLAINT_STATUS.RESOLVED]: 'Resolved',
  [COMPLAINT_STATUS.FLAGGED]: 'Flagged'
};

export const USER_ROLES = {
  USER: 'user',
  HR: 'hr'
};

export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  PDF: 'pdf'
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'],
  videos: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  audios: ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg'],
  pdf: ['application/pdf']
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile'
  },
  COMPLAINTS: {
    BASE: '/complaints',
    USER: '/complaints/user',
    HR: '/complaints/hr',
    PERPETRATORS: '/complaints/perpetrators'
  },
  DRAFTS: {
    BASE: '/drafts'
  },
  HR: {
    BASE: '/hr'
  }
};