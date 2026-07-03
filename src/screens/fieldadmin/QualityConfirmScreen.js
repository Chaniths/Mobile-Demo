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
<<<<<<< HEAD
import BackgroundShapes from '../../components/common/BackgroundShapes';
=======
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
import FieldAdminFlowStepper from '../../components/common/FieldAdminFlowStepper';
import { buildQualityFlow, FLOW_STEPS } from '../../utils/fieldAdminQualityFlow';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

const QualityConfirmScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [notes, setNotes] = useState('');
  const [partialQuantities, setPartialQuantities] = useState({});
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(route?.params?.order?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

<<<<<<< HEAD
  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-045',
    seller: 'Green Market',
    sellerId: 'seller-001',
    date: '2024-12-09',
    items: [
      { id: '1', name: 'Heirloom Tomatoes', quantity: '5kg', quantityValue: 5, quantityUnit: 'kg' },
      { id: '2', name: 'Organic Spinach', quantity: '10 bunches', quantityValue: 10, quantityUnit: 'bunches' },
      { id: '3', name: 'Baby Carrots', quantity: '3kg', quantityValue: 3, quantityUnit: 'kg' },
    ],
  };
=======
  useEffect(() => {
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
        Alert.alert('Error', 'Failed to load quality-check orders.');
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
      routeNumber: selectedOrder.route?.routeNumber ?? '-',
      date: selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleDateString() : '-',
      items: (selectedOrder.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        quantity: `${item.quantity} ${item.unit}`,
        quantityValue: item.quantity,
        quantityUnit: item.unit,
      })),
    };
  }, [selectedOrder]);

  useEffect(() => {
    setSelectedProducts([]);
    setPartialQuantities({});
    setNotes('');
  }, [selectedOrderId]);

  const warningColor = theme.colors.warning || theme.colors.accent?.yellow || '#f59e0b';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

  const teal = theme.colors.primary?.main || '#14b8a6';

  const handleQualityCheck = (itemId, quality, item) => {
    const totalQuantity = item.quantityValue || 0;
    setSelectedProducts((prev) => {
      const filtered = prev.filter((p) => p.itemId !== itemId);
<<<<<<< HEAD
      const entry = { itemId, quality };
      if (quality === 'approved') {
        entry.approvedQuantity = item.quantityValue;
        entry.approvedUnit = item.quantityUnit;
        setPartialQuantities((q) => { const n = { ...q }; delete n[itemId]; return n; });
      } else if (quality === 'rejected') {
        entry.approvedQuantity = 0;
        entry.approvedUnit = item.quantityUnit;
        setPartialQuantities((q) => { const n = { ...q }; delete n[itemId]; return n; });
      } else if (quality === 'partial') {
        entry.approvedQuantity = partialQuantities[itemId] || 0;
        entry.approvedUnit = item.quantityUnit;
      }
      return [...filtered, entry];
    });
  };

  const handlePartialQty = (itemId, value, item) => {
    const num = parseFloat(value) || 0;
    const max = item.quantityValue || 0;
    const clamped = Math.max(0, Math.min(num, max));
    setPartialQuantities((prev) => ({ ...prev, [itemId]: clamped }));
    if (clamped > 0 && clamped < max) {
      setSelectedProducts((prev) => {
        const filtered = prev.filter((p) => p.itemId !== itemId);
        return [...filtered, { itemId, quality: 'partial', approvedQuantity: clamped, approvedUnit: item.quantityUnit }];
      });
    } else if (clamped === max) {
      handleQualityCheck(itemId, 'approved', item);
    } else if (clamped === 0) {
=======
      let approvedQuantity = 0;
      if (quality === 'approved') {
        approvedQuantity = totalQuantity;
      } else if (quality === 'rejected') {
        approvedQuantity = 0;
      }

      if (quality !== 'partial') {
        setPartialQuantities((prevQty) => {
          const newQty = { ...prevQty };
          delete newQty[itemId];
          return newQty;
        });
      }

      return [
        ...filtered,
        {
          itemId,
          quality,
          approvedQuantity,
          approvedUnit: item.quantityUnit,
        },
      ];
    });
  };

  const handleEnterPartialMode = (itemId, item) => {
    setPartialQuantities((prev) => ({ ...prev, [itemId]: '' }));
    setSelectedProducts((prev) => {
      const filtered = prev.filter((p) => p.itemId !== itemId);
      return [
        ...filtered,
        {
          itemId,
          quality: 'partial',
          approvedQuantity: null,
          approvedUnit: item.quantityUnit,
        },
      ];
    });
  };

  const handlePartialQuantityChange = (itemId, value, item) => {
    const maxValue = item.quantityValue || 0;

    if (value === '' || value === '.') {
      setPartialQuantities((prev) => ({ ...prev, [itemId]: '' }));
      setSelectedProducts((prev) => {
        const filtered = prev.filter((p) => p.itemId !== itemId);
        return [
          ...filtered,
          {
            itemId,
            quality: 'partial',
            approvedQuantity: null,
            approvedUnit: item.quantityUnit,
          },
        ];
      });
      return;
    }

    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) return;

    const clampedValue = Math.max(0, Math.min(numValue, maxValue));
    setPartialQuantities((prev) => ({
      ...prev,
      [itemId]: clampedValue,
    }));

    if (clampedValue > 0 && clampedValue < maxValue) {
      setSelectedProducts((prev) => {
        const filtered = prev.filter((p) => p.itemId !== itemId);
        return [
          ...filtered,
          {
            itemId,
            quality: 'partial',
            approvedQuantity: clampedValue,
            approvedUnit: item.quantityUnit,
          },
        ];
      });
    } else if (clampedValue >= maxValue) {
      handleQualityCheck(itemId, 'approved', item);
    } else if (clampedValue === 0) {
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
      handleQualityCheck(itemId, 'rejected', item);
    }
  };

