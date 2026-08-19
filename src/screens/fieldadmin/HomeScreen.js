import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import fieldAdminApi from '../../api/fieldAdminApi';
import AppIcon from '../../components/common/AppIcon';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const authUser = useSelector((state) => state.auth.user);
  const [overview, setOverview] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [latestAggregationRun, setLatestAggregationRun] = useState(null);
  const [inTransitCount, setInTransitCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewData, inTransitOrders, scheduledOrders] = await Promise.all([
          fieldAdminApi.getDashboardOverview(),
          fieldAdminApi.getOrdersByTab('in_transit'),
          fieldAdminApi.getOrdersByTab('scheduled'),
        ]);
        setOverview(overviewData);
        setInTransitCount(inTransitOrders?.length ?? 0);
        const mergedOrders = [...(inTransitOrders ?? []), ...(scheduledOrders ?? [])];
        const dedupedOrders = mergedOrders.filter(
          (order, index, array) => array.findIndex((entry) => entry.id === order.id) === index
        );
        const mappedPending = dedupedOrders
          .filter((order) => order.status !== 'DELIVERED')
          .slice(0, 6)
          .map((order) => ({
            id: order.id,
            type: 'DELIVERY',
            orderId: order.orderNumber ? `#${order.orderNumber}` : '#TASK',
            customer: order.customer || null,
            address: order.address || null,
            route: order.route?.routeNumber || null,
            items: order.totalAmount ? `Total: ${order.totalAmount}` : null,
            priority: order.status === 'IN_TRANSIT' ? 'high' : 'normal',
            status: order.status,
          }));
        setPendingTasks(mappedPending);
        const runs = await fieldAdminApi.getAggregationRuns(1);
        setLatestAggregationRun(runs?.[0] ?? null);
      } catch (error) {
        console.error('Failed to load field admin dashboard:', error?.message || error);
      }
    };
    loadData();
  }, []);

  const todayStats = useMemo(
    () => [
      { id: '1', label: 'Orders Assigned', value: String(overview?.assignedOrders ?? 0), icon: 'orders', color: '#3b82f6' },
      { id: '2', label: 'Assessments', value: String(overview?.assessments ?? 0), icon: 'check', color: '#22c55e' },
      { id: '3', label: 'In Transit', value: String(inTransitCount), icon: 'truck', color: '#f59e0b' },
      { id: '4', label: 'Routes Today', value: String(overview?.routesToday ?? 0), icon: 'map', color: '#8b5cf6' },
    ],
    [overview, inTransitCount]
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
      id: '3',
      title: 'Mark Delivery',
      subtitle: 'Complete order handover',
      icon: 'orders',
      color: '#3b82f6',
      screen: 'DeliveryPickup',
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

  const teal = theme.colors.primary?.main || '#14b8a6';

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

        {/* Pending Tasks */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Pending Tasks
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {pendingTasks.length === 0 ? (
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.taskCard}>
              <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>
                No pending delivery tasks right now.
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
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor:
                        task.priority === 'high' ? `${theme.colors.error}20` : `${theme.colors.info}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color: task.priority === 'high' ? theme.colors.error : theme.colors.info,
                      },
                    ]}
                  >
                    {task.priority}
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

        {/* Aggregation Run Observability */}
        <View style={styles.tasksSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Latest Aggregation Run
          </Text>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.taskCard}>
            {latestAggregationRun ? (
              <>
                <Text style={[styles.taskOrderId, { color: theme.colors.text.primary }]}>
                  Run #{latestAggregationRun.id.slice(0, 8)}
                </Text>
                <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>
                  Status: {latestAggregationRun.status}
                </Text>
                <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>
                  Eligible: {latestAggregationRun.totalEligible} • Rejected: {latestAggregationRun.totalRejected}
                </Text>
                <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>
                  Batches: {latestAggregationRun.batchesCreatedCount} • Clusters: {latestAggregationRun.totalClusters}
                </Text>
              </>
            ) : (
              <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>
                No aggregation run history yet.
              </Text>
            )}
          </Card>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navSection}>
          <Button
            title="View Route Map"
            onPress={() => navigation.navigate('RouteMap')}
            style={styles.navButton}
          />
        </View>

        {/* Pending Tasks */}
        <View style={styles.taskHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, marginBottom: 0 }]}>
            Pending Tasks
          </Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: teal }]}>View All</Text>
          </TouchableOpacity>
        </View>
        {pendingTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskContent}>
              <Text style={[styles.taskType, { color: theme.colors.text.secondary }]}>{task.type}</Text>
              <Text style={[styles.taskOrderId, { color: theme.colors.text.primary }]}>{task.orderId}</Text>
              <Text style={[styles.taskDetail, { color: theme.colors.text.secondary }]}>{task.detail}</Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                {
                  backgroundColor: task.priority === 'High' ? '#fee2e2' : '#e0f2fe',
                },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: task.priority === 'High' ? '#ef4444' : '#3b82f6' },
                ]}
              >
                {task.priority}
              </Text>
            </View>
          </View>
        ))}

        {/* Nav Buttons */}
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: teal }]}
          onPress={() => navigation.navigate('RouteMap')}
          activeOpacity={0.8}
        >
          <Text style={styles.navBtnText}>View Route Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtnOutline, { borderColor: teal }]}
          onPress={() => navigation.navigate('RouteOrders')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navBtnOutlineText, { color: teal }]}>View Assigned Orders</Text>
        </TouchableOpacity>
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
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
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
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAll: { fontSize: 14, fontWeight: '600' },

  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  taskContent: { flex: 1, marginRight: 12 },
  taskType: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 4 },
  taskOrderId: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  taskDetail: { fontSize: 13, lineHeight: 18 },
  priorityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: { fontSize: 12, fontWeight: '700' },

  navBtn: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  navBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  navBtnOutline: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
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
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDetail: {
    fontSize: 13,
  },
  navSection: {
    gap: 12,
    marginBottom: 20,
  },
  navButton: {
    marginBottom: 0,
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
