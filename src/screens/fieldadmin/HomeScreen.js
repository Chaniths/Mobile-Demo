import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import fieldAdminApi from '../../api/fieldAdminApi';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [overview, setOverview] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [latestAggregationRun, setLatestAggregationRun] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewData, tasksData] = await Promise.all([
          fieldAdminApi.getDashboardOverview(),
          fieldAdminApi.getAssignedTasks(),
        ]);
        setOverview(overviewData);
        setPendingTasks(tasksData.slice(0, 5));
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
      { id: '1', label: 'Orders Assigned', value: String(overview?.assignedOrders ?? 0), icon: '📦', color: '#3b82f6' },
      { id: '2', label: 'Assessments', value: String(overview?.assessments ?? 0), icon: '✓', color: '#22c55e' },
      { id: '3', label: 'Pending Quality', value: String(overview?.pendingQuality ?? 0), icon: '⏰', color: '#f59e0b' },
      { id: '4', label: 'Routes Today', value: String(overview?.routesToday ?? 0), icon: '🗺️', color: '#8b5cf6' },
    ],
    [overview]
  );

  const quickActions = [
    {
      id: '1',
      title: 'Confirm Quality',
      icon: '✅',
      color: '#22c55e',
      screen: 'QualityConfirm',
    },
    {
      id: '2',
      title: 'Reject Product',
      icon: '❌',
      color: '#ef4444',
      screen: 'SellerReject',
    },
    {
      id: '3',
      title: 'Mark Delivery',
      icon: '📦',
      color: '#3b82f6',
      screen: 'DeliveryPickup',
    },
    {
      id: '4',
      title: 'Assessments',
      icon: '📋',
      color: '#8b5cf6',
      screen: 'Assessment',
    },
    {
      id: '5',
      title: 'Report Damage',
      icon: '⚠️',
      color: '#f59e0b',
      screen: 'DamageReport',
    },
    {
      id: '6',
      title: 'Refund Initiation',
      icon: '💰',
      color: '#06b6d4',
      screen: 'RefundInitiation',
    },
    {
      id: '7',
      title: 'Route Reassessment',
      icon: '🔄',
      color: '#10b981',
      screen: 'RouteReassessment',
    },
    {
      id: '8',
      title: 'Truck Capacity',
      icon: '🚚',
      color: '#6366f1',
      screen: 'TruckCapacity',
    },
    {
      id: '9',
      title: 'View Assigned Orders',
      icon: '📋',
      color: '#3b82f6',
      screen: 'RouteOrders',
    },
  ];

  const mappedTasks = pendingTasks.map((task) => ({
    id: task.id,
    type: task.type,
    orderId: task.order?.orderNumber ? `#${task.order.orderNumber}` : task.route?.routeNumber || '#TASK',
    customer: task.buyer?.user?.name || null,
    seller: task.seller?.user?.name || null,
    address: task.address,
    route: task.route?.routeNumber || null,
    items: task.order ? `Total: ${task.order.totalAmount}` : null,
    priority: task.status === 'IN_PROGRESS' ? 'high' : 'normal',
  }));

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
              Chanith Wijekoon
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
              >
                <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.actionCard}>
                  <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text
                    style={[styles.actionTitle, { color: theme.colors.text.primary }]}
                    numberOfLines={2}
                  >
                    {action.title}
                  </Text>
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
          {mappedTasks.map((task) => (
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
                {task.seller || task.customer || task.driver}
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
  actionCard: {
    width: '23%',
    minWidth: 80,
    padding: 12,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
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

