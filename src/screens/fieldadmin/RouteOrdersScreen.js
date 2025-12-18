import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const RouteOrdersScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedRoute, setSelectedRoute] = useState(null);

  const routes = [
    {
      id: '1',
      routeId: 'Route #12',
      driver: 'Mike Johnson',
      truck: 'WP ABC-1234',
      stops: 8,
      distance: '45.8 km',
      status: 'In Progress',
      orders: [
        {
          id: '1',
          orderId: '#ORD-2024-001',
          customer: 'John Doe',
          address: '123 Main St, Downtown',
          coords: { latitude: 13.0827, longitude: 80.2707 },
          items: ['Tomatoes 5kg', 'Spinach 10 bunches'],
          status: 'In Transit',
          eta: '10:30 AM',
        },
        {
          id: '2',
          orderId: '#ORD-2024-002',
          customer: 'Jane Smith',
          address: '456 Oak Ave, Midtown',
          coords: { latitude: 13.0627, longitude: 80.2907 },
          items: ['Carrots 3kg', 'Cabbage 2pcs'],
          status: 'Scheduled',
          eta: '11:00 AM',
        },
      ],
    },
    {
      id: '2',
      routeId: 'Route #15',
      driver: 'Sarah Williams',
      truck: 'WP XYZ-5678',
      stops: 6,
      distance: '32.4 km',
      status: 'Scheduled',
      orders: [
        {
          id: '3',
          orderId: '#ORD-2024-004',
          customer: 'Bob Johnson',
          address: '789 Lake Rd, Riverside',
          coords: { latitude: 13.0427, longitude: 80.2607 },
          items: ['Mangoes 5kg', 'Bananas 8pcs'],
          status: 'Scheduled',
          eta: '02:00 PM',
        },
      ],
    },
  ];

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Route Orders
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RouteMap')}>
            <Text style={[styles.mapButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>

        {routes.map((route) => (
          <Card variant={theme.isDarkMode ? "glass" : "default"} key={route.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View>
                <Text style={[styles.routeId, { color: theme.colors.text.primary }]}>
                  {route.routeId}
                </Text>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>
                  Driver: {route.driver} • {route.truck}
                </Text>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>
                  {route.stops} stops • {route.distance}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      route.status === 'In Progress' ? `${theme.colors.success}20` : `${theme.colors.info}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: route.status === 'In Progress' ? theme.colors.success : theme.colors.info,
                    },
                  ]}
                >
                  {route.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={[styles.ordersTitle, { color: theme.colors.text.primary }]}>
              Assigned Orders ({route.orders.length})
            </Text>

            {route.orders.map((order) => (
              <Card variant={theme.isDarkMode ? "glass" : "default"} key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
                    {order.orderId}
                  </Text>
                  <Text style={[styles.orderEta, { color: theme.colors.text.secondary }]}>
                    ETA: {order.eta}
                  </Text>
                </View>
                <Text style={[styles.orderCustomer, { color: theme.colors.text.primary }]}>
                  {order.customer}
                </Text>
                <Text style={[styles.orderAddress, { color: theme.colors.text.secondary }]}>
                  📍 {order.address}
                </Text>
                <Text style={[styles.orderItems, { color: theme.colors.text.secondary }]}>
                  Items: {order.items.join(', ')}
                </Text>
                <View style={styles.orderActions}>
                  <Button
                    title="View Details"
                    onPress={() => navigation.navigate('DeliveryPickup', { order })}
                    variant="outline"
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            ))}

            <Button
              title="View on Map"
              onPress={() => navigation.navigate('RouteMap', { route })}
              style={styles.mapButtonCard}
            />
          </Card>
        ))}
      </ScrollView>
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
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 120,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  mapButton: { fontSize: 16, fontWeight: '600' },
  routeCard: { padding: 16, marginBottom: 24 },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeId: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  routeDetail: { fontSize: 13, marginBottom: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  ordersTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  orderCard: { padding: 12, marginBottom: 12 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontSize: 15, fontWeight: '700' },
  orderEta: { fontSize: 12 },
  orderCustomer: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  orderAddress: { fontSize: 13, marginBottom: 4 },
  orderItems: { fontSize: 12, marginBottom: 12 },
  orderActions: { marginTop: 4 },
  actionButton: { marginBottom: 0 },
  mapButtonCard: { marginTop: 12 },
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

export default RouteOrdersScreen;

