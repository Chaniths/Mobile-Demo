import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    
    // TODO: Implement actual password reset logic
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>
            Check Your Email
          </Text>
          <Text style={[styles.successText, { color: theme.colors.text.secondary }]}>
            We've sent password reset instructions to{'\n'}
            {email}
          </Text>
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Card with Glassmorphism */}
        <Card variant="glass" style={styles.formCard}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Forgot Password?
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Enter your email and we'll send you instructions to reset your password
            </Text>
          </View>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
          />

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            style={[styles.resetButton, theme.isDarkMode && { backgroundColor: theme.colors.primary.main }]}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  content: {
    flex: 1,
    padding: 24,
    zIndex: 1,
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
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

export default ForgotPasswordScreen;

