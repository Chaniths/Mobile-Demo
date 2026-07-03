import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
<<<<<<< HEAD
import BackgroundShapes from '../../components/common/BackgroundShapes';
=======
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

const RouteReassessmentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [changes, setChanges] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);

<<<<<<< HEAD
  const routes = [
    { id: '1', routeId: 'Route #12', driver: 'Mike Johnson', stops: 8, distance: '45.8 km', status: 'In Progress', orders: ['#ORD-001', '#ORD-002', '#ORD-003'] },
    { id: '2', routeId: 'Route #15', driver: 'Sarah Williams', stops: 6, distance: '32.8 km', status: 'In Progress', orders: ['#ORD-004', '#ORD-005'] },
  ];
=======
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await fieldAdminApi.getRoutes();
        const mapped = data.map((r) => ({
          id: r.id,
          routeId: r.routeNumber,
          driver: r.driver?.user?.name ?? 'Unassigned',
          stops: r.stops?.length ?? 0,
          distance: r.totalDistance ? `${r.totalDistance} km` : 'N/A',
          status: r.status,
          orders: (r.batch?.orders ?? []).map((o) => o.orderNumber),
        }));
        setRoutes(mapped);
      } catch {
        Alert.alert('Error', 'Failed to load routes.');
      }
    };
    loadRoutes();
  }, []);
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

  const handleReassess = () => {
    if (!selectedRoute || !changes.trim()) {
      alert('Please select a route and describe the changes');
      return;
    }
<<<<<<< HEAD
    console.log('Route reassessed:', { route: selectedRoute.routeId, changes });
    navigation.goBack();
=======
    fieldAdminApi
      .submitRouteReassessment({
        routeId: selectedRoute.id,
        reason: changes,
        oldData: { routeNumber: selectedRoute.routeId },
        newData: { note: changes },
      })
      .then(() => {
        Alert.alert('Success', 'Route reassessment submitted.');
        navigation.goBack();
      })
      .catch(() => Alert.alert('Error', 'Failed to submit reassessment.'));
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
<<<<<<< HEAD
      <BackgroundShapes variant="form" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
=======
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Reassess Route</Text>
          <View style={{ width: 70 }} />
        </View>

<<<<<<< HEAD
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
=======
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Select Route
        </Text>
        {routes.map((route) => (
          <TouchableOpacity
            key={route.id}
            onPress={() => setSelectedRoute(route)}
          >
            <Card
              variant={theme.isDarkMode ? "glass" : "default"}
              style={[
                styles.routeCard,
                selectedRoute?.id === route.id && {
                  borderWidth: 2,
                  borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                },
              ]}
            >
              <View style={styles.routeHeader}>
                <Text style={[styles.routeId, { color: theme.colors.text.primary }]}>
                  {route.routeId}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        route.status === 'In Progress' ? `${theme.colors.success}20` : `${theme.colors.info}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: route.status === 'In Progress' ? theme.colors.success : theme.colors.info,
                      },
                    ]}
                  >
                    {route.status}
                  </Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
                </View>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>Driver : {r.driver}</Text>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>{r.stops} stops  .  {r.distance}</Text>
                <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>Orders : {r.orders.join(', ')}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

<<<<<<< HEAD
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Route Changes</Text>
        <View style={styles.changesCard}>
          <TextInput
            style={[styles.changesInput, { color: theme.colors.text.primary }]}
=======
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Route Changes
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.changesCard}>
          <TextInput
            style={[styles.input, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            placeholder="Describe route changes (e.g., add stop, remove stop, change order)..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
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
<<<<<<< HEAD
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
=======
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
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 32,
    zIndex: 1,
  },
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
<<<<<<< HEAD
  backText: { fontSize: 16, fontWeight: '600' },
=======
  backButton: { fontSize: 16, fontWeight: '600' },
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  headerTitle: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  routeCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
<<<<<<< HEAD
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
=======
  routeId: { fontSize: 18, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  routeDetail: { fontSize: 14, marginBottom: 4 },
  changesCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 150, textAlignVertical: 'top' },
  submitButton: { marginTop: 8 },
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
});

export default RouteReassessmentScreen;
