// Typography system matching web app (Outfit font family)
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // Will be replaced with Outfit when fonts are added
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Text styles (predefined combinations)
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.5,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.5,
    },
  },
};

export default typography;

