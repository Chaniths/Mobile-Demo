import React, { useState, useEffect } from 'react';
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
import apiClient from '../../api/client';

// ─── Password helpers (same rules as web/forgot-password flow) ────

const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score === 2) return { score, label: 'Fair',   color: '#eab308' };
  if (score === 3) return { score, label: 'Good',   color: '#3b82f6' };
  return                  { score, label: 'Strong', color: '#10b981' };
};

const validatePassword = (pwd) => {
  const errors = [];
  if (pwd.length < 8)             errors.push('At least 8 characters');
  if (!/[A-Z]/.test(pwd))         errors.push('At least 1 uppercase letter');
  if (!/[0-9]/.test(pwd))         errors.push('At least 1 number');
  if (!/[^A-Za-z0-9]/.test(pwd))  errors.push('At least 1 special character (!@#$...)');
  return errors;
};

const ResetPasswordScreen = ({ navigation, route }) => {
  const { theme } = useTheme();

  // NOTE: assumes your deep-link handler passes the token as a route param,
  // e.g. navigation.navigate('ResetPassword', { token })
  const token = route?.params?.token ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const passwordErrors = validatePassword(newPassword);

  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      navigation.navigate('Login');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [success, countdown]);

  const handleSubmit = async () => {
    setError('');

    if (passwordErrors.length > 0) {
      setError('Please fix password requirements');
      setShowHints(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setCountdown(5);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>
            Password Reset!
          </Text>
          <Text style={[styles.successText, { color: theme.colors.text.secondary }]}>
            Your password has been updated successfully.
          </Text>

          <View style={[styles.noticeCard, { borderColor: theme.colors.border, backgroundColor: `${theme.colors.success}15` }]}>
            <Text style={[styles.noticeTitle, { color: theme.colors.text.primary }]}>📧 Check your email</Text>
            <Text style={[styles.noticeBody, { color: theme.colors.text.secondary }]}>
              We sent a confirmation to your inbox. If this wasn't you, tap "Secure My Account" in that
              email to immediately lock your account and sign out all devices.
            </Text>
          </View>

          <Text style={[styles.countdownText, { color: theme.colors.text.secondary }]}>
            Redirecting to sign in in {countdown}s...
          </Text>

          <Button
            title="Go to sign in now"
            onPress={() => navigation.navigate('Login')}
            style={styles.actionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Set New Password</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Choose a strong password for your account
          </Text>
        </View>

        {!token && (
          <Text style={[styles.errorBanner, { color: theme.colors.error }]}>
            Invalid reset link. Please request a new one.
          </Text>
        )}
        {error ? (
          <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

        <Input
          label="New Password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChangeText={(text) => { setNewPassword(text); setShowHints(true); }}
          secureTextEntry={!showNewPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowNewPassword((p) => !p)}>
          <Text style={[styles.toggleText, { color: theme.colors.primary.main }]}>
            {showNewPassword ? 'Hide password' : 'Show password'}
          </Text>
        </TouchableOpacity>

        {newPassword ? (
          <View style={styles.strengthBlock}>
            <View style={styles.strengthRow}>
              <View style={styles.strengthSegments}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSeg,
                      { backgroundColor: i <= strength.score ? strength.color : theme.colors.border },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>

            {showHints && passwordErrors.length > 0 && passwordErrors.map((e) => (
              <Text key={e} style={[styles.hintText, { color: theme.colors.error }]}>✕ {e}</Text>
            ))}
            {passwordErrors.length === 0 && (
              <Text style={[styles.hintText, { color: theme.colors.success }]}>✓ Password looks great!</Text>
            )}
          </View>
        ) : null}

        <Input
          label="Confirm New Password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          style={styles.confirmInput}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)}>
          <Text style={[styles.toggleText, { color: theme.colors.primary.main }]}>
            {showConfirmPassword ? 'Hide password' : 'Show password'}
          </Text>
        </TouchableOpacity>

        {confirmPassword && confirmPassword !== newPassword && (
          <Text style={[styles.hintText, { color: theme.colors.error }]}>✕ Passwords do not match</Text>
        )}
        {confirmPassword && confirmPassword === newPassword && (
          <Text style={[styles.hintText, { color: theme.colors.success }]}>✓ Passwords match</Text>
        )}

        <Button
          title="Reset Password"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !token || passwordErrors.length > 0 || newPassword !== confirmPassword}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  backButton: { marginBottom: 24 },
  backText: { fontSize: 16, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 14, lineHeight: 20 },

  errorBanner: { fontSize: 13, marginBottom: 12 },

  toggleText: { fontSize: 12, fontWeight: '600', marginTop: 6, marginBottom: 4 },
  confirmInput: { marginTop: 12 },

  strengthBlock: { marginTop: 4, marginBottom: 4, gap: 4 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strengthSegments: { flexDirection: 'row', flex: 1, gap: 4 },
  strengthSeg: { flex: 1, height: 4, borderRadius: 999 },
  strengthLabel: { fontSize: 11, fontWeight: '600' },
  hintText: { fontSize: 11, marginTop: 2 },

  actionButton: { marginTop: 20 },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successIconText: { fontSize: 40, color: '#ffffff', fontWeight: '700' },
  successTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  successText: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },

  noticeCard: { width: '100%', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  noticeTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  noticeBody: { fontSize: 12, lineHeight: 18 },

  countdownText: { fontSize: 13, marginBottom: 8 },
});

export default ResetPasswordScreen;