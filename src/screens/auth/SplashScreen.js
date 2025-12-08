import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import theme from '../../styles/theme';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => {
      // Navigate to login after splash
      navigation.replace('Login');
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Logo or App Name */}
      <View style={styles.logoContainer}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>🌱</Text>
        </View>
        <Text style={styles.appName}>FreshRoute</Text>
        <Text style={styles.tagline}>Organic Products Fleet Management</Text>
      </View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconText: {
    fontSize: 60,
  },
  appName: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: theme.spacing['2xl'],
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  version: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
});

export default SplashScreen;

