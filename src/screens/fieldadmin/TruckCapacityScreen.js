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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';

const TruckCapacityScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [truck, setTruck] = useState(route?.params?.truck || {
    id: 'truck-001',
    licensePlate: 'WP ABC-1234',
    driver: 'Mike Johnson',
    currentCapacity: '75',
    maxCapacity: '100',
    unit: 'kg',
  });

  const [capacity, setCapacity] = useState(truck.currentCapacity);
  const [notes, setNotes] = useState('');
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    const loadTrucks = async () => {
      try {
        const routes = await fieldAdminApi.getRoutes();
        const mapped = routes
          .filter((r) => r?.truck?.id && r?.driver?.id)
          .map((r) => ({
            id: r.truck.id,
            driverId: r.driver.id,
            licensePlate: r.truck.vehicleNumber ?? 'Unknown',
            driver: r.driver?.user?.name ?? 'Driver',
            currentCapacity: String(r.truck.currentLoadWeight ?? 0),
            maxCapacity: String(r.truck.maxWeight ?? 0),
            currentLoadVolume: String(r.truck.currentLoadVolume ?? 0),
            maxVolume: String(r.truck.maxVolume ?? 0),
            currentLoadStops: String(r.truck.currentLoadStops ?? 0),
            maxStops: String(r.truck.maxStops ?? 0),
            unit: 'kg',
          }));
        setTrucks(mapped);
        if (mapped.length > 0) {
          setTruck(mapped[0]);
          setCapacity(mapped[0].currentCapacity);
        }
      } catch {
        Alert.alert('Error', 'Failed to load trucks.');
      }
    };
    loadTrucks();
  }, []);

  const handleUpdateCapacity = () => {
    if (!capacity.trim() || isNaN(capacity) || parseFloat(capacity) < 0) {
      alert('Please enter a valid capacity value');
      return;
    }
    if (!truck.driverId) {
      Alert.alert('Error', 'No driver linked to this truck.');
      return;
    }
    fieldAdminApi
      .updateTruckCapacity({
        driverId: truck.driverId,
        vehicleCapacity: parseFloat(capacity),
      })
      .then(() => {
        Alert.alert('Success', notes ? `Capacity updated. Note: ${notes}` : 'Capacity updated.');
        navigation.goBack();
      })
      .catch(() => Alert.alert('Error', 'Failed to update truck capacity.'));
  };

  const currentWeight = parseFloat(truck.currentCapacity || '0');
  const maxWeight = parseFloat(truck.maxCapacity || '0');
  const capacityPercent = maxWeight > 0 ? (currentWeight / maxWeight) * 100 : 0;

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Truck Capacity
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Select Truck
        </Text>
        {trucks.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => {
              setTruck(t);
              setCapacity(t.currentCapacity);
            }}
          >
            <Card
              variant={theme.isDarkMode ? "glass" : "default"}
              style={[
                styles.truckCard,
                truck.id === t.id && {
                  borderWidth: 2,
                  borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                },
              ]}
            >
              <Text style={[styles.truckPlate, { color: theme.colors.text.primary }]}>
                {t.licensePlate}
              </Text>
              <Text style={[styles.truckDriver, { color: theme.colors.text.secondary }]}>
                Driver: {t.driver}
              </Text>
              <Text style={[styles.truckCapacity, { color: theme.colors.text.secondary }]}>
                Capacity: {t.currentCapacity}/{t.maxCapacity} {t.unit}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.capacityCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Truck Details</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>
            License: {truck.licensePlate}
          </Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>
            Driver: {truck.driver}
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Current Capacity
          </Text>
          <View style={styles.capacityBarContainer}>
            <View style={styles.capacityBar}>
              <View
                style={[
                  styles.capacityBarFill,
                  {
                    width: `${capacityPercent}%`,
                    backgroundColor:
                      capacityPercent > 80
                        ? theme.colors.error
                        : capacityPercent > 60
                        ? theme.colors.warning
                        : theme.colors.success,
                  },
                ]}
              />
            </View>
            <Text style={[styles.capacityText, { color: theme.colors.text.primary }]}>
              {truck.currentCapacity} / {truck.maxCapacity} {truck.unit} ({Math.round(capacityPercent)}%)
            </Text>
          </View>
          <Text style={[styles.detail, { color: theme.colors.text.secondary }]}>
            Volume: {Number(truck.currentLoadVolume ?? 0).toFixed(3)} / {truck.maxVolume ?? '0'} m3
          </Text>
          <Text style={[styles.detail, { color: theme.colors.text.secondary }]}>
            Stops: {truck.currentLoadStops ?? '0'} / {truck.maxStops ?? '-'}
          </Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Update Capacity
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.updateCard}>
          <View style={styles.capacityInputRow}>
            <TextInput
              style={[styles.capacityInput, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
              placeholder="Enter new capacity"
              placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
            />
            <Text style={[styles.unitText, { color: theme.colors.text.secondary }]}>kg</Text>
          </View>
          <Text style={[styles.hint, { color: theme.colors.text.tertiary }]}>
            Max capacity: {truck.maxCapacity} kg
          </Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Notes
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.notesCard}>
          <TextInput
            style={[styles.input, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
            placeholder="Add notes about capacity update..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        <Button
          title="Update Capacity"
          onPress={handleUpdateCapacity}
          style={styles.submitButton}
        />
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
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 120,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  truckCard: { padding: 16, marginBottom: 12 },
  truckPlate: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  truckDriver: { fontSize: 14, marginBottom: 4 },
  truckCapacity: { fontSize: 14 },
  capacityCard: { padding: 16, marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  detail: { fontSize: 14, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  capacityBarContainer: { marginTop: 8 },
  capacityBar: {
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  capacityText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  updateCard: { padding: 16, marginBottom: 24 },
  capacityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  capacityInput: { flex: 1, fontSize: 18, fontWeight: '600', paddingVertical: 12 },
  unitText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  hint: { fontSize: 12 },
  notesCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
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
});

export default TruckCapacityScreen;

