<<<<<<< HEAD
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
import BackgroundShapes from "../../components/common/BackgroundShapes";
import { useDriverData } from "../../hooks/useDriverData";
import { useDriverTracking } from "../../hooks/useDriverTracking";
import { driverApi } from "../../api/driverApi";
import { promptNavigation } from "../../utils/navigationUtils";
=======
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AppIcon from '../../components/common/AppIcon';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };

const RouteScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { deliveryId } = route?.params || {};
  const { data, loading, refreshing, error, refresh, reload } = useDriverData();
  const mapRef = useRef(null);
  const lastCameraUpdateRef = useRef(0);

  const routeData = data.route || data.activeRoute;
  const allStops = useMemo(() => {
    const source = routeData?.stops?.length ? routeData.stops : data.orders;
    if (!source.length) return [];

    if (!deliveryId) return source;
    const selected = source.find((stop) => stop.id === deliveryId);
    return selected ? [selected] : source;
  }, [data.orders, deliveryId, routeData]);

  const [activeStopId, setActiveStopId] = useState(allStops[0]?.id || null);
  const [failedPanelOpen, setFailedPanelOpen] = useState(false);
  const [failedNotes, setFailedNotes] = useState("");

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

  const routePolylineCoords = useMemo(() => {
    return [HUB_COORDS, ...stopsWithCoords.map((stop) => stop.coordinates)];
  }, [stopsWithCoords]);

  const {
    isTracking,
    activeSessionId,
    trackingStatus,
    statusLabel,
    socketMessage,
    error: trackingError,
    renderPosition,
    renderHeading,
    polylinePoints,
    followMode,
    setFollowMode,
    toggleFollowMode,
    latestServerPoint,
    pendingPointQueue,
    startTracking,
    stopTracking,
    clearError,
  } = useDriverTracking(routeData, activeStop?.currentStopId || activeStop?.id);

  const livePolylineCoords = useMemo(() => {
    return polylinePoints.length > 1 ? polylinePoints : routePolylineCoords;
  }, [polylinePoints, routePolylineCoords]);

  const mapRegion = useMemo(() => {
    const center =
      renderPosition ||
      livePolylineCoords[livePolylineCoords.length - 1] ||
      activeStop?.coordinates ||
      HUB_COORDS;

    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
  }, [activeStop, livePolylineCoords, renderPosition]);

  useEffect(() => {
    if (!mapRef.current || !renderPosition || !followMode) {
      return;
    }

    const now = Date.now();
    if (now - lastCameraUpdateRef.current < 450) {
      return;
    }

    lastCameraUpdateRef.current = now;
    mapRef.current.animateCamera(
      {
        center: renderPosition,
        heading: renderHeading,
        pitch: 0,
      },
      { duration: 650 },
    );
  }, [followMode, renderHeading, renderPosition]);

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

  const handleToggleFollow = () => {
    toggleFollowMode();
  };

  const handleStartNavigation = () => {
    if (!activeStop) return;

    // Build remaining stops: active stop first, then the rest in sequence order
    const activeIndex = allStops.findIndex((s) => s.id === activeStop.id);
    const remainingStops = allStops
      .slice(activeIndex)
      .filter((s) => s.status !== "COMPLETED" && s.status !== "FAILED" && s.status !== "SKIPPED")
      .map((s) => ({
        latitude: s.coordinates?.latitude,
        longitude: s.coordinates?.longitude,
        address: s.address,
        customer: s.customer,
      }));

    // Use live driver position as origin if available, otherwise null (Google Maps uses device location)
    const origin = renderPosition
      ? { latitude: renderPosition.latitude, longitude: renderPosition.longitude }
      : null;

    promptNavigation(origin, remainingStops, remainingStops[0]);
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
<<<<<<< HEAD
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <BackgroundShapes variant="detail" />
=======
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isDarkMode ? (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      ) : (
        <>
          {/* Arch-like strips in green colors for light mode */}
          <View style={[styles.archStrip1, styles.lightModeArchStrip1]} />
          <View style={[styles.archStrip2, styles.lightModeArchStrip2]} />
          <View style={[styles.archStrip3, styles.lightModeArchStrip3]} />
          <View style={[styles.archStrip4, styles.lightModeArchStrip4]} />
        </>
      )}
      {/* Header */}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          showsCompass={false}
          showsMyLocationButton={false}
          onPanDrag={() => {
            if (followMode) {
              setFollowMode(false);
            }
          }}
        >
<<<<<<< HEAD
          {livePolylineCoords.length > 1 && (
            <Polyline
              coordinates={livePolylineCoords}
              strokeColor={theme.colors.primary.main}
              strokeWidth={4}
            />
          )}

          <Marker coordinate={HUB_COORDS} />
