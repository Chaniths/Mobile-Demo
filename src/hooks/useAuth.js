import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from '../store/slices/authSlice';
import AsyncStorageService from '../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials) => {
      try {
        dispatch(loginStart());
        
        // TODO: Make API call to login endpoint
        // const response = await authAPI.login(credentials);
        
        // For now, mock response
        const mockResponse = {
          user: { id: 1, name: 'Test User', role: 'buyer' },
          token: 'mock_token_123',
        };

        // Store token and user data
        await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, mockResponse.token);
        await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, mockResponse.user);

        dispatch(loginSuccess(mockResponse));
        return { success: true };
      } catch (err) {
        dispatch(loginFailure(err.message || 'Login failed'));
        return { success: false, error: err.message };
      }
    },
    [dispatch]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Clear stored data
      await AsyncStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorageService.removeItem(STORAGE_KEYS.USER_DATA);

      // TODO: Make API call to logout endpoint if needed
      
      dispatch(logoutAction());
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  /**
   * Check if user is authenticated (on app start)
   */
  const checkAuth = useCallback(async () => {
    try {
      const storedToken = await AsyncStorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorageService.getItem(STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUser) {
        dispatch(loginSuccess({ token: storedToken, user: storedUser }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Auth check error:', err);
      return false;
    }
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  };
};

export default useAuth;

