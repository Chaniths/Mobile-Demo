import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

// ── Constants ──────────────────────────────────────────────────────────────────

// Backend statuses: PENDING, CONFIRMED, PREPARING, READY, IN_TRANSIT, DELIVERED, CANCELLED
const STATUS_COLORS = {
  PENDING:    '#f59e0b',
  CONFIRMED:  '#3b82f6',
  PREPARING:  '#8b5cf6',
  READY:      '#06b6d4',
  IN_TRANSIT: '#3b82f6',
  DELIVERED:  '#22c55e',
  CANCELLED:  '#ef4444',
};

const STATUS_LABELS = {
  PENDING:    'Pending',
  CONFIRMED:  'Confirmed',
  PREPARING:  'Preparing',
  READY:      'Ready',
  IN_TRANSIT: 'In Transit',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
};

const TABS = [
  { key: 'all',        label: 'All' },
  { key: 'PENDING',    label: 'Pending' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'DELIVERED',  label: 'Delivered' },
  { key: 'CANCELLED',  label: 'Cancelled' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Component ──────────────────────────────────────────────────────────────────

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  const [activeTab, setActiveTab]   = useState('all');

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      // GET /api/v1/orders — returns buyer's orders sorted by date desc
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchOrders);
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  // ── Filter by tab ─────────────────────────────────────────────────────────────

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  // ── Render order card ─────────────────────────────────────────────────────────

  const renderOrder = ({ item }) => {
    const color = STATUS_COLORS[item.status] ?? '#6b7280';
    const label = STATUS_LABELS[item.status] ?? item.status;
    const itemCount = item.items?.length ?? 0;

    return (
      <Card
        style={styles.orderCard}
        onPress={() => navigation.navigate('TrackOrder', { orderId: item.id })}
      >
        {/* Header row */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
              #{item.orderNumber}
            </Text>
            <Text style={[styles.orderDate, { color: theme.colors.text.secondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.statusText, { color }]}>{label}</Text>
          </View>
        </View>

        {/* Items preview */}
        {item.items && item.items.length > 0 && (
          <View style={styles.itemsPreview}>
            {item.items.slice(0, 2).map((orderItem, idx) => (
              <Text
                key={idx}
                style={[styles.itemPreviewText, { color: theme.colors.text.secondary }]}
                numberOfLines={1}
              >
                • {orderItem.product?.name} × {orderItem.quantity} {orderItem.product?.unit}
              </Text>
            ))}
            {item.items.length > 2 && (
              <Text style={[styles.itemPreviewText, { color: theme.colors.text.tertiary }]}>
                +{item.items.length - 2} more
              </Text>
            )}
          </View>
        )}

        {/* Footer row */}
        <View style={styles.orderFooter}>
          <Text style={[styles.orderInfo, { color: theme.colors.text.secondary }]}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.orderTotal, { color: theme.colors.primary.main }]}>
            Rs. {(item.totalAmount ?? 0).toFixed(2)}
          </Text>
        </View>

        {/* Track button — only for active orders */}
        {item.status !== 'DELIVERED' && item.status !== 'CANCELLED' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('TrackOrder', { orderId: item.id })}
            style={styles.trackButton}
          >
            <Text style={[styles.trackButtonText, { color: theme.colors.primary.main }]}>
              Track Order →
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Orders</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading orders…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  if (error && orders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Orders</Text>
        </View>
        <View style={styles.centered}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={[{ fontSize: 15, textAlign: 'center', marginBottom: 20 }, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary.main }]}
            onPress={() => { setLoading(true); fetchOrders(); }}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Orders</Text>
        {orders.length > 0 && (
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && {
                borderBottomColor: theme.colors.primary.main,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                },
              ]}
            >
              {tab.label}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No orders found"
            message={
              activeTab === 'all'
                ? "You haven't placed any orders yet"
                : `No ${STATUS_LABELS[activeTab] ?? activeTab} orders`
            }
            actionLabel="Browse Products"
            onAction={() => navigation.navigate('BrowseTab')}
            style={undefined}
          />
        }
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1 },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  retryBtn:    { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  retryBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  header:   { padding: 20, paddingBottom: 4 },
  title:    { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },

  tabs:    { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  tab:     { paddingVertical: 12, paddingHorizontal: 8, marginRight: 12 },
  tabText: { fontSize: 13, fontWeight: '600' },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  orderCard:   { marginBottom: 12, padding: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId:     { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  orderDate:   { fontSize: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText:  { fontSize: 11, fontWeight: '600' },

  itemsPreview:    { marginBottom: 10 },
  itemPreviewText: { fontSize: 12, marginBottom: 2 },

  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderInfo:   { fontSize: 13 },
  orderTotal:  { fontSize: 18, fontWeight: '700' },

  trackButton:     { alignSelf: 'flex-start' },
  trackButtonText: { fontSize: 13, fontWeight: '600' },

  emptyIcon: { fontSize: 64 },
});

export default OrdersScreen;