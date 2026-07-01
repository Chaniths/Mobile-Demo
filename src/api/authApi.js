import apiClient from './client';

// Backend uses a unified login endpoint for all roles.
export const loginByRole = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export default {
  loginByRole,
};
