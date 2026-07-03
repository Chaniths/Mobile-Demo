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
import {
  buildAffectedItemsSummary,
  confirmLeaveFlow,
  FLOW_STEPS,
  withFlowUpdate,
} from '../../utils/fieldAdminQualityFlow';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

const DamageReportScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const flow = route?.params?.flow ?? null;
  const isFlowMode = Boolean(flow);
  const [damageType, setDamageType] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [affectedItems, setAffectedItems] = useState(
    isFlowMode ? buildAffectedItemsSummary(flow.rejectedItems) : ''
  );
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(
    flow?.orderId ?? route?.params?.order?.id ?? null
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

<<<<<<< HEAD
  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-042',
    customer: 'John Doe',
  };
=======
  useEffect(() => {
    if (isFlowMode) return undefined;
    const loadOrders = async () => {
      try {
        setLoading(true);
        const [inTransitOrders, deliveredOrders] = await Promise.all([
          fieldAdminApi.getOrdersByTab('in_transit'),
          fieldAdminApi.getOrdersByTab('delivered'),
        ]);
        const mergedOrders = [...(inTransitOrders ?? []), ...(deliveredOrders ?? [])];
        const dedupedOrders = mergedOrders.filter(
          (order, index, array) => array.findIndex((entry) => entry.id === order.id) === index
        );
        setOrders(dedupedOrders);
        if (!selectedOrderId && dedupedOrders.length) {
          setSelectedOrderId(dedupedOrders[0].id);
        }
      } catch {
        Alert.alert('Error', 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [isFlowMode]);

  const flowOrder = useMemo(() => {
    if (!isFlowMode || !flow?.order) return null;
    return {
      id: flow.order.id,
      orderId: flow.order.orderId,
      customer: flow.order.customer,
      stopId: flow.order.stopId,
      status: 'IN_FLOW',
    };
  }, [flow, isFlowMode]);

  const selectedOrder = useMemo(
    () => orders.find((entry) => entry.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const order = useMemo(() => {
    if (isFlowMode) return flowOrder;
    if (!selectedOrder) return null;
    return {
      id: selectedOrder.id,
      orderId: selectedOrder.orderNumber ?? selectedOrder.id,
      customer: selectedOrder.customer ?? 'Customer',
      stopId: selectedOrder.deliveryStopId ?? null,
      status: selectedOrder.status ?? 'N/A',
    };
  }, [isFlowMode, flowOrder, selectedOrder]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((entry) =>
      `${entry.orderNumber ?? ''} ${entry.customer ?? ''} ${entry.status ?? ''}`.toLowerCase().includes(query)
    );
  }, [orders, orderSearch]);
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

  const damageTypes = ['Product Damage', 'Packaging Damage', 'Transport Damage', 'Other'];
  const severityLevels = ['Minor', 'Moderate', 'Severe', 'Critical'];

  const handleSubmitReport = () => {
    if (!damageType || !severity || !description.trim()) {
      alert('Please fill all required fields');
      return;
    }
<<<<<<< HEAD
    console.log('Damage reported:', { orderId: order.orderId, damageType, severity, description, affectedItems });
=======
    setSubmitting(true);
    const orderItemIds = isFlowMode ? flow.rejectedItems.map((entry) => entry.itemId) : undefined;
    const inspectionIds = isFlowMode ? flow.inspectionIds : undefined;

    fieldAdminApi
      .submitDamageReport({
        stopId: order?.stopId,
        damageType,
        severity,
        affectedItems,
        orderItemIds,
        inspectionIds,
        description: `${damageType} | ${severity} | ${description}${affectedItems ? ` | Items: ${affectedItems}` : ''}`,
      })
      .then((result) => {
        if (isFlowMode) {
          const updatedFlow = withFlowUpdate(flow, { damageReportId: result?.id });
          navigation.navigate('RefundInitiation', { flow: updatedFlow, step: FLOW_STEPS.REFUND });
          return null;
        }
        Alert.alert('Success', 'Damage report submitted.');
        setDamageType('');
        setSeverity('');
        setDescription('');
        setAffectedItems('');
        return null;
      })
      .catch(() => Alert.alert('Error', 'Failed to submit damage report.'))
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
      <BackgroundShapes variant="detail" />
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
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Report Damage</Text>
          <View style={{ width: 70 }} />
        </View>

<<<<<<< HEAD
        {/* Order Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ORDER ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <Text style={styles.fieldLabel}>CUSTOMER</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.customer}</Text>
=======
        {isFlowMode ? <FieldAdminFlowStepper currentStep={FLOW_STEPS.DAMAGE} /> : null}
        {isFlowMode && order ? (
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.flowOrderBanner}>
            <Text style={[styles.flowOrderText, { color: theme.colors.text.secondary }]}>
              Quality issue workflow — Order {order.orderId}
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
            No delivered or in-transit orders available.
          </Text>
        ) : null}

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order?.orderId ?? '-'}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Customer</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order?.customer ?? '-'}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Status</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order?.status ?? '-'}</Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Damage Type
        </Text>
        <View style={styles.optionsContainer}>
          {damageTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionCard,
                {
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.colors.card || '#f9fafb',
                },
                damageType === type && {
                  borderColor: theme.colors.error,
                  backgroundColor: `${theme.colors.error}20`,
                },
              ]}
              onPress={() => setDamageType(type)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: theme.colors.text.primary },
                  damageType === type && { color: theme.colors.error, fontWeight: '700' },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
        </View>

        {/* Damage Type */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Damage Type</Text>
        <View style={styles.pillList}>
          {damageTypes.map((type) => {
            const isSelected = damageType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.pill, isSelected && { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}
                onPress={() => setDamageType(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: theme.colors.text.primary }, isSelected && { color: '#ef4444', fontWeight: '700' }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

<<<<<<< HEAD
        {/* Severity */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Severity Level</Text>
        <View style={styles.pillList}>
          {severityLevels.map((level) => {
            const isSelected = severity === level;
            return (
              <TouchableOpacity
                key={level}
                style={[styles.pill, isSelected && { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}
                onPress={() => setSeverity(level)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: theme.colors.text.primary }, isSelected && { color: '#f59e0b', fontWeight: '700' }]}>
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Affected Items */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Affected Items</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary, minHeight: 80 }]}
            placeholder="List damaged items..."
            placeholderTextColor={theme.colors.text.tertiary}
=======
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Affected Items
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.inputCard}>
          <TextInput
            style={[styles.input, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
            placeholder="List damaged items (e.g., Tomatoes - 2kg, Spinach - 5 bunches)..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            multiline
            numberOfLines={3}
            value={affectedItems}
            onChangeText={setAffectedItems}
          />
        </View>

<<<<<<< HEAD
        {/* Description */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Description (Required)</Text>
        <View style={styles.inputCard}>
=======
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Description (Required)
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.inputCard}>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary, minHeight: 120 }]}
            placeholder="Describe the damage in detail..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
          />
        </View>

<<<<<<< HEAD
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleSubmitReport} activeOpacity={0.8}>
          <Text style={styles.submitText}>Submit Damage Report</Text>
        </TouchableOpacity>
=======
        <Button
          title={submitting ? 'Submitting...' : 'Submit Damage Report'}
          onPress={handleSubmitReport}
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
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Select Order</Text>
            <TextInput
              style={[
                styles.modalSearchInput,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                },
              ]}
              placeholder="Search order/customer/status..."
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
                        {entry.customer} • {entry.status}
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
  fieldValue: { fontSize: 15, fontWeight: '500' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  pillList: { gap: 10, marginBottom: 24 },
  pill: {
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  pillText: { fontSize: 15, fontWeight: '500' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
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
  orderId: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  detail: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  optionsContainer: { gap: 10, marginBottom: 24 },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 15, fontWeight: '500' },
  inputCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
});

export default DamageReportScreen;
