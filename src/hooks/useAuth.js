import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  loginDriverAsync,
  restoreSessionAsync,
  logoutAsync,
  clearError,
} from "../store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth,
  );

  const login = useCallback(
    async (credentials) => {
      try {
        await dispatch(loginDriverAsync(credentials)).unwrap();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: typeof err === "string" ? err : "Login failed.",
        };
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: typeof err === "string" ? err : "Logout failed.",
      };
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      const restored = await dispatch(restoreSessionAsync()).unwrap();
      return !!restored;
    } catch {
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
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth;
