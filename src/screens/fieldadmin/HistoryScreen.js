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
import BackgroundShapes from '../../components/common/BackgroundShapes';

const HistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('assessments');

  const teal = theme.colors.primary?.main || '#14b8a6';

  const assessments = [
    { id: '1', date: '2024-12-08', type: 'Driver Assessment', subject: 'Mike Johnson', orderId: '#ORD-2024-038', rating: 5, comments: 'Excellent service, on-time delivery' },
    { id: '2', date: '2024-12-08', type: 'Buyer Assessment', subject: 'John Doe', orderId: '#ORD-2024-037', rating: 4, comments: 'Good communication, satisfied with quality' },
    { id: '3', date: '2024-12-07', type: 'Seller Assessment', subject: 'Green Market', orderId: '#ORD-2024-035', rating: 5, comments: 'High quality products, well packaged' },
    { id: '4', date: '2024-12-06', type: 'Driver Assessment', subject: 'Sarah Williams', orderId: '#ORD-2024-032', rating: 4, comments: 'Professional delivery, careful handling' },
    { id: '5', date: '2024-12-05', type: 'Buyer Assessment', subject: 'Jane Smith', orderId: '#ORD-2024-030', rating: 5, comments: 'Very satisfied with service' },
  ];

  const trucks = [
    { id: '1', licensePlate: 'WP ABC-1234', date: '2024-12-08', driver: 'Mike Johnson', capacity: '75/100 kg', orders: 8, status: 'Completed' },
    { id: '2', licensePlate: 'WP XYZ-5678', date: '2024-12-07', driver: 'Sarah Williams', capacity: '65/100 kg', orders: 6, status: 'Completed' },
    { id: '3', licensePlate: 'WP DEF-9012', date: '2024-12-06', driver: 'Tom Brown', capacity: '90/100 kg', orders: 10, status: 'Completed' },
    { id: '4', licensePlate: 'WP ABC-1234', date: '2024-12-05', driver: 'Mike Johnson', capacity: '80/100 kg', orders: 7, status: 'Completed' },
  ];

  const drivers = [
    { id: '1', name: 'Sarah Williams', date: '2024-12-07', routes: 1, orders: 6, rating: 4.5, truck: 'WP XYZ-5678' },
    { id: '2', name: 'Tom Brown', date: '2024-12-06', routes: 1, orders: 10, rating: 4.9, truck: 'WP DEF-9012' },
    { id: '3', name: 'Mike Johnson', date: '2024-12-08', routes: 2, orders: 15, rating: 4.8, truck: 'WP ABC-1234' },
    { id: '4', name: 'Mike Johnson', date: '2024-12-05', routes: 2, orders: 14, rating: 4.7, truck: 'WP ABC-1234' },
  ];

  const tabs = [
    { key: 'assessments', label: 'Assessments' },
    { key: 'trucks', label: 'Trucks' },
    { key: 'drivers', label: 'Drivers' },
  ];

  const renderStars = (r) => '★'.repeat(Math.floor(r)) + '☆'.repeat(5 - Math.floor(r));

  const renderAssessments = () =>
    assessments.map((a) => (
      <View key={a.id} style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardType}>{a.type}</Text>
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{a.subject}</Text>
            <Text style={styles.cardMeta}>{a.orderId}  .  {a.date}</Text>
          </View>
          <View style={styles.ratingCol}>
            <Text style={styles.stars}>{renderStars(a.rating)}</Text>
            <Text style={[styles.ratingNum, { color: theme.colors.text.primary }]}>{a.rating}/5</Text>
          </View>
        </View>
        {a.comments && <Text style={styles.comment}>{a.comments}</Text>}
      </View>
    ));

  const renderTrucks = () =>
    trucks.map((t) => (
      <View key={t.id} style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{t.licensePlate}</Text>
            <Text style={styles.cardMeta}>Driver: {t.driver}  .  {t.date}</Text>
            <Text style={styles.cardMeta}>Capacity : {t.capacity}  .  {t.orders} orders</Text>
          </View>
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>{t.status}</Text>
          </View>
        </View>
      </View>
    ));

  const renderDrivers = () =>
    drivers.map((d) => (
      <View key={d.id} style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>{d.name}</Text>
            <Text style={styles.cardMeta}>{d.date}  .  Truck: {d.truck}</Text>
            <Text style={styles.cardMeta}>{d.routes} routes  .  {d.orders} orders</Text>
          </View>
          <View style={styles.ratingCol}>
            <Text style={styles.stars}>{renderStars(d.rating)}</Text>
            <Text style={[styles.ratingNum, { color: theme.colors.text.primary }]}>{d.rating}</Text>
          </View>
        </View>
      </View>
    ));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>History</Text>
        <Text style={styles.headerSub}>Past 4+ days</Text>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && { borderBottomWidth: 3, borderBottomColor: teal }]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, { color: isActive ? teal : theme.colors.text.secondary }, isActive && { fontWeight: '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'assessments' && renderAssessments()}
        {activeTab === 'trucks' && renderTrucks()}
        {activeTab === 'drivers' && renderDrivers()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 4 },

  tabBar: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#e0dcd9' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabLabel: { fontSize: 15, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardType: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardMeta: { fontSize: 13, color: '#94a3b8', lineHeight: 20, marginBottom: 2 },

  ratingCol: { alignItems: 'flex-end', paddingTop: 4 },
  stars: { fontSize: 14, color: '#fbbf24', letterSpacing: 1, marginBottom: 4 },
  ratingNum: { fontSize: 14, fontWeight: '700' },

  comment: { fontSize: 13, fontStyle: 'italic', color: '#94a3b8', marginTop: 10, lineHeight: 20 },

  completedBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  completedText: { fontSize: 12, fontWeight: '700', color: '#22c55e' },
});

export default HistoryScreen;
