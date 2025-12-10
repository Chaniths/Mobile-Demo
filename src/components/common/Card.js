import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Reusable Card Component
 */
const Card = ({
  children,
  onPress,
  style,
  elevation = 'md',
  variant = 'default',
  ...props
}) => {
  const { theme } = useTheme();

  const getElevationStyle = () => {
    switch (elevation) {
      case 'sm':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,
          elevation: 1,
        };
      case 'lg':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.30,
          shadowRadius: 4.65,
          elevation: 8,
        };
      case 'none':
        return {};
      default: // md
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
          elevation: 4,
        };
    }
  };

  const getCardStyle = () => {
    if (variant === 'glass' || variant === 'glassmorphism') {
      // Glassmorphism style for dark mode with teal theme - use teal opacity instead of dark blue
      return {
        backgroundColor: theme.isDarkMode 
          ? theme.colors.teal.strong // Use teal with 40% opacity instead of dark blue
          : 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: theme.isDarkMode 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
        // Note: backdrop-blur is not directly available in React Native
        // You can use a library like react-native-blur or accept it won't blur
      };
    }
    return {
      backgroundColor: theme.isDarkMode 
        ? (variant === 'secondary' ? theme.colors.teal.medium : theme.colors.teal.soft)
        : (variant === 'secondary' ? theme.colors.cardSecondary : theme.colors.card),
    };
  };

  const cardStyle = [
    styles.card,
    getCardStyle(),
    getElevationStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
});

export default Card;

