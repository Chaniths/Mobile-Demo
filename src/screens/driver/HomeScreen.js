import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import BackgroundShapes from "../../components/common/BackgroundShapes";
import { useDriverData } from "../../hooks/useDriverData";
import { driverApi } from "../../api/driverApi";

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { data, loading, refreshing, error, refresh, reload, routeModifiedAt } = useDriverData();
  const [isAvailable, setIsAvailable] = useState(true);

  const routeData = data.activeRoute || data.route;
  const upcomingDeliveries = useMemo(() => {
    const source = routeData?.stops?.length ? routeData.stops : data.orders;
    return source.slice(0, 4);
  }, [data.orders, routeData]);

  const todayStats = useMemo(() => {
    const stats = data.stats;
    return [
      {
        id: "1",
        label: "Deliveries",
        value: String(stats?.totalDeliveries ?? 0),
        icon: "📦",
        color: "#3b82f6",
      },
      {
        id: "2",
        label: "Completed",
        value: String(stats?.completedDeliveries ?? 0),
        icon: "✓",
        color: "#22c55e",
      },
      {
        id: "3",
        label: "Remaining",
        value: String(stats?.remainingDeliveries ?? 0),
        icon: "⏰",
        color: "#f59e0b",
      },
      {
        id: "4",
        label: "Earnings",
        value: `$${Number(stats?.earningsToday ?? 0).toFixed(2)}`,
        icon: "💰",
        color: "#8b5cf6",
      },
    ];
  }, [data.stats]);

  if (loading) {
    return <Loader fullScreen text="Loading driver dashboard..." />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackgroundShapes />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text
              style={[styles.greeting, { color: theme.colors.text.secondary }]}
            >
              Good shift
            </Text>
            <Text
              style={[styles.userName, { color: theme.colors.text.primary }]}
            >
              {data.me?.name || "Driver"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Avatar name={data.me?.name || "Driver"} size="medium" />
          </TouchableOpacity>
        </View>

        {!!error && (
          <Card style={styles.errorCard}>
            <Text
              style={[
                styles.errorText,
                { color: theme.colors.error || "#d32f2f" },
              ]}
            >
              {error}
            </Text>
            <Button
              title="Retry"
              size="small"
              onPress={reload}
              style={styles.retryButton}
            />
          </Card>
        )}

        <Card style={styles.activeRouteCard} elevation="lg">
          <View style={styles.routeHeader}>
            <View>
              <Text
                style={[
                  styles.routeTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                Active Route
              </Text>
              <Text
                style={[styles.routeId, { color: theme.colors.text.tertiary }]}
              >
                {routeData?.id || "No active route"}
                {routeData?.truckNumber ? ` • ${routeData.truckNumber}` : ""}
              </Text>
            </View>
            <View
              style={[
                styles.activeBadge,
                { backgroundColor: `${theme.colors.success}20` },
              ]}
            >
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: theme.colors.success },
                ]}
              />
              <Text
                style={[styles.activeText, { color: theme.colors.success }]}
              >
                {routeData ? "In Progress" : "Idle"}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.routeDetails,
              { color: theme.colors.text.secondary },
            ]}
          >
            {routeData?.stops?.length || 0} stops
            {routeData?.totalDistanceKm
              ? ` • ${routeData.totalDistanceKm.toFixed(1)} km`
              : ""}
            {routeData?.estimatedDurationMinutes
              ? ` • Est. ${routeData.estimatedDurationMinutes} min`
              : ""}
          </Text>

          <Button
            title="View Route Map"
            onPress={() => navigation.navigate("Route")}
            style={styles.routeButton}
          />
        </Card>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
            >
              Today's Performance
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Earnings")}>
              <Text style={[styles.seeAll, { color: theme.colors.primary.main }]}>
                View Earnings
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            {todayStats.map((stat) => (
              <Card key={stat.id} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: `${stat.color}20` },
                  ]}
                >
                  <Text style={styles.statIconText}>{stat.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.statValue,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {stat.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {stat.label}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.deliveriesSection}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Next Deliveries
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllDeliveries")}
            >
              <Text
                style={[styles.seeAll, { color: theme.colors.primary.main }]}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingDeliveries.length === 0 ? (
            <EmptyState
              icon={<Text style={styles.emptyIcon}>📦</Text>}
              title="No deliveries assigned"
              message="You currently have no assigned deliveries from backend."
            />
          ) : (
            upcomingDeliveries.map((delivery) => (
              <Card
                key={delivery.id}
                style={styles.deliveryCard}
                onPress={() =>
                  navigation.navigate("DeliveryDetail", {
                    deliveryId: delivery.id,
                  })
                }
              >
                {delivery.priority === "high" && (
                  <View
                    style={[
                      styles.priorityStrip,
                      { backgroundColor: theme.colors.error },
                    ]}
                  />
                )}
                <View style={styles.deliveryHeader}>
                  <View>
                    <Text
                      style={[
                        styles.orderNumber,
                        { color: theme.colors.text.primary },
                      ]}
                    >
                      {delivery.orderId}
                    </Text>
                    <Text
                      style={[
                        styles.customerName,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      {delivery.customer}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.deliveryTime,
                      { color: theme.colors.primary.main },
                    ]}
                  >
                    {delivery.scheduledAt || `ETA ${delivery.etaMinutes} min`}
                  </Text>
                </View>
                <View style={styles.deliveryDetails}>
                  <Text
                    style={[
                      styles.deliveryIcon,
                      { color: theme.colors.text.tertiary },
                    ]}
                  >
                    📍
                  </Text>
                  <Text
                    style={[
                      styles.address,
                      { color: theme.colors.text.secondary },
                    ]}
                  >
                    {delivery.address}
                  </Text>
                </View>
                <View style={styles.deliveryFooter}>
                  <Text
                    style={[
                      styles.distance,
                      { color: theme.colors.text.tertiary },
                    ]}
                  >
                    {delivery.distanceKm.toFixed(1)} km away
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Route", { deliveryId: delivery.id })
                    }
                  >
                    <Text
                      style={[
                        styles.startButton,
                        { color: theme.colors.primary.main },
                      ]}
                    >
                      Start →
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.reportBtn]}
              onPress={() => navigation.navigate("ReportIssue", {})}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnText}>Report Issue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.breakBtn]}
              onPress={async () => {
                const newAvail = !isAvailable;
                try {
                  await driverApi.toggleAvailability(newAvail);
                  setIsAvailable(newAvail);
                  Alert.alert(newAvail ? "Back Online" : "On Break", newAvail ? "You are now available for deliveries." : "You are on break. No new routes will be assigned.");
                } catch (err) {
                  Alert.alert("Error", "Could not update availability.");
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnText}>{isAvailable ? "Take Break" : "Go Online"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Re-route Banner */}
        {routeModifiedAt && (
          <View style={styles.rerouteBanner}>
            <Text style={styles.rerouteText}>Route updated by optimizer</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.rerouteRefresh}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  greeting: { fontSize: 14, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: "700" },
  errorCard: { marginHorizontal: 20, marginBottom: 16 },
  errorText: { fontSize: 13, fontWeight: "600" },
  retryButton: { marginTop: 8, alignSelf: "flex-start" },
  activeRouteCard: { marginHorizontal: 20, marginBottom: 24, padding: 20 },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  routeTitle: { fontSize: 18, fontWeight: "700" },
  routeId: { fontSize: 11, marginTop: 2 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  activeText: { fontSize: 12, fontWeight: "600" },
  routeDetails: { fontSize: 14, marginBottom: 16 },
  routeButton: { marginTop: 8 },
  statsSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: { width: "48%", marginBottom: 8, padding: 12 },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIconText: { fontSize: 16 },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 2 },
  deliveriesSection: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: { fontSize: 14, fontWeight: "600" },
  deliveryCard: { marginBottom: 12, padding: 14 },
  priorityStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderNumber: { fontSize: 16, fontWeight: "700" },
  customerName: { fontSize: 14, marginTop: 2 },
  deliveryTime: { fontSize: 13, fontWeight: "600" },
  deliveryDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryIcon: { marginRight: 8 },
  address: { flex: 1, fontSize: 13 },
  deliveryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distance: { fontSize: 12 },
  startButton: { fontSize: 13, fontWeight: "700" },
  emptyIcon: { fontSize: 48 },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
  },
  reportBtn: {
    borderColor: "#14b8a6",
    backgroundColor: "#ffffff",
  },
  breakBtn: {
    borderColor: "#14b8a6",
    backgroundColor: "#ffffff",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14b8a6",
  },

  rerouteBanner: {
    marginHorizontal: 20,
    backgroundColor: "#dcfce7",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rerouteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22c55e",
  },
  rerouteRefresh: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14b8a6",
  },
});

export default HomeScreen;
