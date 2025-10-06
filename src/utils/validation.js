// Validation utility functions
export const validatePhone = (phone) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number (7-15 digits)
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { isValid: false, message: 'Phone number must be 7-15 digits' };
  }
  
  return { isValid: true, message: '' };
};

export const validateVIN = (vin) => {
  // Remove spaces and convert to uppercase
  const cleanVin = vin.replace(/\s/g, '').toUpperCase();
  
  // VIN must be exactly 17 characters
  // if (cleanVin.length !== 17) {
  //   return { isValid: false, message: 'VIN must be exactly 17 characters' };
  // }
  
  // VIN cannot contain I, O, or Q
  // if (/[IOQ]/.test(cleanVin)) {
  //   return { isValid: false, message: 'VIN cannot contain letters I, O, or Q' };
  // }
  
  // Check if it contains only valid VIN characters
  // if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
  //   return { isValid: false, message: 'VIN contains invalid characters' };
  // }
  
  return { isValid: true, message: '' };
};

export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);
  
  if (!year || isNaN(yearNum)) {
    return { isValid: false, message: 'Year is required' };
  }
  
  if (yearNum < 1900 || yearNum > currentYear + 1) {
    return { isValid: false, message: `Year must be between 1900 and ${currentYear + 1}` };
  }
  
  return { isValid: true, message: '' };
};

export const validateNumeric = (value, fieldName, min = 0, max = 999999) => {
  if (!value) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }
  
  if (numValue < min || numValue > max) {
    return { isValid: false, message: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true, message: '' };
};

export const validateOTP = (otp) => {
  if (!otp) {
    return { isValid: false, message: 'OTP is required' };
  }
  
  // OTP should be 4-8 digits
  if (!/^\d{4,8}$/.test(otp)) {
    return { isValid: false, message: 'OTP must be 4-8 digits' };
  }
  
  return { isValid: true, message: '' };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (value.trim().length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters` };
  }
  
  return { isValid: true, message: '' };
};

export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};
