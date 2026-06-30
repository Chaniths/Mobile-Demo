import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import { logoutAsync } from "../../store/slices/authSlice";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";
import BackgroundShapes from "../../components/common/BackgroundShapes";

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    { id: "1", icon: "👤", title: "Edit Profile", screen: "EditProfile" },
    { id: "2", icon: "📍", title: "Addresses", screen: "Addresses" },
    { id: "3", icon: "💳", title: "Payment Methods", screen: "PaymentMethods" },
    { id: "4", icon: "🔔", title: "Notifications", screen: "Notifications" },
    { id: "5", icon: "❤️", title: "Wishlist", screen: "Wishlist" },
    { id: "6", icon: "⭐", title: "My Reviews", screen: "MyReviews" },
    { id: "7", icon: "❓", title: "Help & Support", screen: "Help" },
    { id: "8", icon: "📄", title: "Terms & Privacy", screen: "Terms" },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackgroundShapes variant="profile" />
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
        <Card style={styles.userCard}>
          <Avatar name={user?.name || "Driver"} size="large" />
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            {user?.name || "Driver"}
          </Text>
          <Text
            style={[styles.userEmail, { color: theme.colors.text.secondary }]}
          >
            {user?.email || "Not available"}
          </Text>
          <Text
            style={[styles.userPhone, { color: theme.colors.text.tertiary }]}
          >
            {user?.phone || "Phone not available"}
          </Text>
        </Card>

        {/* Theme Toggle */}
        <Card style={styles.themeCard}>
          <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
              <Text style={styles.themeIcon}>{isDarkMode ? "🌙" : "☀️"}</Text>
              <View>
                <Text
                  style={[
                    styles.themeTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </Text>
                <Text
                  style={[
                    styles.themeSubtitle,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Toggle app appearance
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary.main,
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
              <Card style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: theme.colors.text.primary },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.menuArrow,
                    { color: theme.colors.text.tertiary },
                  ]}
                >
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
            Alert.alert("Logout", "Are you sure you want to logout?", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                  dispatch(logoutAsync());
                },
              },
            ]);
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  userCard: {
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  themeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    padding: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuArrow: {
    fontSize: 20,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginVertical: 24,
  },
});

export default ProfileScreen;
