import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
<<<<<<< HEAD
import BackgroundShapes from '../../components/common/BackgroundShapes';
=======
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
import FieldAdminFlowStepper from '../../components/common/FieldAdminFlowStepper';
import { confirmLeaveFlow, FLOW_STEPS } from '../../utils/fieldAdminQualityFlow';

const buildRefundDefaults = (selectedOrder) => {
  if (!selectedOrder) {
    return { amount: '', reason: '' };
  }

  const refundableItems = (selectedOrder.items ?? []).filter((item) => item.refundableQuantity > 0);
  const refundableAmount = Number(selectedOrder.refundableAmount ?? 0);
  const orderLabel = selectedOrder.orderNumber ?? selectedOrder.id;

  const itemSummary = refundableItems
    .map((item) => `${item.name} (${item.refundableQuantity} ${item.unit})`)
    .join(', ');

  const reason = itemSummary
    ? `Quality rejection refund for order ${orderLabel}: ${itemSummary}`
    : `Quality rejection refund for order ${orderLabel}`;

  return {
    amount: refundableAmount > 0 ? refundableAmount.toFixed(2) : '',
    reason,
  };
};
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

const RefundInitiationScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const flow = route?.params?.flow ?? null;
  const isFlowMode = Boolean(flow);
  const [reason, setReason] = useState('');
<<<<<<< HEAD
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

