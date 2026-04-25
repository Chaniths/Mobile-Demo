import React, { useMemo, useState } from "react";
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
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import { useDriverData } from "../../hooks/useDriverData";

const statusColors = {
  delivered: "#22c55e",
  in_transit: "#3b82f6",
  processing: "#f59e0b",
  cancelled: "#ef4444",
  pending: "#f59e0b",
};

const toTitle = (value) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { data, loading, refreshing, error, refresh, reload } = useDriverData();
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return data.orders;
    return data.orders.filter((order) => order.status === activeTab);
  }, [activeTab, data.orders]);

  const tabs = useMemo(() => {
    const statusSet = new Set(data.orders.map((order) => order.status));
    return ["all", ...Array.from(statusSet)];
  }, [data.orders]);

  if (loading) {
    return <Loader fullScreen text="Loading deliveries..." />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          My Deliveries
        </Text>
        {!!error && (
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.error || "#d32f2f" },
            ]}
          >
            {error}
          </Text>
        )}
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: theme.colors.primary.main,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab
                      ? theme.colors.primary.main
                      : theme.colors.text.secondary,
                },
              ]}
            >
              {toTitle(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        renderItem={({ item }) => {
          const statusColor =
            statusColors[item.status] || theme.colors.primary.main;
          return (
            <Card
              style={styles.orderCard}
              onPress={() =>
                navigation.navigate("DeliveryDetail", { deliveryId: item.id })
              }
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text
                    style={[
                      styles.orderId,
                      { color: theme.colors.text.primary },
                    ]}
                  >
                    {item.orderId}
                  </Text>
                  <Text
                    style={[
                      styles.customerName,
                      { color: theme.colors.text.secondary },
                    ]}
                  >
                    {item.customer}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusColor}20` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {toTitle(item.status)}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.address, { color: theme.colors.text.secondary }]}
                numberOfLines={2}
              >
                {item.address}
              </Text>

              <View style={styles.metaRow}>
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.text.tertiary },
                  ]}
                >
                  ETA {item.etaMinutes} min
                </Text>
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.text.tertiary },
                  ]}
                >
                  {item.distanceKm.toFixed(1)} km
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Route", { deliveryId: item.id })
                  }
                >
                  <Text
                    style={[
                      styles.routeLink,
                      { color: theme.colors.primary.main },
                    ]}
                  >
                    Route
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No deliveries found"
            message="No deliveries available for the selected filter."
            actionLabel="Reload"
            onAction={reload}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  address: {
    fontSize: 13,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
  },
  routeLink: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyIcon: {
    fontSize: 64,
  },
});

export default OrdersScreen;
