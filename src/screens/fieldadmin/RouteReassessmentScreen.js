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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const RouteReassessmentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [changes, setChanges] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  const routes = [
    {
      id: '1',
      routeId: 'Route #12',
      driver: 'Mike Johnson',
      stops: 8,
      distance: '45.8 km',
      status: 'In Progress',
      orders: ['#ORD-001', '#ORD-002', '#ORD-003'],
    },
    {
      id: '2',
      routeId: 'Route #15',
      driver: 'Sarah Williams',
      stops: 6,
      distance: '32.4 km',
      status: 'Scheduled',
      orders: ['#ORD-004', '#ORD-005'],
    },
  ];

  const handleReassess = () => {
    if (!selectedRoute || !changes.trim()) {
      alert('Please select a route and describe the changes');
      return;
    }
    // In real app, this would make an API call
    console.log('Route reassessed:', { route: selectedRoute.routeId, changes });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Reassess Route
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Select Route
        </Text>
        {routes.map((route) => (
          <TouchableOpacity
            key={route.id}
            onPress={() => setSelectedRoute(route)}
          >
            <Card
              style={[
                styles.routeCard,
                selectedRoute?.id === route.id && {
                  borderWidth: 2,
                  borderColor: theme.colors.primary.main,
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
                </View>
              </View>
              <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>
                Driver: {route.driver}
              </Text>
              <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>
                {route.stops} stops • {route.distance}
              </Text>
              <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>
                Orders: {route.orders.join(', ')}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Route Changes
        </Text>
        <Card style={styles.changesCard}>
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="Describe route changes (e.g., add stop, remove stop, change order)..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={6}
            value={changes}
            onChangeText={setChanges}
          />
        </Card>

        <Button
          title="Submit Reassessment"
          onPress={handleReassess}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { fontSize: 16, color: '#16a34a', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  routeCard: { padding: 16, marginBottom: 12 },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeId: { fontSize: 18, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  routeDetail: { fontSize: 14, marginBottom: 4 },
  changesCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 150, textAlignVertical: 'top' },
  submitButton: { marginTop: 8 },
});

export default RouteReassessmentScreen;

