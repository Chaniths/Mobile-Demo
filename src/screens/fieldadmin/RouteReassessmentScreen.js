import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import BackgroundShapes from '../../components/common/BackgroundShapes';

const RouteReassessmentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [changes, setChanges] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  const routes = [
    { id: '1', routeId: 'Route #12', driver: 'Mike Johnson', stops: 8, distance: '45.8 km', status: 'In Progress', orders: ['#ORD-001', '#ORD-002', '#ORD-003'] },
    { id: '2', routeId: 'Route #15', driver: 'Sarah Williams', stops: 6, distance: '32.8 km', status: 'In Progress', orders: ['#ORD-004', '#ORD-005'] },
  ];

  const handleReassess = () => {
    if (!selectedRoute || !changes.trim()) {
      alert('Please select a route and describe the changes');
      return;
    }
    console.log('Route reassessed:', { route: selectedRoute.routeId, changes });
    navigation.goBack();
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes variant="form" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Reassess Route</Text>
          <View style={{ width: 70 }} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Select Route</Text>
        {routes.map((r) => {
          const isSelected = selectedRoute?.id === r.id;
          return (
            <TouchableOpacity key={r.id} onPress={() => setSelectedRoute(r)} activeOpacity={0.7}>
              <View style={[styles.routeCard, isSelected && { borderColor: teal, borderWidth: 2 }]}>
                <View style={styles.routeHeader}>
                  <Text style={[styles.routeId, { color: theme.colors.text.primary }]}>{r.routeId}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{r.status}</Text>
                  </View>
                </View>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>Driver : {r.driver}</Text>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>{r.stops} stops  .  {r.distance}</Text>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>Orders : {r.orders.join(', ')}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Route Changes</Text>
        <View style={styles.changesCard}>
          <TextInput
            style={[styles.changesInput, { color: theme.colors.text.primary }]}
            placeholder="Describe route changes (e.g., add stop, remove stop, change order)..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={6}
            value={changes}
            onChangeText={setChanges}
          />
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleReassess} activeOpacity={0.8}>
          <Text style={styles.submitText}>Submit Reassessment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
  backText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  routeCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  routeId: { fontSize: 17, fontWeight: '700' },
  statusBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#22c55e' },
  routeDetail: { fontSize: 14, lineHeight: 22, marginBottom: 2 },

  changesCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  changesInput: { fontSize: 14, minHeight: 140, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default RouteReassessmentScreen;
