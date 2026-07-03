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

const SellerRejectScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const item = route?.params?.item || {
    id: '1',
    name: 'Baby Carrots',
    quantity: '3kg',
  };
=======
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
import FieldAdminFlowStepper from '../../components/common/FieldAdminFlowStepper';
import {
  confirmLeaveFlow,
  FLOW_STEPS,
  formatRejectedQtyLabel,
  withFlowUpdate,
} from '../../utils/fieldAdminQualityFlow';

const SellerRejectScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const flow = route?.params?.flow ?? null;
  const isFlowMode = Boolean(flow);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(flow?.orderId ?? route?.params?.order?.id ?? null);
  const [selectedItemId, setSelectedItemId] = useState(route?.params?.item?.id ?? null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [inspectionIds, setInspectionIds] = useState(flow?.inspectionIds ?? []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOrderPickerVisible, setIsOrderPickerVisible] = useState(false);
  const [isItemPickerVisible, setIsItemPickerVisible] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  useEffect(() => {
    if (isFlowMode) {
      return;
    }
    const loadOrders = async () => {
      try {
        setLoading(true);
        const scheduledOrders = await fieldAdminApi.getOrdersByTab('scheduled');
        const fallbackOrders = scheduledOrders?.length ? scheduledOrders : await fieldAdminApi.getOrdersByTab('all');
        const normalized = fallbackOrders ?? [];
        setOrders(normalized);
        if (!selectedOrderId && normalized.length > 0) {
          setSelectedOrderId(normalized[0].id);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load assigned orders.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [isFlowMode, selectedOrderId]);

  const flowCurrentItem = isFlowMode ? flow.rejectedItems[currentItemIndex] ?? null : null;
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

  const flowOrder = useMemo(() => {
    if (!isFlowMode || !flow?.order) return null;
    return {
      id: flow.order.id,
      orderId: flow.order.orderId,
      customer: flow.order.customer,
      routeNumber: '-',
    };
  }, [flow, isFlowMode]);

  const flowItem = useMemo(() => {
    if (!flowCurrentItem) return null;
    return {
      id: flowCurrentItem.itemId,
      name: flowCurrentItem.name,
      quantity: formatRejectedQtyLabel(flowCurrentItem),
    };
  }, [flowCurrentItem]);

  const selectedOrder = useMemo(
    () => orders.find((entry) => entry.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    if (isFlowMode) return;
    const availableItems = selectedOrder?.items ?? [];
    if (!availableItems.length) {
      setSelectedItemId(null);
      return;
    }
    const itemExists = availableItems.some((entry) => entry.id === selectedItemId);
    if (!itemExists) {
      setSelectedItemId(availableItems[0].id);
    }
  }, [selectedOrder, selectedItemId]);

  const item = useMemo(() => {
    if (isFlowMode) return flowItem;
    const found = (selectedOrder?.items ?? []).find((entry) => entry.id === selectedItemId);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      quantity: `${found.quantity} ${found.unit}`,
    };
  }, [isFlowMode, flowItem, selectedOrder, selectedItemId]);

  const order = useMemo(() => {
    if (isFlowMode) return flowOrder;
    if (!selectedOrder) return null;
    return {
      id: selectedOrder.id,
      orderId: selectedOrder.orderNumber,
      customer: selectedOrder.customer,
      routeNumber: selectedOrder.route?.routeNumber ?? '-',
    };
  }, [isFlowMode, flowOrder, selectedOrder]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((entry) =>
      `${entry.orderNumber ?? ''} ${entry.customer ?? ''}`.toLowerCase().includes(query)
    );
  }, [orders, orderSearch]);

  const filteredItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    const items = selectedOrder?.items ?? [];
    if (!query) return items;
    return items.filter((entry) => entry.name?.toLowerCase().includes(query));
  }, [selectedOrder, itemSearch]);

  const rejectionReasons = [
    'Poor Quality',
    'Damaged Items',
    'Expired/ Stale',
    'Wrong Quantity',
    'Not Fresh',
    'Packaging Issues',
    'Other',
  ];

  const handleReject = () => {
<<<<<<< HEAD
    if (!selectedReason && !customReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    console.log('Product rejected:', { item, order: order.orderId, reason: selectedReason || customReason });
=======
    if (!item?.id) {
      Alert.alert('Unavailable', 'No order item selected.');
      return;
    }
    if (!selectedReason && !reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    const rejectionReason = selectedReason || 'Other';
    const rejectionDetails = selectedReason === 'Other' || !selectedReason ? reason.trim() : reason.trim();
    const notes = [flow?.qualityNotes, rejectionReason, rejectionDetails].filter(Boolean).join(' | ');

    setSubmitting(true);

    const flowItemData = isFlowMode ? flowCurrentItem : null;
    const isFullReject = flowItemData ? flowItemData.quality === 'rejected' : true;
    const approvedQuantity = flowItemData
      ? flowItemData.approvedQuantity
      : 0;

    fieldAdminApi
      .submitQualityReview({
        orderItemId: item.id,
        rejected: isFullReject,
        approvedQuantity,
        notes,
        rejectionReason,
        rejectionDetails: rejectionDetails || undefined,
      })
      .then((result) => {
        if (!isFlowMode) {
          Alert.alert('Success', 'Rejection submitted.');
          setReason('');
          setSelectedReason('');
          return fieldAdminApi.getOrdersByTab('scheduled');
        }

        const nextInspectionIds = [...inspectionIds, result?.id].filter(Boolean);
        const isLastItem = currentItemIndex >= flow.rejectedItems.length - 1;

        if (!isLastItem) {
          setInspectionIds(nextInspectionIds);
          setCurrentItemIndex((prev) => prev + 1);
          setReason('');
          setSelectedReason('');
          return null;
        }

        const updatedFlow = withFlowUpdate(flow, { inspectionIds: nextInspectionIds });
        navigation.navigate('DamageReport', { flow: updatedFlow, step: FLOW_STEPS.DAMAGE });
        return null;
      })
      .then((refreshedOrders) => {
        if (refreshedOrders) {
          setOrders(refreshedOrders);
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to submit rejection.'))
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
<<<<<<< HEAD
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
=======
          <TouchableOpacity onPress={handleBackPress}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Reject Products</Text>
          <View style={{ width: 70 }} />
        </View>

<<<<<<< HEAD
        {/* Product Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PRODUCT</Text>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>{item.name}</Text>
          <Text style={styles.productQty}>{item.quantity}</Text>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>ORDER ID</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <Text style={styles.fieldLabel}>SELLER</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.seller}</Text>
        </View>

        {/* Rejection Reasons */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Select Rejection Reason</Text>
        <View style={styles.reasonsList}>
          {rejectionReasons.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonPill, isSelected && styles.reasonPillActive]}
                onPress={() => {
                  setSelectedReason(reason);
                  if (reason !== 'Other') setCustomReason('');
                }}
                activeOpacity={0.7}
=======
        {isFlowMode ? <FieldAdminFlowStepper currentStep={FLOW_STEPS.REJECT} /> : null}
        {isFlowMode && flow.rejectedItems.length > 1 ? (
          <Text style={[styles.flowProgress, { color: theme.colors.text.secondary }]}>
            Item {currentItemIndex + 1} of {flow.rejectedItems.length}
          </Text>
        ) : null}

        {loading ? <ActivityIndicator color={theme.colors.primary.main} style={{ marginBottom: 16 }} /> : null}
        {!loading && !order ? (
          <Text style={{ color: theme.colors.text.secondary, marginBottom: 16 }}>
            No assigned orders available for rejection.
          </Text>
        ) : null}

        {order && !isFlowMode ? (
          <>
            <TouchableOpacity
              style={[
                styles.openPickerButton,
                {
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                },
              ]}
              onPress={() => setIsOrderPickerVisible(true)}
            >
              <Text style={[styles.openPickerText, { color: theme.colors.text.primary }]}>{`Order: ${order.orderId}`}</Text>
              <Text style={[styles.openPickerChevron, { color: theme.colors.primary.main }]}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.openPickerButton,
                {
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                },
              ]}
              onPress={() => setIsItemPickerVisible(true)}
            >
              <Text style={[styles.openPickerText, { color: theme.colors.text.primary }]}>
                {item ? `Item: ${item.name}` : 'Select item'}
              </Text>
              <Text style={[styles.openPickerChevron, { color: theme.colors.primary.main }]}>▼</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {/* Product Info */}
        {item && order ? (
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.productCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Product
          </Text>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.productQuantity, { color: theme.colors.text.secondary }]}>
            {item.quantity}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb' }]} />
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Order ID
          </Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
            {order.orderId}
          </Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Customer
          </Text>
          <Text style={[styles.seller, { color: theme.colors.text.primary }]}>
            {order.customer}
          </Text>
        </Card>
        ) : null}

        {/* Rejection Reasons */}
        {item ? (
        <>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Select Rejection Reason
        </Text>
        <View style={styles.reasonsContainer}>
          {rejectionReasons.map((reasonOption) => (
            <TouchableOpacity
              key={reasonOption}
              style={[
                styles.reasonCard,
                {
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.colors.card || '#f9fafb',
                },
                selectedReason === reasonOption && {
                  backgroundColor: `${theme.colors.error}20`,
                  borderColor: theme.colors.error,
                },
              ]}
              onPress={() => {
                setSelectedReason(reasonOption);
                if (reasonOption !== 'Other') {
                  setReason('');
                }
              }}
            >
              <Text
                style={[
                  styles.reasonText,
                  { color: theme.colors.text.primary },
                  selectedReason === reasonOption && { color: theme.colors.error, fontWeight: '700' },
                ]}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
              >
                <Text style={[styles.reasonText, { color: theme.colors.text.primary }, isSelected && styles.reasonTextActive]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {(selectedReason === 'Other' || !selectedReason) && (
          <>
<<<<<<< HEAD
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Additional Details</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={[styles.textInput, { color: theme.colors.text.primary }]}
=======
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Additional Details (Required)
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.detailsCard}>
              <TextInput
                style={[styles.detailsInput, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
                placeholder="Describe the issue in detail..."
                placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
                multiline
                numberOfLines={5}
                value={customReason}
                onChangeText={setCustomReason}
              />
            </View>
          </>
        )}

        {/* Actions */}
<<<<<<< HEAD
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleReject} activeOpacity={0.8}>
          <Text style={styles.submitText}>Submit Rejection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={[styles.cancelText, { color: theme.colors.text.secondary }]}>Cancel</Text>
        </TouchableOpacity>
=======
        <View style={styles.actionsContainer}>
          <Button
            title={submitting ? 'Submitting...' : isFlowMode && currentItemIndex < flow.rejectedItems.length - 1 ? 'Submit & Next Item' : 'Submit Rejection'}
            onPress={handleReject}
            disabled={submitting}
            style={styles.rejectButton}
          />
          {!isFlowMode ? (
          <Button
            title="Cancel"
            onPress={handleBackPress}
            variant="outline"
            style={styles.cancelButton}
          />
          ) : null}
        </View>
        </>
        ) : null}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
      </ScrollView>
      <Modal
        visible={isOrderPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOrderPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsOrderPickerVisible(false)} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: theme.colors.surface, borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0' },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Select Assigned Order</Text>
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
                      setIsOrderPickerVisible(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.modalPrimaryText, { color: theme.colors.text.primary }]}>{entry.orderNumber}</Text>
                      <Text style={[styles.modalSecondaryText, { color: theme.colors.text.secondary }]}>
                        {entry.customer} • {entry.items?.length ?? 0} items
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
            <Button title="Close" onPress={() => setIsOrderPickerVisible(false)} style={styles.modalCloseButton} />
          </View>
        </View>
      </Modal>
      <Modal
        visible={isItemPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsItemPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsItemPickerVisible(false)} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: theme.colors.surface, borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0' },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Select Product Item</Text>
            <TextInput
              style={[
                styles.modalSearchInput,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                },
              ]}
              placeholder="Search item..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={itemSearch}
              onChangeText={setItemSearch}
            />
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {filteredItems.map((entry) => {
                const active = entry.id === selectedItemId;
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
                      setSelectedItemId(entry.id);
                      setIsItemPickerVisible(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.modalPrimaryText, { color: theme.colors.text.primary }]}>{entry.name}</Text>
                      <Text style={[styles.modalSecondaryText, { color: theme.colors.text.secondary }]}>
                        {entry.quantity} {entry.unit}
                      </Text>
                    </View>
                    {active ? <Text style={[styles.modalSelectedTick, { color: theme.colors.primary.main }]}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
              {filteredItems.length === 0 ? (
                <Text style={[styles.modalEmptyText, { color: theme.colors.text.secondary }]}>No matching items.</Text>
              ) : null}
            </ScrollView>
            <Button title="Close" onPress={() => setIsItemPickerVisible(false)} style={styles.modalCloseButton} />
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
=======
  backButton: {
    fontSize: 16,
    fontWeight: '600',
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  productName: { fontSize: 18, fontWeight: '800' },
  productQty: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  fieldValue: { fontSize: 15, fontWeight: '500', marginBottom: 4 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  reasonsList: { gap: 10, marginBottom: 24 },
  reasonPill: {
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
<<<<<<< HEAD
  reasonPillActive: {
    backgroundColor: '#fee2e2', borderColor: '#ef4444',
=======
  flowProgress: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
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
  productCard: {
    padding: 16,
    marginBottom: 24,
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  },
  reasonText: { fontSize: 15, fontWeight: '500' },
  reasonTextActive: { color: '#ef4444', fontWeight: '700' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
<<<<<<< HEAD
  textInput: { fontSize: 14, minHeight: 120, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  cancelText: { fontSize: 16, fontWeight: '600' },
=======
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
  modalList: { maxHeight: 340 },
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
  modalPrimaryText: { fontSize: 15, fontWeight: '700' },
  modalSecondaryText: { fontSize: 12, marginTop: 4 },
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

export default SellerRejectScreen;
