import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const ArchBackground = () => {
  const { theme } = useTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.circle1,
          !theme.isDarkMode && styles.lightCircle1,
        ]}
      />
      <View
        style={[
          styles.circle2,
          !theme.isDarkMode && styles.lightCircle2,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  circle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    bottom: -192,
    right: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(35, 101, 113, 0.4)',
    opacity: 0.6,
  },
  lightCircle1: {
    backgroundColor: 'rgba(22, 163, 74, 0.35)',
    opacity: 0.7,
  },
  lightCircle2: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    opacity: 0.5,
  },
});

export default ArchBackground;
