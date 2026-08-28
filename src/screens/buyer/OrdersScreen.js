import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  PAYMENT_PENDING: '#f97316',
  PAYMENT_FAILED: '#ef4444',
  PAID: '#22c55e',
  BATCHED: '#f59e0b',
  ASSIGNED: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PREPARING: '#8b5cf6',
  PACKING: '#8b5cf6',
  READY: '#06b6d4',
  READY_PICKUP: '#06b6d4',
  IN_TRANSIT: '#3b82f6',
  ON_THE_WAY: '#3b82f6',
  DELIVERED: '#22c55e',
  FAILED: '#ef4444',
  CANCELLED: '#ef4444',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  PAYMENT_PENDING: 'Payment pending',
  PAYMENT_FAILED: 'Payment failed',
  PAID: 'Paid',
  BATCHED: 'Batched',
  ASSIGNED: 'Assigned',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  PACKING: 'Packing',
  READY: 'Ready for pickup',
  READY_PICKUP: 'Ready for pickup',
  IN_TRANSIT: 'In transit',
  ON_THE_WAY: 'On the way',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

const PAYMENT_LABELS = {
  PENDING: 'Payment pending',
  PROCESSING: 'Payment processing',
  COMPLETED: 'Payment completed',
  FAILED: 'Payment failed',
  REFUNDED: 'Refunded',
};

const PAYMENT_COLORS = {
  PENDING: '#f97316',
  PROCESSING: '#f59e0b',
  COMPLETED: '#22c55e',
  FAILED: '#ef4444',
  REFUNDED: '#6b7280',
};

// ============================================================
// TRACKING TIMELINE
// ============================================================

const TIMELINE = [
  'Order placed',
  'Confirmed',
  'Packing',
  'Ready pickup',
  'On the way',
  'Delivered',
];

const STATUS_STAGE = {
  PENDING: 0,
  PAYMENT_PENDING: 0,
  PAYMENT_FAILED: 0,

  PAID: 0,

  BATCHED: 1,
  ASSIGNED: 1,
  CONFIRMED: 1,

  PREPARING: 2,
  PACKING: 2,

  READY: 3,
  READY_PICKUP: 3,

  IN_TRANSIT: 4,
  ON_THE_WAY: 4,

  DELIVERED: 5,

  CANCELLED: 0,
  FAILED: 0,
};

// ============================================================
// HELPERS
// ============================================================

const formatStatus = (status) => {
  return STATUS_LABELS[status] || status || 'Unknown';
};

const formatPaymentStatus = (status) => {
  if (!status) return 'No payment info';

  return PAYMENT_LABELS[status] || status;
};

const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#6b7280';
};

const getPaymentColor = (status) => {
  return PAYMENT_COLORS[status] || '#f97316';
};

const getStage = (status) => {
  return STATUS_STAGE[status] ?? 0;
};

