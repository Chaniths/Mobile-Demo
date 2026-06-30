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

const RefundInitiationScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('0.00');

  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-001',
    customer: 'John Doe',
    address: '123 Main st',
    totalAmount: 'Rs. 2,450.00',
    maxRefundable: 2450,
    status: 'Cancelled',
  };

  const handleInitiateRefund = () => {
    if (!reason.trim() || !amount.trim()) {
      alert('Please fill all required fields');
      return;
    }
    console.log('Refund initiated:', { order: order.orderId, reason, amount });
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
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Initiate Refund</Text>
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
          <Text style={styles.fieldLabel}>STATUS</Text>
          <View style={styles.cancelledBadge}>
            <Text style={styles.cancelledText}>{order.status}</Text>
          </View>
        </View>

        {/* Refund Reason */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Refund Reason</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.reasonInput, { color: theme.colors.text.primary }]}
            placeholder="Enter refund reason...."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />
        </View>

        {/* Refund Amount */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Refund Amount</Text>
        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Rs.</Text>
            <TextInput
              style={[styles.amountValue, { color: teal }]}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.amountDivider} />
          <Text style={styles.maxText}>Maximum refundable : Rs. {order.maxRefundable || '2,450'}.00</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleInitiateRefund} activeOpacity={0.8}>
          <Text style={styles.submitText}>Initiate Refund</Text>
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

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  orderId: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  fieldValue: { fontSize: 15, fontWeight: '500' },
  cancelledBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  cancelledText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  reasonInput: { fontSize: 14, minHeight: 100, textAlignVertical: 'top', lineHeight: 22 },

  amountCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  amountLabel: { fontSize: 18, fontWeight: '600', color: '#94a3b8', marginRight: 8 },
  amountValue: { fontSize: 32, fontWeight: '800', flex: 1 },
  amountDivider: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 12 },
  maxText: { fontSize: 13, color: '#94a3b8' },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default RefundInitiationScreen;
