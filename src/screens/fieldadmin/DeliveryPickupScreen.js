import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
import AppIcon from '../../components/common/AppIcon';

const DeliveryPickupScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [actionType, setActionType] = useState(null);
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(route?.params?.order?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const [inTransitOrders, assignedOrders] = await Promise.all([
          fieldAdminApi.getOrdersByTab('in_transit'),
          fieldAdminApi.getOrdersByTab('scheduled'),
        ]);
        const mergedOrders = [...(inTransitOrders ?? []), ...(assignedOrders ?? [])];
        const dedupedOrders = mergedOrders.filter(
          (order, index, array) => array.findIndex((entry) => entry.id === order.id) === index
        );
        setOrders(dedupedOrders);
        if (!selectedOrderId && dedupedOrders.length) {
          setSelectedOrderId(dedupedOrders[0].id);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load delivery orders.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

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
      address: selectedOrder.address ?? '-',
      stopId: selectedOrder.deliveryStopId,
      routeNumber: selectedOrder.route?.routeNumber ?? '-',
    };
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((entry) =>
      `${entry.orderNumber ?? ''} ${entry.customer ?? ''} ${entry.status ?? ''} ${entry.address ?? ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [orders, orderSearch]);

  const quickSearchResults = useMemo(() => {
    const query = quickSearch.trim().toLowerCase();
    if (!query) return [];
    return orders
      .filter((entry) =>
        `${entry.orderNumber ?? ''} ${entry.customer ?? ''} ${entry.status ?? ''} ${entry.address ?? ''}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 5);
  }, [orders, quickSearch]);

  const handleMarkAction = () => {
    if (!actionType) {
      alert('Please select an action');
      return;
    }
    if (!order?.stopId) {
      Alert.alert('Unavailable', 'No delivery stop linked to this order.');
      return;
    }
    const submit = async () => {
      try {
        setSubmitting(true);
        await fieldAdminApi.markDeliveryComplete({
          stopId: order.stopId,
          notes: [actionType === 'pickup' ? 'Pickup confirmed' : 'Delivery confirmed', signature, notes]
            .filter(Boolean)
            .join(' | '),
        });
        Alert.alert('Success', `${actionType === 'delivery' ? 'Delivery' : 'Pickup'} marked complete.`);
        const [refreshedInTransitOrders, refreshedAssignedOrders] = await Promise.all([
          fieldAdminApi.getOrdersByTab('in_transit'),
          fieldAdminApi.getOrdersByTab('scheduled'),
        ]);
        const refreshedMerged = [...(refreshedInTransitOrders ?? []), ...(refreshedAssignedOrders ?? [])];
        const refreshedOrders = refreshedMerged.filter(
          (entry, index, array) => array.findIndex((item) => item.id === entry.id) === index
        );
        setOrders(refreshedOrders);
        const stillExists = refreshedOrders.some((entry) => entry.id === order.id);
        if (!stillExists) {
          setSelectedOrderId(refreshedOrders?.[0]?.id ?? null);
        }
        setSignature('');
        setNotes('');
        setActionType(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to update delivery status.');
      } finally {
        setSubmitting(false);
      }
    };
    submit();
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Delivery / Pickup</Text>
          <View style={{ width: 70 }} />
        </View>

        {loading ? <ActivityIndicator color={theme.colors.primary.main} style={{ marginBottom: 16 }} /> : null}
        {order ? (
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
        <TextInput
          style={[
            styles.quickSearchInput,
            {
              color: theme.colors.text.primary,
              borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
              backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
            },
          ]}
          placeholder="Quick search by order, customer, address..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={quickSearch}
          onChangeText={setQuickSearch}
        />
        {quickSearchResults.length > 0 ? (
          <View style={styles.quickSearchResults}>
            {quickSearchResults.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[
                  styles.quickResultItem,
                  { borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb' },
                ]}
                onPress={() => {
                  setSelectedOrderId(entry.id);
                  setQuickSearch('');
                }}
              >
                <Text style={[styles.quickResultPrimary, { color: theme.colors.text.primary }]}>
                  {entry.orderNumber}
                </Text>
                <Text style={[styles.quickResultSecondary, { color: theme.colors.text.secondary }]}>
                  {entry.customer} • {entry.status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        {order ? (
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <View style={styles.divider} />
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Customer</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.customer}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Address</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.address}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Route</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.routeNumber}</Text>
        </Card>
        ) : (
          <Text style={{ color: theme.colors.text.secondary, marginBottom: 16 }}>
            No assigned/in-transit delivery order available.
          </Text>
        )}

        {/* Action Buttons */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Select Action</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, actionType === 'delivery' && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}
            onPress={() => setActionType('delivery')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <AppIcon
                name="check"
                size={18}
                color={actionType === 'delivery' ? '#fff' : theme.colors.text.primary}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  actionType === 'delivery' && { color: '#fff' },
                  !actionType && { color: theme.colors.text.primary },
                ]}
              >
                Mark Delivered
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, actionType === 'pickup' && { backgroundColor: teal, borderColor: teal }]}
            onPress={() => setActionType('pickup')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <AppIcon
                name="orders"
                size={18}
                color={actionType === 'pickup' ? '#fff' : theme.colors.text.primary}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  actionType === 'pickup' && { color: '#fff' },
                  !actionType && { color: theme.colors.text.primary },
                ]}
              >
                Mark Picked Up
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {actionType && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Customer Signature / Confirmation
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.signatureCard}>
              <TextInput
                style={[styles.input, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
                placeholder="Enter customer name or signature..."
                placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
                value={signature}
                onChangeText={setSignature}
              />
            </Card>

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Additional Notes
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.notesCard}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder="Add any notes..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </Card>

            <Button
              title={submitting ? 'Submitting...' : `Confirm ${actionType === 'delivery' ? 'Delivery' : 'Pickup'}`}
              onPress={handleMarkAction}
              disabled={submitting || !order}
              style={styles.submitButton}
            />
          </>
        )}
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
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Select Delivery Order</Text>
            <TextInput
              style={[
                styles.modalSearchInput,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                },
              ]}
              placeholder="Search order/customer/address/status..."
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
                      <Text style={[styles.modalOrderMeta, { color: theme.colors.text.secondary }]}>{entry.customer}</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
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
  quickSearchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  quickSearchResults: { marginBottom: 12, gap: 8 },
  quickResultItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickResultPrimary: { fontSize: 14, fontWeight: '700' },
  quickResultSecondary: { fontSize: 12, marginTop: 2 },
  orderCard: { padding: 16, marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  orderId: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  detail: { fontSize: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  actionButtonText: { fontSize: 15, fontWeight: '600' },
  actionButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signatureCard: { padding: 16, marginBottom: 24 },
  notesCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 50, textAlignVertical: 'top' },
  submitButton: { marginTop: 8 },
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
});

export default DeliveryPickupScreen;
