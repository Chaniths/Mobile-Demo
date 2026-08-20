import AsyncStorageService from '../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../utils/constants';

let memoryToken = null;

export const setAuthToken = (token) => {
  memoryToken = token || null;
};

export const setupInterceptors = (axiosInstance) => {
  // Request interceptor - add auth token
  axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        const token = memoryToken || (await AsyncStorageService.getItem(STORAGE_KEYS.AUTH_TOKEN));
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
            setAuthToken(null);
            await AsyncStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorageService.removeItem(STORAGE_KEYS.USER_DATA);
            break;
          case 403:
            if (__DEV__) {
              console.warn('Access forbidden:', error.response.data);
            }
            break;
          case 400:
          case 422:
            break;
          case 404:
            break;
          case 500:
            console.error('Server error');
            break;
          default:
            if (__DEV__) {
              console.warn('API Error:', error.response.data);
            }
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

