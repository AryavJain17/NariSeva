import { isValidEmail, isValidPhone } from './helpers';

// Validation rules
export const validateRegister = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Phone validation
  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  // Address validation
  if (!formData.address?.trim()) {
    errors.address = 'Address is required';
  }

  // HR specific validations
  if (formData.role === 'hr') {
    if (!formData.organization?.trim()) {
      errors.organization = 'Organization is required for HR';
    }
    if (!formData.position?.trim()) {
      errors.position = 'Position is required for HR';
    }
    if (!formData.department?.trim()) {
      errors.department = 'Department is required for HR';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Login validation
export const validateLogin = ({ email, password }) => {
    const errors = {};
  
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Invalid email address';
    }
  
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
  
    return errors;
  };
  

// Complaint validation
export const validateComplaint = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = 'Title is required';
  } else if (formData.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }

  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }

  if (!formData.incidentDate) {
    errors.incidentDate = 'Incident date is required';
  } else {
    const incidentDate = new Date(formData.incidentDate);
    const today = new Date();
    if (incidentDate > today) {
      errors.incidentDate = 'Incident date cannot be in the future';
    }
  }

  if (!formData.incidentLocation?.trim()) {
    errors.incidentLocation = 'Incident location is required';
  }

  if (!formData.hrId) {
    errors.hrId = 'Please select an HR/NGO to report to';
  }

  // If not anonymous, perpetrator details are required
  if (!formData.isAnonymous) {
    if (!formData.perpetratorName?.trim()) {
      errors.perpetratorName = 'Perpetrator name is required for non-anonymous complaints';
    }
    if (!formData.perpetratorDetails?.trim()) {
      errors.perpetratorDetails = 'Perpetrator details are required for non-anonymous complaints';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Draft validation (less strict than complaint)
export const validateDraft = (formData) => {
  const errors = {};

  if (formData.title && formData.title.trim().length > 0 && formData.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters if provided';
  }

  if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters if provided';
  }

  if (formData.incidentDate) {
    const incidentDate = new Date(formData.incidentDate);
    const today = new Date();
    if (incidentDate > today) {
      errors.incidentDate = 'Incident date cannot be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Profile update validation
export const validateProfile = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  if (!formData.address?.trim()) {
    errors.address = 'Address is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// File validation
export const validateFiles = (files, allowedTypes, maxSize = 10 * 1024 * 1024) => {
  const errors = [];

  files.forEach((file, index) => {
    if (file.size > maxSize) {
      errors.push(`File ${index + 1}: File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File ${index + 1}: File type ${file.type} is not allowed`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};