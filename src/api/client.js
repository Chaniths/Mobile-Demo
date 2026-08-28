import axios from 'axios';
import config from '../utils/config';
import { setupInterceptors } from './interceptors';

// Helpful debug log to verify which base URL the app is using
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('API baseURL:', config.apiUrl);
}

// Create axios instance
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors (authentication, error handling, etc.)
setupInterceptors(apiClient);

export default apiClient;