const isActiveOrder = (status) => {
  return (
    status !== 'DELIVERED' &&
    status !== 'CANCELLED' &&
    status !== 'FAILED'
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  const today = new Date();

  const isToday =
    date.toDateString() === today.toDateString();

  if (isToday) {
    return `Today · ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return (
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' · ' +
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  );
};

const money = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return '0.00';
  }

  return number.toFixed(2);
};

// Pulls a seller/business display name off an order item, trying the
// shapes the API has used (product.seller.businessName, product.seller.user.name,
// or a top-level sellerName on the item) and falling back gracefully.
const getSellerName = (item) => {
  return (
    item?.product?.seller?.businessName ||
    item?.product?.seller?.user?.name ||
    item?.sellerName ||
    'Unknown seller'
  );
};

// Works out subtotal/tax to show above the total, same approach as the
// web dashboard. Prefers an explicit order.tax field if the API provides
// one; otherwise derives tax as the difference between totalAmount and
// the sum of the line items.
const getOrderTaxBreakdown = (order) => {
  const items = order?.items || [];

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.totalPrice) || 0),
    0,
  );

  const explicitTax = order?.tax;
  const totalAmount = Number(order?.totalAmount) || 0;

  const tax =
    typeof explicitTax === 'number'
      ? explicitTax
      : Math.max(totalAmount - subtotal, 0);

  return { subtotal, tax };
};

// ============================================================
// TIMELINE COMPONENT
// ============================================================

const TrackingTimeline = ({ status, theme }) => {
  const stage = getStage(status);

  return (
    <View style={styles.timelineContainer}>
      <Text
        style={[
          styles.sectionLabel,
          { color: theme.colors.text.secondary },
        ]}
      >
        TRACKING TIMELINE
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineScroll}
      >
        {TIMELINE.map((step, index) => {
          const completed = index <= stage;

          return (
            <View key={step} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelinePill,
                  completed
                    ? {
                        backgroundColor: `${theme.colors.primary.main}25`,
                      }
                    : {
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.timelineText,
                    {
                      color: completed
                        ? theme.colors.primary.main
                        : theme.colors.text.tertiary,
                    },
                  ]}
                >
                  {step}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status, theme }) => {
  const color = getStatusColor(status);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: `${color}20`,
        },
      ]}
    >
      <Text style={[styles.statusText, { color }]}>
        {formatStatus(status)}
      </Text>
    </View>
  );
};

// ============================================================
// PAYMENT BADGE
// ============================================================

const PaymentBadge = ({ status }) => {
  const color = getPaymentColor(status);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: `${color}20`,
        },
      ]}
    >
      <Text style={[styles.statusText, { color }]}>
        {formatPaymentStatus(status)}
      </Text>
    </View>
  );
};

// ============================================================
// ORDER CARD
// ============================================================

const OrderCard = ({
  order,
  theme,
  onPress,
}) => {
  const itemCount = order.items?.length || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(order)}
    >
      <Card style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.orderDate,
                { color: theme.colors.text.secondary },
              ]}
            >
              {formatDate(order.createdAt)}
            </Text>

            <Text
              style={[
                styles.orderNumber,
                { color: theme.colors.text.primary },
              ]}
            >
              {order.orderNumber || `#${order.id}`}
            </Text>
          </View>

          <View style={styles.badges}>
            {order.payment && (
              <PaymentBadge
                status={order.payment.status}
              />
            )}
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsContainer}>
          {order.items?.map((item, index) => (
            <View
              key={`${order.id}-${item.productId || index}`}
              style={[
                styles.itemPill,
                {
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.itemPillText,
                  { color: theme.colors.text.secondary },
                ]}
                numberOfLines={1}
              >
                {item.product?.name || 'Product'}
                {' · '}
                {item.quantity}
                {item.product?.unit
                  ? ` ${item.product.unit}`
                  : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <TrackingTimeline
          status={order.status}
          theme={theme}
        />

        {/* Driver */}
        {order.driver && (
          <View
            style={[
              styles.driverBox,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.driverTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Rider contact
            </Text>

            <Text
              style={[
                styles.driverName,
                { color: theme.colors.text.secondary },
              ]}
            >
              {order.driver.user?.name || 'Pending'}
            </Text>

            <Text
              style={[
                styles.driverPhone,
                { color: theme.colors.text.tertiary },
              ]}
            >
              {order.driver.user?.phone ||
                'Pending assignment'}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text
              style={[
                styles.itemCount,
                { color: theme.colors.text.secondary },
              ]}
            >
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Text>

            {order.deliveryTimeSlot && (
              <Text
                style={[
                  styles.deliverySlot,
                  { color: theme.colors.text.tertiary },
                ]}
              >
                {order.deliveryTimeSlot}
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.total,
              { color: theme.colors.primary.main },
            ]}
          >
            Rs. {money(order.totalAmount)}
          </Text>
        </View>

        <Text
          style={[
            styles.viewDetails,
            { color: theme.colors.primary.main },
          ]}
        >
          View Order Details →
        </Text>
      </Card>
    </TouchableOpacity>
  );
};

// ============================================================
// ORDER DETAILS MODAL
// ============================================================

const OrderDetailsModal = ({
  order,
  visible,
  onClose,
  theme,
}) => {
  if (!order) return null;

  const { subtotal, tax } = getOrderTaxBreakdown(order);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.modalDate,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {formatDate(order.createdAt)}
              </Text>

              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                {order.orderNumber || order.id}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.closeText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            {/* Timeline */}
            <TrackingTimeline
              status={order.status}
              theme={theme}
            />

            {/* Delivery details */}
            <View
              style={[
                styles.detailBox,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionLabel,
                  { color: theme.colors.text.secondary },
                ]}
              >
                DELIVERY DETAILS
              </Text>

              <Text
                style={[
                  styles.deliveryAddress,
                  { color: theme.colors.text.primary },
                ]}
              >
                {order.deliveryAddress ||
                  'No delivery address provided'}
              </Text>

              {order.deliveryTimeSlot && (
                <Text
                  style={[
                    styles.detailSecondary,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Time slot: {order.deliveryTimeSlot}
                </Text>
              )}

              {order.specialInstructions && (
                <Text
                  style={[
                    styles.detailSecondary,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Notes: {order.specialInstructions}
                </Text>
              )}
            </View>

            {/* Driver */}
            {order.driver && (
              <View
                style={[
                  styles.detailBox,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  RIDER CONTACT
                </Text>

                <Text
                  style={[
                    styles.driverModalName,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {order.driver.user?.name || 'Pending'}
                </Text>

                <Text
                  style={[
                    styles.detailSecondary,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {order.driver.user?.phone ||
                    'Pending assignment'}
                </Text>
              </View>
            )}

            {/* Items */}
            <View style={styles.itemsSection}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: theme.colors.text.secondary },
                ]}
              >
                ITEMS
              </Text>

              {order.items?.map((item, index) => (
                <View
                  key={`${order.id}-detail-${
                    item.productId || index
                  }`}
                  style={[
                    styles.detailItem,
                    {
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.productName,
                        {
                          color:
                            theme.colors.text.primary,
                        },
                      ]}
                    >
                      {item.product?.name || 'Product'}
                    </Text>

                    <Text
                      style={[
                        styles.productSeller,
                        {
                          color:
                            theme.colors.text.tertiary,
                        },
                      ]}
                    >
                      Sold by {getSellerName(item)}
                    </Text>

                    <Text
                      style={[
                        styles.productQuantity,
                        {
                          color:
                            theme.colors.text.secondary,
                        },
                      ]}
                    >
                      {item.quantity}{' '}
                      {item.product?.unit || ''}
                    </Text>
                  </View>

                  <View style={styles.itemPrices}>
                    <Text
                      style={[
                        styles.unitPrice,
                        {
                          color:
                            theme.colors.text.secondary,
                        },
                      ]}
                    >
                      Rs. {money(item.unitPrice)}
                    </Text>

                    <Text
                      style={[
                        styles.itemTotal,
                        {
                          color:
                            theme.colors.text.primary,
                        },
                      ]}
                    >
                      Rs. {money(item.totalPrice)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Subtotal / Tax / Total */}
            <View
              style={[
                styles.totalBox,
                {
                  borderTopColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Subtotal
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Rs. {money(subtotal)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Tax
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Rs. {money(tax)}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text
                  style={[
                    styles.totalLabel,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  Total
                </Text>

                <Text
                  style={[
                    styles.modalTotal,
                    { color: theme.colors.primary.main },
                  ]}
                >
                  Rs. {money(order.totalAmount)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// MAIN SCREEN
// ============================================================

const OrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // ==========================================================
  // FETCH ORDERS
  // ==========================================================

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);

      console.log('📦 Fetching buyer orders...');

      const response = await api.get('/orders');

      const fetchedOrders = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      console.log(
        '✅ Orders fetched:',
        fetchedOrders.length,
      );

      setOrders(fetchedOrders);
    } catch (err) {
      console.error(
        '❌ Orders fetch error:',
        err,
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load orders.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh whenever screen gets focus
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      fetchOrders,
    );

    return unsubscribe;
  }, [navigation, fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  // ==========================================================
  // SPLIT ORDERS
  // ==========================================================

  const activeOrders = orders.filter((order) =>
    isActiveOrder(order.status),
  );

  const pastOrders = orders.filter(
    (order) => !isActiveOrder(order.status),
  );

  // ==========================================================
  // STATS
  // ==========================================================

  const liveDeliveries = orders.filter(
    (order) =>
      order.status === 'ON_THE_WAY' ||
      order.status === 'IN_TRANSIT',
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === 'DELIVERED',
  ).length;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
              },
            ]}
          >
            Tracking & History
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            Your orders only
          </Text>
        </View>

        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary.main}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && orders.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
              },
            ]}
          >
            Tracking & History
          </Text>
        </View>

        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>

          <Text
            style={[
              styles.errorText,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor:
                  theme.colors.primary.main,
              },
            ]}
            onPress={() => {
              setLoading(true);
              fetchOrders();
            }}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <FlatList
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
        contentContainerStyle={
          styles.mainContent
        }
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.smallHeader,
                  {
                    color:
                      theme.colors.primary.main,
                  },
                ]}
              >
                YOUR ORDERS ONLY
              </Text>

              <Text
                style={[
                  styles.title,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Tracking & History
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                View all orders you've purchased
                and track your deliveries.
              </Text>
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  {
                    borderColor:
                      theme.colors.border,
                    backgroundColor:
                      theme.colors.surface ||
                      theme.colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        theme.colors.text.secondary,
                    },
                  ]}
                >
                  Live deliveries
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  {liveDeliveries}
                </Text>

                <Text
                  style={[
                    styles.statHelper,
                    {
                      color:
                        theme.colors.text.tertiary,
                    },
                  ]}
                >
                  Updated in real time
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    borderColor:
                      theme.colors.border,
                    backgroundColor:
                      theme.colors.surface ||
                      theme.colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        theme.colors.text.secondary,
                    },
                  ]}
                >
                  Delivered
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  {deliveredOrders}
                </Text>

                <Text
                  style={[
                    styles.statHelper,
                    {
                      color:
                        theme.colors.text.tertiary,
                    },
                  ]}
                >
                  Completed orders
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    borderColor:
                      theme.colors.border,
                    backgroundColor:
                      theme.colors.surface ||
                      theme.colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        theme.colors.text.secondary,
                    },
                  ]}
                >
                  Total orders
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  {orders.length}
                </Text>

                <Text
                  style={[
                    styles.statHelper,
                    {
                      color:
                        theme.colors.text.tertiary,
                    },
                  ]}
                >
                  All time
                </Text>
              </View>
            </View>

            {/* ERROR */}
            {error && (
              <View
                style={[
                  styles.errorBox,
                  {
                    borderColor:
                      '#ef444450',
                    backgroundColor:
                      '#ef444415',
                  },
                ]}
              >
                <Text
                  style={styles.errorBoxText}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* NO ORDERS */}
            {orders.length === 0 ? (
              <EmptyState
                icon={
                  <Text style={styles.emptyIcon}>
                    📦
                  </Text>
                }
                title="No orders yet"
                message="Start shopping to see your orders here."
                actionLabel="Browse Products"
                onAction={() =>
                  navigation.navigate(
                    'BrowseTab',
                  )
                }
              />
            ) : (
              <>
                {/* ==========================================
                    ACTIVE ORDERS
                ========================================== */}

                <View
                  style={[
                    styles.panel,
                    {
                      borderColor:
                        theme.colors.border,
                      backgroundColor:
                        theme.colors.surface ||
                        theme.colors.background,
                    },
                  ]}
                >
                  <View style={styles.panelHeader}>
                    <View>
                      <Text
                        style={[
                          styles.panelTitle,
                          {
                            color:
                              theme.colors.text
                                .primary,
                          },
                        ]}
                      >
                        Live Tracking
                      </Text>

                      <Text
                        style={[
                          styles.panelSubtitle,
                          {
                            color:
                              theme.colors.text
                                .secondary,
                          },
                        ]}
                      >
                        {activeOrders.length}{' '}
                        active order
                        {activeOrders.length !== 1
                          ? 's'
                          : ''}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.countBadge,
                        {
                          backgroundColor: `${theme.colors.primary.main}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countText,
                          {
                            color:
                              theme.colors.primary
                                .main,
                          },
                        ]}
                      >
                        {activeOrders.length}
                      </Text>
                    </View>
                  </View>

                  {activeOrders.length === 0 ? (
                    <Text
                      style={[
                        styles.noOrdersText,
                        {
                          color:
                            theme.colors.text
                              .secondary,
                        },
                      ]}
                    >
                      No active orders right
                      now.
                    </Text>
                  ) : (
                    activeOrders.map(
                      (order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          theme={theme}
                          onPress={
                            setSelectedOrder
                          }
                        />
                      ),
                    )
                  )}
                </View>

                {/* ==========================================
                    ORDER HISTORY
                ========================================== */}

                <View
                  style={[
                    styles.panel,
                    {
                      borderColor:
                        theme.colors.border,
                      backgroundColor:
                        theme.colors.surface ||
                        theme.colors.background,
                    },
                  ]}
                >
                  <View style={styles.panelHeader}>
                    <View>
                      <Text
                        style={[
                          styles.panelTitle,
                          {
                            color:
                              theme.colors.text
                                .primary,
                          },
                        ]}
                      >
                        Order History
                      </Text>

                      <Text
                        style={[
                          styles.panelSubtitle,
                          {
                            color:
                              theme.colors.text
                                .secondary,
                          },
                        ]}
                      >
                        {pastOrders.length}{' '}
                        completed order
                        {pastOrders.length !== 1
                          ? 's'
                          : ''}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.countBadge,
                        {
                          backgroundColor:
                            '#6b728020',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countText,
                          {
                            color:
                              theme.colors.text
                                .secondary,
                          },
                        ]}
                      >
                        {pastOrders.length}
                      </Text>
                    </View>
                  </View>

                  {pastOrders.length === 0 ? (
                    <Text
                      style={[
                        styles.noOrdersText,
                        {
                          color:
                            theme.colors.text
                              .secondary,
                        },
                      ]}
                    >
                      No completed orders
                      yet.
                    </Text>
                  ) : (
                    pastOrders.map(
                      (order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          theme={theme}
                          onPress={
                            setSelectedOrder
                          }
                        />
                      ),
                    )
                  )}
                </View>
              </>
            )}
          </>
        }
      />

      {/* ORDER DETAILS MODAL */}
      <OrderDetailsModal
        order={selectedOrder}
        visible={!!selectedOrder}
        onClose={() =>
          setSelectedOrder(null)
        }
        theme={theme}
      />
    </SafeAreaView>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mainContent: {
    paddingBottom: 100,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },

  smallHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 18,
    gap: 8,
  },

  statCard: {
    flex: 1,
    minHeight: 105,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },

  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statValue: {
    fontSize: 23,
    fontWeight: '700',
    marginTop: 7,
  },

  statHelper: {
    fontSize: 9,
    marginTop: 2,
  },

  // Error
  errorBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },

  errorBoxText: {
    color: '#fca5a5',
    fontSize: 13,
  },

  errorIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Panels
  panel: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderRadius: 22,
    padding: 15,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  panelSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 12,
    fontWeight: '700',
  },

  noOrdersText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 13,
  },

  // Order card
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  orderDate: {
    fontSize: 11,
    marginBottom: 4,
  },

  orderNumber: {
    fontSize: 17,
    fontWeight: '700',
  },

  badges: {
    alignItems: 'flex-end',
    gap: 5,
    marginLeft: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Items
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 13,
  },

  itemPill: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
    maxWidth: '100%',
  },

  itemPillText: {
    fontSize: 10,
  },

  // Timeline
  timelineContainer: {
    marginTop: 14,
  },

  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  timelineScroll: {
    gap: 6,
    paddingRight: 10,
  },

  timelineItem: {
    flexShrink: 0,
  },

  timelinePill: {
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  timelineText: {
    fontSize: 9,
    fontWeight: '500',
  },

  // Driver
  driverBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 13,
  },

  driverTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },

  driverName: {
    fontSize: 12,
  },

  driverPhone: {
    fontSize: 11,
    marginTop: 2,
  },

  // Footer
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },

  itemCount: {
    fontSize: 11,
  },

  deliverySlot: {
    fontSize: 10,
    marginTop: 3,
  },

  total: {
    fontSize: 18,
    fontWeight: '700',
  },

  viewDetails: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },

  // Empty
  emptyIcon: {
    fontSize: 60,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },

  modalDate: {
    fontSize: 11,
    marginBottom: 4,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 14,
  },

  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  modalBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 5,
  },

  // Detail boxes
  detailBox: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    marginTop: 16,
  },

  deliveryAddress: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },

  detailSecondary: {
    fontSize: 12,
    marginTop: 7,
    lineHeight: 18,
  },

  driverModalName: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Items detail
  itemsSection: {
    marginTop: 20,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  productName: {
    fontSize: 13,
    fontWeight: '600',
  },

  productSeller: {
    fontSize: 11,
    marginTop: 2,
  },

  productQuantity: {
    fontSize: 11,
    marginTop: 3,
  },

  itemPrices: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  unitPrice: {
    fontSize: 10,
  },

  itemTotal: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },

  totalBox: {
    borderTopWidth: 1,
    paddingTop: 15,
    marginTop: 5,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  summaryTotalRow: {
    marginTop: 6,
    marginBottom: 0,
  },

  summaryLabel: {
    fontSize: 12,
  },

  summaryValue: {
    fontSize: 12,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  modalTotal: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default OrdersScreen;