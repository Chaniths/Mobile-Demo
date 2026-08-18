// Color palette based on the web application theme
// You can switch between light and dark themes here

export const colors = {
  // Primary brand colors - organic green theme
  primary: {
    main: '#16a34a',      // green-600
    light: '#4ade80',     // green-400
    dark: '#15803d',      // green-700
    soft: '#bbf7d0',      // green-200
  },

  // Dark theme colors (matching web app with teal theme)
  brand: {
    background: '#020617', // Deep navy background
    surface: '#a8bff7',    // Light surface
    card: '#020c24',       // Card background
    muted: '#1f2937',      // Borders/separators
  },
  
  // Teal theme colors for dark mode
  teal: {
    main: '#236571',       // supply-teal (primary teal)
    light: '#2d7a87',      // Lighter teal
    dark: '#1a4d56',       // Darker teal
    soft: 'rgba(35, 101, 113, 0.1)', // 10% opacity
    medium: 'rgba(35, 101, 113, 0.2)', // 20% opacity
    strong: 'rgba(35, 101, 113, 0.4)', // 40% opacity
    deep: '#2E2F34',       // supply-deep (for cards)
  },

  // Accent colors
  accent: {
    yellow: '#facc15',
    yellowSoft: '#fad850',
    yellowDark: '#FFFACD',
    blue: '#38bdf8',
    greenSoft: '#bbf7d0',
    peach: '#FFE5D9',      // Light cream/peach for textbox text
    peachSoft: '#FFF4F0',  // Very light peach
  },

  // Light theme (default for mobile)
  light: {
    background: '#ffffff',
    surface: '#FAF7F2',
    card: '#ffffff',
    muted: '#e5e7eb',
    cardSecondary: '#f9fafb',
  },

  // Semantic colors
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Text colors
  text: {
    primary: '#f8fafc',    // slate-50 (for dark theme)
    secondary: '#cbd5e1',  // slate-300
    tertiary: '#94a3b8',   // slate-400
    highlight: '#e2e8f0',  // off-white for emphasis
    disabled: '#64748b',   // slate-500
  },

  // Text colors for light theme
  textLight: {
    primary: '#0f172a',    // slate-900
    secondary: '#475569',  // slate-600
    tertiary: '#64748b',   // slate-500
    highlight: '#ffffff',  // pure white for emphasis
    disabled: '#94a3b8',   // slate-400
  },

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Border colors
  border: {
    light: '#e2e8f0',
    dark: '#334155',
  },

  // Status colors for orders
  status: {
    pending: '#f59e0b',
    processing: '#3b82f6',
    confirmed: '#8b5cf6',
    shipped: '#06b6d4',
    delivered: '#22c55e',
    cancelled: '#ef4444',
  },
};

export default colors;

