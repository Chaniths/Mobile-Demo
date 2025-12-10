import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { loginSuccess } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const roles = [
  {
    id: 'buyer',
    title: 'Buyer',
    icon: '🛒',
    description: 'Browse and purchase organic products',
  },
  {
    id: 'seller',
    title: 'Seller',
    icon: '🏪',
    description: 'Sell organic products and manage inventory',
  },
  {
    id: 'driver',
    title: 'Driver',
    icon: '🚚',
    description: 'Deliver products and manage routes',
  },
  {
    id: 'fieldadmin',
    title: 'Field Admin',
    icon: '📋',
    description: 'Quality checks and route assessment',
  },
];

const RoleSelectScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // Update user with selected role and trigger navigation via AppNavigator
    dispatch(loginSuccess({
      user: {
        id: 1,
        name: 'Demo User',
        email: 'demo@freshroute.com',
        role: selectedRole,
      },
      token: 'demo_token_123',
    }));
    
    // Navigation will happen automatically via AppNavigator
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode && (
        <>
          <View style={styles.gradientCircle1} />
          <View style={styles.gradientCircle2} />
        </>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Select Your Role
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Choose how you'll use FreshRoute
          </Text>
        </View>

        {/* Role Cards Container with Glassmorphism */}
        <Card variant="glass" style={styles.rolesCard}>
          <View style={styles.rolesContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.7}
              >
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
                      <Text style={styles.icon}>{role.icon}</Text>
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
          </View>
        </Card>

        {/* Continue Button */}
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
          style={[styles.continueButton, theme.isDarkMode && { backgroundColor: theme.colors.primary.main }]}
        />
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    zIndex: 1,
  },
  rolesCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
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
    marginBottom: 24,
  },
  roleCard: {
    marginBottom: 16,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 30,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButton: {
    marginTop: 8,
  },
});

export default RoleSelectScreen;

