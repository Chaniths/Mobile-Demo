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
import { getBuyerOrders } from '../../api/ordersApi';
import { formatMoney, mapOrderTab } from '../../utils/mediaUrl';

const plannerStatusColors = {
  'On the way': { bg: 'rgba(34,197,94,0.18)', fg: '#22c55e' },
  Processing: { bg: 'rgba(251,191,36,0.28)', fg: '#fbbf24' },
  Scheduled: { bg: 'rgba(251,191,36,0.28)', fg: '#fbbf24' },
};

const isOpenStatus = (status) => {
  const tab = mapOrderTab(status);
  return tab === 'processing' || tab === 'in_transit';
};

const formatWindow = (order) => {
  const slot = String(order.deliveryTimeSlot || '').toLowerCase();
  const date = new Date(order.placedAt || order.createdAt);
  const when = Number.isNaN(date.getTime())
    ? 'Upcoming'
    : date.toLocaleDateString('en-LK', { weekday: 'short', month: 'short', day: 'numeric' });
  const slotLabel = slot ? slot.charAt(0).toUpperCase() + slot.slice(1) : 'Delivery';
  return `${when} · ${slotLabel}`;
};

const AnalyticsScreen = () => {
  const { theme } = useTheme();
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
      setError(err?.response?.data?.message || 'Could not load analytics.');
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

  const stats = useMemo(() => {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthOrders = orders.filter((order) => {
      const t = new Date(order.placedAt || order.createdAt).getTime();
      return Number.isFinite(t) && t >= monthAgo;
    });
    const monthTotal = monthOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    const avgOrder = monthOrders.length ? monthTotal / monthOrders.length : 0;
    const openOrders = orders.filter((order) => isOpenStatus(order.status)).length;
    const completed7d = orders.filter((order) => {
      const t = new Date(order.placedAt || order.createdAt).getTime();
      return mapOrderTab(order.status) === 'delivered' && Number.isFinite(t) && t >= weekAgo;
    }).length;
    const vendorIds = new Set();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item.sellerId) vendorIds.add(item.sellerId);
      });
    });
    return {
      monthTotal,
      avgOrder,
      openOrders,
      completed7d,
      favVendors: vendorIds.size,
    };
  }, [orders]);

  const deliveryPlanner = useMemo(
    () =>
      orders
        .filter((order) => isOpenStatus(order.status))
        .slice(0, 5)
        .map((order) => ({
          id: order.id,
          window: formatWindow(order),
          desc: `${order.deliveryAddress || 'Saved address'} · ${order.orderNumber ? `#${order.orderNumber}` : `#${String(order.id).slice(-6)}`}`,
          status: mapOrderTab(order.status) === 'in_transit' ? 'On the way' : 'Processing',
        })),
    [orders]
  );

  const recentPurchases = useMemo(() => {
    const rows = [];
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        rows.push({
          id: item.id || `${order.id}-${item.productId}`,
          name: item.product?.name || 'Product',
          qty: `${item.quantity} ${item.product?.unit || ''}`.trim(),
          price: formatMoney(item.totalPrice ?? item.unitPrice * item.quantity),
          date: new Date(order.placedAt || order.createdAt).toLocaleString('en-LK', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
        });
      });
    });
    return rows.slice(0, 8);
  }, [orders]);

  const trendingProducts = useMemo(() => {
    const counts = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.product?.name || 'Product';
        if (!counts[name]) counts[name] = { name, qty: 0, spend: 0 };
        counts[name].qty += Number(item.quantity) || 0;
        counts[name].spend += Number(item.totalPrice) || 0;
      });
    });
    const colors = ['#22c55e', '#f59e0b', '#38bdf8', '#a78bfa'];
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4)
      .map((item, index) => ({
        id: item.name,
        name: item.name,
        stat: `${item.qty} ordered`,
        price: formatMoney(item.spend),
        color: colors[index % colors.length],
        width: Math.min(100, 30 + item.qty * 8),
      }));
  }, [orders]);

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
          Buyer Analytics
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Track your buying patterns, deliveries, and top picks from live orders.
        </Text>

        {loading && orders.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 24 }} />
        ) : error && orders.length === 0 ? (
          <Text style={{ color: theme.colors.text.secondary }}>{error}</Text>
        ) : (
          <>
            <View style={styles.row}>
              <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={[styles.metricCard, styles.tintGreen, { flex: 1 }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Spend (30D)</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>
                  {formatMoney(stats.monthTotal)}
                </Text>
                <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>
                  Avg: {formatMoney(stats.avgOrder)} / order
                </Text>
              </Card>
              <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={[styles.metricCard, styles.tintTeal, { flex: 1 }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Open Orders</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>{stats.openOrders}</Text>
                <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>Awaiting delivery</Text>
              </Card>
            </View>

            <View style={styles.row}>
              <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={[styles.metricCard, styles.tintAmber, { flex: 1 }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Completed (7D)</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>{stats.completed7d}</Text>
                <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>Delivered recently</Text>
              </Card>
              <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={[styles.metricCard, styles.tintIndigo, { flex: 1 }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Vendors</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>{stats.favVendors}</Text>
                <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>Sellers in your orders</Text>
              </Card>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Delivery Planner</Text>
            {deliveryPlanner.length === 0 ? (
              <Text style={{ color: theme.colors.text.secondary, marginBottom: 8 }}>No open deliveries.</Text>
            ) : (
              deliveryPlanner.map((item) => (
                <Card variant={theme.isDarkMode ? 'glass' : 'default'} key={item.id} style={styles.listCard}>
                  <Text style={[styles.listTitle, { color: theme.colors.text.primary }]}>{item.window}</Text>
                  <Text style={[styles.listDesc, { color: theme.colors.text.secondary }]}>{item.desc}</Text>
                  <Text
                    style={[
                      styles.chip,
                      {
                        color: (plannerStatusColors[item.status] || {}).fg || theme.colors.primary.main,
                        backgroundColor: (plannerStatusColors[item.status] || {}).bg || `${theme.colors.status.processing}`,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </Card>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Recent Products</Text>
            {recentPurchases.length === 0 ? (
              <Text style={{ color: theme.colors.text.secondary }}>No purchases yet.</Text>
            ) : (
              recentPurchases.map((item) => (
                <Card variant={theme.isDarkMode ? 'glass' : 'default'} key={item.id} style={styles.listCard}>
                  <Text style={[styles.listTitle, { color: theme.colors.text.primary }]}>{item.name}</Text>
                  <Text style={[styles.listDesc, { color: theme.colors.text.secondary }]}>{item.qty} · {item.price}</Text>
                  <Text style={[styles.listMeta, { color: theme.colors.text.tertiary }]}>{item.date}</Text>
                </Card>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Most ordered</Text>
            {trendingProducts.map((item) => (
              <Card variant={theme.isDarkMode ? 'glass' : 'default'} key={item.id} style={styles.listCard}>
                <View style={styles.trendRow}>
                  <Text style={[styles.listTitle, { color: theme.colors.text.primary }]}>{item.name}</Text>
                  <Text style={[styles.trendBadge, { backgroundColor: `${item.color}33`, color: item.color }]}>
                    {item.stat}
                  </Text>
                </View>
                <Text style={[styles.listDesc, { color: theme.colors.text.secondary }]}>{item.price}</Text>
                <View style={styles.chartBar}>
                  <View style={[styles.chartBarFill, { width: `${item.width}%`, backgroundColor: item.color }]} />
                </View>
              </Card>
            ))}
          </>
        )}
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    padding: 16,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSub: {
    fontSize: 12,
  },
  listCard: {
    marginBottom: 10,
    padding: 14,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  listDesc: {
    fontSize: 14,
  },
  listMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  chartBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 10,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  tintGreen: { backgroundColor: 'rgba(34,197,94,0.60)' },
  tintTeal: { backgroundColor: 'rgba(45,212,191,0.60)' },
  tintAmber: { backgroundColor: 'rgba(251,191,36,0.50)' },
  tintIndigo: { backgroundColor: 'rgba(99,102,241,0.50)' },
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

export default AnalyticsScreen;
