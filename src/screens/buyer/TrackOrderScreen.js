import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getBuyerOrders } from '../../api/ordersApi';
import { mapOrderTab, orderStatusLabel, timelineIndexForStatus } from '../../utils/mediaUrl';

const statusColor = {
  'On the way': '#22c55e',
  Packing: '#f59e0b',
  Pending: '#94a3b8',
  Delivered: '#22c55e',
};

const TIMELINE = ['Order placed', 'Packed', 'Picked up', 'On the way', 'Delivered'];

const liveLabel = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'DELIVERED') return 'Delivered';
  if (value === 'IN_TRANSIT') return 'On the way';
  if (value === 'ASSIGNED' || value === 'BATCHED' || value === 'PAID') return 'Packing';
  return 'Pending';
};

const COLOMBO = { latitude: 6.9271, longitude: 79.8612 };

const TrackOrderScreen = ({ route }) => {
  const { theme } = useTheme();
  const focusOrderId = route?.params?.orderId;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getBuyerOrders();
      setOrders(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load tracking.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const liveOrders = useMemo(() => {
    const mapped = orders
      .filter((order) => {
        const tab = mapOrderTab(order.status);
        return tab === 'processing' || tab === 'in_transit' || order.id === focusOrderId;
      })
      .map((order) => ({
        id: order.id,
        title: order.orderNumber
          ? `#${order.orderNumber}`
          : `#${String(order.id).slice(-8).toUpperCase()}`,
        status: liveLabel(order.status),
        statusRaw: order.status,
        items: (order.items || []).map(
          (item) => `${item.product?.name || 'Item'}: ${item.quantity} ${item.product?.unit || ''}`.trim()
        ),
        timeline: TIMELINE,
        currentIndex: timelineIndexForStatus(order.status),
        rider: {
          name: order.driver?.user?.name || 'Pending assignment',
          vehicle: order.driver?.vehicleNumber || 'Assignment pending',
          phone: order.driver?.user?.phone || '',
        },
        lat: Number(order.deliveryLat) || COLOMBO.latitude,
        lng: Number(order.deliveryLng) || COLOMBO.longitude,
        address: order.deliveryAddress,
      }));

    if (focusOrderId) {
      mapped.sort((a, b) => (a.id === focusOrderId ? -1 : b.id === focusOrderId ? 1 : 0));
    }
    return mapped;
  }, [orders, focusOrderId]);

  const delivered7d = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return orders.filter((order) => {
      const t = new Date(order.placedAt || order.createdAt).getTime();
      return mapOrderTab(order.status) === 'delivered' && t >= weekAgo;
    }).length;
  }, [orders]);

  const mapOrder = liveOrders[0];
  const mapRegion = {
    latitude: mapOrder?.lat || COLOMBO.latitude,
    longitude: mapOrder?.lng || COLOMBO.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode ? (
        <>
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      ) : (
        <>
          <View style={[styles.archStrip1, styles.lightModeArchStrip1]} />
          <View style={[styles.archStrip2, styles.lightModeArchStrip2]} />
          <View style={[styles.archStrip3, styles.lightModeArchStrip3]} />
          <View style={[styles.archStrip4, styles.lightModeArchStrip4]} />
        </>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} />
        }
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Tracking & History
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Live status from your FreshRoute orders.
        </Text>

        <View style={styles.kpiRow}>
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={[styles.kpiCard, styles.tintGreen]}>
            <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Live Deliveries</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.text.highlight }]}>
              {liveOrders.filter((o) => o.status !== 'Delivered').length}
            </Text>
            <Text style={[styles.kpiHint, { color: theme.colors.text.secondary }]}>In progress</Text>
          </Card>
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={[styles.kpiCard, styles.tintTeal]}>
            <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Delivered (7D)</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.text.highlight }]}>{delivered7d}</Text>
            <Text style={[styles.kpiHint, { color: theme.colors.text.secondary }]}>Completed recently</Text>
          </Card>
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={[styles.kpiCard, styles.tintAmber]}>
            <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>All orders</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.text.highlight }]}>{orders.length}</Text>
            <Text style={[styles.kpiHint, { color: theme.colors.text.secondary }]}>From your account</Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Live order tracking</Text>
        {loading && orders.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginVertical: 20 }} />
        ) : error && orders.length === 0 ? (
          <Text style={{ color: theme.colors.text.secondary }}>{error}</Text>
        ) : liveOrders.length === 0 ? (
          <Text style={{ color: theme.colors.text.secondary }}>No active deliveries to track.</Text>
        ) : (
          liveOrders.map((order) => (
            <Card variant={theme.isDarkMode ? 'glass' : 'default'} key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderTitle, { color: theme.colors.text.primary }]}>
                    {order.title}
                  </Text>
                  <Text style={[styles.items, { color: theme.colors.text.secondary }]}>
                    {order.items.join(' · ') || orderStatusLabel(order.statusRaw)}
                  </Text>
                </View>
                <View style={styles.orderBadge}>
                  <Text
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: `${statusColor[order.status] || theme.colors.primary.main}33`,
                        color: statusColor[order.status] || theme.colors.primary.main,
                      },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.timelineBar}>
                <View
                  style={[
                    styles.timelineBarFill,
                    {
                      width: `${((order.currentIndex + 1) / order.timeline.length) * 100}%`,
                      backgroundColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                    },
                  ]}
                />
              </View>
              <View style={styles.timeline}>
                {order.timeline.map((step, idx) => {
                  const active = idx <= order.currentIndex;
                  return (
                    <View key={`${order.id}-tl-${idx}`} style={styles.timelineStep}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: active ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main) : theme.colors.text.tertiary },
                        ]}
                      />
                      <Text
                        style={[
                          styles.timelineLabel,
                          { color: active ? theme.colors.text.primary : theme.colors.text.tertiary },
                        ]}
                      >
                        {step}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.riderCard} elevation="lg">
                <Text style={[styles.riderTitle, { color: theme.colors.text.primary }]}>Rider contact</Text>
                <Text style={[styles.riderName, { color: theme.colors.text.secondary }]}>{order.rider.name}</Text>
                <Text style={[styles.riderMeta, { color: theme.colors.text.tertiary }]}>{order.rider.vehicle}</Text>
                {order.rider.phone ? (
                  <Text style={[styles.riderPhone, { color: theme.colors.text.primary }]}>{order.rider.phone}</Text>
                ) : (
                  <Text style={[styles.riderPhone, { color: theme.colors.text.tertiary }]}>Pending assignment</Text>
                )}
              </Card>
            </Card>
          ))
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Delivery map</Text>
        <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              region={mapRegion}
              showsUserLocation={false}
              showsCompass={false}
              scrollEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              zoomEnabled={false}
            >
              <Polyline
                coordinates={[
                  { latitude: mapRegion.latitude - 0.012, longitude: mapRegion.longitude - 0.008 },
                  { latitude: mapRegion.latitude, longitude: mapRegion.longitude },
                ]}
                strokeColor="#16a34a"
                strokeWidth={5}
              />
              <Marker
                coordinate={{ latitude: mapRegion.latitude - 0.012, longitude: mapRegion.longitude - 0.008 }}
                title="Hub"
                description="FreshRoute hub"
                pinColor="#16a34a"
              />
              <Marker
                coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
                title="Delivery"
                description={mapOrder?.address || 'Delivery location'}
                pinColor="#f97316"
              />
            </MapView>
          </View>
          <Text style={[styles.mapHint, { color: theme.colors.text.secondary }]}>
            {mapOrder?.address
              ? `Showing the delivery pin for ${mapOrder.title}.`
              : 'Place an order to pin your delivery location here.'}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
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
  title: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 16 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, padding: 14 },
  kpiLabel: { fontSize: 12 },
  kpiValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  kpiHint: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  orderCard: { marginBottom: 12, padding: 14 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  orderTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  items: { fontSize: 13 },
  orderBadge: { alignItems: 'flex-end' },
  riderCard: { marginTop: 12, padding: 12 },
  riderTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  riderName: { fontSize: 13, fontWeight: '600' },
  riderMeta: { fontSize: 12, marginTop: 2 },
  riderPhone: { fontSize: 12, marginTop: 4 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  timeline: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2, paddingHorizontal: 6 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLabel: { fontSize: 12, fontWeight: '600' },
  timelineBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 12,
    overflow: 'hidden',
  },
  timelineBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  mapCard: { padding: 12, marginTop: 10, marginBottom: 12 },
  mapContainer: {
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  mapHint: {
    fontSize: 12,
    marginTop: 10,
  },
  tintGreen: { backgroundColor: 'rgba(34,197,94,0.62)' },
  tintTeal: { backgroundColor: 'rgba(52,211,153,0.62)' },
  tintAmber: { backgroundColor: 'rgba(251,191,36,0.70)' },
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

export default TrackOrderScreen;
