// Validation boundary helpers (Page 12 of specification)
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email.trim());
};

export const isValidPhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return typeof phone === 'string' && phone.trim().length >= 10;
};

export const validateRegistration = ({ name, email, password, role }) => {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !isValidEmail(email)) errors.push('A valid email address is required.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
  if (role && !['ADMIN', 'CUSTOMER', 'SUPPORT'].includes(role)) errors.push('Invalid role selected.');
  return errors;
};

export const validateCustomer = ({ phone, address }) => {
  const errors = [];
  if (!phone || !isValidPhone(phone)) errors.push('Valid 10-digit phone number is required.');
  return errors;
};
