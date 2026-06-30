import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import BackgroundShapes from '../../components/common/BackgroundShapes';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const todayStats = [
    { id: '1', label: 'Orders Assigned', value: '24', icon: '📦', color: '#3b82f6' },
    { id: '2', label: 'Assessments', value: '18', icon: '✓', color: '#22c55e' },
    { id: '3', label: 'Pending Quality', value: '6', icon: '⏰', color: '#f59e0b' },
    { id: '4', label: 'Routes Today', value: '8', icon: '🗺️', color: '#8b5cf6' },
  ];

  const quickActions = [
    { id: '1', title: 'Confirm\nQuality', icon: '✅', color: '#22c55e', screen: 'QualityConfirm' },
    { id: '2', title: 'Reject\nProduct', icon: '❌', color: '#ef4444', screen: 'SellerReject' },
    { id: '3', title: 'Mark\nDelivery', icon: '📦', color: '#3b82f6', screen: 'DeliveryPickup' },
    { id: '4', title: 'Assessments', icon: '📋', color: '#8b5cf6', screen: 'Assessment' },
    { id: '5', title: 'Report\nDamage', icon: '⚠️', color: '#f59e0b', screen: 'DamageReport' },
    { id: '6', title: 'Refund\nInitiation', icon: '💰', color: '#06b6d4', screen: 'RefundInitiation' },
    { id: '7', title: 'Route\nReass...', icon: '🔄', color: '#10b981', screen: 'RouteReassessment' },
    { id: '8', title: 'Truck\nCapacity', icon: '🚚', color: '#6366f1', screen: 'TruckCapacity' },
  ];

  const pendingTasks = [
    {
      id: '1',
      type: 'QUALITY CHECK',
      orderId: '#ORD-2024-045',
      detail: 'Green Market . Tomatoes, Spinach',
      priority: 'High',
    },
    {
      id: '2',
      type: 'DELIVERY',
      orderId: '#ORD-2024-042',
      detail: 'John Doe . 123 Main St',
      priority: 'Pending',
    },
    {
      id: '3',
      type: 'ASSESSMENT',
      orderId: '#ORD-2024-040',
      detail: 'Mike Johnson . Route #12',
      priority: 'Pending',
    },
  ];

  const teal = theme.colors.primary?.main || '#14b8a6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {todayStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}15` }]}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}12` }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
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
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

  statsRow: {
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
  actionCard: {
    width: '22%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: { fontSize: 22 },
  actionTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 15 },

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
  navBtnOutlineText: { fontSize: 16, fontWeight: '700' },
});

export default HomeScreen;
