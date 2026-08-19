// Backend Prisma enums are BUYER / SELLER / DRIVER / FIELD_ADMIN / ADMIN.
// loginUser() lowercases those, so FIELD_ADMIN arrives as "field_admin".

export const normalizeRole = (role) => {
  const compact = String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (compact === 'fieldadmin' || compact === 'field_admin') return 'field_admin';
  if (compact === 'customer') return 'buyer';
  if (compact === 'vendor') return 'seller';
  return compact;
};

export const isFieldAdminRole = (role) => normalizeRole(role) === 'field_admin';

export const buildSessionUser = (apiUser = {}, profile = {}) => {
  const role = normalizeRole(apiUser.role);
  return {
    ...profile,
    ...apiUser,
    role,
    id: apiUser.id,
    email: apiUser.email,
    ...(role === 'field_admin' ? { fieldAdminId: profile.id ?? apiUser.fieldAdminId } : {}),
    ...(role === 'driver' ? { driverId: profile.id ?? apiUser.driverId } : {}),
    ...(role === 'seller' ? { sellerId: profile.id ?? apiUser.sellerId } : {}),
  };
};

export const unwrapStoredValue = (value) => {
  if (value == null) return null;
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return unwrapStoredValue(parsed);
  } catch {
    return value;
  }
};
