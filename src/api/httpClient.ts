import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { appConfig } from '../config/appConfig';
import AsyncStorageService from '../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../utils/constants';
import { unwrapStoredValue } from '../utils/roles';
import { AppError } from './errors';

// Reads from the same place LoginScreen actually writes to (AsyncStorageService,
// shared with the rest of the app's auth flow) — not tokenStorage/SecureStore,
// which nothing in the current login flow ever populates.
const withAuthHeader = async (config: InternalAxiosRequestConfig) => {
  const token = unwrapStoredValue(await AsyncStorageService.getItem(STORAGE_KEYS.AUTH_TOKEN));
  if (typeof token === 'string' && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const httpClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(withAuthHeader);

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (!error.response) {
      return Promise.reject(
        new AppError('Network error. Please check your connection and try again.', {
          code: 'NETWORK_ERROR',
        })
      );
    }

    const status = error.response.status;
    const messageFromServer =
      (error.response.data as any)?.message ||
      (error.response.data as any)?.error ||
      undefined;

    const defaultMessageByStatus: Record<number, string> = {
      400: 'Request could not be processed.',
      401: 'Your session is invalid. Please sign in again.',
      403: 'You do not have permission to perform this action.',
      404: 'Requested resource was not found.',
      500: 'Backend server error. Please try again in a moment.',
    };

    const message =
      messageFromServer || defaultMessageByStatus[status] || 'Unexpected API error occurred.';

    return Promise.reject(
      new AppError(message, {
        status,
      })
    );
  }
);
