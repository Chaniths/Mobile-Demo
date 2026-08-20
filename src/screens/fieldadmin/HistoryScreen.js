import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import fieldAdminApi from '../../api/fieldAdminApi';
import AppIcon from '../../components/common/AppIcon';

const routeWhen = (route) =>
  route?.actualEnd || route?.scheduledStart || route?.updatedAt || route?.completedAt || null;

const formatWhen = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const dayKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const routeStatusLabel = (status) => {
  const value = String(status ?? '').replace(/_/g, ' ');
  if (!value) return 'Assigned';
  return value.charAt(0) + value.slice(1).toLowerCase();
};

const COMPLETED_STATUSES = new Set(['DELIVERED', 'COMPLETED']);
const IN_PROGRESS_STATUSES = new Set([
  'IN_TRANSIT',
  'ASSIGNED',
  'BATCHED',
  'IN_PROGRESS',
  'STARTED',
  'PLANNED',
]);

const workPhaseFromStatus = (status) => {
  const value = String(status ?? '').toUpperCase();
  if (COMPLETED_STATUSES.has(value)) return 'completed';
  if (IN_PROGRESS_STATUSES.has(value)) return 'in_progress';
  return null;
};

const DRIVER_PHASE = {
  in_progress: { label: 'In progress', color: '#f59e0b' },
  completed: { label: 'Completed', color: '#22c55e' },
};

const orderWhen = (order) =>
  order?.deliveredAt ||
  order?.actualDelivery ||
  order?.route?.scheduledStart ||
  order?.batch?.scheduledDate ||
  order?.placedAt ||
  null;

const HistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('assessments'); // assessments, trucks, drivers
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Assessments still come from history/all. Trucks and drivers are taken from
        // /route/all because that payload already includes the assigned Truck row and
        // Driver profile — the dedicated history endpoints only look at COMPLETED
        // routes and read the truck plate off the driver, so they stay empty.
        const [allHistory, routes, orders] = await Promise.all([
          fieldAdminApi.getAllHistory(),
          fieldAdminApi.getRoutes(),
          fieldAdminApi.getOrdersByTab('all'),
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const withinLastWeek = (value) => {
          if (!value) return false;
          const parsed = new Date(value);
          return !Number.isNaN(parsed.getTime()) && parsed >= sevenDaysAgo;
        };

        const mappedAssessments = (allHistory?.assessments ?? [])
          .filter((assessment) => withinLastWeek(assessment.createdAt))
          .map((assessment) => ({
            id: assessment.id,
            date: new Date(assessment.createdAt).toLocaleDateString(),
            type: `${assessment.target?.charAt(0)}${assessment.target?.slice(1).toLowerCase()} Assessment`,
            subject: assessment.targetUserName || assessment.targetUserId,
            rating: assessment.rating,
            comments: assessment.comment || '',
          }));

        const recentRoutes = (Array.isArray(routes) ? routes : []).filter((route) =>
          withinLastWeek(routeWhen(route))
        );
        const visibleRoutes = recentRoutes.length > 0 ? recentRoutes : (Array.isArray(routes) ? routes : []);

        const mappedTrucks = visibleRoutes
          .filter((route) => route?.truck?.id || route?.truck?.vehicleNumber)
          .map((route) => ({
            id: `${route.id}-${route.truck?.id ?? 'truck'}`,
            truckId: route.truck?.id,
            licensePlate: route.truck?.vehicleNumber || 'Truck N/A',
            date: formatWhen(routeWhen(route)),
            routeNumber: route.routeNumber,
            truckType: route.truck?.vehicleType || 'N/A',
            status: routeStatusLabel(route.status),
            maxWeight: route.truck?.maxWeight,
            maxVolume: route.truck?.maxVolume,
            driverName: route.driver?.user?.name || null,
          }));

        const recentOrders = (Array.isArray(orders) ? orders : []).filter((order) =>
          withinLastWeek(orderWhen(order))
        );
        const visibleOrders = recentOrders.length > 0 ? recentOrders : (Array.isArray(orders) ? orders : []);

        const driverRows = new Map();
        const addDriverRow = (entry) => {
          if (!entry?.name || !entry.phase) return;
          const key = `${entry.driverId || entry.name}::${entry.phase}`;
          const current = driverRows.get(key);
          const routesForRow = entry.routeNumber ? [entry.routeNumber] : [];
          if (!current) {
            driverRows.set(key, {
              ...entry,
              orderCount: entry.orderCount ?? 1,
              routes: routesForRow,
            });
            return;
          }
          current.orderCount += entry.orderCount ?? 1;
          routesForRow.forEach((routeNumber) => {
            if (!current.routes.includes(routeNumber)) current.routes.push(routeNumber);
          });
          if (entry.vehicleNumber && !current.vehicleNumber) current.vehicleNumber = entry.vehicleNumber;
          if (entry.rating != null) current.rating = entry.rating;
        };

        visibleOrders.forEach((order) => {
          const name = order?.driver?.name;
          if (!name) return;
          const phase = workPhaseFromStatus(order.status);
          if (!phase) return;
          addDriverRow({
            driverId: order.driver?.id,
            name,
            phase,
            date: formatWhen(orderWhen(order)),
            routeNumber: order.route?.routeNumber || order.batch?.batchNumber || null,
            vehicleNumber: order.truck?.vehicleNumber || null,
            vehicleType: null,
            orderCount: 1,
          });
        });

        visibleRoutes.forEach((route) => {
          const name = route?.driver?.user?.name;
          if (!name) return;
          const phase = workPhaseFromStatus(route.status) || 'in_progress';
          addDriverRow({
            driverId: route.driver?.id,
            name,
            phase,
            date: formatWhen(routeWhen(route)),
            routeNumber: route.routeNumber,
            vehicleNumber: route.driver?.vehicleNumber || route.truck?.vehicleNumber || null,
            vehicleType: route.driver?.vehicleType || route.truck?.vehicleType || null,
            orderCount: 1,
          });
        });

        const knownDriverKeys = new Set(
          Array.from(driverRows.values()).map((row) => row.driverId || row.name)
        );

        (allHistory?.assessments ?? [])
          .filter((assessment) => String(assessment.target).toUpperCase() === 'DRIVER')
          .filter((assessment) => withinLastWeek(assessment.createdAt))
          .forEach((assessment) => {
            const name = assessment.targetUserName || assessment.targetUserId;
            if (!name) return;
            const identity = assessment.targetUserId || name;
            if (knownDriverKeys.has(identity) || knownDriverKeys.has(name)) return;

            const assessmentDay = dayKey(assessment.createdAt);
            const sameDayOrders = visibleOrders.filter(
              (order) => dayKey(orderWhen(order)) === assessmentDay
            );
            const hasInProgress = sameDayOrders.some((order) => workPhaseFromStatus(order.status) === 'in_progress');
            const hasCompleted = sameDayOrders.some((order) => workPhaseFromStatus(order.status) === 'completed');
            const phases = [
              hasInProgress ? 'in_progress' : null,
              hasCompleted ? 'completed' : null,
            ].filter(Boolean);
            const inferred =
              phases.length > 0
                ? phases
                : [dayKey(assessment.createdAt) === dayKey(new Date()) ? 'in_progress' : 'completed'];

            inferred.forEach((phase) => {
              const matching = sameDayOrders.filter((order) => workPhaseFromStatus(order.status) === phase);
              addDriverRow({
                driverId: assessment.targetUserId,
                name,
                phase,
                date: new Date(assessment.createdAt).toLocaleDateString(),
                routeNumber: matching[0]?.route?.routeNumber || matching[0]?.batch?.batchNumber || null,
                vehicleNumber: matching[0]?.truck?.vehicleNumber || null,
                vehicleType: null,
                orderCount: matching.length || 1,
                rating: assessment.rating,
              });
            });
          });

        const mappedDrivers = Array.from(driverRows.values())
          .map((row) => ({
            ...row,
            id: `${row.driverId || row.name}-${row.phase}-${row.date}`,
            routeNumber: row.routes?.[0] || row.routeNumber || '—',
            extraRoutes: Math.max(0, (row.routes?.length ?? 1) - 1),
          }))
          .sort((a, b) => {
            if (a.phase !== b.phase) return a.phase === 'in_progress' ? -1 : 1;
            return String(b.date).localeCompare(String(a.date));
          });

        setAssessments(mappedAssessments);
        setTrucks(mappedTrucks);
        setDrivers(mappedDrivers);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const currentList = useMemo(() => {
    if (activeTab === 'assessments') return assessments;
    if (activeTab === 'trucks') return trucks;
    return drivers;
  }, [activeTab, assessments, trucks, drivers]);

  const uniqueTruckCount = useMemo(
    () => new Set(trucks.map((truck) => truck.truckId || truck.licensePlate)).size,
    [trucks]
  );
  const uniqueDriverCount = useMemo(
    () => new Set(drivers.map((driver) => driver.driverId || driver.name)).size,
    [drivers]
  );

  const summaryStats = useMemo(
    () => [
      { id: 'assessments', label: 'Assessments', value: assessments.length, color: theme.colors.warning, icon: 'star' },
      { id: 'trucks', label: 'Trucks', value: uniqueTruckCount, color: theme.colors.success, icon: 'truck' },
      {
        id: 'drivers',
        label: 'Drivers',
        value: uniqueDriverCount,
        color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
        icon: 'profile',
      },
    ],
    [assessments, uniqueTruckCount, uniqueDriverCount, theme]
  );

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 20 }} />;
    }

    if (currentList.length === 0) {
      return (
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.itemCard}>
          <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
            No records found for this tab.
          </Text>
        </Card>
      );
    }

    if (activeTab === 'assessments') {
      return assessments.map((assessment) => (
        <Card variant={theme.isDarkMode ? "glass" : "default"} key={assessment.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              <Text style={[styles.itemType, { color: theme.colors.text.secondary }]}>
                {assessment.type}
              </Text>
              <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                {assessment.subject}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                {assessment.date}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingText, { color: theme.colors.warning }]}>
                {renderStars(assessment.rating)}
              </Text>
              <Text style={[styles.ratingValue, { color: theme.colors.text.primary }]}>
                {assessment.rating}/5
              </Text>
            </View>
          </View>
          {assessment.comments && (
            <Text style={[styles.comments, { color: theme.colors.text.secondary }]}>
              {assessment.comments}
            </Text>
          )}
        </Card>
      ));
    } else if (activeTab === 'trucks') {
      return trucks.map((truck) => (
        <Card variant={theme.isDarkMode ? "glass" : "default"} key={truck.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                {truck.licensePlate}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Route: {truck.routeNumber} • {truck.date}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Truck Type: {truck.truckType}
              </Text>
              {truck.driverName ? (
                <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                  Driver: {truck.driverName}
                </Text>
              ) : null}
              {truck.maxWeight != null || truck.maxVolume != null ? (
                <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                  Capacity: {truck.maxWeight ?? '—'} kg / {truck.maxVolume ?? '—'} m³
                </Text>
              ) : null}
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${theme.colors.success}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: theme.colors.success }]}>
                {truck.status}
              </Text>
            </View>
          </View>
        </Card>
      ));
    } else {
      return drivers.map((driver) => {
        const phase = DRIVER_PHASE[driver.phase] ?? DRIVER_PHASE.in_progress;
        return (
          <Card variant={theme.isDarkMode ? "glass" : "default"} key={driver.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemHeaderLeft}>
                <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                  {driver.name}
                </Text>
                <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                  {driver.date}
                  {driver.routeNumber && driver.routeNumber !== '—' ? ` • Route: ${driver.routeNumber}` : ''}
                  {driver.extraRoutes > 0 ? ` +${driver.extraRoutes} more` : ''}
                </Text>
                <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                  {driver.phase === 'completed'
                    ? `${driver.orderCount} completed order${driver.orderCount === 1 ? '' : 's'}`
                    : `${driver.orderCount} in-progress order${driver.orderCount === 1 ? '' : 's'}`}
                </Text>
                {driver.vehicleNumber ? (
                  <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                    Truck: {driver.vehicleNumber}
                    {driver.vehicleType ? ` • ${driver.vehicleType}` : ''}
                  </Text>
                ) : null}
                {driver.rating != null ? (
                  <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                    Rated {driver.rating}/5
                  </Text>
                ) : null}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${phase.color}20` }]}>
                <Text style={[styles.statusText, { color: phase.color }]}>{phase.label}</Text>
              </View>
            </View>
          </Card>
        );
      });
    }
  };

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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          History
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
          Past 7 days
        </Text>
      </View>

      <View style={styles.summaryRow}>
        {summaryStats.map((stat) => {
          const selected = activeTab === stat.id;
          return (
            <Card
              key={stat.id}
              variant={theme.isDarkMode ? 'glass' : 'default'}
              onPress={() => setActiveTab(stat.id)}
              style={[
                styles.summaryCard,
                {
                  borderWidth: 1.5,
                  borderColor: selected
                    ? `${stat.color}99`
                    : theme.isDarkMode
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <View style={[styles.summaryIconWrap, { backgroundColor: `${stat.color}20` }]}>
                <AppIcon name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>{stat.value}</Text>
              <Text
                style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}
                numberOfLines={2}
              >
                {stat.label}
              </Text>
            </Card>
          );
        })}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor:
                activeTab === 'assessments'
                  ? theme.isDarkMode
                    ? theme.colors.teal.main
                    : theme.colors.primary.main
                  : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('assessments')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.text.primary },
              activeTab === 'assessments' && {
                color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                fontWeight: '700',
              },
            ]}
          >
            Assessments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor:
                activeTab === 'trucks'
                  ? theme.isDarkMode
                    ? theme.colors.teal.main
                    : theme.colors.primary.main
                  : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('trucks')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.text.primary },
              activeTab === 'trucks' && {
                color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                fontWeight: '700',
              },
            ]}
          >
            Trucks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor:
                activeTab === 'drivers'
                  ? theme.isDarkMode
                    ? theme.colors.teal.main
                    : theme.colors.primary.main
                  : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('drivers')}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.text.primary },
              activeTab === 'drivers' && {
                color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                fontWeight: '700',
              },
            ]}
          >
            Drivers
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
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
  header: {
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
    zIndex: 1,
  },
  summaryCard: {
    flex: 1,
    minHeight: 112,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryIcon: { fontSize: 14 },
  summaryValue: { fontSize: 18, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.25)',
    zIndex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    marginBottom: -1,
  },
  tabText: { fontSize: 15, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 16, zIndex: 1 },
  itemCard: { padding: 16, marginBottom: 12 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  itemHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  itemType: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  itemMeta: { fontSize: 13, marginBottom: 2 },
  ratingContainer: { alignItems: 'flex-end', flexShrink: 0 },
  ratingText: { fontSize: 14, marginBottom: 4 },
  ratingValue: { fontSize: 14, fontWeight: '700' },
  comments: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 12, fontWeight: '600' },
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

export default HistoryScreen;

