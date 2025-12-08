import AsyncStorageService from '../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../utils/constants';

export const setupInterceptors = (axiosInstance) => {
  // Request interceptor - add auth token
  axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.response) {
        // Handle specific error codes
        switch (error.response.status) {
          case 401:
            // Unauthorized - clear auth and redirect to login
            await AsyncStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorageService.removeItem(STORAGE_KEYS.USER_DATA);
            // TODO: Navigate to login screen
            break;
          case 403:
            // Forbidden
            console.error('Access forbidden');
            break;
          case 404:
            console.error('Resource not found');
            break;
          case 500:
            console.error('Server error');
            break;
          default:
            console.error('API Error:', error.response.data);
        }
      } else if (error.request) {
        // Request made but no response
        console.error('Network error:', error.message);
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;

