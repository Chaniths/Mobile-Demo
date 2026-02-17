// Color palette based on the web application theme
// You can switch between light and dark themes here

export const colors = {
  // Primary brand colors - teal/cyan theme (matching Figma)
  primary: {
    main: "#14b8a6", // teal-500
    light: "#2dd4bf", // teal-400
    dark: "#0d9488", // teal-600
    soft: "#99f6e4", // teal-200
  },

  // Dark theme colors (matching Figma design)
  brand: {
    background: "#0a1929", // Dark navy background
    surface: "#0f2942", // Lighter dark teal surface
    card: "#11273f", // Card background - slightly lighter than background
    muted: "#1e3a52", // Borders/separators
  },

  // Accent colors
  accent: {
    yellow: "#facc15",
    yellowSoft: "#fad850",
    yellowDark: "#FFFACD",
    blue: "#38bdf8",
    greenSoft: "#bbf7d0",
  },

  // Light theme (default for mobile)
  light: {
    background: "#ffffff",
    surface: "#FAF7F2",
    card: "#ffffff",
    muted: "#e5e7eb",
    cardSecondary: "#f9fafb",
  },

  // Semantic colors
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",

  // Text colors
  text: {
    primary: "#f8fafc", // slate-50 (for dark theme)
    secondary: "#cbd5e1", // slate-300
    tertiary: "#94a3b8", // slate-400
    highlight: "#e2e8f0", // off-white for emphasis
    disabled: "#64748b", // slate-500
  },

  // Text colors for light theme
  textLight: {
    primary: "#0f172a", // slate-900
    secondary: "#475569", // slate-600
    tertiary: "#64748b", // slate-500
    highlight: "#ffffff", // pure white for emphasis
    disabled: "#94a3b8", // slate-400
  },

  // Overlay colors
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",

  // Border colors
  border: {
    light: "#e2e8f0",
    dark: "#334155",
  },

  // Status colors for orders
  status: {
    pending: "#f59e0b",
    processing: "#3b82f6",
    confirmed: "#8b5cf6",
    shipped: "#06b6d4",
    delivered: "#22c55e",
    cancelled: "#ef4444",
  },
};

export default colors;
