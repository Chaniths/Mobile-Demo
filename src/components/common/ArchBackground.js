import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const ArchBackground = () => {
  const { theme } = useTheme();
  const light = !theme.isDarkMode;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.archStrip1, light && styles.light1]} />
      <View style={[styles.archStrip2, light && styles.light2]} />
      <View style={[styles.archStrip3, light && styles.light3]} />
      <View style={[styles.archStrip4, light && styles.light4]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  archStrip1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 200,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(35, 101, 113, 0.3)',
    opacity: 0.7,
    transform: [{ rotate: '-15deg' }],
  },
  archStrip2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 350,
    height: 180,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: 'rgba(45, 122, 135, 0.35)',
    opacity: 0.6,
    transform: [{ rotate: '25deg' }],
  },
  archStrip3: {
    position: 'absolute',
    bottom: 200,
    left: -60,
    width: 380,
    height: 190,
    borderTopLeftRadius: 190,
    borderTopRightRadius: 190,
    backgroundColor: 'rgba(35, 101, 113, 0.25)',
    opacity: 0.5,
    transform: [{ rotate: '20deg' }],
  },
  archStrip4: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 420,
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: 'rgba(45, 122, 135, 0.3)',
    opacity: 0.6,
    transform: [{ rotate: '-30deg' }],
  },
  light1: { backgroundColor: 'rgba(22, 163, 74, 0.3)', opacity: 0.7 },
  light2: { backgroundColor: 'rgba(34, 197, 94, 0.35)', opacity: 0.6 },
  light3: { backgroundColor: 'rgba(22, 163, 74, 0.25)', opacity: 0.5 },
  light4: { backgroundColor: 'rgba(34, 197, 94, 0.3)', opacity: 0.6 },
});

export default ArchBackground;
