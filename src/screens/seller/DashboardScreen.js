import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import NotificationBell from '../../components/NotificationBell';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // ── Pull real seller from Redux auth state ────────────────────────────────
  const user = useSelector((state) => state.auth.user);
  const businessName = user?.businessName ?? user?.name ?? 'My Store';
  const ownerName    = user?.ownerName    ?? user?.name ?? 'Seller';

  const stats = [
    { id: '1', label: 'Total Sales',  value: '$2,450', icon: '💰', color: '#22c55e' },
    { id: '2', label: 'Orders',       value: '45',     icon: '📦', color: '#3b82f6' },
    { id: '3', label: 'Products',     value: '23',     icon: '🏪', color: '#f59e0b' },
    { id: '4', label: 'Rating',       value: '4.8',    icon: '⭐', color: '#8b5cf6' },
  ];

  const recentOrders = [
    { id: '1', orderId: '#ORD-001', customer: 'John Doe',    items: 3, total: 45.99, status: 'pending'   },
    { id: '2', orderId: '#ORD-002', customer: 'Jane Smith',  items: 2, total: 32.50, status: 'confirmed' },
    { id: '3', orderId: '#ORD-003', customer: 'Bob Johnson', items: 1, total: 18.75, status: 'pending'   },
  ];

  const quickActions = [
    { id: '1', title: 'Add Product',       icon: '➕', screen: 'AddProduct'  },
    { id: '2', title: 'Manage Inventory',  icon: '📊', screen: 'Inventory'   },
    { id: '3', title: 'View Orders',       icon: '📋', screen: 'Orders'      },
    { id: '4', title: 'Earnings',          icon: '💵', screen: 'Earnings'    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
              {getGreeting()}, {ownerName.split(' ')[0]}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {businessName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            {/* Avatar uses businessName so initials match the store */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar name={businessName} size="medium" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <Card key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Text style={styles.statIconText}>{stat.icon}</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                {stat.label}
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
            {quickActions.map((action) => (
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

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Recent Orders
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary.main }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map((order) => (
            <Card
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
                    {order.orderId}
                  </Text>
                  <Text style={[styles.customerName, { color: theme.colors.text.secondary }]}>
                    {order.customer}
                  </Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: order.status === 'confirmed'
                    ? `${theme.colors.success}20`
                    : `${theme.colors.warning}20`,
                }]}>
                  <Text style={[styles.statusText, {
                    color: order.status === 'confirmed'
                      ? theme.colors.success
                      : theme.colors.warning,
                  }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <Text style={[styles.orderItems, { color: theme.colors.text.tertiary }]}>
                  {order.items} items
                </Text>
                <Text style={[styles.orderTotal, { color: theme.colors.primary.main }]}>
                  ${order.total.toFixed(2)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1 },
  scrollView:    { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 100 },

  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 14, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 24 },
  statCard:  { width: '47%', margin: '1.5%', alignItems: 'center', paddingVertical: 20 },
  statIcon:  { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statIconText: { fontSize: 24 },
  statValue: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 13 },

  section:       { marginBottom: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:  { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  seeAll:        { fontSize: 14, fontWeight: '600' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  actionCard:  { width: '47%', margin: '1.5%', alignItems: 'center', paddingVertical: 20 },
  actionIcon:  { fontSize: 32, marginBottom: 8 },
  actionTitle: { fontSize: 13, fontWeight: '600' },

  orderCard:    { marginBottom: 12, padding: 16 },
  orderHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId:      { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  customerName: { fontSize: 13 },
  statusBadge:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText:   { fontSize: 12, fontWeight: '600' },
  orderFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderItems:   { fontSize: 13 },
  orderTotal:   { fontSize: 18, fontWeight: '700' },
});

export default DashboardScreen;