<<<<<<< HEAD
  const handleConfirm = () => {
    console.log('Quality reviews submitted:', { orderId: order.orderId, selectedProducts, notes });
    navigation.goBack();
  };

  const allChecked = order.items.every((item) =>
    selectedProducts.some((p) => p.itemId === item.id && ['approved', 'rejected', 'partial'].includes(p.quality))
  );

  const getQuality = (itemId) => selectedProducts.find((p) => p.itemId === itemId);
=======
  const isPartialComplete = (item, qualityData) => {
    if (qualityData?.quality !== 'partial') return false;
    const approvedQty = qualityData.approvedQuantity ?? partialQuantities[item.id];
    const totalQty = item.quantityValue || 0;
    const numericApproved = typeof approvedQty === 'number' ? approvedQty : parseFloat(approvedQty);
    return numericApproved > 0 && numericApproved < totalQty;
  };

  const handleConfirm = () => {
    if (!order) return;
    const submit = async () => {
      try {
        setSubmitting(true);

        const rejectedItems = [];
        const approvedCalls = [];

        order.items.forEach((item) => {
          const qualityData = selectedProducts.find((p) => p.itemId === item.id);
          if (!qualityData) return;

          if (qualityData.quality === 'approved') {
            approvedCalls.push(
              fieldAdminApi.submitQualityReview({
                orderItemId: item.id,
                notes,
                approvedQuantity: qualityData.approvedQuantity,
                rejected: false,
              })
            );
            return;
          }

          const totalQuantity = item.quantityValue || 0;
          const approvedQuantity =
            qualityData.quality === 'rejected' ? 0 : (qualityData.approvedQuantity ?? 0);

          rejectedItems.push({
            itemId: item.id,
            name: item.name,
            quality: qualityData.quality,
            approvedQuantity,
            totalQuantity,
            unit: item.quantityUnit,
          });
        });

        if (rejectedItems.length === 0) {
          await Promise.all(approvedCalls);
          Alert.alert('Success', 'Quality reviews submitted.');
          const refreshedOrders = await fieldAdminApi.getOrdersByTab('scheduled');
          setOrders(refreshedOrders ?? []);
          const stillExists = (refreshedOrders ?? []).some((entry) => entry.id === order.id);
          if (!stillExists) {
            setSelectedOrderId(refreshedOrders?.[0]?.id ?? null);
          }
          setSelectedProducts([]);
          setPartialQuantities({});
          setNotes('');
          return;
        }

        if (approvedCalls.length > 0) {
          await Promise.all(approvedCalls);
        }

        const flow = buildQualityFlow({
          order,
          selectedOrder,
          rejectedItems,
          notes,
        });

        navigation.navigate('SellerReject', { flow, step: FLOW_STEPS.REJECT });
      } catch (error) {
        Alert.alert('Error', 'Failed to submit quality reviews.');
      } finally {
        setSubmitting(false);
      }
    };
    submit();
  };

  // Enable submit when all items have been quality-checked (approved, rejected, or valid partial)
  const allChecked = order?.items?.every((item) => {
    const qualityData = selectedProducts.find((p) => p.itemId === item.id);
    if (!qualityData) return false;
    if (qualityData.quality === 'partial') return isPartialComplete(item, qualityData);
    return qualityData.quality === 'approved' || qualityData.quality === 'rejected';
  }) ?? false;

  const getItemQuality = (item) => {
    return selectedProducts.find((p) => p.itemId === item.id);
  };

  const getApprovalStatus = (item, qualityData) => {
    if (!qualityData) return null;
    
    if (qualityData.quality === 'partial') {
      const approvedQty = qualityData.approvedQuantity ?? partialQuantities[item.id];
      if (approvedQty === null || approvedQty === '' || approvedQty === undefined) {
        return 'Enter approved quantity below';
      }
      const numericApproved = typeof approvedQty === 'number' ? approvedQty : parseFloat(approvedQty);
      const totalQty = item.quantityValue || 0;
      const percentage = totalQty > 0 ? Math.round((numericApproved / totalQty) * 100) : 0;
      return `Partially Approved (${numericApproved}${item.quantityUnit} / ${totalQty}${item.quantityUnit} - ${percentage}%)`;
    } else if (qualityData.quality === 'approved') {
      return 'Fully Approved';
    } else if (qualityData.quality === 'rejected') {
      return 'Rejected';
    }
    return null;
  };
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((entry) =>
      `${entry.orderNumber ?? ''} ${entry.customer ?? ''}`.toLowerCase().includes(query)
    );
  }, [orders, orderSearch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
<<<<<<< HEAD
      <BackgroundShapes variant="detail" />
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
<<<<<<< HEAD
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
=======
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Confirm Quality</Text>
          <View style={{ width: 70 }} />
        </View>

<<<<<<< HEAD
        {/* Order Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ORDER ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>SELLER</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.seller}</Text>
          <Text style={styles.fieldLabel}>DATE</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.date}</Text>
        </View>

        {/* Products */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Product Quality Check</Text>
        {order.items.map((item) => {
          const qd = getQuality(item.id);
          const quality = qd?.quality;
          const approvedQty = qd?.approvedQuantity || partialQuantities[item.id] || 0;
          const totalQty = item.quantityValue || 0;

          return (
            <View key={item.id} style={styles.productCard}>
              <Text style={[styles.productName, { color: theme.colors.text.primary }]}>{item.name}</Text>
              <Text style={styles.productQty}>Total: {item.quantity}</Text>

              {quality && (
                <View style={[styles.statusBadge, {
                  backgroundColor: quality === 'approved' ? '#dcfce7' : quality === 'partial' ? '#fef3c7' : '#fee2e2',
                }]}>
                  <Text style={[styles.statusText, {
                    color: quality === 'approved' ? '#22c55e' : quality === 'partial' ? '#f59e0b' : '#ef4444',
                  }]}>
                    {quality === 'approved' ? 'Fully Approved' : quality === 'partial' ? `Partial (${approvedQty}${item.quantityUnit})` : 'Rejected'}
=======
        <FieldAdminFlowStepper currentStep={FLOW_STEPS.QUALITY} />

        {!order && !loading ? (
          <Text style={{ color: theme.colors.text.secondary, marginBottom: 16 }}>
            No assigned orders available for quality checks.
          </Text>
        ) : null}
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

        {/* Order Info */}
        {order ? (
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Order ID
          </Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
            {order.orderId}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb' }]} />
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Customer
          </Text>
          <Text style={[styles.orderDetail, { color: theme.colors.text.primary }]}>
            {order.customer}
          </Text>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Route
          </Text>
          <Text style={[styles.orderDetail, { color: theme.colors.text.primary }]}>
            {order.routeNumber}
          </Text>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Date
          </Text>
          <Text style={[styles.orderDetail, { color: theme.colors.text.primary }]}>
            {order.date}
          </Text>
        </Card>
        ) : null}

        {/* Products */}
        {order ? (
        <>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Product Quality Check
        </Text>
        {order.items.map((item) => {
          const qualityData = getItemQuality(item);
          const quality = qualityData?.quality;
          const approvedQty = qualityData?.approvedQuantity ?? partialQuantities[item.id];
          const numericApproved = typeof approvedQty === 'number' ? approvedQty : parseFloat(approvedQty) || 0;
          const totalQty = item.quantityValue || 0;
          const statusText = getApprovalStatus(item, qualityData);
          const partialInputValue =
            partialQuantities[item.id] === '' || partialQuantities[item.id] === undefined
              ? ''
              : String(partialQuantities[item.id]);

          return (
            <Card variant={theme.isDarkMode ? "glass" : "default"} key={item.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.productQuantity, { color: theme.colors.text.secondary }]}>
                    Total: {item.quantity}
                  </Text>
                  {statusText && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            quality === 'approved'
                              ? `${theme.colors.success}20`
                              : quality === 'partial'
                              ? `${warningColor}20`
                              : `${theme.colors.error}20`,
                          marginTop: 8,
                          alignSelf: 'flex-start',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              quality === 'approved'
                                ? theme.colors.success
                                : quality === 'partial'
                                ? warningColor
                                : theme.colors.error,
                          },
                        ]}
                      >
                        {statusText}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {quality === 'partial' && (
                <View style={[styles.partialApprovalContainer, { backgroundColor: `${warningColor}18` }]}>
                  <Text style={[styles.partialLabel, { color: warningColor }]}>
                    Approved Quantity
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
                  </Text>
                </View>
              )}

              {quality === 'partial' && (
                <View style={styles.partialWrap}>
                  <Text style={styles.partialLabel}>Approved Quantity</Text>
                  <View style={styles.qtyRow}>
                    <TextInput
<<<<<<< HEAD
                      style={[styles.qtyInput, { color: theme.colors.text.primary }]}
=======
                      style={[
                        styles.quantityInput,
                        {
                          color: theme.colors.text.primary,
                          borderColor: warningColor,
                          backgroundColor: theme.colors.background,
                        },
                      ]}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
<<<<<<< HEAD
                      value={approvedQty > 0 ? approvedQty.toString() : ''}
                      onChangeText={(v) => handlePartialQty(item.id, v, item)}
=======
                      value={partialInputValue}
                      onChangeText={(value) => handlePartialQuantityChange(item.id, value, item)}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
                    />
                    <Text style={styles.qtyUnit}>{item.quantityUnit} / {totalQty} {item.quantityUnit}</Text>
                  </View>
                  {numericApproved > 0 && totalQty > 0 && (
                    <View style={styles.progressBar}>
<<<<<<< HEAD
                      <View style={[styles.progressFill, { width: `${(approvedQty / totalQty) * 100}%`, backgroundColor: '#22c55e' }]} />
=======
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(numericApproved / totalQty) * 100}%`,
                            backgroundColor: warningColor,
                          },
                        ]}
                      />
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
                    </View>
                  )}
                </View>
              )}

<<<<<<< HEAD
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.qualityBtn, quality === 'approved' && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}
                  onPress={() => handleQualityCheck(item.id, 'approved', item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qualityBtnText, quality === 'approved' ? { color: '#fff' } : { color: theme.colors.text.primary }]}>
                    {'✓ Approve All'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qualityBtn, quality === 'rejected' && { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                  onPress={() => {
                    handleQualityCheck(item.id, 'rejected', item);
                    navigation.navigate('SellerReject', { item, order });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qualityBtnText, quality === 'rejected' ? { color: '#fff' } : { color: theme.colors.text.primary }]}>
                    {'✗ Reject All'}
                  </Text>
                </TouchableOpacity>
              </View>

              {quality !== 'partial' && (
                <TouchableOpacity style={styles.partialToggle} onPress={() => handleQualityCheck(item.id, 'partial', item)}>
                  <Text style={[styles.partialToggleText, { color: teal }]}>Approve Partial Quantity</Text>
                </TouchableOpacity>
=======
              {quality !== 'partial' ? (
                <View style={styles.qualityButtons}>
                  <TouchableOpacity
                    style={[
                      styles.qualityButton,
                      {
                        borderColor:
                          quality === 'approved'
                            ? theme.colors.success
                            : theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                        backgroundColor:
                          quality === 'approved' ? theme.colors.success : theme.colors.card || 'transparent',
                      },
                    ]}
                    onPress={() => handleQualityCheck(item.id, 'approved', item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.qualityButtonText,
                        {
                          color: quality === 'approved' ? '#fff' : theme.colors.text.primary,
                        },
                      ]}
                    >
                      ✓ Approve
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.qualityButton,
                      {
                        borderColor: warningColor,
                        backgroundColor: theme.colors.card || 'transparent',
                      },
                    ]}
                    onPress={() => handleEnterPartialMode(item.id, item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.qualityButtonText, { color: warningColor }]}>
                      ⚡ Partial
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.qualityButton,
                      {
                        borderColor:
                          quality === 'rejected'
                            ? theme.colors.error
                            : theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                        backgroundColor:
                          quality === 'rejected'
                            ? theme.colors.error
                            : theme.colors.card || 'transparent',
                      },
                    ]}
                    onPress={() => handleQualityCheck(item.id, 'rejected', item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.qualityButtonText,
                        {
                          color: quality === 'rejected' ? '#fff' : theme.colors.text.primary,
                        },
                      ]}
                    >
                      ✗ Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.qualityButtons}>
                  <TouchableOpacity
                    style={[
                      styles.qualityButton,
                      styles.qualityButtonDisabled,
                      {
                        borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                        backgroundColor: theme.colors.card || 'transparent',
                      },
                    ]}
                    disabled
                    activeOpacity={1}
                  >
                    <Text style={[styles.qualityButtonText, { color: theme.colors.text.disabled || '#94a3b8' }]}>
                      ✓ Approve All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.qualityButton,
                      styles.partialActiveButton,
                      {
                        borderColor: warningColor,
                        backgroundColor: warningColor,
                      },
                    ]}
                    activeOpacity={1}
                  >
                    <Text style={[styles.qualityButtonText, { color: '#fff' }]}>
                      ⚡ Partial
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.qualityButton,
                      styles.qualityButtonDisabled,
                      {
                        borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                        backgroundColor: theme.colors.card || 'transparent',
                      },
                    ]}
                    disabled
                    activeOpacity={1}
                  >
                    <Text style={[styles.qualityButtonText, { color: theme.colors.text.disabled || '#94a3b8' }]}>
                      ✗ Reject All
                    </Text>
                  </TouchableOpacity>
                </View>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
              )}
            </View>
          );
        })}

        {/* Notes */}
<<<<<<< HEAD
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Additional Notes</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary }]}
            placeholder="Add notes about quality check..."
            placeholderTextColor="#94a3b8"
=======
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Additional Notes
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.notesCard}>
          <TextInput
            style={[styles.notesInput, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
            placeholder="Add notes about quality check..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

<<<<<<< HEAD
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: teal, opacity: allChecked ? 1 : 0.5 }]}
          onPress={handleConfirm}
          disabled={!allChecked}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {allChecked ? 'Submit Quality Reviews' : `Review ${order.items.length - selectedProducts.length} more item(s)`}
          </Text>
        </TouchableOpacity>
=======
        {/* Confirm Button */}
        <Button
          title={submitting ? "Submitting..." : allChecked ? "Submit Quality Reviews" : `Review ${order.items.length - selectedProducts.length} more item(s)`}
          onPress={handleConfirm}
          disabled={!allChecked || submitting}
          style={styles.confirmButton}
        />
        </>
        ) : null}
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
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
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
                      setIsPickerVisible(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.modalOrderNumber, { color: theme.colors.text.primary }]}>
                        {entry.orderNumber}
                      </Text>
                      <Text style={[styles.modalOrderMeta, { color: theme.colors.text.secondary }]}>
                        {entry.customer} • {entry.items?.length ?? 0} items
                      </Text>
                    </View>
                    {active ? <Text style={[styles.modalSelectedTick, { color: theme.colors.primary.main }]}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
              {filteredOrders.length === 0 ? (
                <Text style={[styles.modalEmptyText, { color: theme.colors.text.secondary }]}>
                  No matching orders.
                </Text>
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
=======
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  orderCard: {
    padding: 16,
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  orderDetail: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  orderId: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  fieldValue: { fontSize: 15, fontWeight: '500', marginBottom: 4 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  productCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  productName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  productQty: { fontSize: 14, color: '#94a3b8', marginBottom: 10 },

  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },

  partialWrap: {
    backgroundColor: '#fffbeb', borderRadius: 16, padding: 14, marginBottom: 12,
  },
  partialLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyInput: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#e0dcd9', fontSize: 16, fontWeight: '600', backgroundColor: '#fff',
  },
  qtyUnit: { fontSize: 14, fontWeight: '500', color: '#94a3b8' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: '#e5e7eb', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  btnRow: { flexDirection: 'row', gap: 12 },
  qualityBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0dcd9',
    alignItems: 'center', backgroundColor: '#fff',
  },
<<<<<<< HEAD
  qualityBtnText: { fontSize: 14, fontWeight: '700' },

  partialToggle: { paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  partialToggleText: { fontSize: 13, fontWeight: '600' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, minHeight: 100, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
=======
  productQuantity: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  partialActiveButton: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  qualityButtonDisabled: {
    opacity: 0.45,
  },
  qualityButtonText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  partialApprovalContainer: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  partialLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quantityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: '600',
  },
  quantityUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  notesCard: {
    padding: 16,
    marginBottom: 24,
  },
  notesInput: {
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmButton: {
    marginTop: 8,
  },
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

export default QualityConfirmScreen;
