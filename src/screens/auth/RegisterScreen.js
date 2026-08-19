/**
 * RegisterScreen.js
 * Buyer/seller signup with map address picker.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
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
import { buildSessionUser } from '../../utils/roles';

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
    4: { label: 'Strong', color: '#10b981' },
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

const ROLES = [
  { id: 'buyer',  icon: '🛒', title: 'Buyer',  desc: 'Browse and purchase products' },
  { id: 'seller', icon: '🏪', title: 'Seller', desc: 'List and manage your products' },
];

const RegisterScreen = ({ navigation }) => {
  const { theme }  = useTheme();
  const dispatch   = useDispatch();

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
    businessName: true, businessAddress: true, policy: true,
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
        const sessionUser = buildSessionUser(data.user ?? {});
        await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, sessionUser);
        dispatch(loginSuccess({ user: sessionUser, token: data.token }));
      } else {
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

  const accent = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;

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
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Join FreshRoute today</Text>
          </View>

          {!!apiError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>❌ {apiError}</Text>
            </View>
          )}

          <Card variant="glass" style={styles.mainCard}>
            <View style={styles.rolesContainer}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
                Choose your role
              </Text>
              {ROLES.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => { setRole(item.id); setErrors((p) => ({ ...p, role: '' })); }}>
                  <Card
                    variant={role === item.id ? 'glass' : 'default'}
                    style={[
                      styles.roleCard,
                      role === item.id && {
                        borderWidth: 2,
                        borderColor: accent,
                        backgroundColor: theme.isDarkMode ? 'rgba(35, 101, 113, 0.2)' : undefined,
                      },
                    ]}
                  >
                    <View style={styles.roleContent}>
                      <View style={[styles.iconContainer, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
                        <Text style={styles.roleIcon}>{item.icon}</Text>
                      </View>
                      <View style={styles.roleInfo}>
                        <Text style={[styles.roleTitle, { color: theme.colors.text.primary }]}>{item.title}</Text>
                        <Text style={[styles.roleDescription, { color: theme.colors.text.secondary }]}>{item.desc}</Text>
                      </View>
                      {role === item.id && (
                        <View style={[styles.checkmark, { backgroundColor: accent }]}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
              {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}
              <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>
                Drivers and field admins are added by administrators only.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label={role === 'seller' ? 'Owner full name' : 'Full Name'}
                placeholder="Enter your full name"
                value={name}
                onChangeText={(t) => { setName(t); setErrors((p) => ({ ...p, name: '' })); }}
                onBlur={() => touch('name')}
                error={touched.name && errors.name ? errors.name : ''}
              />

              {role === 'seller' && (
                <Input
                  label="Business name"
                  placeholder="Green Market"
                  value={businessName}
                  onChangeText={(t) => { setBusinessName(t); setErrors((p) => ({ ...p, businessName: '' })); }}
                  onBlur={() => touch('businessName')}
                  error={touched.businessName && errors.businessName ? errors.businessName : ''}
                />
              )}

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((p) => ({ ...p, email: '' })); }}
                onBlur={() => touch('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                error={touched.email && errors.email ? errors.email : ''}
              />

              <Input
                label="Phone Number"
                placeholder="7XXXXXXXX"
                value={phone}
                onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 9)); setErrors((p) => ({ ...p, phone: '' })); }}
                onBlur={() => touch('phone')}
                keyboardType="phone-pad"
                error={touched.phone && errors.phone ? errors.phone : ''}
              />

              {role === 'buyer' && (
                <View style={styles.mapBlock}>
                  <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Delivery address</Text>
                  <MapAddressPicker
                    theme={theme}
                    onChange={(next) => {
                      setAddress(next);
                      setErrors((p) => ({ ...p, address: '' }));
                      touch('address');
                    }}
                  />
                  {touched.address && errors.address ? <Text style={styles.fieldError}>{errors.address}</Text> : null}
                </View>
              )}

              {role === 'seller' && (
                <View style={styles.mapBlock}>
                  <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Business address</Text>
                  <MapAddressPicker
                    theme={theme}
                    onChange={(next) => {
                      setBusinessAddress(next);
                      setErrors((p) => ({ ...p, businessAddress: '' }));
                      touch('businessAddress');
                    }}
                  />
                  {touched.businessAddress && errors.businessAddress ? <Text style={styles.fieldError}>{errors.businessAddress}</Text> : null}
                </View>
              )}

              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((p) => ({ ...p, password: '' })); }}
                secureTextEntry={!showPassword}
                error={touched.password && errors.password ? errors.password : ''}
                rightIcon={<EyeIcon visible={showPassword} color={theme.colors.text.secondary} />}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBg}>
                    <View style={[styles.strengthBar, { width: `${strength.score * 25}%`, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
              {password.length > 0 && pwdErrors.length > 0 && (
                <View style={{ marginTop: 4, marginBottom: 8 }}>
                  {pwdErrors.map((msg) => <Text key={msg} style={styles.fieldError}>✕ {msg}</Text>)}
                </View>
              )}
              {password.length > 0 && pwdErrors.length === 0 && (
                <Text style={[styles.fieldOk, { marginTop: 4 }]}>✓ Password looks great!</Text>
              )}

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
              />
              {confirmPassword && password === confirmPassword && (
                <Text style={styles.fieldOk}>✓ Passwords match</Text>
              )}

              {role === 'seller' && (
                <TouchableOpacity style={styles.policyRow} onPress={() => setAgreedToPolicy(!agreedToPolicy)} activeOpacity={0.7}>
                  <View style={[styles.checkbox, agreedToPolicy && { backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.main }]}>
                    {agreedToPolicy && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
                  </View>
                  <Text style={[styles.policyText, { color: theme.colors.text.secondary }]}>
                    I agree to the FreshRoute Vendor Policy and understand that orders and payouts are managed by the platform.
                  </Text>
                </TouchableOpacity>
              )}
              {touched.policy && errors.policy ? <Text style={styles.fieldError}>{errors.policy}</Text> : null}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.colors.primary.main }, loading && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>{role === 'seller' ? 'Register Vendor Account' : 'Create Account'}</Text>
                }
              </TouchableOpacity>
            </View>
          </Card>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginText, { color: accent }]}>
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
  container: { flex: 1, overflow: 'hidden' },
  flex: { flex: 1 },
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
  scrollContent: { flexGrow: 1, padding: 24, zIndex: 1 },
  mainCard: { borderRadius: 24, padding: 20, marginVertical: 8 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  rolesContainer: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  roleCard: { marginBottom: 12 },
  roleContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 52, height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  roleIcon: { fontSize: 26 },
  roleInfo: { flex: 1 },
  roleTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  roleDescription: { fontSize: 13 },
  checkmark: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  checkmarkText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  helperText: { fontSize: 12, marginTop: 4 },
  form: { marginBottom: 8 },
  mapBlock: { marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 14 },
  loginText: { fontSize: 14, fontWeight: '600' },
  errorText: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#ef4444' },
  errorBanner: {
    borderRadius: 12, padding: 12, marginBottom: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  errorBannerText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  fieldError: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  fieldOk: { fontSize: 12, color: '#10b981', marginBottom: 8 },
  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 8 },
  strengthBg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(148,163,184,0.3)', overflow: 'hidden' },
  strengthBar: { height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '600', minWidth: 48 },
  policyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8, marginBottom: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  policyText: { flex: 1, fontSize: 12, lineHeight: 18 },
  submitBtn: { marginTop: 12, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  lightModeCircle1: { backgroundColor: 'rgba(22, 163, 74, 0.35)', opacity: 0.7 },
  lightModeCircle2: { backgroundColor: 'rgba(74, 222, 128, 0.2)', opacity: 0.5 },
});

export default RegisterScreen;
