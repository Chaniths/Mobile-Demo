import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { useDriverData } from "../../hooks/useDriverData";
import { driverApi } from "../../api/driverApi";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { data, loading, refreshing, error, refresh, reload, routeModifiedAt } = useDriverData();
  const [isAvailable, setIsAvailable] = useState(true);
  const [availLoading, setAvailLoading] = useState(false);

  const routeData = data.route || data.activeRoute;
  const upcomingDeliveries = useMemo(() => {
    const source = routeData?.stops?.length ? routeData.stops : data.orders;
    return source.slice(0, 4);
  }, [data.orders, routeData]);

  const stats = data.stats;
  const completionRate = stats?.totalDeliveries > 0
    ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100)
    : 0;

  const handleToggleAvailability = async () => {
    const newAvail = !isAvailable;
    setAvailLoading(true);
    try {
      await driverApi.toggleAvailability(newAvail);
      setIsAvailable(newAvail);
      Alert.alert(
        newAvail ? "Back Online" : "On Break",
        newAvail ? "You are now available for new routes." : "Break mode on — no new routes will be assigned.",
      );
    } catch {
      Alert.alert("Error", "Could not update availability. Please try again.");
    } finally {
      setAvailLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading your dashboard..." />;
  }

  const primaryColor = "#14b8a6";
  const darkBg = "#0a1929";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={darkBg} />

      {/* Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: darkBg }]}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.heroGreeting}>{getGreeting()}</Text>
              <Text style={styles.heroName}>{data.me?.name || "Driver"}</Text>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.heroBadge, { backgroundColor: isAvailable ? "#22c55e20" : "#f59e0b20" }]}>
                  <View style={[styles.heroDot, { backgroundColor: isAvailable ? "#22c55e" : "#f59e0b" }]} />
                  <Text style={[styles.heroBadgeText, { color: isAvailable ? "#22c55e" : "#f59e0b" }]}>
                    {isAvailable ? "Online" : "On Break"}
                  </Text>
                </View>
                {routeData && (
                  <View style={[styles.heroBadge, { backgroundColor: "#14b8a620", marginLeft: 8 }]}>
                    <Text style={[styles.heroBadgeText, { color: primaryColor }]}>
                      {routeData.stops?.length || 0} stops today
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Avatar name={data.me?.name || "Driver"} size="medium" />
            </TouchableOpacity>
          </View>

          {/* Quick stats strip */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats?.totalDeliveries ?? 0}</Text>
              <Text style={styles.heroStatLabel}>Assigned</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: "#22c55e" }]}>{stats?.completedDeliveries ?? 0}</Text>
              <Text style={styles.heroStatLabel}>Done</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: "#f59e0b" }]}>{stats?.remainingDeliveries ?? 0}</Text>
              <Text style={styles.heroStatLabel}>Left</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: primaryColor }]}>{completionRate}%</Text>
              <Text style={styles.heroStatLabel}>Rate</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={primaryColor} />}
      >
        {/* Error Banner — user-friendly, not raw Prisma errors */}
        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerIcon}>⚠</Text>
            <Text style={styles.errorBannerText}>Could not load some data. Pull down to retry.</Text>
            <TouchableOpacity onPress={reload}>
              <Text style={styles.errorBannerAction}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Route Update Banner */}
        {routeModifiedAt && (
          <View style={styles.updateBanner}>
            <Text style={styles.updateBannerText}>Route updated by dispatcher</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.updateBannerAction}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Route Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Active Route</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Route")}>
              <Text style={[styles.sectionLink, { color: primaryColor }]}>View Map →</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.routeCard} elevation="lg">
            {routeData ? (
              <>
                <View style={styles.routeCardTop}>
                  <View style={styles.routeCardInfo}>
                    <Text style={[styles.routeCardTitle, { color: theme.colors.text.primary }]}>
                      {routeData.routeNumber || `Route ${routeData.id?.slice(-6) || "—"}`}
                    </Text>
                    {routeData.truckNumber && (
                      <Text style={[styles.routeCardSub, { color: theme.colors.text.tertiary }]}>
                        Truck: {routeData.truckNumber}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: "#22c55e15" }]}>
                    <View style={[styles.statusDot, { backgroundColor: "#22c55e" }]} />
                    <Text style={[styles.statusPillText, { color: "#22c55e" }]}>In Progress</Text>
                  </View>
                </View>

                <View style={styles.routeMetrics}>
                  <View style={styles.routeMetric}>
                    <Text style={[styles.routeMetricValue, { color: theme.colors.text.primary }]}>
                      {routeData.stops?.length || 0}
                    </Text>
                    <Text style={[styles.routeMetricLabel, { color: theme.colors.text.tertiary }]}>Stops</Text>
                  </View>
                  {routeData.totalDistanceKm > 0 && (
                    <View style={styles.routeMetric}>
                      <Text style={[styles.routeMetricValue, { color: theme.colors.text.primary }]}>
                        {routeData.totalDistanceKm.toFixed(1)}
                      </Text>
                      <Text style={[styles.routeMetricLabel, { color: theme.colors.text.tertiary }]}>km</Text>
                    </View>
                  )}
                  {routeData.estimatedDurationMinutes > 0 && (
                    <View style={styles.routeMetric}>
                      <Text style={[styles.routeMetricValue, { color: theme.colors.text.primary }]}>
                        {routeData.estimatedDurationMinutes}
                      </Text>
                      <Text style={[styles.routeMetricLabel, { color: theme.colors.text.tertiary }]}>min</Text>
                    </View>
                  )}
                </View>

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: `${primaryColor}20` }]}>
                    <View
                      style={[styles.progressFill, {
                        backgroundColor: primaryColor,
                        width: `${completionRate}%`,
                      }]}
                    />
                  </View>
                  <Text style={[styles.progressLabel, { color: theme.colors.text.tertiary }]}>
                    {completionRate}% complete
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noRouteContent}>
                <Text style={styles.noRouteIcon}>🗺️</Text>
                <Text style={[styles.noRouteTitle, { color: theme.colors.text.primary }]}>No Active Route</Text>
                <Text style={[styles.noRouteSub, { color: theme.colors.text.secondary }]}>
                  Waiting for dispatcher to assign your route
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Next Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Next Stops</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AllDeliveries")}>
              <Text style={[styles.sectionLink, { color: primaryColor }]}>See All →</Text>
            </TouchableOpacity>
          </View>

          {upcomingDeliveries.length === 0 ? (
            <EmptyState
              icon={<Text style={styles.emptyIcon}>📦</Text>}
              title="No stops assigned"
              message="Your next stops will appear here once a route is assigned."
            />
          ) : (
            upcomingDeliveries.map((stop, index) => (
              <TouchableOpacity
                key={stop.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("DeliveryDetail", { deliveryId: stop.id })}
              >
                <Card style={styles.stopCard}>
                  {stop.priority === "high" && (
                    <View style={[styles.priorityStrip, { backgroundColor: "#ef4444" }]} />
                  )}
                  <View style={styles.stopCardRow}>
                    {/* Sequence badge */}
                    <View style={[styles.seqBadge, { backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}40` }]}>
                      <Text style={[styles.seqBadgeText, { color: primaryColor }]}>
                        {stop.sequence ?? index + 1}
                      </Text>
                    </View>

                    <View style={styles.stopCardBody}>
                      <View style={styles.stopCardTopRow}>
                        <Text style={[styles.stopCustomer, { color: theme.colors.text.primary }]} numberOfLines={1}>
                          {stop.customer}
                        </Text>
                        {stop.type && (
                          <View style={[
                            styles.typePill,
                            { backgroundColor: stop.type === "PICKUP" ? "#fef3c7" : "#eff6ff" }
                          ]}>
                            <Text style={[
                              styles.typePillText,
                              { color: stop.type === "PICKUP" ? "#b45309" : "#1d4ed8" }
                            ]}>
                              {stop.type === "PICKUP" ? "PICKUP" : "DELIVERY"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.stopAddress, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                        📍 {stop.address}
                      </Text>
                      <View style={styles.stopMeta}>
                        <Text style={[styles.stopMetaText, { color: theme.colors.text.tertiary }]}>
                          {stop.etaMinutes > 0 ? `ETA ${stop.etaMinutes} min` : ""}
                          {stop.etaMinutes > 0 && stop.distanceKm > 0 ? " · " : ""}
                          {stop.distanceKm > 0 ? `${stop.distanceKm.toFixed(1)} km` : ""}
                        </Text>
                        <TouchableOpacity
                          onPress={() => navigation.navigate("Route", { deliveryId: stop.id })}
                        >
                          <Text style={[styles.startNav, { color: primaryColor }]}>Navigate →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: "#ef444440" }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ReportIssue", {})}
            >
              <Text style={styles.actionCardIcon}>⚠️</Text>
              <Text style={[styles.actionCardLabel, { color: theme.colors.text.primary }]}>Report Issue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderColor: isAvailable ? "#f59e0b40" : "#22c55e40" }]}
              activeOpacity={0.7}
              onPress={handleToggleAvailability}
              disabled={availLoading}
            >
              <Text style={styles.actionCardIcon}>{isAvailable ? "☕" : "✅"}</Text>
              <Text style={[styles.actionCardLabel, { color: theme.colors.text.primary }]}>
                {availLoading ? "Updating..." : isAvailable ? "Take Break" : "Go Online"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderColor: "#8b5cf640" }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Earnings")}
            >
              <Text style={styles.actionCardIcon}>💰</Text>
              <Text style={[styles.actionCardLabel, { color: theme.colors.text.primary }]}>Earnings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderColor: `${primaryColor}40` }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AllDeliveries")}
            >
              <Text style={styles.actionCardIcon}>📋</Text>
              <Text style={[styles.actionCardLabel, { color: theme.colors.text.primary }]}>All Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },

  /* Hero Header */
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    marginBottom: 20,
  },
  headerTextGroup: { flex: 1 },
  heroGreeting: { fontSize: 13, color: "#94a3b8", marginBottom: 4 },
  heroName: { fontSize: 26, fontWeight: "800", color: "#f8fafc", marginBottom: 8 },
  heroBadgeRow: { flexDirection: "row", alignItems: "center" },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  heroBadgeText: { fontSize: 12, fontWeight: "600" },

  /* Quick stats strip */
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#0f2942",
    borderRadius: 16,
    paddingVertical: 14,
  },
  heroStat: { alignItems: "center", flex: 1 },
  heroStatValue: { fontSize: 22, fontWeight: "800", color: "#f8fafc" },
  heroStatLabel: { fontSize: 11, color: "#64748b", marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: "#1e3a52", marginVertical: 4 },

  /* Banners */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorBannerIcon: { fontSize: 14, marginRight: 8 },
  errorBannerText: { flex: 1, fontSize: 13, color: "#b91c1c", fontWeight: "500" },
  errorBannerAction: { fontSize: 13, fontWeight: "700", color: "#ef4444" },

  updateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  updateBannerText: { fontSize: 13, color: "#065f46", fontWeight: "500" },
  updateBannerAction: { fontSize: 13, fontWeight: "700", color: "#14b8a6" },

  /* Sections */
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionLink: { fontSize: 13, fontWeight: "600" },

  /* Route Card */
  routeCard: { padding: 18 },
  routeCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  routeCardInfo: { flex: 1 },
  routeCardTitle: { fontSize: 17, fontWeight: "700" },
  routeCardSub: { fontSize: 12, marginTop: 3 },
  statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusPillText: { fontSize: 12, fontWeight: "600" },
  routeMetrics: { flexDirection: "row", marginBottom: 14, gap: 20 },
  routeMetric: { alignItems: "center" },
  routeMetricValue: { fontSize: 20, fontWeight: "800" },
  routeMetricLabel: { fontSize: 11, marginTop: 2 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 11, width: 80, textAlign: "right" },

  noRouteContent: { alignItems: "center", paddingVertical: 20 },
  noRouteIcon: { fontSize: 40, marginBottom: 10 },
  noRouteTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  noRouteSub: { fontSize: 13, textAlign: "center" },

  /* Stop Cards */
  stopCard: { marginBottom: 10, padding: 14 },
  priorityStrip: {
    position: "absolute", top: 0, left: 0, right: 0, height: 3,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  stopCardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  seqBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, marginTop: 2,
  },
  seqBadgeText: { fontSize: 14, fontWeight: "800" },
  stopCardBody: { flex: 1 },
  stopCardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  stopCustomer: { fontSize: 15, fontWeight: "700", flex: 1, marginRight: 8 },
  typePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typePillText: { fontSize: 9, fontWeight: "800" },
  stopAddress: { fontSize: 12, marginBottom: 6 },
  stopMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stopMetaText: { fontSize: 12 },
  startNav: { fontSize: 12, fontWeight: "700" },

  /* Actions Grid */
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 120,
  },
  actionCard: {
    width: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  actionCardIcon: { fontSize: 28, marginBottom: 8 },
  actionCardLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },

  emptyIcon: { fontSize: 48 },
});

export default HomeScreen;
