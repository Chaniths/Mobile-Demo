import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import BackgroundShapes from "../../components/common/BackgroundShapes";
import { driverApi } from "../../api/driverApi";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDate = (isoDate) => {
  const d = new Date(isoDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - d) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return DAY_NAMES[d.getDay()];
};

const EarningsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEarnings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await driverApi.getEarnings();
      setData(result);
    } catch (err) {
      setError(err?.message || "Failed to load earnings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchEarnings(false);
  }, [fetchEarnings]);

  if (loading) {
    return <Loader fullScreen text="Loading earnings..." />;
  }

  const maxEarnings = data?.breakdown
    ? Math.max(...data.breakdown.map((d) => d.earnings), 1)
    : 1;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <BackgroundShapes />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchEarnings(true)} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Earnings</Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={[styles.errorText, { color: theme.colors.error || "#d32f2f" }]}>
              {error}
            </Text>
          </Card>
        )}

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { flex: 1, marginRight: 8 }]}>
            <View style={[styles.summaryIcon, { backgroundColor: "#8b5cf620" }]}>
              <Text style={styles.summaryIconText}>💰</Text>
            </View>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              ${(data?.today ?? 0).toFixed(2)}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
              Today
            </Text>
            <Text style={[styles.summaryMeta, { color: theme.colors.text.tertiary }]}>
              {data?.todayDeliveries ?? 0} deliveries
            </Text>
          </Card>
          <Card style={[styles.summaryCard, { flex: 1, marginLeft: 8 }]}>
            <View style={[styles.summaryIcon, { backgroundColor: "#22c55e20" }]}>
              <Text style={styles.summaryIconText}>📈</Text>
            </View>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              ${(data?.thisWeek ?? 0).toFixed(2)}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
              This Week
            </Text>
            <Text style={[styles.summaryMeta, { color: theme.colors.text.tertiary }]}>
              {data?.thisWeekDeliveries ?? 0} deliveries
            </Text>
          </Card>
        </View>

        <Card style={styles.breakdownCard}>
          <Text style={[styles.breakdownTitle, { color: theme.colors.text.primary }]}>
            Daily Breakdown
          </Text>
          {(data?.breakdown ?? []).map((item) => {
            const barWidth = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0;
            const isToday = formatDate(item.date) === "Today";
            return (
              <View key={item.date} style={styles.dayRow}>
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: isToday
                        ? theme.colors.primary.main
                        : theme.colors.text.secondary,
                      fontWeight: isToday ? "700" : "500",
                    },
                  ]}
                >
                  {formatDate(item.date)}
                </Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.barTrack,
                      { backgroundColor: `${theme.colors.primary.main}18` },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${barWidth}%`,
                          backgroundColor: isToday
                            ? theme.colors.primary.main
                            : `${theme.colors.primary.main}80`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.dayMeta}>
                  <Text
                    style={[
                      styles.dayEarnings,
                      {
                        color: isToday
                          ? theme.colors.primary.main
                          : theme.colors.text.primary,
                        fontWeight: isToday ? "700" : "600",
                      },
                    ]}
                  >
                    ${item.earnings.toFixed(2)}
                  </Text>
                  <Text style={[styles.dayDeliveries, { color: theme.colors.text.tertiary }]}>
                    {item.deliveries}x
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  header: { paddingTop: 8, paddingBottom: 16 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "700" },
  errorCard: { marginBottom: 16, padding: 14 },
  errorText: { fontSize: 13, fontWeight: "600" },
  summaryRow: { flexDirection: "row", marginBottom: 16 },
  summaryCard: { padding: 16 },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryIconText: { fontSize: 18 },
  summaryValue: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { fontSize: 13, marginTop: 2 },
  summaryMeta: { fontSize: 11, marginTop: 4 },
  breakdownCard: { padding: 16, marginBottom: 16 },
  breakdownTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dayLabel: { width: 42, fontSize: 13 },
  barWrapper: { flex: 1, marginHorizontal: 10 },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  dayMeta: { flexDirection: "row", alignItems: "center", gap: 6, width: 80, justifyContent: "flex-end" },
  dayEarnings: { fontSize: 13 },
  dayDeliveries: { fontSize: 11 },
});

export default EarningsScreen;
