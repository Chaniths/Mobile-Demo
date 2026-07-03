import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AppIcon from '../../components/common/AppIcon';

const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };

const RouteMapScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [activeOrderId, setActiveOrderId] = useState(null);

  const selectedRoute = route?.params?.route || {
    id: '1',
    routeId: 'Route #12',
    driver: 'Mike Johnson',
    stops: 8,
    distance: '45.8 km',
    orders: [
      {
        id: '1',
        orderId: '#ORD-2024-001',
        customer: 'John Doe',
        address: '123 Main St, Downtown',
        coords: { latitude: 13.0827, longitude: 80.2707 },
        eta: '10:30 AM',
        status: 'In Transit',
      },
      {
        id: '2',
        orderId: '#ORD-2024-002',
        customer: 'Jane Smith',
        address: '456 Oak Ave, Midtown',
        coords: { latitude: 13.0627, longitude: 80.2907 },
        eta: '11:00 AM',
        status: 'Scheduled',
      },
      {
        id: '3',
        orderId: '#ORD-2024-003',
        customer: 'Bob Johnson',
        address: '789 Lake Rd, Riverside',
        coords: { latitude: 13.0427, longitude: 80.2607 },
        eta: '11:45 AM',
        status: 'Scheduled',
      },
    ],
  };

  const activeOrder = useMemo(() => {
    // Filter orders with valid coordinates first
    const ordersWithCoords = selectedRoute.orders.filter(
      (o) => o.coords && o.coords.latitude && o.coords.longitude
    );
    if (ordersWithCoords.length === 0) return null;
    return ordersWithCoords.find((o) => o.id === activeOrderId) || ordersWithCoords[0];
  }, [activeOrderId, selectedRoute.orders]);

  const polylineCoords = useMemo(() => {
    // Filter out orders without coordinates to prevent crashes
    const ordersWithCoords = selectedRoute.orders.filter((o) => o.coords && o.coords.latitude && o.coords.longitude);
    return [HUB_COORDS, ...ordersWithCoords.map((o) => o.coords)];
  }, [selectedRoute.orders]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
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
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {selectedRoute.routeId}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {selectedRoute.stops} stops • {selectedRoute.distance}
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: HUB_COORDS.latitude,
            longitude: HUB_COORDS.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          showsUserLocation={false}
          showsCompass={false}
          showsMyLocationButton={false}
        >
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

          {selectedRoute.orders
            .filter((order) => order.coords && order.coords.latitude && order.coords.longitude)
            .map((order, index) => {
              const isActive = order.id === activeOrderId || (!activeOrderId && index === 0);
              return (
                <Marker
                  key={order.id}
                  coordinate={order.coords}
                  onPress={() => setActiveOrderId(order.id)}
                >
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
                      { color: isActive ? '#fff' : theme.colors.text.primary },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.mapOverlay}>
          <Text style={[styles.overlayText, { color: theme.colors.text.primary }]}>
            {selectedRoute.driver} • {selectedRoute.orders.length} orders
          </Text>
        </Card>
      </View>

      <View style={styles.bottomSheet}>
        {activeOrder ? (
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.activeOrderCard}>
            <View style={styles.activeOrderHeader}>
              <View>
                <Text style={[styles.activeOrderLabel, { color: theme.colors.text.secondary }]}>
                  Current Order
                </Text>
                <Text style={[styles.activeOrderId, { color: theme.colors.text.primary }]}>
                  {activeOrder.orderId}
                </Text>
              </View>
              <Text style={[styles.activeOrderEta, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                {activeOrder.eta}
              </Text>
            </View>
            <Text style={[styles.activeOrderCustomer, { color: theme.colors.text.primary }]}>
              {activeOrder.customer}
            </Text>
            <View style={styles.addressRow}>
              <AppIcon name="location" size={14} color={theme.colors.text.secondary} />
              <Text style={[styles.activeOrderAddress, { color: theme.colors.text.secondary }]}>
                {activeOrder.address}
              </Text>
            </View>
            <View style={styles.activeOrderActions}>
              <Button
                title="View Details"
                onPress={() => navigation.navigate('DeliveryPickup', { order: activeOrder })}
                style={styles.detailButton}
              />
              <Button
                title="Start Navigation"
                onPress={() => {}}
                variant="outline"
                style={styles.navButton}
              />
            </View>
          </Card>
        ) : (
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.activeOrderCard}>
            <Text style={[styles.activeOrderLabel, { color: theme.colors.text.secondary }]}>
              No orders with valid coordinates available
            </Text>
            <Text style={[styles.activeOrderAddress, { color: theme.colors.text.tertiary }]}>
              Please ensure all orders have location coordinates
            </Text>
          </Card>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ordersScroll}
        >
          {selectedRoute.orders
            .filter((order) => order.coords && order.coords.latitude && order.coords.longitude)
            .map((order, index) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => setActiveOrderId(order.id)}
            >
              <Card
                variant={theme.isDarkMode ? "glass" : "default"}
                style={[
                  styles.orderCard,
                  (order.id === activeOrderId || (!activeOrderId && index === 0)) && {
                    borderWidth: 2,
                    borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                  },
                ]}
              >
                <View style={[
                  styles.orderNumber,
                  {
                    backgroundColor:
                      order.id === activeOrderId || (!activeOrderId && index === 0)
                        ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main)
                        : (theme.isDarkMode ? theme.colors.teal.soft : '#f3f4f6'),
                  },
                ]}>
                  <Text
                    style={[
                      styles.orderNumberText,
                      {
                        color:
                          order.id === activeOrderId || (!activeOrderId && index === 0)
                            ? '#fff'
                            : theme.colors.text.primary,
                      },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.orderIdText,
                    { color: theme.colors.text.primary },
                  ]}
                  numberOfLines={1}
                >
                  {order.orderId}
                </Text>
                <Text
                  style={[
                    styles.orderEtaText,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {order.eta}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  mapWrapper: { flex: 1.2, marginHorizontal: 16, marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  map: { flex: 1 },
  hubMarker: { padding: 8, borderRadius: 16 },
  hubEmoji: { fontSize: 18 },
  stopMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopMarkerText: { fontSize: 14, fontWeight: '700' },
  mapOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  overlayText: { fontSize: 12, fontWeight: '600' },
  bottomSheet: { flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 28 },
  activeOrderCard: { padding: 16, marginBottom: 10 },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activeOrderLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  activeOrderId: { fontSize: 16, fontWeight: '700' },
  activeOrderEta: { fontSize: 14, fontWeight: '700' },
  activeOrderCustomer: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  activeOrderAddress: { fontSize: 13, marginBottom: 12, flex: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  activeOrderActions: { flexDirection: 'row', gap: 12 },
  detailButton: { flex: 1, marginBottom: 0 },
  navButton: { flex: 1, marginBottom: 0 },
  ordersScroll: { paddingVertical: 4 },
  orderCard: { width: 120, padding: 12, marginRight: 8, alignItems: 'center' },
  orderNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumberText: { fontSize: 14, fontWeight: '700' },
  orderIdText: { fontSize: 12, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  orderEtaText: { fontSize: 11 },
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

export default RouteMapScreen;

