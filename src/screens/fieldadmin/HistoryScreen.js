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
        const [allHistory, truckHistory, driverHistory] = await Promise.all([
          fieldAdminApi.getAllHistory(),
          fieldAdminApi.getTruckHistory(),
          fieldAdminApi.getDriverHistory(),
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

        const mappedTrucks = (truckHistory ?? [])
          .filter((truck) => withinLastWeek(truck.completedAt))
          .map((truck) => ({
            id: truck.routeId,
            licensePlate: truck.truckNumber || 'Truck N/A',
            date: truck.completedAt ? new Date(truck.completedAt).toLocaleDateString() : '-',
            routeNumber: truck.routeNumber,
            truckType: truck.truckType || 'N/A',
            status: 'Completed',
          }));

        const mappedDrivers = (driverHistory ?? [])
          .filter((driver) => withinLastWeek(driver.completedAt))
          .map((driver) => ({
            id: `${driver.routeId}-${driver.driverId ?? 'unknown'}`,
            name: driver.driverName || 'Driver N/A',
            date: driver.completedAt ? new Date(driver.completedAt).toLocaleDateString() : '-',
            routeNumber: driver.routeNumber,
          }));

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

  const summaryStats = useMemo(
    () => [
      { id: 'a', label: 'Assessments', value: assessments.length, color: theme.colors.warning, icon: '⭐' },
      { id: 't', label: 'Truck Runs', value: trucks.length, color: theme.colors.success, icon: '🚚' },
      {
        id: 'd',
        label: 'Drivers Worked',
        value: new Set(drivers.map((driver) => driver.name)).size,
        color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
        icon: '👤',
      },
    ],
    [assessments, trucks, drivers, theme]
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
            No records found in the last 7 days.
          </Text>
        </Card>
      );
    }

    if (activeTab === 'assessments') {
      return assessments.map((assessment) => (
        <Card variant={theme.isDarkMode ? "glass" : "default"} key={assessment.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View>
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
            <View>
              <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                {truck.licensePlate}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Route: {truck.routeNumber} • {truck.date}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Truck Type: {truck.truckType}
              </Text>
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
      return drivers.map((driver) => (
        <Card variant={theme.isDarkMode ? "glass" : "default"} key={driver.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View>
              <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                {driver.name}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                {driver.date} • Route: {driver.routeNumber}
              </Text>
            </View>
          </View>
        </Card>
      ));
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
        {summaryStats.map((stat) => (
          <Card variant={theme.isDarkMode ? "glass" : "default"} key={stat.id} style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: `${stat.color}20` }]}>
              <Text style={styles.summaryIcon}>{stat.icon}</Text>
            </View>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>{stat.value}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]} numberOfLines={1}>
              {stat.label}
            </Text>
          </Card>
        ))}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'assessments' && {
              borderBottomWidth: 2,
              borderBottomColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
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
            activeTab === 'trucks' && {
              borderBottomWidth: 2,
              borderBottomColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
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
            activeTab === 'drivers' && {
              borderBottomWidth: 2,
              borderBottomColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
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
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
    zIndex: 1,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
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
  summaryValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  summaryLabel: { fontSize: 11, fontWeight: '500' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 15, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 16, zIndex: 1 },
  itemCard: { padding: 16, marginBottom: 12 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemType: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  itemMeta: { fontSize: 13, marginBottom: 2 },
  ratingContainer: { alignItems: 'flex-end' },
  ratingText: { fontSize: 14, marginBottom: 4 },
  ratingValue: { fontSize: 14, fontWeight: '700' },
  comments: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
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

