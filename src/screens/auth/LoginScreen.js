import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { loginFailure, loginStart, loginSuccess } from '../../store/slices/authSlice';
import AsyncStorageService from '../../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../../utils/constants';
import { loginByRole } from '../../api/authApi';
import { setAuthToken } from '../../api/interceptors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import apiClient from '../../api/client';
import AsyncStorageService from '../../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../../utils/constants';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const EyeIcon = ({ visible, color = '#94a3b8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    {!visible && (
      <Line x1="2" y1="2" x2="22" y2="22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    )}
  </Svg>
);
// ─── Validation ───────────────────────────────────────────────────────────────

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Recognize a "not approved yet" login response from the API.
// Adjust this to match your backend's actual shape — common patterns:
//   - 403 with { status: 'pending' } or { accountStatus: 'pending' }
//   - 403 with a specific error code, e.g. { code: 'VENDOR_PENDING_APPROVAL' }
//   - fallback: sniff the message text
const isPendingApprovalError = (err) => {
  const data = err?.response?.data;
  if (!data) return false;
  const status = data.status ?? data.accountStatus;
  const code   = data.code;
  if (status === 'pending' || status === 'pending_approval') return true;
  if (code === 'VENDOR_PENDING_APPROVAL') return true;
  const msg = (data.message ?? '').toLowerCase();
  return msg.includes('pending') && msg.includes('approv');
};

// ─── Component ────────────────────────────────────────────────────────────────
import AppIcon from '../../components/common/AppIcon';
import Card from '../../components/common/Card';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch   = useDispatch();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState({});
  const [apiError,     setApiError]     = useState('');

  // ── Touched state — show inline errors only after user has left the field ──
  const [touched, setTouched] = useState({ email: false, password: false });
  const touch = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const emailError    = touched.email    && (!email    ? 'Email is required'    : !isValidEmail(email)    ? 'Enter a valid email address'         : '');
  const passwordError = touched.password && (!password ? 'Password is required' : password.length < 8     ? 'Password must be at least 8 characters' : '');

  const validate = () => {
    setTouched({ email: true, password: true });
    return isValidEmail(email) && password.length >= 8;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const { data } = await apiClient.post('/auth/login', { email: email.trim(), password });
      // 🔧 merge seller's business profile (businessName, businessAddress, lat/lng)
      // straight into user, since backend sends it as a separate `profile` object
      const mergedUser = { ...data.user, ...(data.profile ?? {}) };
      await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mergedUser));
      dispatch(loginSuccess({ user: mergedUser, token: data.token }));
      // Navigation handled automatically by AppNavigator based on auth state
    } catch (err) {
      if (isPendingApprovalError(err)) {
        navigation.navigate('PendingApproval');
      } else {
        setApiError(err?.response?.data?.message ?? 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Background gradient overlay for dark mode
  const backgroundStyle = theme.isDarkMode
    ? {
        backgroundColor: theme.colors.background,
      }
    : {
        backgroundColor: theme.colors.background,
      };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
              <Text style={styles.logoText}>🌱</Text>
            </View>
            <Text style={s.title}>Welcome Back</Text>
            <Text style={s.subtitle}>Sign in to continue to FreshRoute</Text>
          </View>

          {/* API error banner */}
          {!!apiError && (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>❌ {apiError}</Text>
            </View>
          )}

          {/* Form Card with Glassmorphism */}
          <Card variant="glass" style={styles.formCard}>
            <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors({}); setApiError(''); }}
              onBlur={() => touch('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors({}); setApiError(''); }}
              onBlur={() => touch('password')}
              secureTextEntry={!showPassword}
              error={errors.password}
              rightIcon={
                <AppIcon
                  name={showPassword ? 'eye' : 'eyeOff'}
                  size={22}
                  color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main}
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.forgotRow}>
              <Text style={[s.forgotText, { color: theme.colors.primary.main }]}>Forgot Password?</Text>
            </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPassword}
              >
                <Text style={[styles.forgotText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={[styles.loginButton, theme.isDarkMode && { backgroundColor: theme.colors.primary.main }]}
              />

              {!!authError && (
                <Text style={[styles.errorText, { color: theme.colors.error || '#d32f2f' }]}>
                  {authError}
                </Text>
              )}
            </View>
          </Card>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={[s.footerText, { color: theme.colors.text.secondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.signupText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    zIndex: 1,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    marginVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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

export default LoginScreen;