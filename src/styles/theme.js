import colors from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

// Main theme configuration
// Set isDarkMode to false for light theme (default), true for dark theme
export const theme = {
  isDarkMode: false, // Light mode as default for mobile
  
  colors: {
    ...colors,
    // Dynamic colors based on theme mode
    get background() {
      return this.isDarkMode ? colors.brand.background : colors.light.background;
    },
    get surface() {
      return this.isDarkMode ? colors.brand.card : colors.light.surface;
    },
    get card() {
      return this.isDarkMode ? colors.brand.card : colors.light.card;
    },
    get text() {
      return this.isDarkMode ? colors.text : colors.textLight;
    },
    get border() {
      return this.isDarkMode ? colors.border.dark : colors.border.light;
    },
  },

  typography,
  spacing,

  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export default theme;

