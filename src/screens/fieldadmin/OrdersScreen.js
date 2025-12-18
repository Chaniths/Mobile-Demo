import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const mockOrders = [
  {
    id: '1',
    orderId: '#ORD-2024-001',
    date: 'Dec 18, 2024',
    status: 'scheduled',
    customer: 'John Doe',
    address: '123 Main St, Downtown',
    coords: { latitude: 13.0827, longitude: 80.2707 },
    items: 3,
    total: 45.99,
    route: 'Route #12',
    driver: 'Mike Johnson',
    eta: '10:30 AM',
  },
  {
    id: '2',
    orderId: '#ORD-2024-002',
    date: 'Dec 18, 2024',
    status: 'in_transit',
    customer: 'Jane Smith',
    address: '456 Oak Ave, Midtown',
    coords: { latitude: 13.0627, longitude: 80.2907 },
    items: 2,
    total: 32.50,
    route: 'Route #12',
    driver: 'Mike Johnson',
    eta: '11:00 AM',
  },
  {
    id: '3',
    orderId: '#ORD-2024-003',
    date: 'Dec 18, 2024',
    status: 'in_transit',
    customer: 'Bob Johnson',
    address: '789 Lake Rd, Riverside',
    coords: { latitude: 13.0427, longitude: 80.2607 },
    items: 4,
    total: 67.25,
    route: 'Route #15',
    driver: 'Sarah Williams',
    eta: '02:00 PM',
  },
  {
    id: '4',
    orderId: '#ORD-2024-004',
    date: 'Dec 17, 2024',
    status: 'delivered',
    customer: 'Alice Brown',
    address: '321 Park St, Uptown',
    coords: { latitude: 13.0927, longitude: 80.2807 },
    items: 1,
    total: 18.75,
    route: 'Route #10',
    driver: 'Tom Wilson',
    eta: 'Delivered',
  },
  {
    id: '5',
    orderId: '#ORD-2024-005',
    date: 'Dec 18, 2024',
    status: 'scheduled',
    customer: 'Charlie Davis',
    address: '654 Elm St, Suburb',
    coords: { latitude: 13.0527, longitude: 80.2507 },
    items: 5,
    total: 89.50,
    route: 'Route #15',
    driver: 'Sarah Williams',
    eta: '03:30 PM',
  },
  {
    id: '6',
    orderId: '#ORD-2024-006',
    date: 'Dec 17, 2024',
    status: 'delivered',
    customer: 'Diana Miller',
    address: '987 Pine Ave, Downtown',
    coords: { latitude: 13.0727, longitude: 80.2407 },
    items: 2,
    total: 42.00,
    route: 'Route #10',
    driver: 'Tom Wilson',
    eta: 'Delivered',
  },
  {
    id: '7',
    orderId: '#ORD-2024-007',
    date: 'Dec 18, 2024',
    status: 'pending',
    customer: 'Eve Wilson',
    address: '147 Maple Dr, Midtown',
    coords: null, // No coordinates for unassigned orders
    items: 3,
    total: 55.75,
    route: 'Not assigned',
    driver: 'Pending',
    eta: 'TBD',
  },
];

const statusColors = {
  scheduled: '#3b82f6',
  in_transit: '#06b6d4',
  delivered: '#22c55e',
  pending: '#f59e0b',
  cancelled: '#ef4444',
  processing: '#8b5cf6',
};

const statusLabels = {
  scheduled: 'Scheduled',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  pending: 'Pending',
  cancelled: 'Cancelled',
  processing: 'Processing',
};

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = activeTab === 'all'
    ? mockOrders
    : mockOrders.filter((order) => order.status === activeTab);

  const renderOrder = ({ item }) => (
    <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
            {item.orderId}
          </Text>
          <Text style={[styles.orderDate, { color: theme.colors.text.secondary }]}>
            {item.date}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusColors[item.status]}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {statusLabels[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Customer:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.customer}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Address:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.address}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Route:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.route}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Driver:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.driver}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            ETA:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.eta}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={[styles.orderItems, { color: theme.colors.text.secondary }]}>
          {item.items} items
        </Text>
        <Text style={[styles.orderTotal, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
          ${item.total.toFixed(2)}
        </Text>
      </View>

      <View style={styles.orderActions}>
        <Button
          title="View Details"
          onPress={() => navigation.navigate('DeliveryPickup', { order: item })}
          variant="outline"
          style={styles.actionButton}
        />
        {item.status === 'scheduled' || item.status === 'in_transit' ? (
          <Button
            title="View on Map"
            onPress={() => {
              // Only navigate if order has coordinates
              if (item.coords) {
                navigation.navigate('RouteMap', {
                  route: {
                    routeId: item.route,
                    driver: item.driver,
                    stops: 1,
                    distance: '0 km',
                    orders: [item],
                  },
                });
              } else {
                // Show alert if no coordinates
                alert('This order does not have location coordinates yet.');
              }
            }}
            style={styles.actionButton}
            disabled={!item.coords}
          />
        ) : null}
      </View>
    </Card>
  );

  return (
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['all', 'pending', 'scheduled', 'in_transit', 'delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab
                      ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main)
                      : theme.colors.text.secondary,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { zIndex: 1 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No orders found"
            message={`No ${activeTab === 'all' ? '' : activeTab.replace('_', ' ')} orders available`}
          />
        }
      />
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
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    zIndex: 1,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  orderInfoRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  orderLabel: {
    fontSize: 13,
    width: 80,
  },
  orderValue: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItems: {
    fontSize: 13,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyIcon: {
    fontSize: 64,
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

export default OrdersScreen;
