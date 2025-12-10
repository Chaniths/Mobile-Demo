import React, { useState } from 'react';
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

const HistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('assessments'); // assessments, trucks, drivers

  // Mock data for last 4+ days
  const assessments = [
    {
      id: '1',
      date: '2024-12-08',
      type: 'Driver Assessment',
      subject: 'Mike Johnson',
      orderId: '#ORD-2024-038',
      rating: 5,
      comments: 'Excellent service, on-time delivery',
    },
    {
      id: '2',
      date: '2024-12-08',
      type: 'Buyer Assessment',
      subject: 'John Doe',
      orderId: '#ORD-2024-037',
      rating: 4,
      comments: 'Good communication, satisfied with quality',
    },
    {
      id: '3',
      date: '2024-12-07',
      type: 'Seller Assessment',
      subject: 'Green Market',
      orderId: '#ORD-2024-035',
      rating: 5,
      comments: 'High quality products, well packaged',
    },
    {
      id: '4',
      date: '2024-12-06',
      type: 'Driver Assessment',
      subject: 'Sarah Williams',
      orderId: '#ORD-2024-032',
      rating: 4,
      comments: 'Professional delivery, careful handling',
    },
    {
      id: '5',
      date: '2024-12-05',
      type: 'Buyer Assessment',
      subject: 'Jane Smith',
      orderId: '#ORD-2024-030',
      rating: 5,
      comments: 'Very satisfied with service',
    },
  ];

  const trucks = [
    {
      id: '1',
      licensePlate: 'WP ABC-1234',
      date: '2024-12-08',
      driver: 'Mike Johnson',
      capacity: '75/100 kg',
      orders: 8,
      status: 'Completed',
    },
    {
      id: '2',
      licensePlate: 'WP XYZ-5678',
      date: '2024-12-07',
      driver: 'Sarah Williams',
      capacity: '65/100 kg',
      orders: 6,
      status: 'Completed',
    },
    {
      id: '3',
      licensePlate: 'WP DEF-9012',
      date: '2024-12-06',
      driver: 'Tom Brown',
      capacity: '90/100 kg',
      orders: 10,
      status: 'Completed',
    },
    {
      id: '4',
      licensePlate: 'WP ABC-1234',
      date: '2024-12-05',
      driver: 'Mike Johnson',
      capacity: '80/100 kg',
      orders: 7,
      status: 'Completed',
    },
  ];

  const drivers = [
    {
      id: '1',
      name: 'Mike Johnson',
      date: '2024-12-08',
      routes: 2,
      orders: 15,
      rating: 4.8,
      truck: 'WP ABC-1234',
    },
    {
      id: '2',
      name: 'Sarah Williams',
      date: '2024-12-07',
      routes: 1,
      orders: 6,
      rating: 4.5,
      truck: 'WP XYZ-5678',
    },
    {
      id: '3',
      name: 'Tom Brown',
      date: '2024-12-06',
      routes: 1,
      orders: 10,
      rating: 4.9,
      truck: 'WP DEF-9012',
    },
    {
      id: '4',
      name: 'Mike Johnson',
      date: '2024-12-05',
      routes: 2,
      orders: 14,
      rating: 4.7,
      truck: 'WP ABC-1234',
    },
  ];

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const renderContent = () => {
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
                {assessment.orderId} • {assessment.date}
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
                Driver: {truck.driver} • {truck.date}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Capacity: {truck.capacity} • {truck.orders} orders
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
                {driver.date} • Truck: {driver.truck}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                {driver.routes} routes • {driver.orders} orders
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingText, { color: theme.colors.warning }]}>
                {renderStars(driver.rating)}
              </Text>
              <Text style={[styles.ratingValue, { color: theme.colors.text.primary }]}>
                {driver.rating}
              </Text>
            </View>
          </View>
        </Card>
      ));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode && (
        <>
          <View style={styles.gradientCircle1} />
          <View style={styles.gradientCircle2} />
        </>
      )}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          History
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
          Past 4+ days
        </Text>
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
  gradientCircle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    opacity: 0.6,
    zIndex: 0,
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -192,
    right: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(35, 101, 113, 0.4)',
    opacity: 0.6,
    zIndex: 0,
  },
  header: {
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
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
});

export default HistoryScreen;

