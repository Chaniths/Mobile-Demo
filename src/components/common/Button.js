import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import theme from '../../styles/theme';

/**
 * Reusable Button Component
 * 
 * @param {Object} props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Press handler
 * @param {string} props.variant - Button variant: 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} props.size - Button size: 'small' | 'medium' | 'large'
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.loading - Show loading indicator
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {Object} props.style - Additional styles
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const primaryColor = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];

    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push({ ...styles.outline, borderColor: primaryColor });
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
      default:
        baseStyle.push({ ...styles.primary, backgroundColor: primaryColor });
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];

    switch (variant) {
      case 'outline':
      case 'ghost':
        baseStyle.push({ ...styles.outlineText, color: primaryColor });
        break;
      default:
        baseStyle.push(styles.primaryText);
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? primaryColor : '#fff'}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    ...theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },

  // Variants - backgroundColor will be overridden in component
  primary: {
    // backgroundColor set dynamically
  },
  secondary: {
    backgroundColor: theme.colors.accent.blue,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    // borderColor set dynamically
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },

  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  primaryText: {
    color: '#ffffff',
  },
  outlineText: {
    // color set dynamically
  },
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.base,
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;

