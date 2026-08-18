/**
 * RegisterScreen.js
 * Changes: replaced all 🙈/👁️ emoji eye icons with proper SVG EyeIcon component.
 * Place at: src/screens/auth/RegisterScreen.js
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { loginSuccess } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import apiClient from '../../api/client';
import AsyncStorageService from '../../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../../utils/constants';
import MapAddressPicker from '../../components/MapAddressPicker';

// ─── SVG eye icon (same as ProfileSectionScreen and web) ─────────────────────

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

const FormField = ({
  label, value, onChange, placeholder, keyboardType, maxLength,
  secureTextEntry, error, onBlur, autoCapitalize, rightIcon,
  onRightIconPress, autoComplete, textContentType,
}) => (
  <Input
    label={label}
    placeholder={placeholder}
    value={value}
    onChangeText={onChange}
    onBlur={onBlur}
    keyboardType={keyboardType}
    maxLength={maxLength}
    secureTextEntry={secureTextEntry}
    autoCapitalize={autoCapitalize ?? 'sentences'}
    error={error}
    rightIcon={rightIcon}
    onRightIconPress={onRightIconPress}
    autoComplete={autoComplete}
    textContentType={textContentType}
  />
);

// ─── Validation helpers (mirrors web SignUpPage.tsx) ──────────────────────────

const isValidEmail      = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPersonName = (v) => /^[A-Za-z\s]+$/.test(v.trim()) && v.trim().length > 0;
const isValidLocalPhone = (v) => /^\d{9}$/.test(v);

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '#94a3b8' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = {
    1: { label: 'Weak',   color: '#ef4444' },
    2: { label: 'Fair',   color: '#f59e0b' },
    3: { label: 'Good',   color: '#10b981' },
    4: { label: 'Strong', color: '#10b981' }, // green, not purple
  };
  return { score, ...(map[score] ?? { label: '', color: '#94a3b8' }) };
};

const getPasswordErrors = (pw) => {
  const e = [];
  if (!pw || pw.length < 8)            e.push('At least 8 characters');
  if (!pw || !/[A-Z]/.test(pw))        e.push('At least 1 uppercase letter');
  if (!pw || !/[0-9]/.test(pw))        e.push('At least 1 number');
  if (!pw || !/[^A-Za-z0-9]/.test(pw)) e.push('At least 1 special character');
  return e;
};

// ─── Role cards ───────────────────────────────────────────────────────────────

const ROLES = [
  { id: 'buyer',  icon: '🛒', title: 'Buyer',  desc: 'Browse and purchase products' },
  { id: 'seller', icon: '🏪', title: 'Seller', desc: 'List and manage your products' },
];


// ─── Main RegisterScreen ──────────────────────────────────────────────────────

const RegisterScreen = ({ navigation }) => {
  const { theme }  = useTheme();
  const dispatch   = useDispatch();

  // Form fields
  const [role,            setRole]            = useState(null);
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address,         setAddress]         = useState({ address: '', city: '', lat: null, lng: null });
  const [businessName,    setBusinessName]    = useState('');
  const [businessAddress, setBusinessAddress] = useState({ address: '', city: '', lat: null, lng: null });
  const [agreedToPolicy,  setAgreedToPolicy]  = useState(false);

  // UI state
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [apiError,      setApiError]      = useState('');
  const [errors,        setErrors]        = useState({});
  const [touched,       setTouched]       = useState({});

  const touch    = (field)  => setTouched((p) => ({ ...p, [field]: true }));
  const touchAll = ()       => setTouched({
    role: true, name: true, email: true, phone: true,
    password: true, confirmPassword: true, address: true,
    businessName: true, businessAddress: true,
  });

  const strength  = useMemo(() => getPasswordStrength(password), [password]);
  const pwdErrors = useMemo(() => getPasswordErrors(password),   [password]);

  const validate = () => {
    const e = {};
    if (!role)                                          e.role            = 'Please select a role';
    if (!name.trim())                                   e.name            = 'Name is required';
    else if (!isValidPersonName(name))                  e.name            = 'Only letters and spaces allowed';
    if (!email.trim())                                  e.email           = 'Email is required';
    else if (!isValidEmail(email))                      e.email           = 'Enter a valid email address';
    if (phone && !isValidLocalPhone(phone))             e.phone           = 'Phone must be exactly 9 digits';
    if (pwdErrors.length > 0)                           e.password        = pwdErrors[0];
    if (!confirmPassword)                               e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)              e.confirmPassword = 'Passwords do not match';
    if (role === 'buyer'  && !address.address.trim())   e.address         = 'Please select your delivery address on the map';
    if (role === 'seller' && !businessName.trim())      e.businessName    = 'Business name is required';
    if (role === 'seller' && !businessAddress.address.trim())    e.businessAddress = 'Please select your business address on the map';
    if (role === 'seller' && !agreedToPolicy)           e.policy          = 'You must agree to the vendor policy';
    return e;
  };

  const handleRegister = async () => {
    touchAll();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setApiError('');
    try {
      if (role === 'buyer') {
        const { data } = await apiClient.post('/auth/customer/register', {
          name: name.trim(), email: email.trim(), password,
          phone: phone ? phone : undefined,
          address: address.address,
          city: address.city,
          latitude: address.lat,
          longitude: address.lng,
        });
        await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        dispatch(loginSuccess({ user: data.user, token: data.token }));
      }  else {
          const payload = {
            businessName: businessName.trim(), ownerName: name.trim(),
            email: email.trim(), phone: phone ? phone : undefined,
            password, confirmPassword,
            businessAddress: businessAddress.address,
            city: businessAddress.city,
            latitude: businessAddress.lat,
            longitude: businessAddress.lng,
            agreedToPolicy,
          };
          await apiClient.post('/auth/vendor/signup', payload);
          navigation.navigate('PendingApproval');
        }
    } catch (err) {
      setApiError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join FreshRoute today</Text>
          </View>

          {/* Main Content Card with Glassmorphism */}
          <Card variant="glass" style={styles.mainCard}>
            {/* Role Selection */}
            <View style={styles.rolesContainer}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
              Choose your role
            </Text>
              {availableRoles.map((role) => (
                <TouchableOpacity key={role.id} onPress={() => setSelectedRole(role.id)}>
                  <Card
                    variant={selectedRole === role.id ? 'glass' : 'default'}
                    style={[
                      styles.roleCard,
                      selectedRole === role.id && {
                        borderWidth: 2,
                        borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                        backgroundColor: theme.isDarkMode ? 'rgba(35, 101, 113, 0.2)' : undefined,
                      },
                    ]}
                  >
                    <View style={styles.roleContent}>
                      <View style={[styles.iconContainer, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
                        <AppIcon name={role.icon} size={28} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
                      </View>
                      <View style={styles.roleInfo}>
                        <Text style={[styles.roleTitle, { color: theme.colors.text.primary }]}>
                          {role.title}
                        </Text>
                        <Text style={[styles.roleDescription, { color: theme.colors.text.secondary }]}>
                          {role.description}
                        </Text>
                      </View>
                      {selectedRole === role.id && (
                        <View style={[styles.checkmark, { backgroundColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                          <AppIcon name="check" size={16} color="#ffffff" />
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
              {errors.role && (
                <Text style={[styles.errorText, { color: theme.colors.error || '#d32f2f' }]}>
                  {errors.role}
                </Text>
              )}
              <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>
                Drivers and field admins are added by administrators only.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                error={errors.name}
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                keyboardType="phone-pad"
                error={errors.phone}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry={!showPassword}
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry={!showPassword}
                error={errors.confirmPassword}
                rightIcon={
                  <AppIcon
                    name={showPassword ? 'eye' : 'eyeOff'}
                    size={22}
                    color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main}
                  />
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

            {/* Password strength bar */}
            {password.length > 0 && (
              <View style={s.strengthWrap}>
                <View style={s.strengthBg}>
                  <View style={[s.strengthBar, { width: `${strength.score * 25}%`, backgroundColor: strength.color }]} />
                </View>
                <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
            {password.length > 0 && pwdErrors.length > 0 && (
              <View style={{ marginTop: 4, marginBottom: 8 }}>
                {pwdErrors.map((e) => <Text key={e} style={s.fieldError}>✕ {e}</Text>)}
              </View>
            )}
            {password.length > 0 && pwdErrors.length === 0 && (
              <Text style={[s.fieldOk, { marginTop: 4 }]}>✓ Password looks great!</Text>
            )}

            {/* Confirm password — also uses SVG eye via same showPassword toggle */}
            <Input
              label="Confirm password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
              onBlur={() => touch('confirmPassword')}
              secureTextEntry={!showConfirmPassword}
              error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''}
              rightIcon={<EyeIcon visible={showConfirmPassword} color={theme.colors.text.secondary} />}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            {confirmPassword && password === confirmPassword && (
              <Text style={s.fieldOk}>✓ Passwords match</Text>
            )}

            {/* Seller policy */}
            {role === 'seller' && (
              <TouchableOpacity style={s.policyRow} onPress={() => setAgreedToPolicy(!agreedToPolicy)} activeOpacity={0.7}>
                <View style={[s.checkbox, agreedToPolicy && { backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.main }]}>
                  {agreedToPolicy && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
                </View>
                <Text style={[s.policyText, { color: theme.colors.text.secondary }]}>
                  I agree to the FreshRoute Vendor Policy and understand that orders and payouts are managed by the platform.
                </Text>
              </TouchableOpacity>
            )}
            {touched.policy && errors.policy ? <Text style={s.fieldError}>{errors.policy}</Text> : null}

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: theme.colors.primary.main }, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitBtnText}>{role === 'seller' ? 'Register Vendor Account' : 'Create Account'}</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={[s.footerText, { color: theme.colors.text.secondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                Sign In
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
    zIndex: 1,
  },
  mainCard: {
    borderRadius: 24,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
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
  rolesContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleCard: {
    marginBottom: 12,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleIcon: {
    fontSize: 26,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
  loginText: {
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


export default RegisterScreen;