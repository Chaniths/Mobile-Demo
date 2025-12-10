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

  const activeOrder = useMemo(
    () => selectedRoute.orders.find((o) => o.id === activeOrderId) || selectedRoute.orders[0],
    [activeOrderId, selectedRoute.orders]
  );

  const polylineCoords = useMemo(
    () => [HUB_COORDS, ...selectedRoute.orders.map((o) => o.coords)],
    [selectedRoute.orders]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
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
            strokeColor={theme.colors.primary.main}
            strokeWidth={4}
          />

          <Marker coordinate={HUB_COORDS}>
            <View style={[styles.hubMarker, { backgroundColor: theme.colors.primary.light }]}>
              <Text style={styles.hubEmoji}>🏬</Text>
            </View>
          </Marker>

          {selectedRoute.orders.map((order, index) => {
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
                        ? theme.colors.primary.main
                        : theme.colors.card,
                      borderColor: theme.colors.primary.main,
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

        <View style={[styles.mapOverlay, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.overlayText, { color: theme.colors.text.primary }]}>
            {selectedRoute.driver} • {selectedRoute.orders.length} orders
          </Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <Card style={styles.activeOrderCard}>
          <View style={styles.activeOrderHeader}>
            <View>
              <Text style={[styles.activeOrderLabel, { color: theme.colors.text.secondary }]}>
                Current Order
              </Text>
              <Text style={[styles.activeOrderId, { color: theme.colors.text.primary }]}>
                {activeOrder.orderId}
              </Text>
            </View>
            <Text style={[styles.activeOrderEta, { color: theme.colors.primary.main }]}>
              {activeOrder.eta}
            </Text>
          </View>
          <Text style={[styles.activeOrderCustomer, { color: theme.colors.text.primary }]}>
            {activeOrder.customer}
          </Text>
          <Text style={[styles.activeOrderAddress, { color: theme.colors.text.secondary }]}>
            📍 {activeOrder.address}
          </Text>
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ordersScroll}
        >
          {selectedRoute.orders.map((order, index) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => setActiveOrderId(order.id)}
            >
              <Card
                style={[
                  styles.orderCard,
                  (order.id === activeOrderId || (!activeOrderId && index === 0)) && {
                    borderWidth: 2,
                    borderColor: theme.colors.primary.main,
                  },
                ]}
              >
                <View style={styles.orderNumber}>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: { fontSize: 16, color: '#16a34a', fontWeight: '600' },
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
  activeOrderAddress: { fontSize: 13, marginBottom: 12 },
  activeOrderActions: { flexDirection: 'row', gap: 12 },
  detailButton: { flex: 1, marginBottom: 0 },
  navButton: { flex: 1, marginBottom: 0 },
  ordersScroll: { paddingVertical: 4 },
  orderCard: { width: 120, padding: 12, marginRight: 8, alignItems: 'center' },
  orderNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumberText: { fontSize: 14, fontWeight: '700' },
  orderIdText: { fontSize: 12, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  orderEtaText: { fontSize: 11 },
});

export default RouteMapScreen;

