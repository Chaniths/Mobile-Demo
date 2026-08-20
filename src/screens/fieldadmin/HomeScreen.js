import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import fieldAdminApi from '../../api/fieldAdminApi';
import AppIcon from '../../components/common/AppIcon';
import { selectCurrentRouteHandoffs, isCurrentBatchOrder } from '../../utils/fieldAdminRoutes';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const authUser = useSelector((state) => state.auth.user);
  const [overview, setOverview] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [inTransitCount, setInTransitCount] = useState(0);
  // null means "not computed yet" so the tile can fall back to the overview count.
  const [routesTodayCount, setRoutesTodayCount] = useState(null);

  const [loadError, setLoadError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadData = async () => {
        setLoadError('');
        try {
          const overviewData = await fieldAdminApi.getDashboardOverview();
          if (!cancelled) setOverview(overviewData);
        } catch (error) {
          console.error('Failed to load field admin overview:', error?.message || error);
          if (!cancelled) setLoadError(error?.response?.data?.message || error?.message || 'Failed to load dashboard');
        }

        try {
          const [inTransitOrders, deliveredOrders] = await Promise.all([
            fieldAdminApi.getOrdersByTab('in_transit'),
            fieldAdminApi.getOrdersByTab('delivered'),
          ]);
          if (cancelled) return;
          const inTransit = Array.isArray(inTransitOrders) ? inTransitOrders : [];
          const delivered = Array.isArray(deliveredOrders) ? deliveredOrders : [];
          setInTransitCount(inTransit.length);
          const mappedCompleted = delivered
            .filter((order) => {
              const status = String(order.status ?? '').toUpperCase();
              if (status !== 'DELIVERED' && status !== 'COMPLETED') return false;
              return isCurrentBatchOrder(order);
            })
            .slice(0, 6)
            .map((order) => ({
              id: order.id,
              type: 'COMPLETED',
              orderId: order.orderNumber ? `#${order.orderNumber}` : '#ORDER',
              customer: order.customer || null,
              address: order.address || null,
              route: order.route?.routeNumber || null,
              items: order.totalAmount ? `Total: LKR ${order.totalAmount}` : null,
              status: order.status,
            }));
          setPendingTasks(mappedCompleted);
        } catch (error) {
          console.error('Failed to load field admin orders:', error?.message || error);
        }

        try {
          // Counted from the same handoffs the Route Orders screen lists, so the tile
          // always equals the number of route cards the field admin can actually open.
          const handoffs = await fieldAdminApi.getRouteHandoffs();
          if (cancelled) return;
          setRoutesTodayCount(selectCurrentRouteHandoffs(handoffs).length);
        } catch (error) {
          console.error('Failed to load field admin routes:', error?.message || error);
        }
      };

      loadData();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const todayStats = useMemo(
    () => [
      { id: '1', label: 'Orders Assigned', value: String(overview?.assignedOrders ?? 0), icon: 'orders', color: '#3b82f6' },
      { id: '2', label: 'Assessments', value: String(overview?.assessments ?? 0), icon: 'check', color: '#22c55e' },
      { id: '3', label: 'In Transit', value: String(inTransitCount), icon: 'truck', color: '#f59e0b' },
      {
        id: '4',
        label: 'Routes Today',
        value: String(routesTodayCount ?? overview?.routesToday ?? 0),
        icon: 'clipboard',
        color: '#8b5cf6',
      },
    ],
    [overview, inTransitCount, routesTodayCount]
  );

  const quickActions = [
    {
      id: '1',
      title: 'Confirm Quality',
      subtitle: 'Start here for pickup quality checks',
      icon: 'check',
      color: '#22c55e',
      screen: 'QualityConfirm',
    },
    {
      id: '4',
      title: 'Assessments',
      subtitle: 'Rate drivers, buyers, sellers',
      icon: 'clipboard',
      color: '#8b5cf6',
      screen: 'Assessment',
    },
    {
      id: '8',
      title: 'Truck Capacity',
      subtitle: 'Adjust vehicle capacity',
      icon: 'truck',
      color: '#6366f1',
      screen: 'TruckCapacity',
    },
  ];

  const displayName =
    authUser?.name ||
    authUser?.fullName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    'Field Admin';

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
              Good Morning
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {displayName}
            </Text>
            {!!loadError && (
              <Text style={[styles.greeting, { color: theme.colors.error || '#f87171', marginTop: 6 }]}>
                {loadError}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar name="Admin" size="medium" />
          </TouchableOpacity>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Today's Overview
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

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => navigation.navigate(action.screen)}
                style={styles.actionItem}
              >
                <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.actionCard}>
                  <View style={styles.actionTopRow}>
                    <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                      <AppIcon name={action.icon} size={22} color={action.color} />
                    </View>
                    <Text style={[styles.actionArrow, { color: action.color }]}>→</Text>
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text
                      style={[styles.actionTitle, { color: theme.colors.text.primary }]}
                      numberOfLines={2}
                    >
                      {action.title}
                    </Text>
                    <Text style={[styles.actionSubtitle, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                      {action.subtitle}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Completed Orders */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Completed Orders
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
              <Text style={[styles.viewAll, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {pendingTasks.length === 0 ? (
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.taskCard}>
              <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>
                No completed orders yet.
              </Text>
            </Card>
          ) : null}
          {pendingTasks.map((task) => (
            <Card variant={theme.isDarkMode ? "glass" : "default"} key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskType, { color: theme.colors.text.secondary }]}>
                    {task.type}
                  </Text>
                  <Text style={[styles.taskOrderId, { color: theme.colors.text.primary }]}>
                    {task.orderId}
                  </Text>
                </View>
              </View>
              <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>
                {task.customer || task.driver}
                {task.address && ` • ${task.address}`}
                {task.route && ` • ${task.route}`}
                {task.items && ` • ${task.items}`}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
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
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 12,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    width: '48%',
  },
  actionCard: {
    minHeight: 122,
    padding: 12,
    borderRadius: 14,
  },
  actionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  tasksSection: {
    marginBottom: 24,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
  },
  taskType: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  taskOrderId: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskDetail: {
    fontSize: 13,
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

