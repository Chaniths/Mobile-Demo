import axios from 'axios';
import config from '../utils/config';
import { setupInterceptors } from './interceptors';

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