=======
  const [amount, setAmount] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(flow?.orderId ?? null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const eligibleOrders = await fieldAdminApi.getRefundEligibleOrders();
        const normalizedOrders = eligibleOrders ?? [];
        setOrders(normalizedOrders);

        const initialOrderId = flow?.orderId ?? route?.params?.order?.id;
        const validSelectedOrderId = normalizedOrders.some((entry) => entry.id === initialOrderId)
          ? initialOrderId
          : normalizedOrders[0]?.id ?? null;

        setSelectedOrderId(validSelectedOrderId);
      } catch {
        Alert.alert('Error', 'Failed to load orders for refund.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [route?.params?.order?.id, flow?.orderId]);

  const selectedOrder = useMemo(
    () => orders.find((entry) => entry.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const order = useMemo(() => {
    if (!selectedOrder) return null;
    return {
      id: selectedOrder.id,
      orderId: selectedOrder.orderNumber ?? selectedOrder.id,
      customer: selectedOrder.customer ?? 'Customer',
      totalAmount: `Rs. ${Number(selectedOrder.totalAmount ?? 0).toFixed(2)}`,
      refundableAmount: Number(selectedOrder.refundableAmount ?? 0),
      status: selectedOrder.status ?? 'N/A',
      items: (selectedOrder.items ?? []).filter((item) => item.refundableQuantity > 0),
    };
  }, [selectedOrder]);

  useEffect(() => {
    const defaults = buildRefundDefaults(selectedOrder);
    setAmount(defaults.amount);
    setReason(defaults.reason);
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((entry) =>
      `${entry.orderNumber ?? ''} ${entry.customer ?? ''}`.toLowerCase().includes(query)
    );
  }, [orders, orderSearch]);

>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  const handleInitiateRefund = () => {
    if (!reason.trim() || !amount.trim()) {
      alert('Please fill all required fields');
      return;
    }
<<<<<<< HEAD
    console.log('Refund initiated:', { order: order.orderId, reason, amount });
=======
    if (!order?.id) {
      Alert.alert('Error', 'No order selected for refund.');
      return;
    }
    const requestedAmount = Number(amount);
    if (requestedAmount <= 0 || requestedAmount > order.refundableAmount) {
      Alert.alert('Error', `Refund amount must be between 0 and Rs. ${order.refundableAmount.toFixed(2)}.`);
      return;
    }

    const orderItemIds = order.items?.map((item) => item.id) ?? [];

    setSubmitting(true);
    fieldAdminApi
      .initiateRefund({
        orderId: order.id,
        amount: requestedAmount,
        reason,
        orderItemIds,
      })
      .then(() => {
        if (isFlowMode) {
          Alert.alert(
            'Workflow complete',
            'Quality issue resolved: rejection logged, damage reported, and refund initiated.',
            [
              {
                text: 'Back to Home',
                onPress: () => navigation.navigate('Home'),
              },
            ]
          );
          return null;
        }
        Alert.alert('Success', 'Refund initiated.');
        return fieldAdminApi.getRefundEligibleOrders();
      })
      .then((eligibleOrders) => {
        if (eligibleOrders) {
          setOrders(eligibleOrders);
          const stillExists = eligibleOrders.some((entry) => entry.id === order.id);
          const nextOrderId = stillExists ? order.id : (eligibleOrders[0]?.id ?? null);
          setSelectedOrderId(nextOrderId);
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to initiate refund.'))
      .finally(() => setSubmitting(false));
  };

  const handleBackPress = () => {
    if (isFlowMode) {
      confirmLeaveFlow(() => navigation.goBack());
      return;
    }
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
    navigation.goBack();
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
          <TouchableOpacity onPress={handleBackPress}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Initiate Refund</Text>
          <View style={{ width: 70 }} />
        </View>

<<<<<<< HEAD
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
=======
        {isFlowMode ? <FieldAdminFlowStepper currentStep={FLOW_STEPS.REFUND} /> : null}
        {isFlowMode && order ? (
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.flowOrderBanner}>
            <Text style={[styles.flowOrderText, { color: theme.colors.text.secondary }]}>
              Final step — refund for order {order.orderId}
            </Text>
          </Card>
        ) : null}

        {loading ? <ActivityIndicator color={theme.colors.primary.main} style={{ marginBottom: 16 }} /> : null}
        {order && !isFlowMode ? (
          <TouchableOpacity
            style={[
              styles.openPickerButton,
              {
                borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              },
            ]}
            onPress={() => setIsPickerVisible(true)}
          >
            <Text style={[styles.openPickerText, { color: theme.colors.text.primary }]}>
              {`Order: ${order.orderId}`}
            </Text>
            <Text style={[styles.openPickerChevron, { color: theme.colors.primary.main }]}>▼</Text>
          </TouchableOpacity>
        ) : null}
        {!loading && !order ? (
          <Text style={{ color: theme.colors.text.secondary, marginBottom: 16 }}>
            No partially/fully rejected orders are available for refund.
          </Text>
        ) : null}

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order?.orderId ?? '-'}</Text>
          <View style={styles.divider} />
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Customer</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order?.customer ?? '-'}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order Total</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order?.totalAmount ?? 'Rs. 0.00'}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Max Refund</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{`Rs. ${order?.refundableAmount?.toFixed(2) ?? '0.00'}`}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.error}20` }]}> 
            <Text style={[styles.statusText, { color: theme.colors.error }]}>{order?.status ?? 'N/A'}</Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </View>
        </View>

<<<<<<< HEAD
        {/* Refund Reason */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Refund Reason</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.reasonInput, { color: theme.colors.text.primary }]}
            placeholder="Enter refund reason...."
            placeholderTextColor={theme.colors.text.tertiary}
=======
        {order?.items?.length ? (
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.refundItemsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, marginBottom: 8 }]}>Refundable Items</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.refundItemRow}>
                <View style={styles.refundItemLeft}>
                  <Text style={[styles.refundItemName, { color: theme.colors.text.primary }]}>{item.name}</Text>
                  <Text style={[styles.refundItemMeta, { color: theme.colors.text.secondary }]}>Rejected: {item.rejectedQuantity} {item.unit}</Text>
                  <Text style={[styles.refundItemMeta, { color: theme.colors.text.secondary }]}>Refundable: {item.refundableQuantity} {item.unit}</Text>
                </View>
                <Text style={[styles.refundItemAmount, { color: theme.colors.text.primary }]}>Rs. {Number(item.refundableAmount ?? 0).toFixed(2)}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Refund Reason
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.reasonCard}>
          <TextInput
            style={[styles.input, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
            placeholder="Enter refund reason..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />
        </View>

<<<<<<< HEAD
        {/* Refund Amount */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Refund Amount</Text>
        <View style={styles.amountCard}>
=======
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Refund Amount
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.amountCard}>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Rs.</Text>
            <TextInput
<<<<<<< HEAD
              style={[styles.amountValue, { color: teal }]}
=======
              style={[styles.amountInput, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
              placeholder="0.00"
              placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
<<<<<<< HEAD
          <View style={styles.amountDivider} />
          <Text style={styles.maxText}>Maximum refundable : Rs. {order.maxRefundable || '2,450'}.00</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleInitiateRefund} activeOpacity={0.8}>
          <Text style={styles.submitText}>Initiate Refund</Text>
        </TouchableOpacity>
=======
          <Text style={[styles.hint, { color: theme.colors.text.tertiary }]}>
            Auto-filled from selected order. Maximum refundable: Rs. {order?.refundableAmount?.toFixed(2) ?? '0.00'}
          </Text>
        </Card>

        <Button
          title={submitting ? 'Submitting...' : 'Initiate Refund'}
          onPress={handleInitiateRefund}
          disabled={submitting || !order}
          style={styles.submitButton}
        />
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
      </ScrollView>
      <Modal
        visible={isPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsPickerVisible(false)} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: theme.colors.surface, borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0' },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Select Refund-Eligible Order</Text>
            <TextInput
              style={[
                styles.modalSearchInput,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                },
              ]}
              placeholder="Search order/customer..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={orderSearch}
              onChangeText={setOrderSearch}
            />
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {filteredOrders.map((entry) => {
                const active = entry.id === selectedOrderId;
                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={[
                      styles.modalListItem,
                      { borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb' },
                      active && {
                        borderColor: theme.colors.primary.main,
                        backgroundColor: theme.isDarkMode ? 'rgba(45, 122, 135, 0.25)' : 'rgba(22, 163, 74, 0.12)',
                      },
                    ]}
                    onPress={() => {
                      setSelectedOrderId(entry.id);
                      setIsPickerVisible(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.modalOrderNumber, { color: theme.colors.text.primary }]}>{entry.orderNumber}</Text>
                      <Text style={[styles.modalOrderMeta, { color: theme.colors.text.secondary }]}>
                        {entry.customer} • Refund: Rs. {Number(entry.refundableAmount ?? 0).toFixed(2)}
                      </Text>
                    </View>
                    {active ? <Text style={[styles.modalSelectedTick, { color: theme.colors.primary.main }]}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
              {filteredOrders.length === 0 ? (
                <Text style={[styles.modalEmptyText, { color: theme.colors.text.secondary }]}>No matching orders.</Text>
              ) : null}
            </ScrollView>
            <Button title="Close" onPress={() => setIsPickerVisible(false)} style={styles.modalCloseButton} />
          </View>
        </View>
      </Modal>
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
    paddingBottom: 120,
    zIndex: 1,
  },
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
<<<<<<< HEAD
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
=======
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  openPickerButton: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openPickerText: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  openPickerChevron: { fontSize: 14, fontWeight: '700' },
  orderCard: { padding: 16, marginBottom: 24 },
  flowOrderBanner: { padding: 12, marginBottom: 16 },
  flowOrderText: { fontSize: 13, textAlign: 'center' },
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
  submitButton: { marginTop: 8, marginBottom: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: '72%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#94a3b8',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  modalSearchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  modalList: { maxHeight: 320 },
  modalListItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOrderNumber: { fontSize: 15, fontWeight: '700' },
  modalOrderMeta: { fontSize: 12, marginTop: 4 },
  modalSelectedTick: { fontSize: 16, fontWeight: '700' },
  modalEmptyText: { textAlign: 'center', paddingVertical: 16, fontSize: 13 },
  modalCloseButton: { marginTop: 4 },
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

export default RefundInitiationScreen;
