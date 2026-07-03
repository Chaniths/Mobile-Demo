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
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import { logoutAsync } from "../../store/slices/authSlice";
import { useDriverData } from "../../hooks/useDriverData";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";

const DriverProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { data } = useDriverData();

  const driver = data.me;
  const stats = data.stats;

  const menuItems = [
    { id: "1", icon: "📦", title: "Delivery History",    color: "#14b8a6", screen: "AllDeliveries" },
    { id: "2", icon: "💰", title: "My Earnings",          color: "#8b5cf6", screen: "Earnings" },
    { id: "3", icon: "⚠️", title: "Report an Issue",      color: "#ef4444", screen: "ReportIssue" },
    { id: "4", icon: "🔔", title: "Notifications",        color: "#f59e0b", screen: "Notifications" },
    { id: "5", icon: "❓", title: "Help & Support",       color: "#3b82f6", screen: "Help" },
    { id: "6", icon: "📄", title: "Terms & Privacy",      color: "#64748b", screen: "Terms" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Profile</Text>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Driver info card */}
        <Card style={styles.userCard}>
          <Avatar name={user?.name || "Driver"} size="large" />
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            {user?.name || driver?.name || "Driver"}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.text.secondary }]}>
            {user?.email || driver?.email || "—"}
          </Text>
          {driver?.phone && (
            <Text style={[styles.userPhone, { color: theme.colors.text.tertiary }]}>
              📞 {driver.phone}
            </Text>
          )}
          <View style={[
            styles.availBadge,
            { backgroundColor: driver?.isAvailable ? "#22c55e20" : "#f59e0b20" },
          ]}>
            <View style={[styles.availDot, { backgroundColor: driver?.isAvailable ? "#22c55e" : "#f59e0b" }]} />
            <Text style={[styles.availText, { color: driver?.isAvailable ? "#22c55e" : "#f59e0b" }]}>
              {driver?.isAvailable ? "Online" : "On Break"}
            </Text>
          </View>
        </Card>

        {/* Today's quick stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.statsTitle, { color: theme.colors.text.primary }]}>Today's Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                {stats?.totalDeliveries ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>Assigned</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#22c55e" }]}>
                {stats?.completedDeliveries ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>Completed</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#f59e0b" }]}>
                {stats?.remainingDeliveries ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>Remaining</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#14b8a6" }]}>
                ${stats?.earningsToday?.toFixed(0) ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>Earned</Text>
            </View>
          </View>
        </Card>

        {/* Vehicle info */}
        {(driver?.vehicleNumber || driver?.vehicleType) && (
          <Card style={styles.vehicleCard}>
            <Text style={[styles.vehicleTitle, { color: theme.colors.text.primary }]}>Vehicle Info</Text>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleIcon}>🚚</Text>
              <View>
                {driver?.vehicleType && (
                  <Text style={[styles.vehicleType, { color: theme.colors.text.secondary }]}>
                    {driver.vehicleType}
                  </Text>
                )}
                {driver?.vehicleNumber && (
                  <Text style={[styles.vehicleNumber, { color: theme.colors.text.primary }]}>
                    {driver.vehicleNumber}
                  </Text>
                )}
                {driver?.licenseNumber && (
                  <Text style={[styles.vehicleLicense, { color: theme.colors.text.tertiary }]}>
                    License: {driver.licenseNumber}
                  </Text>
                )}
              </View>
              {driver?.averageRating > 0 && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={[styles.ratingValue, { color: theme.colors.text.primary }]}>
                    {driver.averageRating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Theme toggle */}
        <Card style={styles.themeCard}>
          <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
              <Text style={styles.themeIcon}>{isDarkMode ? "🌙" : "☀️"}</Text>
              <View>
                <Text style={[styles.themeTitle, { color: theme.colors.text.primary }]}>
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </Text>
                <Text style={[styles.themeSubtitle, { color: theme.colors.text.secondary }]}>
                  Toggle app appearance
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: "#14b8a6" }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                try { navigation.navigate(item.screen, {}); } catch {}
              }}
            >
              <Card style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: `${item.color}18` }]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.menuTitle, { color: theme.colors.text.primary }]}>
                    {item.title}
                  </Text>
                </View>
                <Text style={[styles.menuArrow, { color: theme.colors.text.tertiary }]}>›</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: () => dispatch(logoutAsync()),
              },
            ]);
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.colors.text.tertiary }]}>
          FreshRoute Driver v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800" },
  scrollContent: { paddingBottom: 120 },

  userCard: { alignItems: "center", marginHorizontal: 20, marginBottom: 14, padding: 24 },
  userName: { fontSize: 22, fontWeight: "700", marginTop: 14, marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 4 },
  userPhone: { fontSize: 13, marginBottom: 10 },
  availBadge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginTop: 4,
  },
  availDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  availText: { fontSize: 13, fontWeight: "600" },

  statsCard: { marginHorizontal: 20, marginBottom: 14, padding: 16 },
  statsTitle: { fontSize: 14, fontWeight: "700", marginBottom: 14 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 3 },
  statDivider: { width: 1, height: 32 },

  vehicleCard: { marginHorizontal: 20, marginBottom: 14, padding: 16 },
  vehicleTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  vehicleIcon: { fontSize: 32 },
  vehicleType: { fontSize: 12, textTransform: "capitalize" },
  vehicleNumber: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  vehicleLicense: { fontSize: 12, marginTop: 2 },
  ratingBadge: { marginLeft: "auto", alignItems: "center" },
  ratingStar: { fontSize: 18 },
  ratingValue: { fontSize: 16, fontWeight: "700" },

  themeCard: { marginHorizontal: 20, marginBottom: 14 },
  themeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  themeInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  themeIcon: { fontSize: 28, marginRight: 14 },
  themeTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  themeSubtitle: { fontSize: 12 },

  menuSection: { marginHorizontal: 20, marginBottom: 16, gap: 8 },
  menuItem: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 14,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  menuIcon: { fontSize: 20 },
  menuTitle: { fontSize: 15, fontWeight: "500" },
  menuArrow: { fontSize: 22, fontWeight: "300" },

  logoutButton: {
    marginHorizontal: 20, marginBottom: 8,
    padding: 16, borderRadius: 16,
    alignItems: "center", backgroundColor: "#ef4444",
    shadowColor: "#ef4444", shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  version: { textAlign: "center", fontSize: 12, marginVertical: 20 },
});

export default DriverProfileScreen;
