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

  const trucks = [
    { id: 'truck-001', licensePlate: 'WP ABC-1234', driver: 'Mike Johnson', capacity: '75/100 kg' },
    { id: 'truck-002', licensePlate: 'WP XYZ-5678', driver: 'Sarah Williams', capacity: '45/100 kg' },
    { id: 'truck-003', licensePlate: 'WP DEF-9012', driver: 'Tom Brown', capacity: '90/100 kg' },
  ];

  const handleUpdateCapacity = () => {
    if (!capacity.trim() || isNaN(capacity) || parseFloat(capacity) < 0 || parseFloat(capacity) > 100) {
      alert('Please enter a valid capacity (0-100)');
      return;
    }
    console.log('Capacity updated:', { truckId: truck.id, capacity: parseFloat(capacity), notes });
    navigation.goBack();
  };

  const teal = theme.colors.primary?.main || '#14b8a6';
  const capacityPercent = (parseFloat(truck.currentCapacity) / parseFloat(truck.maxCapacity)) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes variant="detail" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Truck Capacity</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Select Truck */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Select Truck</Text>
        {trucks.map((t) => {
          const isSelected = truck.id === t.id;
          return (
            <TouchableOpacity key={t.id} onPress={() => setTruck(t)} activeOpacity={0.7}>
              <View style={[styles.truckCard, isSelected && { borderColor: teal, borderWidth: 2 }]}>
                <Text style={[styles.truckPlate, { color: theme.colors.text.primary }]}>{t.licensePlate}</Text>
                <Text style={styles.truckMeta}>Driver: {t.driver}</Text>
                <Text style={styles.truckMeta}>Capacity: {t.capacity}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Capacity Details */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>TRUCK DETAILS</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>License: {truck.licensePlate}</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>Driver: {truck.driver}</Text>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>CURRENT CAPACITY</Text>
          <View style={styles.barWrap}>
            <View style={styles.bar}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${capacityPercent}%`,
                    backgroundColor: capacityPercent > 80 ? '#ef4444' : capacityPercent > 60 ? '#f59e0b' : '#22c55e',
                  },
                ]}
              />
            </View>
            <Text style={[styles.barText, { color: theme.colors.text.primary }]}>
              {truck.currentCapacity} / {truck.maxCapacity} {truck.unit} ({Math.round(capacityPercent)}%)
            </Text>
          </View>
        </View>

        {/* Update */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Update Capacity</Text>
        <View style={styles.card}>
          <View style={styles.capacityRow}>
            <TextInput
              style={[styles.capacityInput, { color: theme.colors.text.primary }]}
              placeholder="Enter new capacity"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
            />
            <Text style={styles.unitText}>kg</Text>
          </View>
          <Text style={styles.hintText}>Max capacity: {truck.maxCapacity} kg</Text>
        </View>

        {/* Notes */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Notes</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary }]}
            placeholder="Add notes about capacity update..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleUpdateCapacity} activeOpacity={0.8}>
          <Text style={styles.submitText}>Update Capacity</Text>
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

  truckCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  truckPlate: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  truckMeta: { fontSize: 14, color: '#94a3b8', marginBottom: 2 },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 6, marginTop: 4 },
  fieldValue: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },

  barWrap: { marginTop: 8 },
  bar: { height: 24, backgroundColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', borderRadius: 12 },
  barText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },

  capacityRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0dcd9', borderRadius: 16, paddingHorizontal: 14, marginBottom: 8,
  },
  capacityInput: { flex: 1, fontSize: 18, fontWeight: '600', paddingVertical: 14 },
  unitText: { fontSize: 16, fontWeight: '600', color: '#94a3b8', marginLeft: 8 },
  hintText: { fontSize: 12, color: '#94a3b8' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, minHeight: 100, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default TruckCapacityScreen;
