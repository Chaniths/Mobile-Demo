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

const RefundInitiationScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-038',
    customer: 'John Doe',
    totalAmount: 'Rs. 2,450.00',
    items: [
      { name: 'Heirloom Tomatoes', quantity: '5kg', price: 'Rs. 1,200' },
      { name: 'Organic Spinach', quantity: '10 bunches', price: 'Rs. 1,250' },
    ],
    status: 'Cancelled',
    cancellationReason: 'Customer request',
  };

  const refundReasons = [
    'Order Cancellation',
    'Product Quality Issue',
    'Delivery Delay',
    'Wrong Items Delivered',
    'Damaged Items',
    'Other',
  ];

  const handleInitiateRefund = () => {
    if (!reason.trim() || !amount.trim()) {
      alert('Please fill all required fields');
      return;
    }
    // In real app, this would make an API call
    console.log('Refund initiated:', { order: order.orderId, reason, amount });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode && (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      )}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Initiate Refund
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <View style={styles.divider} />
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Customer</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.customer}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order Total</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.totalAmount}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.error}20` }]}>
            <Text style={[styles.statusText, { color: theme.colors.error }]}>{order.status}</Text>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Refund Reason
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.reasonCard}>
          <TextInput
            style={[styles.input, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
            placeholder="Enter refund reason..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Refund Amount
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.amountCard}>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: theme.colors.text.secondary }]}>Rs.</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
              placeholder="0.00"
              placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <Text style={[styles.hint, { color: theme.colors.text.tertiary }]}>
            Maximum refundable: {order.totalAmount}
          </Text>
        </Card>

        <Button
          title="Initiate Refund"
          onPress={handleInitiateRefund}
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
    paddingBottom: 32,
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
  orderCard: { padding: 16, marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  orderId: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  detail: { fontSize: 14, marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  reasonCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  amountCard: { padding: 16, marginBottom: 24 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  currency: { fontSize: 18, fontWeight: '600', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700' },
  hint: { fontSize: 12, marginTop: 4 },
  submitButton: { marginTop: 8 },
});

export default RefundInitiationScreen;

