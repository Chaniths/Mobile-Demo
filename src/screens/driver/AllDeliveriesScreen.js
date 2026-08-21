import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { useDriverData } from "../../hooks/useDriverData";

const STATUS_COLOR_LIGHT = {
  COMPLETED:   { fg: "#22c55e", bg: "#dcfce7" },
  FAILED:      { fg: "#ef4444", bg: "#fee2e2" },
  SKIPPED:     { fg: "#64748b", bg: "#f1f5f9" },
  IN_PROGRESS: { fg: "#3b82f6", bg: "#eff6ff" },
  PENDING:     { fg: "#f59e0b", bg: "#fef3c7" },
};
const STATUS_COLOR_DARK = {
  COMPLETED:   { fg: "#4ade80", bg: "#14532d" },
  FAILED:      { fg: "#f87171", bg: "#7f1d1d" },
  SKIPPED:     { fg: "#94a3b8", bg: "#1e293b" },
  IN_PROGRESS: { fg: "#60a5fa", bg: "#1e3a5f" },
  PENDING:     { fg: "#fbbf24", bg: "#451a03" },
};

const statusLabel = (s) => {
  if (!s) return "Pending";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const AllDeliveriesScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { data, loading, refreshing, error, refresh, reload } = useDriverData();
  const STATUS_COLOR = isDarkMode ? STATUS_COLOR_DARK : STATUS_COLOR_LIGHT;

  // Today's Stops = the current active route's own stops only. This used to
  // fall back to data.orders (the driver's full, all-time delivery history)
  // whenever there was no active route — which is exactly the state right
  // after finishing the last stop — so a just-completed stop from a route
  // that no longer counts as "active" kept showing up here. No active route
  // now correctly means an empty list, same as Home's Next Stops.
  const stops = useMemo(() => {
    return data.route?.stops || data.activeRoute?.stops || [];
  }, [data.route, data.activeRoute]);

  const completed = useMemo(() => stops.filter((s) => s.status === "COMPLETED").length, [stops]);

  if (loading) {
    return <Loader fullScreen text="Loading today's stops..." />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Today's Stops</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {completed}/{stops.length} completed
          </Text>
        </View>
      </View>

      {!!error && (
        <View style={[
          styles.errorBanner,
          isDarkMode
            ? { backgroundColor: "#2d1515", borderColor: "#7f1d1d" }
            : { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
        ]}>
          <Text style={[styles.errorText, { color: isDarkMode ? "#fca5a5" : "#b91c1c" }]}>
            Could not load stops. Pull down to retry.
          </Text>
        </View>
      )}

      <FlatList
        data={stops}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#14b8a6" />
        }
        renderItem={({ item, index }) => {
          const isPickup = item.type === "PICKUP";
          const isDone = item.status === "COMPLETED" || item.status === "FAILED" || item.status === "SKIPPED";
          const sc = STATUS_COLOR[item.status?.toUpperCase()] || STATUS_COLOR.PENDING;

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("DeliveryDetail", { deliveryId: item.id })}
            >
              <Card style={[styles.card, isDone && styles.cardDone]}>
                <View style={styles.cardRow}>
                  {/* Sequence circle */}
                  <View style={[
                    styles.seqCircle,
                    isDone
                      ? isDarkMode
                        ? { backgroundColor: "#1e293b", borderColor: "#334155" }
                        : { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" }
                      : { backgroundColor: "#14b8a615", borderColor: "#14b8a640" }
                  ]}>
                    {item.status === "COMPLETED" ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : item.status === "FAILED" ? (
                      <Text style={styles.failMark}>✕</Text>
                    ) : (
                      <Text style={[styles.seqText, { color: isDone ? "#94a3b8" : "#14b8a6" }]}>
                        {item.sequence ?? index + 1}
                      </Text>
                    )}
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text
                        style={[styles.customer, { color: isDone ? theme.colors.text.tertiary : theme.colors.text.primary }]}
                        numberOfLines={1}
                      >
                        {item.customer}
                      </Text>
                      <View style={styles.badges}>
                        <View style={[styles.typePill, {
                          backgroundColor: isPickup
                            ? (isDarkMode ? "#451a03" : "#fef3c7")
                            : (isDarkMode ? "#172554" : "#eff6ff"),
                        }]}>
                          <Text style={[styles.typePillText, {
                            color: isPickup
                              ? (isDarkMode ? "#fed7aa" : "#b45309")
                              : (isDarkMode ? "#bfdbfe" : "#1d4ed8"),
                          }]}>
                            {isPickup ? "PICKUP" : "DELIVERY"}
                          </Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.statusPillText, { color: sc.fg }]}>
                            {statusLabel(item.status)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text
                      style={[styles.address, { color: isDone ? theme.colors.text.tertiary : theme.colors.text.secondary }]}
                      numberOfLines={1}
                    >
                      📍 {item.address}
                    </Text>

                    {!isDone && (
                      <Text style={[styles.meta, { color: theme.colors.text.tertiary }]}>
                        {item.etaMinutes > 0 ? `ETA ${item.etaMinutes} min` : ""}
                        {item.etaMinutes > 0 && item.distanceKm > 0 ? " · " : ""}
                        {item.distanceKm > 0 ? `${item.distanceKm.toFixed(1)} km` : ""}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No stops assigned"
            message="Your stops will appear here once a route is assigned."
            actionLabel="Reload"
            onAction={reload}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  backText: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  headerInfo: {},
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: "500" },

  list: { paddingHorizontal: 20, paddingBottom: 120 },

  card: { marginBottom: 10, padding: 14 },
  cardDone: { opacity: 0.65 },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },

  seqCircle: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, marginTop: 2, flexShrink: 0,
  },
  seqText: { fontSize: 14, fontWeight: "800" },
  checkMark: { fontSize: 16, color: "#22c55e", fontWeight: "800" },
  failMark: { fontSize: 16, color: "#ef4444", fontWeight: "800" },

  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 6 },
  customer: { fontSize: 15, fontWeight: "700", flex: 1 },
  badges: { flexDirection: "row", gap: 4 },

  typePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typePillText: { fontSize: 9, fontWeight: "800" },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusPillText: { fontSize: 9, fontWeight: "700" },

  address: { fontSize: 13, marginBottom: 4 },
  meta: { fontSize: 12 },
  emptyIcon: { fontSize: 64 },
});

export default AllDeliveriesScreen;
