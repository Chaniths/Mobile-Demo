import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { toggleTheme as toggleThemeAction, setTheme } from '../store/slices/themeSlice';
import colors from '../styles/colors';
import AsyncStorageService from '../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Custom hook for theme management
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.theme);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = useCallback(async () => {
    dispatch(toggleThemeAction());
    // Persist theme preference
    await AsyncStorageService.setItem(STORAGE_KEYS.THEME_PREFERENCE, !isDarkMode);
  }, [dispatch, isDarkMode]);

  /**
   * Set specific theme mode
   */
  const setThemeMode = useCallback(async (darkMode) => {
    dispatch(setTheme(darkMode));
    await AsyncStorageService.setItem(STORAGE_KEYS.THEME_PREFERENCE, darkMode);
  }, [dispatch]);

  /**
   * Load saved theme preference
   */
  const loadThemePreference = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorageService.getItem(STORAGE_KEYS.THEME_PREFERENCE);
      if (savedTheme !== null) {
        dispatch(setTheme(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  }, [dispatch]);

  /**
   * Get current theme colors
   */
  const theme = useMemo(() => ({
    isDarkMode,
    colors: {
      // Dynamic colors based on theme mode
      background: isDarkMode ? colors.brand.background : colors.light.background,
      surface: isDarkMode ? colors.brand.card : colors.light.surface,
      card: isDarkMode ? colors.brand.card : colors.light.card,
      cardSecondary: isDarkMode ? colors.brand.muted : colors.light.cardSecondary,
      border: isDarkMode ? colors.border.dark : colors.border.light,
      // Primary color for dark mode (teal)
      primaryMain: isDarkMode ? colors.teal.main : colors.primary.main,
      
      // Text colors
      text: {
        primary: isDarkMode ? colors.text.primary : colors.textLight.primary,
        secondary: isDarkMode ? colors.text.secondary : colors.textLight.secondary,
        tertiary: isDarkMode ? colors.text.tertiary : colors.textLight.tertiary,
        highlight: isDarkMode ? colors.text.highlight : colors.textLight.highlight,
        disabled: isDarkMode ? colors.text.disabled : colors.textLight.disabled,
      },

      // Static colors
      primary: colors.primary,
      accent: colors.accent,
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
      status: colors.status,
      teal: colors.teal,
    },
  }), [isDarkMode]);

  return {
    isDarkMode,
    theme,
    toggleTheme,
    setThemeMode,
    loadThemePreference,
  };
};

export default useTheme;

