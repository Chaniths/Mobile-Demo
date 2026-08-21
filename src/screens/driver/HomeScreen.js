import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import NotificationBell from "../../components/NotificationBell";
import { useDriverData } from "../../hooks/useDriverData";
import { driverApi } from "../../api/driverApi";

const PRIMARY = "#14b8a6";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { data, loading, refreshing, error, refresh, reload, routeModifiedAt } = useDriverData();
  const [isAvailable, setIsAvailable] = useState(true);
  const [availLoading, setAvailLoading] = useState(false);

  // useDriverData only fetches once on mount, and this tab stays mounted
  // in the background after the first visit — so completing a route on
  // the Route tab never showed up back here until a manual pull-to-refresh.
  // Re-fetch every time Home regains focus instead.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (typeof data.me?.isAvailable === "boolean") {
      setIsAvailable(data.me.isAvailable);
    }
  }, [data.me?.isAvailable]);

  const routeData = data.route || data.activeRoute;
  const upcomingDeliveries = useMemo(() => {
    const source = routeData?.stops?.length ? routeData.stops : data.orders;
    return source.slice(0, 4);
  }, [data.orders, routeData]);

  const stats = data.stats;
  const completionRate =
    stats?.totalDeliveries > 0
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
        newAvail
          ? "You are now available for new routes."
          : "Break mode on — no new routes will be assigned.",
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

  // ── Theme-derived palette ──────────────────────────────────────────────────
  const heroBg      = isDarkMode ? "#0d2137" : "#0a1929";
  const statsStripBg  = isDarkMode ? "#1e3a52" : "#0f2942";
  const dividerColor  = isDarkMode ? "#2d4a63" : "#1e3a52";

  const errBannerBg   = isDarkMode ? "#2d1515" : "#fef2f2";
  const errBannerBdr  = isDarkMode ? "#7f1d1d" : "#fecaca";
  const errBannerTxt  = isDarkMode ? "#fca5a5" : "#b91c1c";

  const updBannerBg   = isDarkMode ? "#0d2c1c" : "#ecfdf5";
  const updBannerBdr  = isDarkMode ? "#14532d" : "#bbf7d0";
  const updBannerTxt  = isDarkMode ? "#86efac" : "#065f46";

  const pickupBg      = isDarkMode ? "#451a03" : "#fef3c7";
  const pickupTxt     = isDarkMode ? "#fed7aa" : "#b45309";
  const deliveryBg    = isDarkMode ? "#172554" : "#eff6ff";
  const deliveryTxt   = isDarkMode ? "#bfdbfe" : "#1d4ed8";

  const actionCardBg  = theme.colors.card;
  const actionBdrRed  = isDarkMode ? "#7f1d1d60" : "#ef444440";
  const actionBdrAmber = isDarkMode ? "#78350f60" : "#f59e0b40";
  const actionBdrGreen = isDarkMode ? "#14532d60" : "#22c55e40";
  const actionBdrTeal  = isDarkMode ? "#0d4a4060" : "#14b8a640";
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={heroBg} />

      {/* ── Hero Header ── */}
      <View style={[styles.heroHeader, { backgroundColor: heroBg }]}>
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
                    <Text style={[styles.heroBadgeText, { color: PRIMARY }]}>
                      {routeData.stops?.length || 0} stops today
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <NotificationBell />
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Avatar name={data.me?.name || "Driver"} size="medium" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats strip */}
          <View style={[styles.heroStatsRow, { backgroundColor: statsStripBg }]}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats?.totalDeliveries ?? 0}</Text>
              <Text style={styles.heroStatLabel}>Assigned</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: "#22c55e" }]}>{stats?.completedDeliveries ?? 0}</Text>
              <Text style={styles.heroStatLabel}>Done</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: "#f59e0b" }]}>{stats?.remainingDeliveries ?? 0}</Text>
              <Text style={styles.heroStatLabel}>Left</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: PRIMARY }]}>{completionRate}%</Text>
              <Text style={styles.heroStatLabel}>Rate</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={PRIMARY} />}
      >
        {/* Error banner */}
        {!!error && (
          <View style={[styles.errorBanner, { backgroundColor: errBannerBg, borderColor: errBannerBdr }]}>
            <Text style={styles.errorBannerIcon}>⚠</Text>
            <Text style={[styles.errorBannerText, { color: errBannerTxt }]}>
              Could not load some data. Pull down to retry.
            </Text>
            <TouchableOpacity onPress={reload}>
              <Text style={[styles.errorBannerAction, { color: errBannerTxt }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Route update banner */}
        {routeModifiedAt && (
          <View style={[styles.updateBanner, { backgroundColor: updBannerBg, borderColor: updBannerBdr }]}>
            <Text style={[styles.updateBannerText, { color: updBannerTxt }]}>Route updated by dispatcher</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={[styles.updateBannerAction, { color: PRIMARY }]}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Active Route ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Active Route</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Route")}>
              <Text style={[styles.sectionLink, { color: PRIMARY }]}>View Map →</Text>
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
                  <View style={styles.statusPill}>
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

                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: `${PRIMARY}25` }]}>
                    <View style={[styles.progressFill, { backgroundColor: PRIMARY, width: `${completionRate}%` }]} />
                  </View>
                  <Text style={[styles.progressLabel, { color: theme.colors.text.tertiary }]}>
                    {completionRate}%
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

        {/* ── Next Stops ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Next Stops</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AllDeliveries")}>
              <Text style={[styles.sectionLink, { color: PRIMARY }]}>See All →</Text>
            </TouchableOpacity>
          </View>

          {upcomingDeliveries.length === 0 ? (
            <EmptyState
              icon={<Text style={styles.emptyIcon}>📦</Text>}
              title="No stops assigned"
              message="Your next stops will appear here once a route is assigned."
            />
          ) : (
            upcomingDeliveries.map((stop, index) => {
              const isPickup = stop.type === "PICKUP";
              return (
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
                      <View style={[styles.seqBadge, { backgroundColor: `${PRIMARY}18`, borderColor: `${PRIMARY}40` }]}>
                        <Text style={[styles.seqBadgeText, { color: PRIMARY }]}>
                          {stop.sequence ?? index + 1}
                        </Text>
                      </View>
                      <View style={styles.stopCardBody}>
                        <View style={styles.stopCardTopRow}>
                          <Text style={[styles.stopCustomer, { color: theme.colors.text.primary }]} numberOfLines={1}>
                            {stop.customer}
                          </Text>
                          {stop.type && (
                            <View style={[styles.typePill, { backgroundColor: isPickup ? pickupBg : deliveryBg }]}>
                              <Text style={[styles.typePillText, { color: isPickup ? pickupTxt : deliveryTxt }]}>
                                {isPickup ? "PICKUP" : "DELIVERY"}
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
                          <TouchableOpacity onPress={() => navigation.navigate("Route", { deliveryId: stop.id })}>
                            <Text style={[styles.startNav, { color: PRIMARY }]}>Navigate →</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: actionCardBg, borderColor: actionBdrRed }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ReportIssue", {})}
            >
              <Text style={styles.actionCardIcon}>⚠️</Text>
              <Text style={[styles.actionCardLabel, { color: theme.colors.text.primary }]}>Report Issue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: actionCardBg, borderColor: isAvailable ? actionBdrAmber : actionBdrGreen }]}
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
              style={[styles.actionCard, { backgroundColor: actionCardBg, borderColor: actionBdrTeal }]}
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
  container: { flex: 1 },
  heroHeader: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", paddingTop: 8, marginBottom: 20,
  },
  headerTextGroup: { flex: 1 },
  heroGreeting: { fontSize: 13, color: "#94a3b8", marginBottom: 4 },
  heroName: { fontSize: 26, fontWeight: "800", color: "#f8fafc", marginBottom: 8 },
  heroBadgeRow: { flexDirection: "row", alignItems: "center" },
  heroBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  heroDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  heroBadgeText: { fontSize: 12, fontWeight: "600" },

  heroStatsRow: { flexDirection: "row", justifyContent: "space-around", borderRadius: 16, paddingVertical: 14 },
  heroStat: { alignItems: "center", flex: 1 },
  heroStatValue: { fontSize: 22, fontWeight: "800", color: "#f8fafc" },
  heroStatLabel: { fontSize: 11, color: "#64748b", marginTop: 2 },
  heroStatDivider: { width: 1, marginVertical: 4 },

  errorBanner: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginTop: 16, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1,
  },
  errorBannerIcon: { fontSize: 14, marginRight: 8 },
  errorBannerText: { flex: 1, fontSize: 13, fontWeight: "500" },
  errorBannerAction: { fontSize: 13, fontWeight: "700" },

  updateBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 20, marginTop: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1,
  },
  updateBannerText: { fontSize: 13, fontWeight: "500" },
  updateBannerAction: { fontSize: 13, fontWeight: "700" },

  scrollContent: {},
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionLink: { fontSize: 13, fontWeight: "600" },

  routeCard: { padding: 18 },
  routeCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  routeCardInfo: { flex: 1 },
  routeCardTitle: { fontSize: 17, fontWeight: "700" },
  routeCardSub: { fontSize: 12, marginTop: 3 },
  statusPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#22c55e18", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusPillText: { fontSize: 12, fontWeight: "600" },
  routeMetrics: { flexDirection: "row", marginBottom: 14, gap: 20 },
  routeMetric: { alignItems: "center" },
  routeMetricValue: { fontSize: 20, fontWeight: "800" },
  routeMetricLabel: { fontSize: 11, marginTop: 2 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 11, minWidth: 30 },

  noRouteContent: { alignItems: "center", paddingVertical: 20 },
  noRouteIcon: { fontSize: 40, marginBottom: 10 },
  noRouteTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  noRouteSub: { fontSize: 13, textAlign: "center" },

  stopCard: { marginBottom: 10, padding: 14 },
  priorityStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  stopCardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  seqBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", borderWidth: 1.5, marginTop: 2 },
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

  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 120 },
  actionCard: {
    width: "47%", borderRadius: 16, paddingVertical: 18, paddingHorizontal: 16,
    alignItems: "center", borderWidth: 1.5,
    shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  actionCardIcon: { fontSize: 28, marginBottom: 8 },
  actionCardLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  emptyIcon: { fontSize: 48 },
});

export default HomeScreen;
