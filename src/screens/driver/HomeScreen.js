import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { DRIVER_DELIVERIES } from './deliveriesData';
import AppIcon from '../../components/common/AppIcon';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const todayStats = [
    { id: '1', label: 'Deliveries', value: '12', icon: 'orders', color: '#3b82f6' },
    { id: '2', label: 'Completed', value: '8', icon: 'check', color: '#22c55e' },
    { id: '3', label: 'Remaining', value: '4', icon: 'time', color: '#f59e0b' },
    { id: '4', label: 'Earnings', value: '$240', icon: 'cash', color: '#8b5cf6' },
  ];

  const upcomingDeliveries = DRIVER_DELIVERIES;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
              Good Morning
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              Driver Mike
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar name="Mike" size="medium" />
          </TouchableOpacity>
        </View>

        {/* Active Route Card */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.activeRouteCard} elevation="lg">
          <View style={styles.routeHeader}>
            <Text style={[styles.routeTitle, { color: theme.colors.text.primary }]}>
              Active Route
            </Text>
            <View style={[styles.activeBadge, { backgroundColor: `${theme.colors.success}20` }]}>
              <View style={[styles.activeDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.activeText, { color: theme.colors.success }]}>
                In Progress
              </Text>
            </View>
          </View>
          <Text style={[styles.routeDetails, { color: theme.colors.text.secondary }]}>
            12 stops • 45.8 km • Est. 4h 20m
          </Text>
          <Button
            title="View Route Map"
            onPress={() => navigation.navigate('Route')}
            style={styles.routeButton}
          />
        </Card>

        {/* Today's Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Today's Performance
          </Text>
          <View style={styles.statsGrid}>
            {todayStats.map((stat) => (
              <Card variant={theme.isDarkMode ? "glass" : "default"} key={stat.id} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <AppIcon name={stat.icon} size={22} color={stat.color} />
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
        </View>

        {/* Upcoming Deliveries */}
        <View style={styles.deliveriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Next Deliveries
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllDeliveries')}>
              <Text style={[styles.seeAll, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {upcomingDeliveries.map((delivery, index) => (
            <Card
              variant={theme.isDarkMode ? "glass" : "default"}
              key={delivery.id}
              style={styles.deliveryCard}
              onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: delivery.id })}
            >
              {delivery.priority === 'high' && (
                <View style={[styles.priorityStrip, { backgroundColor: theme.colors.error }]} />
              )}
              <View style={styles.deliveryHeader}>
                <View>
                  <Text style={[styles.orderNumber, { color: theme.colors.text.primary }]}>
                    {delivery.orderId}
                  </Text>
                  <Text style={[styles.customerName, { color: theme.colors.text.secondary }]}>
                    {delivery.customer}
                  </Text>
                </View>
                <Text style={[styles.deliveryTime, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                  {delivery.time}
                </Text>
              </View>
              <View style={styles.deliveryDetails}>
                <AppIcon name="location" size={16} color={theme.colors.text.tertiary} />
                <Text style={[styles.address, { color: theme.colors.text.secondary }]}>
                  {delivery.address}
                </Text>
              </View>
              <View style={styles.deliveryFooter}>
                <Text style={[styles.distance, { color: theme.colors.text.tertiary }]}>
                  {delivery.distance} away
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Route')}>
                  <Text style={[styles.startButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                    Start →
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Report Issue"
            onPress={() => navigation.navigate('ReportIssue')}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Take Break"
            onPress={() => {}}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
    zIndex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  activeRouteCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeDetails: {
    fontSize: 14,
    marginBottom: 16,
  },
  routeButton: {
    marginTop: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  deliveriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  deliveryCard: {
    marginBottom: 12,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  priorityStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
  },
  deliveryTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 13,
  },
  startButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
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

export default HomeScreen;

