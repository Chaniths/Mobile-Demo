import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Avatar Component
 */
const Avatar = ({
  source,
  name,
  size = 'medium',
  style,
}) => {
  const { theme } = useTheme();

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'xlarge':
        return 96;
      default: // medium
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 24;
      case 'xlarge':
        return 36;
      default: // medium
        return 18;
    }
  };

  const sizeValue = getSizeValue();
  const fontSize = getFontSize();

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const containerStyle = [
    styles.container,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius: sizeValue / 2,
      backgroundColor: theme.colors.primary.main,
    },
    style,
  ];

  if (source) {
    return (
      <Image
        source={source}
        style={[containerStyle, styles.image]}
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default Avatar;

