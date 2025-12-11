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
import { addUser } from '../../utils/demoUsers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const availableRoles = [
  {
    id: 'buyer',
    title: 'Buyer',
    icon: '🛒',
    description: 'Browse and purchase products.',
  },
  {
    id: 'seller',
    title: 'Seller',
    icon: '🏪',
    description: 'List and manage your products.',
  },
];

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleRegister = async () => {
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!selectedRole) newErrors.role = 'Select buyer or seller';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setFormError('');
    dispatch(loginStart());

    setTimeout(() => {
      try {
        const newUser = addUser({
          role: selectedRole,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        dispatch(
          loginSuccess({
            user: newUser,
            token: `demo_token_${newUser.role}`,
          })
        );
      } catch (error) {
        const message = error?.message || 'Unable to sign up';
        setFormError(message);
        dispatch(loginFailure(message));
      }

      setLoading(false);
    }, 1500);
  };

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
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Join FreshRoute today
            </Text>
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
                        <Text style={styles.roleIcon}>{role.icon}</Text>
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
                          <Text style={styles.checkmarkText}>✓</Text>
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
                  <Text style={{ color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

                <Button
                  title="Sign Up"
                  onPress={handleRegister}
                  loading={loading}
                  style={[styles.registerButton, theme.isDarkMode && { backgroundColor: theme.colors.primary.main }]}
                />

                {!!formError && (
                  <Text style={[styles.errorText, { color: theme.colors.error || '#d32f2f' }]}>
                    {formError}
                  </Text>
                )}
              </View>
            </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>
              Already have an account?{' '}
            </Text>
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

