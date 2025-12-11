import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../hooks/useTheme';

const SplashScreen = ({ navigation }) => {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => {
      // Navigate to login after splash
      navigation.replace('Login');
    }, 2000);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={theme.isDarkMode ? "light" : "dark"} />
      
      {/* Decorative gradient circles */}
      {theme.isDarkMode ? (
        <>
          <View style={styles.gradientCircle1} />
          <View style={styles.gradientCircle2} />
        </>
      ) : (
        <>
          <View style={[styles.gradientCircle1, styles.lightModeCircle1]} />
          <View style={[styles.gradientCircle2, styles.lightModeCircle2]} />
        </>
      )}
      
      {/* Logo or App Name */}
      <View style={styles.logoContainer}>
        <View style={[styles.iconPlaceholder, { backgroundColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
          <Text style={styles.iconText}>🌱</Text>
        </View>
        <Text style={[styles.appName, { color: theme.colors.text.primary }]}>FreshRoute</Text>
        <Text style={[styles.tagline, { color: theme.colors.text.tertiary }]}>
          Organic Products Fleet Management
        </Text>
      </View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading...</Text>
      </View>

      {/* Version */}
      <Text style={[styles.version, { color: theme.colors.text.tertiary }]}>Version 1.0.0</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    overflow: 'hidden',
  },
  gradientCircle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    opacity: 0.6,
    zIndex: 0,
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -192,
    right: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(35, 101, 113, 0.4)',
    opacity: 0.6,
    zIndex: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
    zIndex: 1,
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
    zIndex: 1,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 16,
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: 12,
    zIndex: 1,
  },
  lightModeCircle1: {
    backgroundColor: 'rgba(22, 163, 74, 0.35)',
    opacity: 0.7,
  },
  lightModeCircle2: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    opacity: 0.5,
  },
});

export default SplashScreen;

