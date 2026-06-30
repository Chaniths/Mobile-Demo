import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import BackgroundShapes from "../../components/common/BackgroundShapes";
import { useDriverData } from "../../hooks/useDriverData";
import { driverApi } from "../../api/driverApi";
import { promptNavigation } from "../../utils/navigationUtils";

const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };

const DeliveryDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { deliveryId } = route.params || {};
  const { data, loading, reload } = useDriverData();

  const delivery = useMemo(() => {
    return data.orders.find((order) => order.id === deliveryId) || null;
  }, [data.orders, deliveryId]);

  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    if (!deliveryId) return;
    const stopId = delivery?.currentStopId || deliveryId;
    driverApi.getStopItems(stopId).then((res) => {
      if (res?.items) setOrderItems(res.items);
    }).catch(() => {});
  }, [deliveryId, delivery?.currentStopId]);

  if (loading) {
    return <Loader fullScreen text="Loading delivery details..." />;
  }

  if (!delivery) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <EmptyState
          icon={<Text style={styles.emptyIcon}>📦</Text>}
          title="Delivery not found"
          message="This delivery is no longer available from backend."
          actionLabel="Reload"
          onAction={reload}
        />
      </SafeAreaView>
    );
  }

  const coords = delivery.coordinates || HUB_COORDS;
  const region = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <BackgroundShapes variant="detail" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              style={[styles.backText, { color: theme.colors.primary.main }]}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text
              style={[styles.orderId, { color: theme.colors.text.primary }]}
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
        </View>

        <Card style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              showsUserLocation={false}
            >
              <Polyline
                coordinates={[HUB_COORDS, coords]}
                strokeColor={theme.colors.primary.main}
                strokeWidth={4}
              />
              <Marker coordinate={HUB_COORDS} />
              <Marker coordinate={coords} />
            </MapView>
          </View>
          <Text
            style={[styles.mapHint, { color: theme.colors.text.secondary }]}
          >
            Live route from backend destination.
          </Text>
        </Card>

        <View style={styles.metaRow}>
          <Card style={styles.metaCard}>
            <Text
              style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
            >
              ETA
            </Text>
            <Text
              style={[styles.metaValue, { color: theme.colors.text.primary }]}
            >
              {delivery.etaMinutes} min
            </Text>
          </Card>
          <Card style={styles.metaCard}>
            <Text
              style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
            >
              Distance
            </Text>
            <Text
              style={[styles.metaValue, { color: theme.colors.text.primary }]}
            >
              {delivery.distanceKm.toFixed(1)} km
            </Text>
          </Card>
          <Card style={styles.metaCard}>
            <Text
              style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
            >
              Priority
            </Text>
            <Text
              style={[
                styles.metaValue,
                {
                  color:
                    delivery.priority === "high"
                      ? theme.colors.error
                      : theme.colors.text.primary,
                },
              ]}
            >
              {delivery.priority === "high" ? "High" : "Normal"}
            </Text>
          </Card>
        </View>

        <Card style={styles.infoCard}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Delivery details
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text
              style={[styles.infoText, { color: theme.colors.text.secondary }]}
            >
              {delivery.address}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <Text
              style={[styles.infoText, { color: theme.colors.text.secondary }]}
            >
              {delivery.customer}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📋</Text>
            <Text
              style={[styles.infoText, { color: theme.colors.text.secondary }]}
            >
              Status: {delivery.status}
            </Text>
          </View>
        </Card>

        {orderItems.length > 0 && (
          <Card style={styles.itemsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Order Items
            </Text>
            {orderItems.map((item, idx) => (
              <View key={item.id || idx} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                    {item.quantity} {item.unit} @ ${item.unitPrice}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: theme.colors.text.primary }]}>
                  ${item.totalPrice?.toFixed(2)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title="Start navigation"
            onPress={() => {
              const stop = {
                latitude: delivery.coordinates?.latitude,
                longitude: delivery.coordinates?.longitude,
                address: delivery.address,
                customer: delivery.customer,
              };
              promptNavigation(null, [stop], stop);
            }}
            style={styles.actionButton}
          />
          <Button
            title="Report an issue"
            variant="outline"
            onPress={() =>
              navigation.navigate("ReportIssue", { deliveryId: delivery.id })
            }
            style={styles.actionButton}
          />
        </View>
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
  backText: { fontSize: 14, fontWeight: "600" },
  headerInfo: { marginLeft: 16 },
  orderId: { fontSize: 18, fontWeight: "700" },
  customerName: { fontSize: 14, marginTop: 2 },
  mapCard: { padding: 12, marginBottom: 16 },
  mapContainer: { height: 220, borderRadius: 20, overflow: "hidden" },
  mapHint: { fontSize: 12, marginTop: 8 },
  metaRow: { flexDirection: "row", marginBottom: 16, gap: 10 },
  metaCard: { flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
  metaLabel: { fontSize: 12 },
  metaValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  infoCard: { padding: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoIcon: { fontSize: 16, marginRight: 8 },
  infoText: { flex: 1, fontSize: 14 },
  itemsCard: { padding: 14, marginBottom: 16 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemMeta: { fontSize: 12, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12, marginTop: 4 },
  actionButton: { flex: 1 },
  emptyIcon: { fontSize: 64 },
});

export default DeliveryDetailScreen;
