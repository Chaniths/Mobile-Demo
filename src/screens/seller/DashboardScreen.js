import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
<<<<<<< HEAD
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  'Healthy':       { bg: '#22c55e20', text: '#22c55e' },
  'Low stock':     { bg: '#f59e0b20', text: '#f59e0b' },
  'Out of stock':  { bg: '#ef444420', text: '#ef4444' },
  'New arrival':   { bg: '#3b82f620', text: '#3b82f6' },
};

const STAT_ICONS = {
  'Orders today':    { icon: '📦', color: '#3b82f6' },
  'Revenue today':   { icon: '💰', color: '#22c55e' },
  'Active products': { icon: '🏪', color: '#f59e0b' },
  'Fulfillment SLA': { icon: '⭐', color: '#8b5cf6' },
};

const QUICK_ACTIONS = [
  { id: '1', title: 'Add Product',      icon: '➕', screen: 'AddProduct' },
  { id: '2', title: 'Manage Inventory', icon: '📊', screen: 'Inventory' },
  { id: '3', title: 'View Orders',      icon: '📋', screen: 'Orders' },
  { id: '4', title: 'Earnings',         icon: '💵', screen: 'Earnings' },
];

// ── Component ──────────────────────────────────────────────────────────────────
=======
import NotificationBell from '../../components/NotificationBell';
>>>>>>> c75df1e3d71a01e29e1da79f35c6a98420225705

const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { token } = useAuth();

  const [metrics, setMetrics]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);

  const fetchMetrics = useCallback(async () => {
  try {
    setError(null);
    console.log('🔵 Fetching from:', api.defaults.baseURL);
    const response = await api.get('/dashboard/seller/metrics');
    console.log('✅ Response:', response.data);
    setMetrics(response.data);
  } catch (err) {
    console.log('❌ Error:', JSON.stringify(err?.response ?? err?.message));
    setError(err?.response?.data?.message || 'Failed to load dashboard.');
    
  }
}, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMetrics();
  }, [fetchMetrics]);

  const stats = metrics
    ? [
        { id: '1', ...metrics.ordersToday,    ...STAT_ICONS['Orders today'] },
        { id: '2', ...metrics.revenueToday,   ...STAT_ICONS['Revenue today'] },
        { id: '3', ...metrics.activeProducts, ...STAT_ICONS['Active products'] },
        { id: '4', ...metrics.fulfillmentSLA, ...STAT_ICONS['Fulfillment SLA'] },
      ]
    : [];

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          Loading dashboard…
        </Text>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error && !metrics) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.colors.primary.main }]}
          onPress={() => { setLoading(true); fetchMetrics(); }}
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
              Seller Dashboard
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {metrics?.sellerName ?? 'My Store'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <NotificationBell />
    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
      <Avatar
        name={metrics?.sellerName ?? 'My Store'}
        size="medium"
        source={null}
        style={null}
      />
    </TouchableOpacity>
  </View>
</View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <Card
              key={stat.id}
              style={styles.statCard}
              onPress={() => {}}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Text style={styles.statIconText}>{stat.icon}</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                {stat.label}
              </Text>
              <Text style={[styles.statHelper, { color: theme.colors.text.tertiary }]}>
                {stat.helper}
              </Text>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Card
                key={action.id}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={[styles.actionTitle, { color: theme.colors.text.primary }]}>
                  {action.title}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Catalog Updates */}
        {metrics && metrics.recentProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Recent Catalog Updates
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
                <Text style={[styles.seeAll, { color: theme.colors.primary.main }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {metrics.recentProducts.map((product, index) => {
              const statusColor = STATUS_COLORS[product.status] ?? STATUS_COLORS['Healthy'];
              return (
                <Card
                  key={index}
                  style={styles.productCard}
                  onPress={() => {}}
                >
                  <View style={styles.productRow}>
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productThumb, styles.productThumbPlaceholder]}>
                        <Text style={{ fontSize: 20 }}>🥬</Text>
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text
                        style={[styles.productName, { color: theme.colors.text.primary }]}
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <Text style={[styles.productMeta, { color: theme.colors.text.secondary }]}>
                        {product.price}
                      </Text>
                      <Text style={[styles.productMeta, { color: theme.colors.text.tertiary }]}>
                        Stock: {product.stock}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {product.status}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scrollContent:{ paddingTop: 60, paddingBottom: 100 },

  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText:  { marginTop: 12, fontSize: 14 },
  errorIcon:    { fontSize: 40, marginBottom: 12 },
  errorText:    { fontSize: 15, textAlign: 'center', marginBottom: 20 },
  retryBtn:     { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting:     { fontSize: 14, marginBottom: 4 },
  userName:     { fontSize: 24, fontWeight: '700' },

  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 24 },
  statCard:     { width: '47%', margin: '1.5%', alignItems: 'center', paddingVertical: 20 },
  statIcon:     { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statIconText: { fontSize: 24 },
  statValue:    { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  statLabel:    { fontSize: 12, marginBottom: 2 },
  statHelper:   { fontSize: 11, marginTop: 2 },

  section:      { marginBottom: 24, paddingHorizontal: 20 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  seeAll:       { fontSize: 14, fontWeight: '600' },

  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  actionCard:   { width: '47%', margin: '1.5%', alignItems: 'center', paddingVertical: 20 },
  actionIcon:   { fontSize: 32, marginBottom: 8 },
  actionTitle:  { fontSize: 13, fontWeight: '600' },

  productCard:             { marginBottom: 12, padding: 12 },
  productRow:              { flexDirection: 'row', alignItems: 'center' },
  productThumb:            { width: 52, height: 52, borderRadius: 8, marginRight: 12 },
  productThumbPlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  productInfo:             { flex: 1 },
  productName:             { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  productMeta:             { fontSize: 12, marginBottom: 2 },
  statusBadge:             { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginLeft: 8 },
  statusText:              { fontSize: 11, fontWeight: '600' },
});

export default DashboardScreen;