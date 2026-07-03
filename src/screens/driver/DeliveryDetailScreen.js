<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { useDriverData } from "../../hooks/useDriverData";
import { driverApi } from "../../api/driverApi";
import { promptNavigation } from "../../utils/navigationUtils";

const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };

const STATUS_CONFIG_LIGHT = {
  COMPLETED:   { label: "Completed",   color: "#22c55e", bg: "#dcfce7" },
  FAILED:      { label: "Failed",      color: "#ef4444", bg: "#fee2e2" },
  SKIPPED:     { label: "Skipped",     color: "#64748b", bg: "#f1f5f9" },
  PENDING:     { label: "Pending",     color: "#f59e0b", bg: "#fef3c7" },
  IN_PROGRESS: { label: "In Progress", color: "#3b82f6", bg: "#eff6ff" },
};
const STATUS_CONFIG_DARK = {
  COMPLETED:   { label: "Completed",   color: "#4ade80", bg: "#14532d" },
  FAILED:      { label: "Failed",      color: "#f87171", bg: "#7f1d1d" },
  SKIPPED:     { label: "Skipped",     color: "#94a3b8", bg: "#1e293b" },
  PENDING:     { label: "Pending",     color: "#fbbf24", bg: "#451a03" },
  IN_PROGRESS: { label: "In Progress", color: "#60a5fa", bg: "#1e3a5f" },
};
=======
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { DRIVER_DELIVERIES, HUB_COORDS, findDeliveryById } from './deliveriesData';
import AppIcon from '../../components/common/AppIcon';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

const DeliveryDetailScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { deliveryId } = route.params || {};
  const { data, loading, reload } = useDriverData();
  const [orderItems, setOrderItems] = useState([]);

  // Look up from route stops first (correct source for stop IDs), fall back to orders
  const delivery = useMemo(() => {
    const allStops = data.route?.stops || data.activeRoute?.stops || [];
    const fromRoute = allStops.find((s) => s.id === deliveryId);
    if (fromRoute) return fromRoute;
    return data.orders.find((o) => o.id === deliveryId) || null;
  }, [data.route, data.activeRoute, data.orders, deliveryId]);

  useEffect(() => {
    if (!deliveryId) return;
    const stopId = delivery?.currentStopId || deliveryId;
    driverApi.getStopItems(stopId).then((res) => {
      if (res?.items) setOrderItems(res.items);
    }).catch(() => {});
  }, [deliveryId, delivery?.currentStopId]);

  const handleCall = () => {
    if (!delivery?.phone) return;
    Linking.openURL(`tel:${delivery.phone}`).catch(() =>
      Alert.alert("Cannot call", "Unable to open dialer on this device.")
    );
  };

  if (loading) {
    return <Loader fullScreen text="Loading stop details..." />;
  }

  if (!delivery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>📦</Text>}
          title="Stop not found"
          message="This stop is no longer available."
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
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };

  const isPickup = delivery.type === "PICKUP";
  const STATUS_CONFIG = isDarkMode ? STATUS_CONFIG_DARK : STATUS_CONFIG_LIGHT;
  const statusCfg = STATUS_CONFIG[delivery.status?.toUpperCase()] || STATUS_CONFIG.PENDING;
  const totalAmount = orderItems.reduce((sum, i) => sum + (i.totalPrice ?? 0), 0);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
