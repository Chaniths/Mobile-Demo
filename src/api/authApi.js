import apiClient from './client';

const roleLoginPath = {
  fieldadmin: '/auth/fieldadmin/login',
  driver: '/auth/driver/login',
};

export const loginByRole = async ({ email, password, role }) => {
  const path = roleLoginPath[role];
  if (!path) {
    throw new Error(`Unsupported backend login role: ${role}`);
  }

  const response = await apiClient.post(path, { email, password });
  return response.data;
};

export default {
  loginByRole,
};
