import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const BackgroundShapes = ({ variant = 'default' }) => {
  const { theme } = useTheme();
  const isDark = theme.isDarkMode;
  const teal = theme.colors.primary?.main || '#14b8a6';

  const shapeColor1 = isDark ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.10)';
  const shapeColor2 = isDark ? 'rgba(20, 184, 166, 0.07)' : 'rgba(20, 184, 166, 0.06)';
  const shapeColor3 = isDark ? 'rgba(45, 212, 191, 0.05)' : 'rgba(45, 212, 191, 0.08)';

  if (variant === 'profile') {
    return (
      <View style={styles.container} pointerEvents="none">
        <View style={[styles.profileBlob, { backgroundColor: shapeColor1 }]} />
        <View style={[styles.profileBlobSmall, { backgroundColor: shapeColor2 }]} />
      </View>
    );
  }

  if (variant === 'detail') {
    return (
      <View style={styles.container} pointerEvents="none">
        <View style={[styles.detailCurve, { backgroundColor: shapeColor1 }]} />
        <View style={[styles.detailCircle, { backgroundColor: shapeColor2 }]} />
      </View>
    );
  }

  if (variant === 'form') {
    return (
      <View style={styles.container} pointerEvents="none">
        <View style={[styles.formShape1, { backgroundColor: shapeColor2 }]} />
        <View style={[styles.formShape2, { backgroundColor: shapeColor3 }]} />
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.topBlob, { backgroundColor: shapeColor1 }]} />
      <View style={[styles.topBlobRight, { backgroundColor: shapeColor2 }]} />
      <View style={[styles.midCircle, { backgroundColor: shapeColor3 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  // Default variant
  topBlob: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  topBlobRight: {
    position: 'absolute',
    top: -40,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  midCircle: {
    position: 'absolute',
    top: 300,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
  },

  // Profile variant
  profileBlob: {
    position: 'absolute',
    top: -100,
    left: -40,
    width: 450,
    height: 350,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  profileBlobSmall: {
    position: 'absolute',
    top: 200,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
  },

  // Detail variant
  detailCurve: {
    position: 'absolute',
    top: -60,
    left: -30,
    width: 400,
    height: 280,
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
  },
  detailCircle: {
    position: 'absolute',
    top: 400,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
  },

  // Form variant
  formShape1: {
    position: 'absolute',
    top: -50,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  formShape2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
});

export default BackgroundShapes;