<<<<<<< HEAD
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.colors.primary.main }]}>← Back</Text>
=======
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={styles.headerTopRow}>
              {delivery.sequence != null && (
                <View style={[styles.seqBadge, { backgroundColor: "#14b8a615", borderColor: "#14b8a640" }]}>
                  <Text style={[styles.seqBadgeText, { color: "#14b8a6" }]}>#{delivery.sequence}</Text>
                </View>
              )}
              <View style={[styles.typeBadge, {
                backgroundColor: isPickup
                  ? (isDarkMode ? "#451a03" : "#fef3c7")
                  : (isDarkMode ? "#172554" : "#eff6ff"),
              }]}>
                <Text style={[styles.typeBadgeText, {
                  color: isPickup
                    ? (isDarkMode ? "#fed7aa" : "#b45309")
                    : (isDarkMode ? "#bfdbfe" : "#1d4ed8"),
                }]}>
                  {isPickup ? "PICKUP" : "DELIVERY"}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              </View>
            </View>
            <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
              {delivery.orderId}
            </Text>
            <Text style={[styles.customerName, { color: theme.colors.text.secondary }]}>
              {delivery.customer}
            </Text>
          </View>
        </View>

        {/* Map */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              showsUserLocation={false}
            >
              <Polyline
<<<<<<< HEAD
                coordinates={[HUB_COORDS, coords]}
                strokeColor="#14b8a6"
                strokeWidth={3}
              />
              <Marker coordinate={HUB_COORDS} title="Hub" />
              <Marker coordinate={coords} title={delivery.customer} />
=======
                coordinates={[HUB_COORDS, delivery.coords]}
                strokeColor={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main}
                strokeWidth={4}
              />

              <Marker coordinate={HUB_COORDS}>
                <View style={[styles.hubMarker, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
                  <AppIcon name="store" size={18} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
                </View>
              </Marker>

              <Marker coordinate={delivery.coords}>
                <View style={[styles.stopMarker, { borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                  <AppIcon name="orders" size={16} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
                </View>
              </Marker>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            </MapView>
          </View>
        </Card>

        {/* ETA / Distance / Priority */}
        <View style={styles.metaRow}>
<<<<<<< HEAD
          <Card style={styles.metaCard}>
            <Text style={[styles.metaLabel, { color: theme.colors.text.secondary }]}>ETA</Text>
=======
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.metaCard}>
            <Text style={[styles.metaLabel, { color: theme.colors.text.secondary }]}>
              ETA
            </Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            <Text style={[styles.metaValue, { color: theme.colors.text.primary }]}>
              {delivery.etaMinutes > 0 ? `${delivery.etaMinutes} min` : "—"}
            </Text>
          </Card>
<<<<<<< HEAD
          <Card style={styles.metaCard}>
            <Text style={[styles.metaLabel, { color: theme.colors.text.secondary }]}>Distance</Text>
=======
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.metaCard}>
            <Text style={[styles.metaLabel, { color: theme.colors.text.secondary }]}>
              Distance
            </Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            <Text style={[styles.metaValue, { color: theme.colors.text.primary }]}>
              {delivery.distanceKm > 0 ? `${delivery.distanceKm.toFixed(1)} km` : "—"}
            </Text>
          </Card>
<<<<<<< HEAD
          <Card style={styles.metaCard}>
            <Text style={[styles.metaLabel, { color: theme.colors.text.secondary }]}>Priority</Text>
            <Text style={[styles.metaValue, {
              color: delivery.priority === "high" ? "#ef4444" : theme.colors.text.primary,
            }]}>
              {delivery.priority === "high" ? "High" : "Normal"}
=======
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.metaCard}>
            <Text style={[styles.metaLabel, { color: theme.colors.text.secondary }]}>
              Priority
            </Text>
            <Text
              style={[
                styles.metaValue,
                {
                  color:
                    delivery.priority === 'high'
                      ? theme.colors.error
                      : theme.colors.text.primary,
                },
              ]}
            >
              {delivery.priority === 'high' ? 'High' : 'Normal'}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            </Text>
          </Card>
        </View>

<<<<<<< HEAD
        {/* Contact & Address */}
        <Card style={styles.infoCard}>
=======
        {/* Address & contact */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.infoCard}>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {isPickup ? "Pickup details" : "Delivery details"}
          </Text>

          <View style={styles.infoRow}>
            <AppIcon name="location" size={18} color={theme.colors.text.tertiary} />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {delivery.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <AppIcon name="profile" size={18} color={theme.colors.text.tertiary} />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {delivery.customer}
            </Text>
          </View>
<<<<<<< HEAD

          {/* Call button — only shown when phone is available */}
          {delivery.phone ? (
            <TouchableOpacity
              style={[
                styles.callRow,
                isDarkMode
                  ? { backgroundColor: "#0d2c28", borderColor: "#134e4a" }
                  : { backgroundColor: "#f0fdfa", borderColor: "#99f6e4" },
              ]}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Text style={styles.callIcon}>📞</Text>
              <Text style={[styles.callText, { color: "#14b8a6" }]}>{delivery.phone}</Text>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>Call</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={[styles.infoText, { color: theme.colors.text.tertiary }]}>
                No phone on file
              </Text>
            </View>
          )}

          {delivery.notes ? (
            <View style={[styles.notesBox, isDarkMode
              ? { backgroundColor: "#2d250640", borderColor: "#92400e" }
              : { backgroundColor: "#fef3c720", borderColor: "#fde68a" },
            ]}>
              <Text style={[styles.notesText, { color: isDarkMode ? "#fde68a" : "#92400e" }]}>
                📝 {delivery.notes}
              </Text>
            </View>
          ) : null}
=======
          <View style={styles.infoRow}>
            <AppIcon name="time" size={18} color={theme.colors.text.tertiary} />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Preferred delivery window: {delivery.time}
            </Text>
          </View>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
        </Card>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <Card style={styles.itemsCard}>
            <View style={styles.itemsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Items ({orderItems.length})
              </Text>
              {totalAmount > 0 && (
                <Text style={[styles.totalAmount, { color: "#14b8a6" }]}>
                  ${totalAmount.toFixed(2)}
                </Text>
              )}
            </View>
            {orderItems.map((item, idx) => (
              <View key={item.id || idx} style={[
                styles.itemRow,
                idx < orderItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#1e3a52" : "#f1f5f9" }
              ]}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>{item.name}</Text>
                  <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                    {item.quantity} {item.unit} · ${item.unitPrice}/unit
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: theme.colors.text.primary }]}>
                  ${item.totalPrice?.toFixed(2)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Navigate"
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
            title="Report Issue"
            variant="outline"
            onPress={() => navigation.navigate("ReportIssue", { deliveryId: delivery.id })}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyIcon: { fontSize: 64 },

  headerRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8, marginBottom: 16, gap: 12 },
  backBtn: { paddingTop: 4 },
  backText: { fontSize: 14, fontWeight: "600" },
  headerTopRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  seqBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1.5 },
  seqBadgeText: { fontSize: 12, fontWeight: "800" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText: { fontSize: 10, fontWeight: "800" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
  orderId: { fontSize: 18, fontWeight: "800" },
  customerName: { fontSize: 14, marginTop: 2 },

  mapCard: { padding: 0, marginBottom: 14, overflow: "hidden" },
  mapContainer: { height: 200, borderRadius: 20 },

  metaRow: { flexDirection: "row", marginBottom: 14, gap: 10 },
  metaCard: { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  metaLabel: { fontSize: 11 },
  metaValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },

  infoCard: { padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoIcon: { fontSize: 16, marginRight: 10, width: 24 },
  infoText: { flex: 1, fontSize: 14 },

  callRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerInfo: {
    marginLeft: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
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
    overflow: 'hidden',
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
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  metaCard: {
    flex: 1,
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
<<<<<<< HEAD
  callIcon: { fontSize: 16, marginRight: 10 },
  callText: { flex: 1, fontSize: 14, fontWeight: "600" },
  callPill: { backgroundColor: "#14b8a6", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  callPillText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  notesBox: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 4 },
  notesText: { fontSize: 13 },

  itemsCard: { padding: 16, marginBottom: 14 },
  itemsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalAmount: { fontSize: 16, fontWeight: "800" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemMeta: { fontSize: 12, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: "700" },

  actions: { flexDirection: "row", gap: 12, marginTop: 4 },
  actionButton: { flex: 1 },
=======
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  infoCard: {
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
});

export default DeliveryDetailScreen;
