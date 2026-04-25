import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { useDriverData } from "../../hooks/useDriverData";
import { useDriverTracking } from "../../hooks/useDriverTracking";

const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };

const RouteScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { deliveryId } = route?.params || {};
  const { data, loading, refreshing, error, refresh, reload } = useDriverData();

  const routeData = data.activeRoute || data.route;
  const allStops = useMemo(() => {
    const source = routeData?.stops?.length ? routeData.stops : data.orders;
    if (!source.length) return [];

    if (!deliveryId) return source;
    const selected = source.find((stop) => stop.id === deliveryId);
    return selected ? [selected] : source;
  }, [data.orders, deliveryId, routeData]);

  const [activeStopId, setActiveStopId] = useState(allStops[0]?.id || null);

  useEffect(() => {
    if (!allStops.length) {
      setActiveStopId(null);
      return;
    }

    if (deliveryId) {
      setActiveStopId(deliveryId);
      return;
    }

    setActiveStopId((current) => current || allStops[0].id);
  }, [allStops, deliveryId]);

  const activeStop = useMemo(() => {
    if (!allStops.length) return null;
    return allStops.find((stop) => stop.id === activeStopId) || allStops[0];
  }, [activeStopId, allStops]);

  const stopsWithCoords = useMemo(
    () =>
      allStops.filter(
        (stop) => stop.coordinates?.latitude && stop.coordinates?.longitude,
      ),
    [allStops],
  );

  const polylineCoords = useMemo(() => {
    return [HUB_COORDS, ...stopsWithCoords.map((stop) => stop.coordinates)];
  }, [stopsWithCoords]);

  const mapRegion = useMemo(() => {
    if (activeStop?.coordinates) {
      return {
        latitude: activeStop.coordinates.latitude,
        longitude: activeStop.coordinates.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };
    }

    return {
      latitude: HUB_COORDS.latitude,
      longitude: HUB_COORDS.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [activeStop]);

  const {
    isTracking,
    sessionId,
    statusLabel,
    socketMessage,
    error: trackingError,
    startTracking,
    stopTracking,
    clearError,
  } = useDriverTracking(routeData, activeStop?.currentStopId || activeStop?.id);

  const handleStartTracking = async () => {
    try {
      await startTracking();
      Alert.alert(
        "Tracking Started",
        "Live location tracking session has started successfully.",
      );
    } catch (err) {
      const message =
        (typeof err === "object" && err && "message" in err && err.message) ||
        "Could not start tracking. Please try again.";
      Alert.alert("Tracking Error", message);
    }
  };

  const handleStopTracking = async () => {
    await stopTracking();
    Alert.alert("Tracking Stopped", "Tracking session ended successfully.");
  };

  const handleStartNavigation = () => {
    if (!activeStop) return;

    Alert.alert(
      "Start Navigation",
      `Open turn-by-turn navigation for:\n\n${activeStop.address}`,
      [{ text: "OK" }],
    );
  };

  if (loading) {
    return <Loader fullScreen text="Loading route data..." />;
  }

  if (!allStops.length) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <EmptyState
          icon={<Text style={styles.emptyIcon}>🗺️</Text>}
          title="No route assigned"
          message={error || "No active route/orders were returned by backend."}
          actionLabel="Reload"
          onAction={reload}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {deliveryId ? "Delivery Route" : "Today's Route"}
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            {allStops.length} {allStops.length === 1 ? "stop" : "stops"}
          </Text>
          <Text
            style={[
              styles.routeMetaText,
              { color: theme.colors.text.tertiary },
            ]}
          >
            Route ID: {routeData?.id || "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.mapWrapper}>
        {stopsWithCoords.length > 0 ? (
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            showsCompass={false}
            showsMyLocationButton={false}
          >
            <Polyline
              coordinates={polylineCoords}
              strokeColor={theme.colors.primary.main}
              strokeWidth={4}
            />
            <Marker coordinate={HUB_COORDS} />
            {stopsWithCoords.map((stop, index) => {
              const isActive = stop.id === activeStop?.id;
              return (
                <Marker key={stop.id} coordinate={stop.coordinates}>
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
                        {
                          color: isActive ? "#fff" : theme.colors.text.primary,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        ) : (
          <View
            style={[styles.noMapCard, { backgroundColor: theme.colors.card }]}
          >
            <Text
              style={[styles.noMapText, { color: theme.colors.text.secondary }]}
            >
              This route has no coordinates yet from backend.
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.bottomSheet}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {(error || trackingError) && (
          <Card style={styles.errorCard}>
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
            {!!trackingError && (
              <Text
                style={[
                  styles.errorText,
                  { color: theme.colors.error || "#d32f2f" },
                ]}
              >
                {trackingError}
              </Text>
            )}
            <Button
              title="Dismiss"
              size="small"
              onPress={clearError}
              style={styles.retryButton}
            />
          </Card>
        )}

        <Card style={styles.trackingCard}>
          <Text
            style={[styles.trackingTitle, { color: theme.colors.text.primary }]}
          >
            Live Tracking
          </Text>
          <Text
            style={[
              styles.trackingStatus,
              { color: theme.colors.text.secondary },
            ]}
          >
            {statusLabel}
          </Text>
          {!!socketMessage && (
            <Text
              style={[
                styles.trackingMessage,
                { color: theme.colors.text.tertiary },
              ]}
            >
              {socketMessage}
            </Text>
          )}
          {sessionId && (
            <Text
              style={[
                styles.sessionIdText,
                { color: theme.colors.primary.main },
              ]}
            >
              Session: {sessionId}
            </Text>
          )}

          <View style={styles.trackingButtons}>
            <Button
              title={isTracking ? "Tracking Active" : "Start Tracking"}
              onPress={handleStartTracking}
              disabled={isTracking}
              style={styles.actionButton}
            />
            <Button
              title="Stop Tracking"
              variant="outline"
              onPress={handleStopTracking}
              disabled={!isTracking}
              style={styles.actionButton}
            />
          </View>
        </Card>

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
                {activeStop.distanceKm.toFixed(1)} km
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
            {allStops.map((stop, index) => {
              const isActive = stop.id === activeStop?.id;
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
                      {stop.etaMinutes} min • {stop.distanceKm.toFixed(1)} km
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },
  routeMetaText: { fontSize: 11, marginTop: 4 },
  mapWrapper: {
    height: 260,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: { flex: 1 },
  stopMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  stopMarkerText: { fontSize: 12, fontWeight: "700" },
  noMapCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noMapText: { fontSize: 14, textAlign: "center" },
  bottomSheet: { flex: 1, marginTop: 12, paddingHorizontal: 20 },
  errorCard: { marginBottom: 12 },
  errorText: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  retryButton: { alignSelf: "flex-start" },
  trackingCard: { marginBottom: 12 },
  trackingTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  trackingStatus: { fontSize: 13 },
  trackingMessage: { fontSize: 12, marginTop: 4 },
  sessionIdText: { fontSize: 12, marginTop: 6, fontWeight: "700" },
  trackingButtons: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: { flex: 1 },
  activeStopCard: { marginBottom: 14 },
  activeStopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  activeStopLabel: { fontSize: 12 },
  activeStopCustomer: { fontSize: 18, fontWeight: "700", marginTop: 2 },
  activeStopMeta: { alignItems: "flex-end" },
  metaPrimary: { fontSize: 14, fontWeight: "700" },
  metaSecondary: { fontSize: 12 },
  addressRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  addressIcon: { fontSize: 14, marginRight: 8 },
  addressText: { flex: 1, fontSize: 13 },
  navButton: {},
  stopsListWrapper: { marginBottom: 120 },
  stopsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  stopsScroll: { paddingRight: 8 },
  stopCard: { width: 170, marginRight: 10 },
  stopCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stopNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  stopNumberText: { fontSize: 12, fontWeight: "700" },
  stopOrderId: { fontSize: 11 },
  stopCustomer: { fontSize: 14, fontWeight: "600" },
  stopMeta: { fontSize: 12, marginTop: 6 },
  emptyIcon: { fontSize: 64 },
});

export default RouteScreen;
