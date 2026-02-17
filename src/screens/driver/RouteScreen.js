import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
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
  ROUTE_METADATA,
} from "./deliveriesData";

const RouteScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { deliveryId } = route?.params || {};

  // If a specific delivery is provided, use only that delivery, otherwise show all
  const STOPS = useMemo(() => {
    if (deliveryId) {
      const delivery = findDeliveryById(deliveryId);
      return [delivery];
    }
    return DRIVER_DELIVERIES;
  }, [deliveryId]);

  const [activeStopId, setActiveStopId] = useState(STOPS[0].id);

  // Update active stop when deliveryId changes
  useEffect(() => {
    if (deliveryId) {
      setActiveStopId(deliveryId);
    }
  }, [deliveryId]);

  const activeStop = useMemo(
    () => STOPS.find((s) => s.id === activeStopId) ?? STOPS[0],
    [activeStopId],
  );

  const polylineCoords = useMemo(
    () => [HUB_COORDS, ...STOPS.map((s) => s.coords)],
    [STOPS],
  );

  // Calculate map region based on active stop or all stops
  const mapRegion = useMemo(() => {
    if (deliveryId) {
      // For single delivery, center on the delivery location
      return {
        latitude: activeStop.coords.latitude,
        longitude: activeStop.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // For all deliveries, center on hub
    return {
      latitude: HUB_COORDS.latitude,
      longitude: HUB_COORDS.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [deliveryId, activeStop]);

  // Handle navigation button press
  const handleStartNavigation = () => {
    Alert.alert(
      "Start Navigation",
      `In production, this would open your preferred navigation app (Google Maps, Waze, etc.) with directions to:\n\n${activeStop.address}`,
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {deliveryId ? "Delivery Route" : "Today's Route"}
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            {STOPS.length} {STOPS.length === 1 ? "stop" : "stops"} • optimized
            path
          </Text>
          {!deliveryId && (
            <View style={styles.routeMetaRow}>
              <Text style={[styles.routeMetaText, { color: theme.colors.text.tertiary }]}>
                {ROUTE_METADATA.routeId} • {ROUTE_METADATA.truckNumber}
              </Text>
            </View>
          )}
        </View>
        <View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${theme.colors.success}20` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: theme.colors.success },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.colors.success }]}>
              On duty
            </Text>
          </View>
          {!deliveryId && (
            <View style={[styles.vrpBadge, { backgroundColor: `${theme.colors.primary.main}15` }]}>
              <Text style={styles.vrpIcon}>🎯</Text>
              <Text style={[styles.vrpText, { color: theme.colors.primary.main }]}>
                VRP
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsCompass={false}
          showsMyLocationButton={false}
        >
          <Polyline
            coordinates={polylineCoords}
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

          {STOPS.map((stop, index) => {
            const isActive = stop.id === activeStopId;
            return (
              <Marker key={stop.id} coordinate={stop.coords}>
                <View
                  style={[
                    styles.stopMarker,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary.main
                        : theme.colors.card,
                      borderColor: theme.colors.primary.main,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stopMarkerText,
                      { color: isActive ? "#fff" : theme.colors.text.primary },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        <View
          style={[styles.mapOverlay, { backgroundColor: theme.colors.card }]}
        >
          <Text
            style={[styles.overlayText, { color: theme.colors.text.primary }]}
          >
            Next stop in {activeStop.etaMinutes} min • {activeStop.distanceKm}{" "}
            km
          </Text>
        </View>
      </View>

      {/* Bottom sheet with stops */}
      <View style={styles.bottomSheet}>
        {/* Optimization Info - only show for full route */}
        {!deliveryId && (
          <Card style={styles.optimizationCard}>
            <View style={styles.optimizationRow}>
              <View style={styles.optimizationItem}>
                <Text style={[styles.optimizationLabel, { color: theme.colors.text.secondary }]}>
                  Distance Saved
                </Text>
                <Text style={[styles.optimizationValue, { color: theme.colors.success }]}>
                  ↓ {ROUTE_METADATA.distanceSaved}
                </Text>
              </View>
              <View style={styles.optimizationDivider} />
              <View style={styles.optimizationItem}>
                <Text style={[styles.optimizationLabel, { color: theme.colors.text.secondary }]}>
                  Fuel Saved
                </Text>
                <Text style={[styles.optimizationValue, { color: theme.colors.success }]}>
                  {ROUTE_METADATA.fuelSaved}
                </Text>
              </View>
              <View style={styles.optimizationDivider} />
              <View style={styles.optimizationItem}>
                <Text style={[styles.optimizationLabel, { color: theme.colors.text.secondary }]}>
                  Algorithm
                </Text>
                <Text style={[styles.optimizationValue, { color: theme.colors.primary.main }]}>
                  {ROUTE_METADATA.optimizationAlgorithm}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.activeStopCard}>
          <View style={styles.activeStopHeader}>
            <View>
              <Text
                style={[
                  styles.activeStopLabel,
                  { color: theme.colors.text.secondary },
                ]}
              >
                Current stop
              </Text>
              <Text
                style={[
                  styles.activeStopCustomer,
                  { color: theme.colors.text.primary },
                ]}
              >
                {activeStop.customer}
              </Text>
            </View>
            <View style={styles.activeStopMeta}>
              <Text
                style={[
                  styles.metaPrimary,
                  { color: theme.colors.primary.main },
                ]}
              >
                {activeStop.etaMinutes} min
              </Text>
              <Text
                style={[
                  styles.metaSecondary,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {activeStop.distanceKm} km
              </Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text
              style={[
                styles.addressText,
                { color: theme.colors.text.secondary },
              ]}
            >
              {activeStop.address}
            </Text>
          </View>
          <Button
            title="Start navigation"
            onPress={handleStartNavigation}
            style={styles.navButton}
          />
        </Card>

        <View style={styles.stopsListWrapper}>
          <Text
            style={[styles.stopsTitle, { color: theme.colors.text.primary }]}
          >
            All stops
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stopsScroll}
          >
            {STOPS.map((stop, index) => {
              const isActive = stop.id === activeStopId;
              return (
                <TouchableOpacity
                  key={stop.id}
                  onPress={() => setActiveStopId(stop.id)}
                >
                  <Card
                    style={[
                      styles.stopCard,
                      isActive && {
                        borderWidth: 1.5,
                        borderColor: theme.colors.primary.main,
                      },
                    ]}
                  >
                    <View style={styles.stopCardHeader}>
                      <View
                        style={[
                          styles.stopNumber,
                          {
                            backgroundColor: isActive
                              ? theme.colors.primary.main
                              : theme.colors.card,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stopNumberText,
                            {
                              color: isActive
                                ? "#fff"
                                : theme.colors.text.primary,
                            },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.stopOrderId,
                          { color: theme.colors.text.secondary },
                        ]}
                      >
                        {stop.orderId}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stopCustomer,
                        { color: theme.colors.text.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {stop.customer}
                    </Text>
                    <Text
                      style={[
                        styles.stopMeta,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      {stop.etaMinutes} min • {stop.distanceKm} km
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  routeMetaRow: {
    marginTop: 4,
  },
  routeMetaText: {
    fontSize: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 6,
  },
  vrpBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: "center",
  },
  vrpIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  vrpText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  mapWrapper: {
    flex: 0.9,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  hubMarker: {
    padding: 8,
    borderRadius: 16,
  },
  hubEmoji: {
    fontSize: 18,
  },
  stopMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  stopMarkerText: {
    fontSize: 14,
    fontWeight: "700",
  },
  mapOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  overlayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSheet: {
    flex: 1.1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  optimizationCard: {
    marginBottom: 8,
    padding: 10,
  },
  optimizationRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  optimizationItem: {
    flex: 1,
    alignItems: "center",
  },
  optimizationLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  optimizationValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  optimizationDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e5e5e5",
  },
  activeStopCard: {
    marginBottom: 8,
    padding: 14,
  },
  activeStopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeStopLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  activeStopCustomer: {
    fontSize: 16,
    fontWeight: "700",
  },
  activeStopMeta: {
    alignItems: "flex-end",
  },
  metaPrimary: {
    fontSize: 14,
    fontWeight: "700",
  },
  metaSecondary: {
    fontSize: 11,
    marginTop: 2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  navButton: {
    marginTop: 4,
  },
  stopsListWrapper: {
    marginTop: 0,
  },
  stopsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  stopsScroll: {
    paddingVertical: 4,
  },
  stopCard: {
    width: 140,
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  stopCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  stopNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  stopNumberText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stopOrderId: {
    fontSize: 11,
  },
  stopCustomer: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  stopMeta: {
    fontSize: 11,
  },
});

export default RouteScreen;
