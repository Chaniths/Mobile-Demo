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

const DeliveryPickupScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [actionType, setActionType] = useState(null);
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');

  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-001',
    customer: 'John Doe',
    address: '123 Main st',
    status: 'In Transit',
  };

  const handleMarkAction = () => {
    if (!actionType) {
      alert('Please select an action');
      return;
    }
    console.log('Action marked:', { type: actionType, orderId: order.orderId, signature, notes });
    navigation.goBack();
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes variant="form" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Delivery / Pickup</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Order Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ORDER ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>CUSTOMER</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.customer}</Text>
          <Text style={styles.fieldLabel}>ADDRESS</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.address}</Text>
        </View>

        {/* Action Buttons */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Select Action</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, actionType === 'delivery' && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}
            onPress={() => setActionType('delivery')}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, actionType === 'delivery' ? { color: '#fff' } : { color: theme.colors.text.primary }]}>
              {'✓  Mark Delivered'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, actionType === 'pickup' && { backgroundColor: teal, borderColor: teal }]}
            onPress={() => setActionType('pickup')}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, actionType === 'pickup' ? { color: '#fff' } : { color: theme.colors.text.primary }]}>
              {'📦'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Signature */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Customer Signature/ Confirmation</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary }]}
            placeholder="Enter customer name or signature ......"
            placeholderTextColor={theme.colors.text.tertiary}
            value={signature}
            onChangeText={setSignature}
          />
        </View>

        {/* Notes */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Additional Notes</Text>
        <View style={[styles.inputCard, { minHeight: 100 }]}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary, minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Add any notes ......."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleMarkAction} activeOpacity={0.8}>
          <Text style={styles.submitText}>Confirm Delivery</Text>
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
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  orderId: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  fieldValue: { fontSize: 15, fontWeight: '500' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0dcd9',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  actionText: { fontSize: 14, fontWeight: '700' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, fontWeight: '400' },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default DeliveryPickupScreen;