=======
          <Polyline
            coordinates={polylineCoords}
            strokeColor={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main}
            strokeWidth={4}
          />

          <Marker coordinate={HUB_COORDS}>
            <View style={[styles.hubMarker, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
              <AppIcon name="store" size={18} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
            </View>
          </Marker>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

          {stopsWithCoords.map((stop, index) => {
            const isActive = stop.id === activeStop?.id;
            return (
              <Marker key={stop.id} coordinate={stop.coordinates}>
                <View
                  style={[
                    styles.stopMarker,
                    {
                      backgroundColor: isActive
                        ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main)
                        : theme.colors.card,
                      borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
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

          {renderPosition && (
            <Marker coordinate={renderPosition} anchor={{ x: 0.5, y: 0.5 }}>
              <View
                style={[
                  styles.driverMarker,
                  {
                    backgroundColor: theme.colors.primary.main,
                    transform: [{ rotate: `${renderHeading}deg` }],
                  },
                ]}
              >
                <View style={styles.driverDotOuter}>
                  <View
                    style={[
                      styles.driverDotInner,
                      { backgroundColor: theme.colors.card },
                    ]}
                  />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

<<<<<<< HEAD
        {stopsWithCoords.length === 0 && !renderPosition && (
          <View style={styles.mapHintOverlay} pointerEvents="none">
            <Text
              style={[
                styles.mapHintText,
                { color: theme.colors.text.secondary },
              ]}
            >
              No route coordinates yet. The live driver marker will appear here
              once live-seed or tracking data arrives.
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
          <View style={styles.trackingHeaderRow}>
            <Text style={[styles.trackingTitle, { color: theme.colors.text.primary }]}>
              Live Tracking
            </Text>
            <View style={[
              styles.trackingStatusPill,
              { backgroundColor: isTracking ? "#22c55e18" : (isDarkMode ? "#1e293b" : "#f1f5f9") }
            ]}>
              <View style={[styles.trackingDot, { backgroundColor: isTracking ? "#22c55e" : "#94a3b8" }]} />
              <Text style={[styles.trackingStatusPillText, { color: isTracking ? "#22c55e" : (isDarkMode ? "#94a3b8" : "#64748b") }]}>
                {isTracking ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          <Text style={[styles.trackingStatusLabel, { color: theme.colors.text.secondary }]}>
            {statusLabel}
          </Text>

          <View style={styles.trackingButtons}>
            <Button
              title={isTracking ? "Tracking On" : "Start Tracking"}
              onPress={handleStartTracking}
              disabled={isTracking}
              style={styles.actionButton}
            />
            <Button
              title="Stop"
              variant="outline"
              onPress={handleStopTracking}
              disabled={!isTracking}
              style={styles.actionButton}
            />
          </View>
          <Button
            title={followMode ? "📍 Following" : "Follow Me"}
            variant="outline"
            onPress={handleToggleFollow}
            style={styles.followButton}
          />
        </Card>

        <Card style={styles.activeStopCard}>
=======
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.mapOverlay}>
          <Text style={[styles.overlayText, { color: theme.colors.text.primary }]}>
            Next stop in {activeStop.etaMinutes} min • {activeStop.distanceKm} km
          </Text>
        </Card>
      </View>

      {/* Bottom sheet with stops */}
      <View style={styles.bottomSheet}>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.activeStopCard}>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          <View style={styles.activeStopHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <View style={[styles.stopTypeBadge, { backgroundColor: activeStop.type === 'PICKUP' ? '#f59e0b' : theme.colors.primary.main }]}>
                  <Text style={styles.stopTypeBadgeText}>
                    {activeStop.type === 'PICKUP' ? '⬆ PICKUP' : '⬇ DELIVERY'}
                  </Text>
                </View>
                <Text style={[styles.activeStopLabel, { color: theme.colors.text.secondary }]}>
                  Stop {activeStop.sequence ?? ''}
                </Text>
              </View>
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
<<<<<<< HEAD
              <Text
                style={[
                  styles.metaPrimary,
                  { color: theme.colors.primary.main },
                ]}
              >
=======
              <Text style={[styles.metaPrimary, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
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
<<<<<<< HEAD
            <Text style={styles.addressIcon}>📍</Text>
            <Text
              style={[
                styles.addressText,
                { color: theme.colors.text.secondary },
              ]}
            >
=======
            <AppIcon name="location" size={16} color={theme.colors.text.tertiary} />
            <Text style={[styles.addressText, { color: theme.colors.text.secondary }]}>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
              {activeStop.address}
            </Text>
          </View>

          <Button
            title="Start navigation"
            onPress={handleStartNavigation}
            style={styles.navButton}
          />

          {failedPanelOpen && (
            <View style={[styles.failedPanel, { backgroundColor: `${theme.colors.error || "#ef4444"}08`, borderColor: `${theme.colors.error || "#ef4444"}30` }]}>
              <Text style={[styles.failedPanelTitle, { color: theme.colors.text.primary }]}>
                Why couldn't you deliver?
              </Text>
              <TextInput
                style={[styles.failedNotesInput, { color: theme.colors.text.primary, borderColor: theme.colors.text.tertiary || "#cbd5e1" }]}
                placeholder="Customer unavailable, wrong address, gate locked..."
                placeholderTextColor={theme.colors.text.tertiary || "#94a3b8"}
                value={failedNotes}
                onChangeText={setFailedNotes}
                multiline
                numberOfLines={2}
              />
              <View style={styles.failedPanelActions}>
                <TouchableOpacity
                  style={[styles.confirmFailedBtn, { backgroundColor: theme.colors.error || "#ef4444" }]}
                  activeOpacity={0.8}
                  onPress={async () => {
                    try {
                      const stopId = activeStop.currentStopId || activeStop.id;
                      await driverApi.completeStop(stopId, {
                        status: "FAILED",
                        notes: failedNotes.trim() || "No reason provided",
                      });
                      setFailedPanelOpen(false);
                      setFailedNotes("");
                      refresh();
                    } catch (e) {
                      Alert.alert("Error", e?.message || "Could not update stop.");
                    }
                  }}
                >
                  <Text style={styles.confirmFailedBtnText}>Confirm Failed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelFailedBtn}
                  activeOpacity={0.7}
                  onPress={() => { setFailedPanelOpen(false); setFailedNotes(""); }}
                >
                  <Text style={[styles.cancelFailedBtnText, { color: theme.colors.text.secondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.stopActionRow}>
            <TouchableOpacity
              style={styles.deliveredBtn}
              onPress={() => {
                const isPickup = activeStop.type === 'PICKUP';
                const label = isPickup ? 'Picked Up' : 'Delivered';
                Alert.alert(`Mark ${label}`, `Mark stop for ${activeStop.customer} as ${label.toLowerCase()}?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: label,
                    onPress: async () => {
                      try {
                        const stopId = activeStop.currentStopId || activeStop.id;
                        await driverApi.completeStop(stopId, { status: "COMPLETED" });
                        Alert.alert("Done", `Stop marked as ${label.toLowerCase()}.`);
                        refresh();
                      } catch (e) {
                        Alert.alert("Error", e?.message || "Could not update stop.");
                      }
                    },
                  },
                ]);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.deliveredBtnIcon}>{activeStop.type === 'PICKUP' ? '⬆' : '✓'}</Text>
              <Text style={styles.deliveredBtnText}>{activeStop.type === 'PICKUP' ? 'Picked Up' : 'Delivered'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.failedBtn,
                { backgroundColor: isDarkMode ? (failedPanelOpen ? "#4d1515" : "#3d1515") : (failedPanelOpen ? "#fecaca" : "#fee2e2") },
              ]}
              onPress={() => {
                setFailedPanelOpen((prev) => !prev);
                setFailedNotes("");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.failedBtnIcon}>✕</Text>
              <Text style={styles.failedBtnText}>Failed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.skipBtn, { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" }]}
              onPress={async () => {
                try {
                  const stopId = activeStop.currentStopId || activeStop.id;
                  await driverApi.completeStop(stopId, { status: "SKIPPED", notes: "Driver skipped" });
                  refresh();
                } catch (e) {
                  Alert.alert("Error", e?.message || "Could not skip stop.");
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.skipBtnIcon}>↷</Text>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          </View>
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
              const isDone = stop.status === "COMPLETED" || stop.status === "FAILED" || stop.status === "SKIPPED";
              const isPickup = stop.type === "PICKUP";
              return (
                <TouchableOpacity
                  key={stop.id}
                  onPress={() => setActiveStopId(stop.id)}
                  activeOpacity={0.7}
                >
                  <Card
                    variant={theme.isDarkMode ? "glass" : "default"}
                    style={[
                      styles.stopCard,
<<<<<<< HEAD
                      isActive && { borderWidth: 1.5, borderColor: theme.colors.primary.main },
                      isDone && { opacity: 0.55 },
                    ]}
                  >
                    <View style={styles.stopCardHeader}>
                      <View style={[
                        styles.stopNumber,
                        {
                          backgroundColor: isActive
                            ? theme.colors.primary.main
                            : stop.status === "COMPLETED" ? "#22c55e"
                            : stop.status === "FAILED" ? "#ef4444"
                            : theme.colors.card,
                        },
                      ]}>
                        <Text style={[
                          styles.stopNumberText,
                          { color: (isActive || isDone) ? "#fff" : theme.colors.text.primary },
                        ]}>
                          {stop.status === "COMPLETED" ? "✓"
                            : stop.status === "FAILED" ? "✕"
                            : stop.sequence ?? index + 1}
                        </Text>
                      </View>
                      <View style={[styles.stopTypePill, {
                        backgroundColor: isPickup
                          ? (isDarkMode ? "#451a03" : "#fef3c7")
                          : (isDarkMode ? "#172554" : "#eff6ff"),
                      }]}>
                        <Text style={[styles.stopTypePillText, {
                          color: isPickup
                            ? (isDarkMode ? "#fed7aa" : "#b45309")
                            : (isDarkMode ? "#bfdbfe" : "#1d4ed8"),
                        }]}>
                          {isPickup ? 'PICKUP' : 'DELIVERY'}
=======
                      isActive && {
                        borderWidth: 1.5,
                        borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                      },
                    ]}
                  >
                    <View style={styles.stopCardHeader}>
                      <View
                        style={[
                          styles.stopNumber,
                          {
                            backgroundColor: isActive
                              ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main)
                              : theme.colors.card,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stopNumberText,
                            { color: isActive ? '#fff' : theme.colors.text.primary },
                          ]}
                        >
                          {index + 1}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.stopCustomer, { color: theme.colors.text.primary }]}
                      numberOfLines={1}
                    >
                      {stop.customer}
                    </Text>
                    <Text style={[styles.stopMeta, { color: theme.colors.text.secondary }]}>
                      {isDone
                        ? (stop.status === "COMPLETED" ? "Completed" : stop.status === "FAILED" ? "Failed" : "Skipped")
                        : `${stop.etaMinutes} min · ${stop.distanceKm.toFixed(1)} km`}
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
<<<<<<< HEAD
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
=======
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  // Arch-like strips pattern for dark mode
  archStrip1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 200,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(35, 101, 113, 0.3)',
    opacity: 0.7,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  archStrip2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 350,
    height: 180,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: 'rgba(45, 122, 135, 0.35)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '25deg' }],
  },
  archStrip3: {
    position: 'absolute',
    bottom: 200,
    left: -60,
    width: 380,
    height: 190,
    borderTopLeftRadius: 190,
    borderTopRightRadius: 190,
    backgroundColor: 'rgba(35, 101, 113, 0.25)',
    opacity: 0.5,
    zIndex: 0,
    transform: [{ rotate: '20deg' }],
  },
  archStrip4: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 420,
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: 'rgba(45, 122, 135, 0.3)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '-30deg' }],
  },
  header: {
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
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
    borderRadius: 24,
    overflow: "hidden",
  },
  map: { flex: 1 },
  mapHintOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  mapHintText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  driverMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    overflow: "visible",
  },
  driverDotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  driverDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
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
  trackingHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  trackingTitle: { fontSize: 16, fontWeight: "700" },
  trackingStatusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  trackingDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  trackingStatusPillText: { fontSize: 12, fontWeight: "600" },
  trackingStatusLabel: { fontSize: 13, marginBottom: 4 },
  trackingButtons: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: { flex: 1 },
  followButton: { marginTop: 10 },
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
  stopTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  stopTypePillText: { fontSize: 9, fontWeight: '700' },
  stopTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stopTypeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  stopCustomer: { fontSize: 14, fontWeight: "600" },
  stopMeta: { fontSize: 12, marginTop: 6 },
  emptyIcon: { fontSize: 64 },

  stopActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  deliveredBtn: {
    flex: 2,
    backgroundColor: "#22c55e",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    shadowColor: "#22c55e",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  deliveredBtnIcon: { color: "#fff", fontSize: 15, fontWeight: "800" },
  deliveredBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  failedBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    borderWidth: 1.5,
    borderColor: "#ef444450",
    shadowColor: "#ef4444",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  failedBtnIcon: { color: "#ef4444", fontSize: 13, fontWeight: "800" },
  failedBtnText: { color: "#ef4444", fontSize: 13, fontWeight: "700" },
  skipBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    borderWidth: 1.5,
    borderColor: "#64748b40",
    elevation: 1,
  },
  skipBtnIcon: { color: "#64748b", fontSize: 14, fontWeight: "800" },
  skipBtnText: { color: "#64748b", fontSize: 13, fontWeight: "700" },

  failedBtnActive: {},
  failedPanel: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  failedPanelTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  failedNotesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  failedPanelActions: {
    flexDirection: "row",
    gap: 10,
  },
  confirmFailedBtn: {
    flex: 2,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmFailedBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  cancelFailedBtn: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelFailedBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Light mode arch strips with green colors
  lightModeArchStrip1: {
    backgroundColor: 'rgba(22, 163, 74, 0.3)',
    opacity: 0.7,
  },
  lightModeArchStrip2: {
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
    opacity: 0.6,
  },
  lightModeArchStrip3: {
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    opacity: 0.5,
  },
  lightModeArchStrip4: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    opacity: 0.6,
  },
});

export default RouteScreen;
