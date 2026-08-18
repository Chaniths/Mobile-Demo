import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import NotificationBell from '../../components/NotificationBell';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // ── Pull real driver from Redux auth state ────────────────────────────────
  const user        = useSelector((state) => state.auth.user);
  const displayName = user?.name ?? 'Driver';
  const firstName   = displayName.split(' ')[0];

  const todayStats = [
    { id: '1', label: 'Deliveries', value: '12',  icon: '📦', color: '#3b82f6' },
    { id: '2', label: 'Completed',  value: '8',   icon: '✓',  color: '#22c55e' },
    { id: '3', label: 'Remaining',  value: '4',   icon: '⏰', color: '#f59e0b' },
    { id: '4', label: 'Earnings',   value: '$240', icon: '💰', color: '#8b5cf6' },
  ];

  const upcomingDeliveries = [
    { id: '1', orderId: '#ORD-001', customer: 'John Doe',   address: '123 Main St, Downtown', distance: '2.5 km', time: '10:30 AM', priority: 'high'   },
    { id: '2', orderId: '#ORD-002', customer: 'Jane Smith', address: '456 Oak Ave, Midtown',  distance: '4.2 km', time: '11:00 AM', priority: 'normal' },
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
              {getGreeting()}, {firstName}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {displayName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            {/* Avatar uses real driver name so initials are correct */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar name={displayName} size="medium" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Route Card */}
        <Card style={styles.activeRouteCard} elevation="lg">
          <View style={styles.routeHeader}>
            <Text style={[styles.routeTitle, { color: theme.colors.text.primary }]}>
              Active Route
            </Text>
            <View style={[styles.activeBadge, { backgroundColor: `${theme.colors.success}20` }]}>
              <View style={[styles.activeDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.activeText, { color: theme.colors.success }]}>In Progress</Text>
            </View>
          </View>
          <Text style={[styles.routeDetails, { color: theme.colors.text.secondary }]}>
            12 stops • 45.8 km • Est. 4h 20m
          </Text>
          <Button title="View Route Map" onPress={() => navigation.navigate('Route')} style={styles.routeButton} />
        </Card>

        {/* Today's Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Today's Performance
          </Text>
          <View style={styles.statsGrid}>
            {todayStats.map((stat) => (
              <Card key={stat.id} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Text style={styles.statIconText}>{stat.icon}</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Upcoming Deliveries */}
        <View style={styles.deliveriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Next Deliveries
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllDeliveries')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary.main }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingDeliveries.map((delivery) => (
            <Card
              key={delivery.id}
              style={styles.deliveryCard}
              onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: delivery.id })}
            >
              {delivery.priority === 'high' && (
                <View style={[styles.priorityStrip, { backgroundColor: theme.colors.error }]} />
              )}
              <View style={styles.deliveryHeader}>
                <View>
                  <Text style={[styles.orderNumber,  { color: theme.colors.text.primary }]}>{delivery.orderId}</Text>
                  <Text style={[styles.customerName, { color: theme.colors.text.secondary }]}>{delivery.customer}</Text>
                </View>
                <Text style={[styles.deliveryTime, { color: theme.colors.primary.main }]}>{delivery.time}</Text>
              </View>
              <View style={styles.deliveryDetails}>
                <Text style={[styles.deliveryIcon, { color: theme.colors.text.tertiary }]}>📍</Text>
                <Text style={[styles.address, { color: theme.colors.text.secondary }]}>{delivery.address}</Text>
              </View>
              <View style={styles.deliveryFooter}>
                <Text style={[styles.distance, { color: theme.colors.text.tertiary }]}>{delivery.distance} away</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Route')}>
                  <Text style={[styles.startButton, { color: theme.colors.primary.main }]}>Start →</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button title="Report Issue" onPress={() => navigation.navigate('ReportIssue')} variant="outline" style={styles.actionButton} />
          <Button title="Take Break"   onPress={() => {}}                                  variant="outline" style={styles.actionButton} />
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

  activeRouteCard: { marginHorizontal: 20, marginBottom: 24, padding: 20 },
  routeHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  routeTitle:      { fontSize: 18, fontWeight: '700' },
  activeBadge:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  activeDot:       { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  activeText:      { fontSize: 12, fontWeight: '600' },
  routeDetails:    { fontSize: 14, marginBottom: 16 },
  routeButton:     { marginTop: 8 },

  statsSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll:       { fontSize: 14, fontWeight: '600' },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  statCard:     { width: '47%', margin: '1.5%', alignItems: 'center', paddingVertical: 20 },
  statIcon:     { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statIconText: { fontSize: 24 },
  statValue:    { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  statLabel:    { fontSize: 13 },

  deliveriesSection: { paddingHorizontal: 20, marginBottom: 24 },
  deliveryCard:      { marginBottom: 12, padding: 16, position: 'relative', overflow: 'hidden' },
  priorityStrip:     { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  deliveryHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNumber:       { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  customerName:      { fontSize: 14 },
  deliveryTime:      { fontSize: 14, fontWeight: '600' },
  deliveryDetails:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  deliveryIcon:      { fontSize: 16, marginRight: 8 },
  address:           { flex: 1, fontSize: 14, lineHeight: 20 },
  deliveryFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distance:          { fontSize: 13 },
  startButton:       { fontSize: 14, fontWeight: '600' },

  quickActions: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24 },
  actionButton: { flex: 1, marginHorizontal: 4 },
});

export default HomeScreen;