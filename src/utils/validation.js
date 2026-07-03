export const isValidName = (value) => /^[A-Za-z\s]+$/.test(value.trim()) && value.trim().length > 0;

export const isValidLocalPhone = (value) => /^\d{9}$/.test(value);

export const normalizePhone = (value) => {
  const digits = `${value || ''}`.replace(/\D/g, '').slice(0, 9);
  return digits;
};

export const formatPhone = (value) => {
  const local = normalizePhone(value);
  return local ? `+94${local}` : '';
};

export const getPasswordStrength = (pwd = '') => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score === 3) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#16a34a' };
};
