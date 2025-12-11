import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { loginFailure, loginStart, loginSuccess } from '../../store/slices/authSlice';
import { findUserByCredentials } from '../../utils/demoUsers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const handleLogin = async () => {
    // Validation
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAuthError('');
    dispatch(loginStart());

    setTimeout(() => {
      const user = findUserByCredentials(email, password);

      if (user) {
        dispatch(
          loginSuccess({
            user,
            token: `demo_token_${user.role}`,
          })
        );
      } else {
        const message = 'Invalid email or password';
        setAuthError(message);
        dispatch(loginFailure(message));
      }

      setLoading(false);
    }, 1500);
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
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Sign in to continue to FreshRoute
            </Text>
          </View>

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
                <Text style={{ color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
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

