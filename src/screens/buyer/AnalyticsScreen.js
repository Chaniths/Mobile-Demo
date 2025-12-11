import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';

const recentPurchases = [
  { id: 'rp1', name: 'Heirloom Tomatoes', qty: '3 kg', price: 'Rs. 1,440', date: 'Today, 10:15 AM' },
  { id: 'rp2', name: 'Organic Spinach', qty: '5 bunches', price: 'Rs. 1,600', date: 'Yesterday, 6:40 PM' },
  { id: 'rp3', name: 'Raw Honey', qty: '2 jars', price: 'Rs. 1,780', date: 'Mon, 3:10 PM' },
];

const trendingProducts = [
  { id: 'tp1', name: 'King Coconut', stat: '+42% WoW', price: 'Rs. 180 / pc', color: '#22c55e' },
  { id: 'tp2', name: 'Mango (Keitt)', stat: '+28% WoW', price: 'Rs. 320 / kg', color: '#f59e0b' },
  { id: 'tp3', name: 'Avocado', stat: '+19% WoW', price: 'Rs. 460 / kg', color: '#38bdf8' },
];

const deliveryPlanner = [
  { id: 'dp1', window: 'Today · 02:30 PM - 03:30 PM', desc: 'Green Market · Order #FR-1042', status: 'On the way' },
  { id: 'dp2', window: 'Tomorrow · 08:30 AM', desc: 'Weekly fruit box · Fresh Basket', status: 'Scheduled' },
  { id: 'dp3', window: 'Thu · 05:00 PM', desc: 'Office pantry restock · Urban Farms', status: 'Scheduled' },
];

const plannerStatusColors = {
  'On the way': { bg: 'rgba(34,197,94,0.18)', fg: '#22c55e' }, // green
  Scheduled: { bg: 'rgba(251,191,36,0.28)', fg: '#fbbf24' }, // amber/yellow
};

const spendSummary = {
  monthTotal: 'Rs. 42,300',
  avgOrder: 'Rs. 1,410 / order',
  openOrders: 2,
  completed7d: 8,
  favVendors: 5,
};

const AnalyticsScreen = () => {
  const { theme } = useTheme();

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Buyer Analytics
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Track your buying patterns, deliveries, and top picks.
        </Text>

        {/* Spend & KPIs */}
        <View style={styles.row}>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={[styles.metricCard, styles.tintGreen, { flex: 1 }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Spend (30D)</Text>
            <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>{spendSummary.monthTotal}</Text>
            <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>Avg: {spendSummary.avgOrder}</Text>
          </Card>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={[styles.metricCard, styles.tintTeal, { flex: 1 }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Open Orders</Text>
            <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>{spendSummary.openOrders}</Text>
            <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>Awaiting rider</Text>
          </Card>
        </View>

        <View style={styles.row}>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={[styles.metricCard, styles.tintAmber, { flex: 1 }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Completed (7D)</Text>
            <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>{spendSummary.completed7d}</Text>
            <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>+3 vs last week</Text>
          </Card>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={[styles.metricCard, styles.tintIndigo, { flex: 1 }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.text.secondary }]}>Favorite Vendors</Text>
            <Text style={[styles.metricValue, { color: theme.colors.text.highlight }]}>{spendSummary.favVendors}</Text>
            <Text style={[styles.metricSub, { color: theme.colors.text.secondary }]}>Pinned vendors</Text>
          </Card>
        </View>

        {/* Live Delivery Planner */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Delivery Planner</Text>
        {deliveryPlanner.map((item) => (
          <Card variant={theme.isDarkMode ? "glass" : "default"} key={item.id} style={styles.listCard}>
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
        ))}

        {/* Recent Products */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Recent Products</Text>
        {recentPurchases.map((item) => (
          <Card variant={theme.isDarkMode ? "glass" : "default"} key={item.id} style={styles.listCard}>
            <Text style={[styles.listTitle, { color: theme.colors.text.primary }]}>{item.name}</Text>
            <Text style={[styles.listDesc, { color: theme.colors.text.secondary }]}>{item.qty} · {item.price}</Text>
            <Text style={[styles.listMeta, { color: theme.colors.text.tertiary }]}>{item.date}</Text>
          </Card>
        ))}

        {/* Trending Products with mini chart bars */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Trending Products</Text>
        {trendingProducts.map((item) => (
          <Card variant={theme.isDarkMode ? "glass" : "default"} key={item.id} style={styles.listCard}>
            <View style={styles.trendRow}>
              <Text style={[styles.listTitle, { color: theme.colors.text.primary }]}>{item.name}</Text>
              <Text style={[styles.trendBadge, { backgroundColor: `${item.color}33`, color: item.color }]}>
                {item.stat}
              </Text>
            </View>
            <Text style={[styles.listDesc, { color: theme.colors.text.secondary }]}>{item.price}</Text>
            <View style={styles.chartBar}>
              <View style={[styles.chartBarFill, { width: item.stat.replace('% WoW', '').replace('+', '') + '%', backgroundColor: item.color }]} />
            </View>
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
  },
  trend: {
    fontSize: 12,
    marginTop: 6,
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

export default AnalyticsScreen;

