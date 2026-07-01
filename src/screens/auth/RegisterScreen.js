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
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join FreshRoute today</Text>
          </View>

          {/* API error banner */}
          {!!apiError && (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>❌ {apiError}</Text>
            </View>
          )}

          {/* Role selection */}
          <Text style={[s.sectionLabel, { color: theme.colors.text.secondary }]}>Choose your role</Text>
          {ROLES.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => { setRole(r.id); setErrors((p) => ({ ...p, role: '' })); }} activeOpacity={0.7}>
              <Card style={[s.roleCard, role === r.id && { borderWidth: 2, borderColor: theme.colors.primary.main }]}>
                <View style={s.roleRow}>
                  <View style={[s.roleIconBox, { backgroundColor: `${theme.colors.primary.main}20` }]}>
                    <Text style={{ fontSize: 24 }}>{r.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.roleTitle, { color: theme.colors.text.primary   }]}>{r.title}</Text>
                    <Text style={[s.roleDesc,  { color: theme.colors.text.secondary }]}>{r.desc}</Text>
                  </View>
                  {role === r.id && (
                    <View style={[s.checkmark, { backgroundColor: theme.colors.primary.main }]}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
          {touched.role && errors.role ? <Text style={s.fieldError}>{errors.role}</Text> : null}
          <Text style={[s.helperText, { color: theme.colors.text.secondary }]}>
            Drivers and field admins are added by administrators only.
          </Text>

          {/* Seller pending notice */}
          {role === 'seller' && (
            <View style={s.pendingNotice}>
              <Text style={s.pendingNoticeText}>⏳ Seller accounts require admin approval before you can log in.</Text>
            </View>
          )}

          {/* Form fields */}
          <View style={s.form}>
            <FormField
              label="Full name"
              value={name}
              onChange={(t) => { setName(t.replace(/[^A-Za-z\s]/g, '')); setErrors((p) => ({ ...p, name: '' })); }}
              onBlur={() => touch('name')}
              placeholder={role === 'seller' ? 'Owner full name' : 'Your full name'}
              error={touched.name && errors.name ? errors.name : ''}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
            <FormField
              label="Email"
              value={email}
              onChange={setEmail}
              onBlur={() => touch('email')}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={touched.email && errors.email ? errors.email : ''}
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            {/* Phone with +94 prefix */}
            <Text style={[s.inputLabel, { color: theme.colors.text.secondary }]}>
              Phone number <Text style={{ color: theme.colors.text.tertiary, fontWeight: '400' }}>(optional)</Text>
            </Text>
            <View style={s.phoneRow}>
              <View style={[s.phonePrefix, { borderColor: theme.colors.border, backgroundColor: `${theme.colors.primary.main}10` }]}>
                <Text style={{ color: theme.colors.text.secondary, fontSize: 14, fontWeight: '600' }}>🇱🇰 +94</Text>
              </View>
              <TextInput
                style={[s.phoneInput, { color: theme.colors.text.primary, borderColor: touched.phone && errors.phone ? '#ef4444' : theme.colors.border }]}
                value={phone}
                onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 9)); setErrors((p) => ({ ...p, phone: '' })); }}
                onBlur={() => touch('phone')}
                placeholder="771234567"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="phone-pad"
                maxLength={9}
              />
            </View>
            {touched.phone && errors.phone ? <Text style={s.fieldError}>{errors.phone}</Text> : null}
            {phone.length === 9 && isValidLocalPhone(phone) && <Text style={s.fieldOk}>✓ +94{phone}</Text>}

            {/* Buyer-only: address via map */}
            {role === 'buyer' && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[s.inputLabel, { color: theme.colors.text.secondary }]}>Delivery address</Text>
                <MapAddressPicker
                  initialLat={address.lat}
                  initialLng={address.lng}
                  onChange={(loc) => { setAddress(loc); setErrors((p) => ({ ...p, address: '' })); }}
                  theme={theme}
                />
                {touched.address && errors.address ? <Text style={s.fieldError}>{errors.address}</Text> : null}
              </View>
            )}

            {/* Seller-only: business fields */}
            {role === 'seller' && (
              <>
                <FormField
                  label="Business name"
                  value={businessName}
                  onChange={setBusinessName}
                  onBlur={() => touch('businessName')}
                  placeholder="e.g. Green Market"
                  error={touched.businessName && errors.businessName ? errors.businessName : ''}
                  autoComplete="organization"
                  textContentType="organizationName"
                />
                <View style={{ marginBottom: 8 }}>
                  <Text style={[s.inputLabel, { color: theme.colors.text.secondary }]}>Business address</Text>
                  <MapAddressPicker
                    initialLat={businessAddress.lat}
                    initialLng={businessAddress.lng}
                    onChange={(loc) => { setBusinessAddress(loc); setErrors((p) => ({ ...p, businessAddress: '' })); }}
                    theme={theme}
                  />
                  {touched.businessAddress && errors.businessAddress ? <Text style={s.fieldError}>{errors.businessAddress}</Text> : null}
                </View>
              </>
            )}

            {/* Password with SVG eye icon */}
            <Input
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((p) => ({ ...p, password: '' })); }}
              onBlur={() => touch('password')}
              secureTextEntry={!showPassword}
              error={touched.password && errors.password ? errors.password : ''}
              rightIcon={<EyeIcon visible={showPassword} color={theme.colors.text.secondary} />}
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
              <Text style={[s.footerLink, { color: theme.colors.primary.main }]}>Sign In</Text>
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
  scrollContent:{ flexGrow: 1, padding: 24 },
  header:       { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  title:        { fontSize: 28, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 8 },
  subtitle:     { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center' },

  errorBanner:     { marginBottom: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12 },
  errorBannerText: { color: '#f87171', fontSize: 13, textAlign: 'center' },

  sectionLabel:{ fontSize: 14, fontWeight: '600', marginBottom: 12, color: theme.colors.text.secondary },
  roleCard:    { marginBottom: 12 },
  roleRow:     { flexDirection: 'row', alignItems: 'center' },
  roleIconBox: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  roleTitle:   { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  roleDesc:    { fontSize: 13 },
  checkmark:   { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  helperText:  { fontSize: 12, marginTop: 4, marginBottom: 16 },

  pendingNotice:     { marginBottom: 16, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 12, padding: 12 },
  pendingNoticeText: { color: '#fbbf24', fontSize: 12, textAlign: 'center' },

  form:       { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  phoneRow:   { flexDirection: 'row', marginBottom: 4 },
  phonePrefix:{ borderWidth: 1, borderRightWidth: 0, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  phoneInput: { flex: 1, borderWidth: 1, borderTopRightRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },

  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 4 },
  strengthBg:   { flex: 1, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  strengthBar:  { height: 6, borderRadius: 999 },
  strengthLabel:{ fontSize: 12, fontWeight: '600' },

  policyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginVertical: 12 },
  checkbox:  { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#475569', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  policyText:{ flex: 1, fontSize: 12, lineHeight: 18 },

  fieldError:  { color: '#f87171', fontSize: 12, marginTop: 2, marginBottom: 4 },
  fieldOk:     { color: '#10b981', fontSize: 12, marginTop: 2, marginBottom: 4 },

  submitBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' },
});


export default RegisterScreen;