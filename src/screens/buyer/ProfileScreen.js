import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { logout } from '../../store/slices/authSlice';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();

  const menuItems = [
    { id: '1', icon: '👤', title: 'Edit Profile', screen: 'EditProfile' },
    { id: '2', icon: '📍', title: 'Addresses', screen: 'Addresses' },
    { id: '3', icon: '💳', title: 'Payment Methods', screen: 'PaymentMethods' },
    { id: '4', icon: '🔔', title: 'Notifications', screen: 'Notifications' },
    { id: '5', icon: '❤️', title: 'Wishlist', screen: 'Wishlist' },
    { id: '6', icon: '⭐', title: 'My Reviews', screen: 'MyReviews' },
    { id: '7', icon: '❓', title: 'Help & Support', screen: 'Help' },
    { id: '8', icon: '📄', title: 'Terms & Privacy', screen: 'Terms' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isDarkMode && (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      )}
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Profile
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >

        {/* User Info */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.userCard}>
          <Avatar name="John Doe" size="large" />
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            John Doe
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.text.secondary }]}>
            john.doe@example.com
          </Text>
          <Text style={[styles.userPhone, { color: theme.colors.text.tertiary }]}>
            +1 234 567 8900
          </Text>
        </Card>

        {/* Theme Toggle */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.themeCard}>
          <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
              <Text style={styles.themeIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={[styles.themeTitle, { color: theme.colors.text.primary }]}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text style={[styles.themeSubtitle, { color: theme.colors.text.secondary }]}>
                  Toggle app appearance
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
              }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuTitle, { color: theme.colors.text.primary }]}>
                    {item.title}
                  </Text>
                </View>
                <Text style={[styles.menuArrow, { color: theme.colors.text.tertiary }]}>
                  →
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: () => {
                    // Dispatch logout action - will clear auth state
                    // AppNavigator will automatically redirect to Auth flow
                    dispatch(logout());
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.colors.text.tertiary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    zIndex: 1,
  },
  // Arch-like strips pattern for dark mode
  archStrip1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 200,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(35, 101, 113, 0.3)',
    opacity: 0.7,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  archStrip2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 350,
    height: 180,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: 'rgba(45, 122, 135, 0.35)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '25deg' }],
  },
  archStrip3: {
    position: 'absolute',
    bottom: 200,
    left: -60,
    width: 380,
    height: 190,
    borderTopLeftRadius: 190,
    borderTopRightRadius: 190,
    backgroundColor: 'rgba(35, 101, 113, 0.25)',
    opacity: 0.5,
    zIndex: 0,
    transform: [{ rotate: '20deg' }],
  },
  archStrip4: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 420,
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: 'rgba(45, 122, 135, 0.3)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '-30deg' }],
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  userCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
  },
  themeCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeSubtitle: {
    fontSize: 13,
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 24,
  },
});

export default ProfileScreen;

