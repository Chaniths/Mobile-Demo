import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import api from '../../api/client';

/* =========================================================
   CONSTANTS
========================================================= */

const ORDERS_ENDPOINT = '/orders/seller/list';
const STATS_ENDPOINT = '/orders/seller/stats';

const STATUS_STAGES = [
  'PENDING',
  'PAYMENT_PENDING',
  'PAID',
  'BATCHED',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
];

const STATUS_LABEL = {
  PENDING: 'Pending',
  PAYMENT_PENDING: 'Awaiting Payment',
  PAYMENT_FAILED: 'Payment Failed',
  PAID: 'Paid',
  BATCHED: 'Batched',
  ASSIGNED: 'Rider Assigned',
  IN_TRANSIT: 'On the Way',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

const STATUS_ICONS = {
  PENDING: 'time-outline',
  PAYMENT_PENDING: 'card-outline',
  PAYMENT_FAILED: 'close-circle-outline',
  PAID: 'checkmark-circle-outline',
  BATCHED: 'layers-outline',
  ASSIGNED: 'person-outline',
  IN_TRANSIT: 'car-outline',
  DELIVERED: 'checkmark-done-circle-outline',
  FAILED: 'alert-circle-outline',
  CANCELLED: 'ban-outline',
};

const TIME_SLOT_LABEL = {
  MORNING: 'Morning (6 AM – 12 PM)',
  AFTERNOON: 'Afternoon (12 PM – 6 PM)',
  EVENING: 'Evening (6 PM – 10 PM)',
};

const COMPLETED_STATUSES = [
  'DELIVERED',
  'FAILED',
  'CANCELLED',
  'PAYMENT_FAILED',
];

const RECENT_ORDERS_LIMIT = 10;

const stageIndex = (status) => STATUS_STAGES.indexOf(status);

/* =========================================================
   HELPERS
========================================================= */

const statusColors = (status, theme) => {
  if (status === 'DELIVERED') {
    return {
      bg: 'rgba(16,185,129,0.15)',
      text: '#34d399',
    };
  }

  if (
    ['PENDING', 'PAYMENT_PENDING', 'PAID', 'BATCHED'].includes(
      status
    )
  ) {
    return {
      bg: 'rgba(245,158,11,0.15)',
      text: '#fbbf24',
    };
  }

  if (['IN_TRANSIT', 'ASSIGNED'].includes(status)) {
    return {
      bg: 'rgba(59,130,246,0.15)',
      text: '#60a5fa',
    };
  }

  if (
    ['PAYMENT_FAILED', 'FAILED', 'CANCELLED'].includes(status)
  ) {
    return {
      bg: 'rgba(239,68,68,0.15)',
      text: '#f87171',
    };
  }

  return {
    bg: theme.colors.card,
    text: theme.colors.text.secondary,
  };
};

const money = (value) =>
  `Rs. ${Number(value ?? 0).toFixed(2)}`;

const sellerSubtotal = (order) =>
  (order.items || []).reduce(
    (sum, item) =>
      sum + Number(item.totalPrice ?? 0),
    0
  );

const unitPrice = (item) =>
  item.quantity > 0
    ? Number(item.totalPrice ?? 0) / item.quantity
    : Number(item.totalPrice ?? 0);

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  status,
  theme,
  style,
  showIcon = true,
}) => {
  const colors = statusColors(status, theme);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
        },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={STATUS_ICONS[status] || 'ellipse-outline'}
          size={12}
          color={colors.text}
          style={{ marginRight: 4 }}
        />
      )}

      <Text
        style={[
          styles.badgeText,
          {
            color: colors.text,
          },
        ]}
      >
        {STATUS_LABEL[status] || status}
      </Text>
    </View>
  );
};

/* =========================================================
   TRACKING TIMELINE
========================================================= */

