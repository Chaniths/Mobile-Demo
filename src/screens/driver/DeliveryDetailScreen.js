import React, { useMemo } from "react";
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
import {
  DRIVER_DELIVERIES,
  HUB_COORDS,
  findDeliveryById,
} from "./deliveriesData";

const DeliveryDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { deliveryId } = route.params || {};

  const delivery = useMemo(() => findDeliveryById(deliveryId), [deliveryId]);

  const region = {
    latitude: delivery.coords.latitude,
    longitude: delivery.coords.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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

        {/* Map */}
        <Card style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              showsUserLocation={false}
              showsCompass={false}
            >
              <Polyline
                coordinates={[HUB_COORDS, delivery.coords]}
                strokeColor={theme.colors.primary.main}
                strokeWidth={4}
              />

              <Marker coordinate={HUB_COORDS}>
                <View
                  style={[
                    styles.hubMarker,
                    { backgroundColor: theme.colors.primary.light },
                  ]}
                >
                  <Text style={styles.hubEmoji}>🏬</Text>
                </View>
              </Marker>

              <Marker coordinate={delivery.coords}>
                <View
                  style={[
                    styles.stopMarker,
                    { borderColor: theme.colors.primary.main },
                  ]}
                >
                  <Text style={[styles.stopEmoji]}>📦</Text>
                </View>
              </Marker>
            </MapView>
          </View>
          <Text
            style={[styles.mapHint, { color: theme.colors.text.secondary }]}
          >
            Optimized route from hub to this customer. Hook this up to live GPS
            and routing when ready.
          </Text>
        </Card>

        {/* Meta cards */}
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
              {delivery.distance}
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

        {/* Address & contact */}
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
            <Text style={styles.infoIcon}>⏰</Text>
            <Text
              style={[styles.infoText, { color: theme.colors.text.secondary }]}
            >
              Preferred delivery window: {delivery.time}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Start navigation"
            onPress={() =>
              navigation.navigate("Route", { deliveryId: delivery.id })
            }
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerInfo: {
    marginLeft: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
  },
  customerName: {
    fontSize: 14,
    marginTop: 2,
  },
  mapCard: {
    padding: 12,
    marginBottom: 16,
  },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
  },
  hubMarker: {
    padding: 6,
    borderRadius: 999,
  },
  hubEmoji: {
    fontSize: 16,
  },
  stopMarker: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 2,
  },
  stopEmoji: {
    fontSize: 16,
  },
  mapHint: {
    fontSize: 12,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  metaCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  infoCard: {
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
});

export default DeliveryDetailScreen;
