import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

const mockOrders = [
  {
    id: '1',
    orderId: '#ORD-2024-001',
    date: 'Dec 3, 2024',
    status: 'delivered',
    items: 3,
    total: 18.97,
  },
  {
    id: '2',
    orderId: '#ORD-2024-002',
    date: 'Dec 4, 2024',
    status: 'in_transit',
    items: 2,
    total: 12.98,
  },
  {
    id: '3',
    orderId: '#ORD-2024-003',
    date: 'Dec 5, 2024',
    status: 'processing',
    items: 4,
    total: 24.96,
  },
];

const statusColors = {
  delivered: '#22c55e',
  in_transit: '#3b82f6',
  processing: '#f59e0b',
  cancelled: '#ef4444',
};

const statusLabels = {
  delivered: 'Delivered',
  in_transit: 'In Transit',
  processing: 'Processing',
  cancelled: 'Cancelled',
};

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = activeTab === 'all'
    ? mockOrders
    : mockOrders.filter((order) => order.status === activeTab);

  const renderOrder = ({ item }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
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
      <View style={styles.orderDetails}>
        <Text style={[styles.orderInfo, { color: theme.colors.text.secondary }]}>
          {item.items} items
        </Text>
        <Text style={[styles.orderTotal, { color: theme.colors.primary.main }]}>
          ${item.total.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('TrackOrder', { orderId: item.id })}
        style={styles.trackButton}
      >
        <Text style={[styles.trackButtonText, { color: theme.colors.primary.main }]}>
          Track Order →
        </Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['all', 'processing', 'in_transit', 'delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: theme.colors.primary.main,
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
                      ? theme.colors.primary.main
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
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No orders found"
            message="You haven't placed any orders yet"
            actionLabel="Browse Products"
            onAction={() => navigation.navigate('BrowseTab')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    fontSize: 13,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  trackButton: {
    alignSelf: 'flex-start',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 64,
  },
});

export default OrdersScreen;