const TrackingTimeline = ({ status, theme }) => {
  const stage = stageIndex(status);

  if (stage < 0) return null;

  return (
    <View style={styles.timelineWrap}>
      <View style={styles.timelineHeader}>
        <Ionicons
          name="navigate-outline"
          size={13}
          color={theme.colors.primary.main}
        />

        <Text
          style={[
            styles.timelineLabel,
            {
              color: theme.colors.text.secondary,
            },
          ]}
        >
          ORDER TRACKING
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelinePills}
      >
        {STATUS_STAGES.map((s, i) => {
          const reached = i <= stage;
          const isCurrent = i === stage;

          return (
            <View
              key={s}
              style={[
                styles.timelinePill,
                {
                  backgroundColor: reached
                    ? `${theme.colors.primary.main}20`
                    : theme.colors.background,
                  borderColor: reached
                    ? theme.colors.primary.main
                    : theme.colors.border,
                },
                isCurrent && styles.currentTimelinePill,
              ]}
            >
              <Ionicons
                name={
                  STATUS_ICONS[s] ||
                  'ellipse-outline'
                }
                size={12}
                color={
                  reached
                    ? theme.colors.primary.main
                    : theme.colors.text.tertiary
                }
              />

              <Text
                style={{
                  fontSize: 10,
                  marginLeft: 4,
                  color: reached
                    ? theme.colors.primary.main
                    : theme.colors.text.secondary,
                  fontWeight: reached
                    ? '700'
                    : '500',
                }}
              >
                {STATUS_LABEL[s]}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

/* =========================================================
   ORDER CARD
========================================================= */

const OrderCard = ({
  order,
  onPress,
  theme,
}) => {
  const itemNames = (order.items || []).map(
    (item) =>
      `${item.product?.name ?? 'Item'} · ${
        item.quantity
      } ${item.product?.unit ?? ''}`
  );

  const subtotal = sellerSubtotal(order);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.orderCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* TOP ROW */}

      <View style={styles.orderCardTopRow}>
        <View style={styles.orderIconBox}>
          <Ionicons
            name="receipt-outline"
            size={21}
            color={theme.colors.primary.main}
          />
        </View>

        <View style={styles.orderMainInfo}>
          <View style={styles.orderNumberRow}>
            <Text
              style={[
                styles.orderTitle,
                {
                  color: theme.colors.text.primary,
                },
              ]}
              numberOfLines={1}
            >
              {order.orderNumber || 'Order'}
            </Text>

            <StatusBadge
              status={order.status}
              theme={theme}
            />
          </View>

          {/* BUYER */}

          <View style={styles.metaRow}>
            <Ionicons
              name="person-outline"
              size={13}
              color={theme.colors.text.secondary}
            />

            <Text
              style={[
                styles.metaText,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
              numberOfLines={1}
            >
              {order.buyer?.user?.name ??
                'Customer'}
            </Text>
          </View>

          {/* DELIVERY TIME */}

          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={13}
              color={theme.colors.text.secondary}
            />

            <Text
              style={[
                styles.metaText,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              {TIME_SLOT_LABEL[
                order.deliveryTimeSlot
              ] ||
                order.deliveryTimeSlot ||
                'Delivery time unavailable'}
            </Text>
          </View>
        </View>
      </View>

      {/* ADDRESS */}

      <View
        style={[
          styles.addressBox,
          {
            backgroundColor:
              theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="location-outline"
          size={17}
          color={theme.colors.primary.main}
        />

        <Text
          style={[
            styles.addressText,
            {
              color: theme.colors.text.secondary,
            },
          ]}
          numberOfLines={2}
        >
          {order.deliveryAddress ||
            'Delivery address unavailable'}
        </Text>
      </View>

      {/* PRODUCTS */}

      {itemNames.length > 0 && (
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Ionicons
              name="basket-outline"
              size={14}
              color={theme.colors.text.secondary}
            />

            <Text
              style={[
                styles.productsHeaderText,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              YOUR PRODUCTS
            </Text>
          </View>

          <View style={styles.itemPillsRow}>
            {itemNames.map((label, idx) => (
              <View
                key={`${label}-${idx}`}
                style={[
                  styles.itemPill,
                  {
                    borderColor:
                      theme.colors.border,
                    backgroundColor:
                      theme.colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.itemPillText,
                    {
                      color:
                        theme.colors.text.secondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* FOOTER */}

      <View
        style={[
          styles.orderFooter,
          {
            borderTopColor:
              theme.colors.border,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.totalLabel,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            YOUR TOTAL
          </Text>

          <Text
            style={[
              styles.totalAmount,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            {money(subtotal)}
          </Text>
        </View>

        <View style={styles.viewDetails}>
          <Text
            style={[
              styles.viewDetailsText,
              {
                color:
                  theme.colors.primary.main,
              },
            ]}
          >
            View details
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.primary.main}
          />
        </View>
      </View>

      <TrackingTimeline
        status={order.status}
        theme={theme}
      />
    </TouchableOpacity>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  sub,
  highlight,
  icon,
  theme,
}) => {
  const highlightColor =
    highlight === 'red'
      ? '#f87171'
      : highlight === 'amber'
      ? '#fbbf24'
      : theme.colors.text.primary;

  const iconColor =
    highlight === 'red'
      ? '#f87171'
      : highlight === 'amber'
      ? '#fbbf24'
      : theme.colors.primary.main;

  const highlightBorder =
    highlight === 'red'
      ? 'rgba(239,68,68,0.25)'
      : highlight === 'amber'
      ? 'rgba(245,158,11,0.25)'
      : theme.colors.border;

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor:
            theme.colors.card,
          borderColor: highlightBorder,
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              `${iconColor}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={iconColor}
        />
      </View>

      <Text
        style={[
          styles.statLabel,
          {
            color:
              theme.colors.text.secondary,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.statValue,
          {
            color: highlightColor,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      <Text
        style={[
          styles.statSub,
          {
            color:
              theme.colors.text.tertiary,
          },
        ]}
      >
        {sub}
      </Text>
    </View>
  );
};

/* =========================================================
   ORDER DETAILS MODAL
========================================================= */

const OrderDetailsModal = ({
  order,
  onClose,
  theme,
}) => {
  if (!order) return null;

  const stage = stageIndex(order.status);
  const validStage = stage >= 0;
  const subtotal = sellerSubtotal(order);

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.detailsOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.detailsBackground}
        />

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor:
                theme.colors.card,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          {/* MODAL HEADER */}

          <View style={styles.modalHandle} />

          <View style={styles.detailsHeaderRow}>
            <View style={styles.modalTitleIcon}>
              <Ionicons
                name="receipt-outline"
                size={22}
                color={theme.colors.primary.main}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.timelineLabel,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                ORDER DETAILS
              </Text>

              <Text
                style={[
                  styles.detailsTitle,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                {order.orderNumber}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor:
                    theme.colors.background,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="close"
                size={20}
                color={
                  theme.colors.text.secondary
                }
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          >
            {/* STATUS */}

            <View style={styles.badgesRow}>
              <StatusBadge
                status={order.status}
                theme={theme}
              />

              {order.payment && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        order.payment.status ===
                        'COMPLETED'
                          ? 'rgba(16,185,129,0.15)'
                          : 'rgba(245,158,11,0.15)',
                    },
                  ]}
                >
                  <Ionicons
                    name="card-outline"
                    size={12}
                    color={
                      order.payment.status ===
                      'COMPLETED'
                        ? '#34d399'
                        : '#fbbf24'
                    }
                    style={{
                      marginRight: 4,
                    }}
                  />

                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          order.payment
                            .status ===
                          'COMPLETED'
                            ? '#34d399'
                            : '#fbbf24',
                      },
                    ]}
                  >
                    {order.payment.status ===
                    'COMPLETED'
                      ? 'Payment completed'
                      : `Payment: ${order.payment.status}`}
                  </Text>
                </View>
              )}
            </View>

            {/* TRACKING */}

            {validStage && (
              <View style={{ marginTop: 16 }}>
                <TrackingTimeline
                  status={order.status}
                  theme={theme}
                />
              </View>
            )}

            {/* DELIVERY DETAILS */}

            <View
              style={[
                styles.infoBlock,
                {
                  backgroundColor:
                    theme.colors.background,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <View style={styles.infoHeader}>
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={
                    theme.colors.primary.main
                  }
                />

                <Text
                  style={[
                    styles.infoHeaderText,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  Delivery details
                </Text>
              </View>

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                {order.deliveryAddress ||
                  'Address unavailable'}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={
                    theme.colors.text.secondary
                  }
                />

                <Text
                  style={[
                    styles.infoSubText,
                    {
                      color:
                        theme.colors.text.secondary,
                    },
                  ]}
                >
                  {TIME_SLOT_LABEL[
                    order.deliveryTimeSlot
                  ] ||
                    order.deliveryTimeSlot ||
                    'Delivery time unavailable'}
                </Text>
              </View>

              {!!order.specialInstructions && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={
                      theme.colors.text.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.infoSubText,
                      {
                        color:
                          theme.colors.text.secondary,
                      },
                    ]}
                  >
                    {order.specialInstructions}
                  </Text>
                </View>
              )}

              <Text
                style={[
                  styles.infoMuted,
                  {
                    color:
                      theme.colors.text.tertiary,
                  },
                ]}
              >
                Placed:{' '}
                {order.placedAt
                  ? new Date(
                      order.placedAt
                    ).toLocaleString()
                  : '—'}
              </Text>
            </View>

            {/* BUYER */}

            <View
              style={[
                styles.infoBlock,
                {
                  backgroundColor:
                    theme.colors.background,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <View style={styles.infoHeader}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={
                    theme.colors.primary.main
                  }
                />

                <Text
                  style={[
                    styles.infoHeaderText,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  Buyer
                </Text>
              </View>

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                {order.buyer?.user?.name ??
                  'Customer'}
              </Text>

              {!!order.buyer?.user?.phone && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="call-outline"
                    size={14}
                    color={
                      theme.colors.text.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.infoSubText,
                      {
                        color:
                          theme.colors.text.secondary,
                      },
                    ]}
                  >
                    {order.buyer.user.phone}
                  </Text>
                </View>
              )}
            </View>

            {/* ITEMS */}

            <View style={{ marginTop: 18 }}>
              <View style={styles.itemsModalHeader}>
                <Ionicons
                  name="basket-outline"
                  size={17}
                  color={
                    theme.colors.primary.main
                  }
                />

                <Text
                  style={[
                    styles.infoHeaderText,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  Your items
                </Text>
              </View>

              {(order.items || []).map(
                (item, index) => (
                  <View
                    key={
                      item.id ??
                      `${item.product?.id}-${index}`
                    }
                    style={[
                      styles.itemRow,
                      {
                        borderBottomColor:
                          theme.colors.border,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.itemIcon
                      }
                    >
                      <Ionicons
                        name="leaf-outline"
                        size={16}
                        color={
                          theme.colors
                            .primary.main
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.itemRowMain
                      }
                    >
                      <Text
                        style={[
                          styles.itemRowName,
                          {
                            color:
                              theme.colors
                                .text.primary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.product?.name ??
                          'Product'}
                      </Text>

                      <Text
                        style={[
                          styles.itemRowQty,
                          {
                            color:
                              theme.colors
                                .text.secondary,
                          },
                        ]}
                      >
                        {item.quantity}{' '}
                        {item.product?.unit ??
                          'units'}{' '}
                        ×{' '}
                        {money(
                          unitPrice(item)
                        )}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.itemRowTotal,
                        {
                          color:
                            theme.colors
                              .text.primary,
                        },
                      ]}
                    >
                      {money(
                        item.totalPrice
                      )}
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* TOTAL */}

            <View
              style={[
                styles.totalContainer,
                {
                  backgroundColor:
                    `${theme.colors.primary.main}12`,
                  borderColor:
                    `${theme.colors.primary.main}30`,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.totalLabel,
                    {
                      color:
                        theme.colors.text.secondary,
                    },
                  ]}
                >
                  YOUR ORDER TOTAL
                </Text>

                <Text
                  style={[
                    styles.totalText,
                    {
                      color:
                        theme.colors.primary.main,
                    },
                  ]}
                >
                  {money(subtotal)}
                </Text>
              </View>

              <View
                style={styles.totalIcon}
              >
                <Ionicons
                  name="cash-outline"
                  size={23}
                  color={
                    theme.colors.primary.main
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================
   MAIN SCREEN
========================================================= */

const OrdersScreen = () => {
  const { theme } = useTheme();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const loadData = useCallback(
    async ({ silent } = {}) => {
      try {
        if (!silent) setLoading(true);

        setError(null);

        const [
          ordersRes,
          statsRes,
        ] = await Promise.all([
          api.get(ORDERS_ENDPOINT),
          api.get(STATS_ENDPOINT),
        ]);

        const ordersData =
          ordersRes?.data?.data ||
          ordersRes?.data?.orders ||
          [];

        const statsData =
          statsRes?.data?.data ||
          statsRes?.data?.stats ||
          null;

        setOrders(
          Array.isArray(ordersData)
            ? ordersData
            : []
        );

        setStats(statsData);
      } catch (err) {
        console.error(
          'Failed to load seller orders:',
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load orders.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData({ silent: true });
  };

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.placedAt).getTime() -
        new Date(a.placedAt).getTime()
    )
    .slice(0, RECENT_ORDERS_LIMIT);

  const activeOrders =
    recentOrders.filter(
      (o) =>
        !COMPLETED_STATUSES.includes(
          o.status
        )
    );

  const pastOrders =
    recentOrders.filter((o) =>
      COMPLETED_STATUSES.includes(
        o.status
      )
    );

  const statusBreakdown =
    stats?.ordersByStatus
      ? Object.entries(
          stats.ordersByStatus
        )
      : [];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={
              theme.colors.primary.main
            }
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="receipt-outline"
              size={22}
              color={
                theme.colors.primary.main
              }
            />
          </View>

          <Text
            style={[
              styles.eyebrow,
              {
                color:
                  theme.colors.primary.main,
              },
            ]}
          >
            VENDOR FULFILLMENT
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
            Orders & tracking
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
            Manage your orders, track
            deliveries and monitor your
            sales.
          </Text>
        </View>

        {/* LOADING */}

        {loading ? (
          <Card style={styles.loadingCard}>
            <View
              style={styles.loadingIcon}
            >
              <Ionicons
                name="sync-outline"
                size={24}
                color={
                  theme.colors.primary.main
                }
              />
            </View>

            <Text
              style={[
                styles.loadingTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Loading your orders
            </Text>

            <Text
              style={[
                styles.loadingText,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              Please wait a moment...
            </Text>
          </Card>
        ) : error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor:
                  'rgba(239,68,68,0.08)',
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={25}
              color="#f87171"
            />

            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >
              <Text
                style={[
                  styles.errorTitle,
                  {
                    color: '#f87171',
                  },
                ]}
              >
                Couldn't load orders
              </Text>

              <Text
                style={[
                  styles.errorMessage,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                {error}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => loadData()}
              style={[
                styles.retrySmall,
                {
                  backgroundColor:
                    theme.colors.primary
                      .main,
                },
              ]}
            >
              <Ionicons
                name="refresh"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* STATS */}

            {stats && (
              <View style={styles.statsGrid}>
                <StatCard
                  theme={theme}
                  icon="receipt-outline"
                  label="Total orders"
                  value={
                    stats.totalOrders ?? 0
                  }
                  sub="All time"
                />

                <StatCard
                  theme={theme}
                  icon="today-outline"
                  label="Orders today"
                  value={
                    stats.ordersToday ?? 0
                  }
                  sub="Since midnight"
                  highlight={
                    stats.ordersToday > 0
                      ? 'amber'
                      : undefined
                  }
                />

                <StatCard
                  theme={theme}
                  icon="cash-outline"
                  label="Sales today"
                  value={money(
                    stats.revenueToday
                  )}
                  sub="From your items"
                />

                <StatCard
                  theme={theme}
                  icon="trending-up-outline"
                  label="Total sales"
                  value={money(
                    stats.totalRevenue
                  )}
                  sub="All time earnings"
                />
              </View>
            )}

            {/* ACTIVE ORDERS */}

            <Card style={styles.sectionCard}>
              <View
                style={styles.sectionHeaderRow}
              >
                <View
                  style={
                    styles.sectionHeaderLeft
                  }
                >
                  <View
                    style={[
                      styles.sectionIcon,
                      {
                        backgroundColor:
                          `${theme.colors.primary.main}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="bicycle-outline"
                      size={17}
                      color={
                        theme.colors.primary
                          .main
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.sectionTitle,
                        {
                          color:
                            theme.colors.text
                              .primary,
                        },
                      ]}
                    >
                      Active orders
                    </Text>

                    <Text
                      style={[
                        styles.sectionSubtext,
                        {
                          color:
                            theme.colors.text
                              .secondary,
                        },
                      ]}
                    >
                      Orders currently being
                      processed
                    </Text>
                  </View>

                  {activeOrders.length >
                    0 && (
                    <View
                      style={[
                        styles.countChip,
                        {
                          backgroundColor:
                            `${theme.colors.primary.main}18`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countChipText,
                          {
                            color:
                              theme.colors
                                .primary.main,
                          },
                        ]}
                      >
                        {activeOrders.length}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {activeOrders.length ===
              0 ? (
                <View style={styles.emptyState}>
                  <View
                    style={[
                      styles.emptyIcon,
                      {
                        backgroundColor:
                          'rgba(16,185,129,0.12)',
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-done-outline"
                      size={28}
                      color="#34d399"
                    />
                  </View>

                  <Text
                    style={[
                      styles.emptyTitle,
                      {
                        color:
                          theme.colors.text
                            .primary,
                      },
                    ]}
                  >
                    No active orders
                  </Text>

                  <Text
                    style={[
                      styles.emptyText,
                      {
                        color:
                          theme.colors.text
                            .secondary,
                      },
                    ]}
                  >
                    You're all caught up!
                  </Text>
                </View>
              ) : (
                <View
                  style={{ gap: 10 }}
                >
                  {activeOrders.map(
                    (order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        theme={theme}
                        onPress={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                      />
                    )
                  )}
                </View>
              )}
            </Card>

            {/* STATUS BREAKDOWN */}

            {statusBreakdown.length >
              0 && (
              <Card
                style={
                  styles.sectionCard
                }
              >
                <View
                  style={
                    styles.simpleSectionHeader
                  }
                >
                  <View
                    style={[
                      styles.sectionIcon,
                      {
                        backgroundColor:
                          `${theme.colors.primary.main}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="pie-chart-outline"
                      size={17}
                      color={
                        theme.colors.primary
                          .main
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.sectionTitle,
                        {
                          color:
                            theme.colors.text
                              .primary,
                        },
                      ]}
                    >
                      Orders by status
                    </Text>

                    <Text
                      style={[
                        styles.sectionSubtext,
                        {
                          color:
                            theme.colors.text
                              .secondary,
                        },
                      ]}
                    >
                      Current order overview
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.breakdownGrid
                  }
                >
                  {statusBreakdown.map(
                    ([status, count]) => (
                      <View
                        key={status}
                        style={[
                          styles.breakdownCell,
                          {
                            backgroundColor:
                              theme.colors
                                .background,
                            borderColor:
                              theme.colors
                                .border,
                          },
                        ]}
                      >
                        <StatusBadge
                          status={status}
                          theme={theme}
                          style={{
                            alignSelf:
                              'flex-start',
                          }}
                        />

                        <Text
                          style={[
                            styles.breakdownCount,
                            {
                              color:
                                theme.colors
                                  .text
                                  .primary,
                            },
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </Card>
            )}

            {/* PAST ORDERS */}

            {pastOrders.length > 0 && (
              <Card
                style={
                  styles.sectionCard
                }
              >
                <View
                  style={
                    styles.simpleSectionHeader
                  }
                >
                  <View
                    style={[
                      styles.sectionIcon,
                      {
                        backgroundColor:
                          'rgba(16,185,129,0.12)',
                      },
                    ]}
                  >
                    <Ionicons
                      name="archive-outline"
                      size={17}
                      color="#34d399"
                    />
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.sectionTitle,
                        {
                          color:
                            theme.colors.text
                              .primary,
                        },
                      ]}
                    >
                      Completed & cancelled
                    </Text>

                    <Text
                      style={[
                        styles.sectionSubtext,
                        {
                          color:
                            theme.colors.text
                              .secondary,
                        },
                      ]}
                    >
                      Recently completed orders
                    </Text>
                  </View>
                </View>

                <View
                  style={{ gap: 10 }}
                >
                  {pastOrders.map(
                    (order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        theme={theme}
                        onPress={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                      />
                    )
                  )}
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          theme={theme}
          onClose={() =>
            setSelectedOrder(null)
          }
        />
      )}
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  /* HEADER */

  header: {
    marginBottom: 20,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59,130,246,0.12)',
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    marginTop: 5,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },

  /* LOADING */

  loadingCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  loadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.12)',
    marginBottom: 10,
  },

  loadingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  loadingText: {
    marginTop: 4,
    fontSize: 11,
  },

  /* ERROR */

  errorBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },

  errorMessage: {
    fontSize: 11,
    lineHeight: 16,
  },

  retrySmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  /* STATS */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },

  statCard: {
    width: '47.5%',
    minHeight: 145,
    borderRadius: 17,
    borderWidth: 1,
    padding: 14,
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },

  statValue: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 5,
  },

  statSub: {
    fontSize: 10,
    marginTop: 3,
  },

  /* SECTIONS */

  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },

  sectionHeaderRow: {
    marginBottom: 14,
  },

  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  simpleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  sectionSubtext: {
    fontSize: 10,
    marginTop: 2,
  },

  countChip: {
    marginLeft: 8,
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countChipText: {
    fontSize: 11,
    fontWeight: '800',
  },

  /* ORDER CARD */

  orderCard: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 14,
  },

  orderCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  orderIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(59,130,246,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  orderMainInfo: {
    flex: 1,
  },

  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },

  orderTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  metaText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 10.5,
  },

  /* ADDRESS */

  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginTop: 12,
  },

  addressText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10.5,
    lineHeight: 15,
  },

  /* PRODUCTS */

  productsSection: {
    marginTop: 12,
  },

  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  productsHeaderText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  itemPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  itemPill: {
    maxWidth: '100%',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  itemPillText: {
    fontSize: 9.5,
  },

  /* ORDER FOOTER */

  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 11,
  },

  totalLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  totalAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },

  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 8,
  },

  viewDetailsText: {
    fontSize: 10.5,
    fontWeight: '800',
    marginRight: 3,
  },

  /* BADGE */

  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  /* TRACKING */

  timelineWrap: {
    marginTop: 12,
  },

  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  timelineLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 5,
  },

  timelinePills: {
    gap: 6,
    paddingRight: 5,
  },

  timelinePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentTimelinePill: {
    borderWidth: 1.5,
  },

  /* BREAKDOWN */

  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  breakdownCell: {
    width: '47%',
    minHeight: 83,
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
  },

  breakdownCount: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 7,
  },

  /* EMPTY */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  emptyText: {
    fontSize: 10.5,
    marginTop: 3,
  },

  /* MODAL */

  detailsOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  detailsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  detailsCard: {
    width: '100%',
    maxHeight: '92%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderWidth: 1,
    padding: 18,
    paddingTop: 10,
  },

  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
    alignSelf: 'center',
    marginBottom: 15,
  },

  detailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  modalTitleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(59,130,246,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 3,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 2,
  },

  /* INFO BLOCK */

  infoBlock: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  infoHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },

  infoText: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  infoSubText: {
    flex: 1,
    fontSize: 10.5,
    marginLeft: 6,
    lineHeight: 15,
  },

  infoMuted: {
    fontSize: 9.5,
    marginTop: 8,
  },

  /* MODAL ITEMS */

  itemsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  itemRowMain: {
    flex: 1,
  },

  itemRowName: {
    fontSize: 12,
    fontWeight: '700',
  },

  itemRowQty: {
    fontSize: 9.5,
    marginTop: 3,
  },

  itemRowTotal: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },

  /* TOTAL */

  totalContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  totalText: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  totalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.10)',
  },
});

export default OrdersScreen;