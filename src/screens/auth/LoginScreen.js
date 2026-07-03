import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
<<<<<<< HEAD
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { loginDriverAsync } from "../../store/slices/authSlice";
import { useTheme } from "../../hooks/useTheme";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const PRIMARY = "#14b8a6";
const BRAND_BG = "#0a1929";
=======
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { loginFailure, loginStart, loginSuccess } from '../../store/slices/authSlice';
import { findUserByCredentials } from '../../utils/demoUsers';
import AsyncStorageService from '../../services/storage/AsyncStorageService';
import { STORAGE_KEYS } from '../../utils/constants';
import { loginByRole } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AppIcon from '../../components/common/AppIcon';
import Card from '../../components/common/Card';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme, isDarkMode } = useTheme();
  const [email, setEmail] = useState("mike@freshroute.com");
  const [password, setPassword] = useState("driver123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");

  const handleLogin = async () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
<<<<<<< HEAD
    setAuthError("");
    try {
      await dispatch(
        loginDriverAsync({ email: email.trim().toLowerCase(), password }),
      ).unwrap();
    } catch (error) {
      const message =
        typeof error === "string" ? error : "Invalid credentials. Please try again.";
      setAuthError(message);
=======
    setAuthError('');
    dispatch(loginStart());

    try {
      // Try live backend Field Admin login first.
      // This lets seeded DB users log in even if they do not exist in demoUsers.
      try {
        const data = await loginByRole({ email, password });
        const serverUser = data.user ?? data.fieldAdmin ?? {};
        const normalizedRole = serverUser.role
          ? serverUser.role.toLowerCase().replace(/_/g, '')
          : 'fieldadmin';
        const authPayload = {
          user: {
            id: serverUser.id,
            name: serverUser.name,
            email: serverUser.email,
            role: normalizedRole,
            status: serverUser.status,
          },
          token: data.token,
        };
        await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, authPayload.user);
        dispatch(loginSuccess(authPayload));
        return;
      } catch {
        // Fall through to demo auth (buyer/seller/driver demo accounts).
      }

      const user = findUserByCredentials(email, password);

      if (!user) {
        const message = 'Invalid email or password';
        setAuthError(message);
        dispatch(loginFailure(message));
        setLoading(false);
        return;
      }

      {
        const authPayload = {
          user,
          token: `demo_token_${user.role}`,
        };
        await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, authPayload.token);
        await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, authPayload.user);
        dispatch(loginSuccess(authPayload));
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Login failed';
      setAuthError(message);
      dispatch(loginFailure(message));
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const errBoxBg   = isDarkMode ? "#2d1515" : "#fef2f2";
  const errBoxBdr  = isDarkMode ? "#7f1d1d" : "#fecaca";
  const errBoxText = isDarkMode ? "#fca5a5" : "#b91c1c";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Brand area — always dark navy regardless of theme */}
            <View style={[styles.brandArea, { backgroundColor: BRAND_BG }]}>
              <View style={[styles.logoBox, { backgroundColor: PRIMARY }]}>
                <Text style={styles.logoText}>🌱</Text>
              </View>
              <Text style={styles.brandName}>FreshRoute</Text>
              <Text style={styles.brandTagline}>Driver Portal</Text>
=======
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            </View>

<<<<<<< HEAD
            {/* Form area — adapts to theme */}
            <View style={[styles.formArea, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.formTitle, { color: theme.colors.text.primary }]}>
                Sign In
              </Text>
              <Text style={[styles.formSubtitle, { color: theme.colors.text.secondary }]}>
                Enter your credentials to continue
              </Text>

              <View style={styles.inputGroup}>
                <Input
                  label="Email address"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  rightIcon={
                    <Text style={{ color: PRIMARY, fontSize: 16 }}>
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotRow}
              >
                <Text style={[styles.forgotText, { color: PRIMARY }]}>Forgot Password?</Text>
              </TouchableOpacity>

              {!!authError && (
                <View style={[styles.errorBox, { backgroundColor: errBoxBg, borderColor: errBoxBdr }]}>
                  <Text style={[styles.errorBoxText, { color: errBoxText }]}>{authError}</Text>
                </View>
              )}

              <Button
                title={loading ? "Signing in..." : "Sign In"}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              />

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text style={[styles.signupText, { color: PRIMARY }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
=======
          {/* Form Card with Glassmorphism */}
          <Card variant="glass" style={styles.formCard}>
            <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
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
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.signupText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  brandArea: {
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: "center",
  },
  logoBox: {
    width: 72,
    height: 72,
=======
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#14b8a6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: { fontSize: 36 },
  brandName: { fontSize: 28, fontWeight: "800", color: "#f8fafc", letterSpacing: -0.5 },
  brandTagline: { fontSize: 13, color: "#64748b", marginTop: 4, letterSpacing: 1 },

  formArea: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  formSubtitle: { fontSize: 14, marginBottom: 28 },

  inputGroup: { gap: 4, marginBottom: 8 },

  forgotRow: { alignSelf: "flex-end", marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: "600" },

  errorBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
<<<<<<< HEAD
  errorBoxText: { fontSize: 13, fontWeight: "500", textAlign: "center" },

  loginButton: { marginBottom: 24 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14 },
  signupText: { fontSize: 14, fontWeight: "700" },
=======
  lightModeCircle1: {
    backgroundColor: 'rgba(22, 163, 74, 0.35)',
    opacity: 0.7,
  },
  lightModeCircle2: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    opacity: 0.5,
  },
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
});

export default LoginScreen;
