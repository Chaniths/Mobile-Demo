import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { loginSuccess } from '../../store/slices/authSlice';
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
    await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
    dispatch(loginSuccess({ user: data.user, token: data.token }));
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

  const s = styles(theme);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={s.header}>
            <View style={s.logo}>
              <Text style={{ fontSize: 40 }}>🌱</Text>
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

          {/* Form */}
          <View style={s.form}>
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
              error={passwordError}
              rightIcon={<EyeIcon visible={showPassword} color={theme.colors.text.secondary} />}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.forgotRow}>
              <Text style={[s.forgotText, { color: theme.colors.primary.main }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: theme.colors.primary.main }, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitBtnText}>Sign In</Text>}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={[s.footerText, { color: theme.colors.text.secondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[s.footerLink, { color: theme.colors.primary.main }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = (theme) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.colors.background },
  scrollContent:{ flexGrow: 1, padding: 24, justifyContent: 'center' },

  header:   { alignItems: 'center', marginBottom: 40 },
  logo:     { width: 80, height: 80, borderRadius: 20, backgroundColor: theme.colors.primary.main, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title:    { fontSize: 28, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center' },

  errorBanner:     { marginBottom: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12 },
  errorBannerText: { color: '#f87171', fontSize: 13, textAlign: 'center' },

  form:       { marginBottom: 24 },
  forgotRow:  { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: '600' },

  submitBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;