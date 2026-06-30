import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import BackgroundShapes from "../../components/common/BackgroundShapes";
import { useDriverData } from "../../hooks/useDriverData";

const AllDeliveriesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { data, loading, refreshing, error, refresh, reload } = useDriverData();

  if (loading) {
    return <Loader fullScreen text="Loading today's deliveries..." />;
  }

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
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              style={[styles.backText, { color: theme.colors.primary.main }]}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Today's deliveries
          </Text>
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

        {data.orders.length === 0 ? (
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No deliveries assigned"
            message="Backend returned no deliveries for this driver."
            actionLabel="Reload"
            onAction={reload}
          />
        ) : (
          data.orders.map((delivery) => (
            <Card
              key={delivery.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("DeliveryDetail", {
                  deliveryId: delivery.id,
                })
              }
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text
                    style={[
                      styles.orderId,
                      { color: theme.colors.text.primary },
                    ]}
                  >
                    {delivery.orderId}
                  </Text>
                  <Text
                    style={[
                      styles.customer,
                      { color: theme.colors.text.secondary },
                    ]}
                  >
                    {delivery.customer}
                  </Text>
                </View>
                <View style={styles.metaRight}>
                  <Text
                    style={[styles.time, { color: theme.colors.primary.main }]}
                  >
                    {delivery.scheduledAt || `ETA ${delivery.etaMinutes} min`}
                  </Text>
                  <Text
                    style={[
                      styles.distance,
                      { color: theme.colors.text.tertiary },
                    ]}
                  >
                    {delivery.distanceKm.toFixed(1)} km away
                  </Text>
                </View>
              </View>

              <View style={styles.addressRow}>
                <Text style={styles.addressIcon}>📍</Text>
                <Text
                  style={[
                    styles.address,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {delivery.address}
                </Text>
              </View>

              <View style={styles.footerRow}>
                <View
                  style={[
                    styles.priorityPill,
                    {
                      backgroundColor:
                        delivery.priority === "high"
                          ? `${theme.colors.error}20`
                          : `${theme.colors.success}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color:
                          delivery.priority === "high"
                            ? theme.colors.error
                            : theme.colors.success,
                      },
                    ]}
                  >
                    {delivery.priority === "high"
                      ? "High priority"
                      : "Normal priority"}
                  </Text>
                </View>
                <Button
                  title="Open details"
                  size="small"
                  onPress={() =>
                    navigation.navigate("DeliveryDetail", {
                      deliveryId: delivery.id,
                    })
                  }
                  style={styles.detailsButton}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  backText: { fontSize: 14, fontWeight: "600", marginRight: 12 },
  title: { fontSize: 20, fontWeight: "800" },
  errorCard: { marginBottom: 12 },
  errorText: { fontSize: 13, fontWeight: "600" },
  retryButton: { marginTop: 8, alignSelf: "flex-start" },
  card: { marginBottom: 14, padding: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: "700" },
  customer: { fontSize: 14, marginTop: 2 },
  metaRight: { alignItems: "flex-end" },
  time: { fontSize: 14, fontWeight: "600" },
  distance: { fontSize: 12, marginTop: 2 },
  addressRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  addressIcon: { fontSize: 16, marginRight: 8 },
  address: { flex: 1, fontSize: 14 },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityText: { fontSize: 12, fontWeight: "600" },
  detailsButton: { paddingHorizontal: 12 },
  emptyIcon: { fontSize: 64 },
});

export default AllDeliveriesScreen;
