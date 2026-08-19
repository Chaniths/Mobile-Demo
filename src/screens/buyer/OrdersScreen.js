import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useSelector } from 'react-redux';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import AppIcon from '../../components/common/AppIcon';
import { getBuyerOrders } from '../../api/ordersApi';
import { formatMoney, mapOrderTab, orderStatusLabel } from '../../utils/mediaUrl';
import { isFieldAdminRole, normalizeRole } from '../../utils/roles';

const statusColors = {
  delivered: '#22c55e',
  in_transit: '#3b82f6',
  processing: '#f59e0b',
  cancelled: '#ef4444',
};

const formatOrderDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' });
};

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const role = normalizeRole(user?.role);
  const isSeller = role === 'seller';
  const iconColor = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;
  const [activeTab, setActiveTab] = useState('all');
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
      setError(err?.response?.data?.message || 'Could not load orders.');
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

  const mappedOrders = useMemo(
    () =>
      orders.map((order) => {
        const tab = mapOrderTab(order.status);
        return {
          id: order.id,
          orderId: order.orderNumber ? `#${order.orderNumber}` : `#${String(order.id).slice(-8).toUpperCase()}`,
          date: formatOrderDate(order.placedAt || order.createdAt),
          status: tab,
          statusLabel: orderStatusLabel(order.status),
          items: Array.isArray(order.items) ? order.items.length : 0,
          total: Number(order.totalAmount) || 0,
        };
      }),
    [orders]
  );

  const filteredOrders = activeTab === 'all'
    ? mappedOrders
    : mappedOrders.filter((order) => order.status === activeTab);

  const renderOrder = ({ item }) => (
    <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.orderCard}>
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
            { backgroundColor: `${statusColors[item.status] || '#94a3b8'}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColors[item.status] || '#94a3b8' }]}>
            {item.statusLabel}
          </Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={[styles.orderInfo, { color: theme.colors.text.secondary }]}>
          {item.items} items
        </Text>
        <Text style={[styles.orderTotal, { color: iconColor }]}>
          {formatMoney(item.total)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          if (isSeller) {
            navigation.navigate('TruckTracking', { orderId: item.id });
          } else if (isFieldAdminRole(role)) {
            navigation.navigate('TrackOrder', { orderId: item.id });
          } else {
            navigation.navigate('TrackOrder', { orderId: item.id });
          }
        }}
        style={styles.trackButton}
      >
        <Text style={[styles.trackButtonText, { color: iconColor }]}>
          {isSeller ? 'Track Truck →' : 'Track Order →'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Orders</Text>
      </View>

      <View style={styles.tabs}>
        {['all', 'processing', 'in_transit', 'delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: iconColor,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? iconColor : theme.colors.text.secondary,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && orders.length === 0 ? (
        <ActivityIndicator color={iconColor} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { zIndex: 1 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<AppIcon name="orders" size={64} color={theme.colors.text.tertiary} />}
              title={error ? 'Could not load orders' : 'No orders found'}
              message={error || "You haven't placed any orders yet"}
              actionLabel="Browse Products"
              onAction={() => navigation.navigate('BrowseTab')}
            />
          }
        />
      )}
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
    paddingBottom: 40,
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
