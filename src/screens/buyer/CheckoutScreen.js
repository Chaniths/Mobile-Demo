import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../api/client';

// ============================================================================
// TIME SLOTS
// ============================================================================

const TIME_SLOTS = [
  {
    value: 'MORNING',
    icon: 'partly-sunny-outline',
    label: 'Morning',
    sub: '6 AM – 12 PM',
  },
  {
    value: 'AFTERNOON',
    icon: 'sunny-outline',
    label: 'Afternoon',
    sub: '12 PM – 5 PM',
  },
  {
    value: 'EVENING',
    icon: 'moon-outline',
    label: 'Evening',
    sub: '5 PM – 9 PM',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const parsePrice = (price) => {
  const cleaned = String(price ?? '').replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value) => {
  const number = Number(value) || 0;

  return number.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ============================================================================
// RESERVATION HELPERS
// ============================================================================

const getReservationStatus = (expiresAt) => {
  if (!expiresAt) {
    return {
      isExpired: false,
      percentageRemaining: 100,
      timeRemaining: '',
    };
  }

  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();

  const remaining = expiry - now;

  if (remaining <= 0) {
    return {
      isExpired: true,
      percentageRemaining: 0,
      timeRemaining: 'Expired',
    };
  }

  const totalReservationTime = 24 * 60 * 60 * 1000;
  const percentageRemaining = Math.max(
    0,
    Math.min(100, (remaining / totalReservationTime) * 100)
  );

  const totalSeconds = Math.floor(remaining / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let timeRemaining;

  if (hours > 0) {
    timeRemaining = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    timeRemaining = `${minutes}m ${seconds}s`;
  } else {
    timeRemaining = `${seconds}s`;
  }

  return {
    isExpired: false,
    percentageRemaining,
    timeRemaining,
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Hide bottom tab bar while on checkout to avoid overlap with footer
  useEffect(() => {
    const parent = navigation.getParent?.();
    if (parent?.setOptions) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }

    return () => {
      if (parent?.setOptions) {
        parent.setOptions({ tabBarStyle: { display: 'flex' } });
      }
    };
  }, [navigation]);

  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------

  const [items, setItems] = useState([]);

  const [state, setState] = useState({
    currentStep: 1,

    deliveryAddress: {
      address: '',
      latitude: 0,
      longitude: 0,
    },

    deliveryTimeSlot: null,

    specialInstructions: '',

    loading: false,

    error: null,
  });

  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  });

  const [loadingData, setLoadingData] = useState(true);

  // Used to force reservation countdown refresh
  const [, setTick] = useState(0);

  // --------------------------------------------------------------------------
  // LIVE RESERVATION TIMER
  // --------------------------------------------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================================================
  // FETCH CART + ADDRESS
  // ==========================================================================

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);

      setState((prev) => ({
        ...prev,
        error: null,
      }));

      const [cartRes, addressRes] = await Promise.all([
        api.get('/cart'),
        api.get('/orders/addresses'),
      ]);

      const cartData = cartRes?.data?.data || cartRes?.data || {};

      const rawItems = cartData?.items || [];

      // Guarantee a unique key per line item — the backend's raw `id`
      // can repeat when the same product appears from more than one
      // seller, which is what was causing the duplicate-key warning.
      const cartItems = rawItems.map((item, index) => ({
        ...item,
        uniqueId: `${item.productId || item.id || 'product'}-${item.sellerId || 'seller'}-${index}`,
      }));

      setItems(cartItems);

      setCartTotals({
        subtotal: Number(cartData?.subtotal) || 0,
        tax: Number(cartData?.tax) || 0,
        discount: Number(cartData?.discount) || 0,
        total: Number(cartData?.total) || 0,
      });

      const primaryAddress =
        addressRes?.data?.primary ||
        addressRes?.data?.data?.primary ||
        null;

      if (primaryAddress) {
        setState((prev) => ({
          ...prev,

          deliveryAddress: {
            address: primaryAddress.address || '',
            latitude: Number(primaryAddress.latitude) || 0,
            longitude: Number(primaryAddress.longitude) || 0,
          },
        }));
      }
    } catch (error) {
      console.error('Checkout fetch error:', error);

      setState((prev) => ({
        ...prev,
        error:
          error?.response?.data?.message ||
          'Failed to load checkout.',
      }));
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================================
  // EMPTY CART GUARD
  // ==========================================================================

  useEffect(() => {
    if (!loadingData && items.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Your cart is empty. Please add items before checkout.',
        [
          {
            text: 'Go to Cart',
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    }
  }, [loadingData, items.length, navigation]);

  // ==========================================================================
  // RESERVATION BADGE
  // ==========================================================================

  const renderReservationBadge = (item) => {
    const expiresAt = item?.reservation?.expiresAt;

    if (!expiresAt) {
      return null;
    }

    const status = getReservationStatus(expiresAt);

    if (status.isExpired) {
      return (
        <View style={styles.inlineIconRow}>
          <Ionicons name="alert-circle-outline" size={12} color="#f87171" style={styles.inlineIcon} />
          <Text style={styles.expiredText}>
            Expired — go back to cart to re-add
          </Text>
        </View>
      );
    }

    let color = '#34d399';

    if (status.percentageRemaining < 10) {
      color = '#facc15';
    } else if (status.percentageRemaining < 25) {
      color = '#fb923c';
    }

    return (
      <View style={styles.inlineIconRow}>
        <Ionicons name="timer-outline" size={12} color={color} style={styles.inlineIcon} />
        <Text
          style={[
            styles.reservationText,
            {
              color,
            },
          ]}
        >
          {status.timeRemaining}
        </Text>
      </View>
    );
  };

  // ==========================================================================
  // VALIDATE RESERVATIONS
  // ==========================================================================

  const validateReservations = () => {
    const expiredItems = [];
    const expiringItems = [];

    items.forEach((item) => {
      if (!item?.reservation?.expiresAt) {
        return;
      }

      const status = getReservationStatus(
        item.reservation.expiresAt
      );

      if (status.isExpired) {
        expiredItems.push(item.name);
      } else if (status.percentageRemaining < 10) {
        expiringItems.push(
          `${item.name} (${status.timeRemaining})`
        );
      }
    });

    return {
      expiredItems,
      expiringItems,
    };
  };

  // ==========================================================================
  // NEXT STEP
  // ==========================================================================

  const handleNextStep = () => {
    if (state.currentStep === 2) {
      if (!state.deliveryAddress?.address?.trim()) {
        setState((prev) => ({
          ...prev,
          error: 'Please enter a delivery address.',
        }));

        return;
      }
    }

    if (state.currentStep === 3) {
      if (!state.deliveryTimeSlot) {
        setState((prev) => ({
          ...prev,
          error: 'Please select a delivery time slot.',
        }));

        return;
      }
    }

    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
      error: null,
    }));
  };

  // ==========================================================================
  // PREVIOUS STEP
  // ==========================================================================

  const handlePreviousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
      error: null,
    }));
  };

  // ==========================================================================
  // CREATE ORDER + STRIPE PAYMENT
  // ==========================================================================

  const handlePay = async () => {
    if (!state.deliveryTimeSlot) {
      setState((prev) => ({
        ...prev,
        error: 'Please select a delivery time slot.',
      }));

      return;
    }

    if (!state.deliveryAddress?.address?.trim()) {
      setState((prev) => ({
        ...prev,
        error: 'Please enter a delivery address.',
      }));

      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // ----------------------------------------------------------------------
      // STEP 1 — CHECK RESERVATIONS
      // ----------------------------------------------------------------------

      const { expiredItems, expiringItems } =
        validateReservations();

      if (expiredItems.length > 0) {
        throw new Error(
          `The following items have expired: ${expiredItems.join(
            ', '
          )}. Please go back to your cart and re-add them.`
        );
      }

      // ----------------------------------------------------------------------
      // STEP 2 — WARN IF RESERVATION IS ABOUT TO EXPIRE
      // ----------------------------------------------------------------------

      if (expiringItems.length > 0) {
        Alert.alert(
          'Reservation Almost Expired',
          `The following items are running out of reservation time:\n\n${expiringItems.join(
            '\n'
          )}\n\nDo you want to continue?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setState((prev) => ({
                  ...prev,
                  loading: false,
                }));
              },
            },
            {
              text: 'Continue',
              onPress: () => {
                continuePayment();
              },
            },
          ]
        );

        return;
      }

      await continuePayment();
    } catch (error) {
      console.error('Payment preparation error:', error);

      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong.',
      }));
    }
  };

  // ==========================================================================
  // CREATE ORDER
  // ==========================================================================

  const continuePayment = async () => {
    try {
      // ----------------------------------------------------------------------
      // CREATE ORDER
      // ----------------------------------------------------------------------

      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          sellerId: item.sellerId,
        })),

        deliveryAddress:
          state.deliveryAddress.address,

        deliveryLat:
          state.deliveryAddress.latitude,

        deliveryLng:
          state.deliveryAddress.longitude,

        deliveryTimeSlot:
          state.deliveryTimeSlot,

        specialInstructions:
          state.specialInstructions || undefined,
      };

      console.log(
        'Creating order:',
        JSON.stringify(orderPayload, null, 2)
      );

      const orderResponse = await api.post(
        '/orders',
        orderPayload
      );

      const order =
        orderResponse?.data?.data ||
        orderResponse?.data;

      if (!order?.id) {
        throw new Error(
          'Order was created but no order ID was returned.'
        );
      }

      // ----------------------------------------------------------------------
      // CREATE STRIPE CHECKOUT SESSION
      // ----------------------------------------------------------------------

      console.log(
        'Creating payment session for order:',
        order.id
      );

      const paymentResponse = await api.post('/payments', {
        orderId: order.id,
        currency: 'usd',
      });

      const paymentData =
        paymentResponse?.data?.data ||
        paymentResponse?.data;

      const checkoutUrl =
        paymentData?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(
          'Failed to get payment URL. Please try again.'
        );
      }

      console.log(
        'Opening Stripe checkout:',
        checkoutUrl
      );

      // ----------------------------------------------------------------------
      // OPEN STRIPE
      // ----------------------------------------------------------------------

      const supported =
        await Linking.canOpenURL(checkoutUrl);

      if (!supported) {
        throw new Error(
          'Unable to open the payment page on this device.'
        );
      }

      await Linking.openURL(checkoutUrl);

      // ----------------------------------------------------------------------
      // SUCCESS
      // ----------------------------------------------------------------------

      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    } catch (error) {
      console.error('Place order/payment error:', error);

      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          'Could not proceed to payment. Please try again.',
      }));
    }
  };

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loadingData) {
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
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Checkout
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
            Loading checkout…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================================
  // MAIN
  // ==========================================================================

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
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={theme.colors.primary.main}
          />

          <Text
            style={[
              styles.backButton,
              {
                color:
                  theme.colors.primary.main,
              },
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Checkout
          </Text>

          <Text
            style={[
              styles.stepText,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            Step {state.currentStep} of 5
          </Text>
        </View>

        <View style={{ width: 50 }} />
      </View>

      {/* ================================================================ */}
      {/* PROGRESS BAR */}
      {/* ================================================================ */}

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View
            key={step}
            style={[
              styles.progressBar,
              {
                backgroundColor:
                  step <= state.currentStep
                    ? theme.colors.primary.main
                    : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* ================================================================ */}
      {/* ERROR */}
      {/* ================================================================ */}

      {state.error && (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: 'rgba(239,68,68,0.12)',
              borderColor: 'rgba(239,68,68,0.35)',
            },
          ]}
        >
          <Text
            style={[
              styles.errorText,
              {
                color:
                  theme.colors.error ||
                  '#ef4444',
              },
            ]}
          >
            {state.error}
          </Text>
        </View>
      )}

      {/* ================================================================ */}
      {/* CONTENT */}
      {/* ================================================================ */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (insets.bottom || 0) + 180 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* STEP 1 — ORDER SUMMARY */}
        {/* ============================================================ */}

        {state.currentStep === 1 && (
          <Card style={styles.card}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Order Summary
            </Text>

            {items.map((item) => {
              const price =
                parsePrice(item.price);

              const itemTotal =
                price * item.quantity;

              return (
                <View
                  key={item.uniqueId || item.id}
                  style={[
                    styles.orderItem,
                    {
                      backgroundColor:
                        theme.colors.background,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.orderItemContent
                    }
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{
                          uri: item.imageUrl,
                        }}
                        style={
                          styles.productImage
                        }
                      />
                    ) : (
                      <View
                        style={[
                          styles.productImage,
                          styles.imagePlaceholder,
                          {
                            backgroundColor:
                              theme.colors
                                .primary.light,
                          },
                        ]}
                      >
                        <Ionicons
                          name="cart-outline"
                          size={20}
                          color={theme.colors.primary.main}
                        />
                      </View>
                    )}

                    <View
                      style={
                        styles.productDetails
                      }
                    >
                      <Text
                        style={[
                          styles.itemName,
                          {
                            color:
                              theme.colors
                                .text.primary,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>

                      {item.vendor && (
                        <View style={styles.inlineIconRow}>
                          <Ionicons
                            name="storefront-outline"
                            size={11}
                            color={theme.colors.text.secondary}
                            style={styles.inlineIcon}
                          />
                          <Text
                            style={[
                              styles.itemMeta,
                              {
                                color:
                                  theme.colors
                                    .text.secondary,
                                marginTop: 0,
                              },
                            ]}
                          >
                            {item.vendor}
                          </Text>
                        </View>
                      )}

                      <Text
                        style={[
                          styles.itemMeta,
                          {
                            color:
                              theme.colors
                                .text.secondary,
                          },
                        ]}
                      >
                        Rs. {formatCurrency(price)} /{' '}
                        {item.unit} · Qty{' '}
                        {item.quantity}
                      </Text>

                      {renderReservationBadge(
                        item
                      )}
                    </View>

                    <Text
                      style={[
                        styles.itemTotal,
                        {
                          color:
                            theme.colors
                              .text.primary,
                        },
                      ]}
                    >
                      Rs.{' '}
                      {formatCurrency(
                        itemTotal
                      )}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* SUBTOTAL */}

            <View
              style={[
                styles.highlightBox,
                {
                  borderColor:
                    theme.colors.primary.main,
                  backgroundColor:
                    `${theme.colors.primary.main}10`,
                },
              ]}
            >
              <Text
                style={[
                  styles.highlightLabel,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Subtotal
              </Text>

              <Text
                style={[
                  styles.highlightValue,
                  {
                    color:
                      theme.colors.primary.main,
                  },
                ]}
              >
                Rs.{' '}
                {formatCurrency(
                  cartTotals.subtotal
                )}
              </Text>
            </View>
          </Card>
        )}

        {/* ============================================================ */}
        {/* STEP 2 — ADDRESS */}
        {/* ============================================================ */}

        {state.currentStep === 2 && (
          <Card style={styles.card}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Delivery Address
            </Text>

            <Text
              style={[
                styles.fieldLabel,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              Address
            </Text>

            <TextInput
              value={
                state.deliveryAddress.address
              }
              onChangeText={(text) =>
                setState((prev) => ({
                  ...prev,

                  deliveryAddress: {
                    ...prev.deliveryAddress,
                    address: text,
                  },

                  error: null,
                }))
              }
              placeholder="Enter your delivery address"
              placeholderTextColor={
                theme.colors.text.tertiary
              }
              multiline
              style={[
                styles.addressInput,
                {
                  color:
                    theme.colors.text.primary,
                  borderColor:
                    theme.colors.border,
                  backgroundColor:
                    theme.colors.background,
                },
              ]}
            />

            <View style={styles.inlineIconRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={theme.colors.text.secondary}
                style={styles.inlineIcon}
              />
              <Text
                style={[
                  styles.locationText,
                  {
                    color:
                      theme.colors.text.secondary,
                    marginTop: 0,
                  },
                ]}
              >
                Latitude:{' '}
                {Number(
                  state.deliveryAddress
                    .latitude || 0
                ).toFixed(4)}
              </Text>
            </View>

            <View style={styles.inlineIconRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={theme.colors.text.secondary}
                style={styles.inlineIcon}
              />
              <Text
                style={[
                  styles.locationText,
                  {
                    color:
                      theme.colors.text.secondary,
                    marginTop: 0,
                  },
                ]}
              >
                Longitude:{' '}
                {Number(
                  state.deliveryAddress
                    .longitude || 0
                ).toFixed(4)}
              </Text>
            </View>

            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor:
                    `${theme.colors.primary.main}10`,
                  borderColor:
                    `${theme.colors.primary.main}30`,
                },
              ]}
            >
              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Your primary delivery address
                is loaded automatically from
                your profile.
              </Text>
            </View>
          </Card>
        )}

        {/* ============================================================ */}
        {/* STEP 3 — TIME SLOT */}
        {/* ============================================================ */}

        {state.currentStep === 3 && (
          <Card style={styles.card}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Delivery Time Slot
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
              Select a convenient time for
              your delivery.
            </Text>

            {TIME_SLOTS.map((slot) => {
              const selected =
                state.deliveryTimeSlot ===
                slot.value;

              return (
                <TouchableOpacity
                  key={slot.value}
                  onPress={() =>
                    setState((prev) => ({
                      ...prev,
                      deliveryTimeSlot:
                        slot.value,
                      error: null,
                    }))
                  }
                  style={[
                    styles.timeSlot,
                    {
                      borderColor: selected
                        ? theme.colors.primary.main
                        : theme.colors.border,

                      backgroundColor: selected
                        ? `${theme.colors.primary.main}12`
                        : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.timeSlotIconWrap}>
                    <Ionicons
                      name={slot.icon}
                      size={22}
                      color={
                        selected
                          ? theme.colors.primary.main
                          : theme.colors.text.secondary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.timeSlotContent
                    }
                  >
                    <Text
                      style={[
                        styles.timeSlotLabel,
                        {
                          color: selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .text.primary,
                        },
                      ]}
                    >
                      {slot.label}
                    </Text>

                    <Text
                      style={[
                        styles.timeSlotSub,
                        {
                          color:
                            theme.colors
                              .text.secondary,
                        },
                      ]}
                    >
                      {slot.sub}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor:
                          selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .border,
                      },
                    ]}
                  >
                    {selected && (
                      <View
                        style={[
                          styles.radioInner,
                          {
                            backgroundColor:
                              theme.colors
                                .primary.main,
                          },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>
        )}

        {/* ============================================================ */}
        {/* STEP 4 — SPECIAL INSTRUCTIONS */}
        {/* ============================================================ */}

        {state.currentStep === 4 && (
          <Card style={styles.card}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Special Instructions
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
              Add any instructions for your
              delivery. This is optional.
            </Text>

            <TextInput
              value={
                state.specialInstructions
              }
              onChangeText={(text) =>
                setState((prev) => ({
                  ...prev,
                  specialInstructions:
                    text,
                  error: null,
                }))
              }
              placeholder="Example: Please leave the order at the front door..."
              placeholderTextColor={
                theme.colors.text.tertiary
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={[
                styles.instructionsInput,
                {
                  color:
                    theme.colors.text.primary,
                  borderColor:
                    theme.colors.border,
                  backgroundColor:
                    theme.colors.background,
                },
              ]}
            />

            <Text
              style={[
                styles.characterCount,
                {
                  color:
                    theme.colors.text.tertiary,
                },
              ]}
            >
              {state.specialInstructions.length}{' '}
              characters
            </Text>
          </Card>
        )}

        {/* ============================================================ */}
        {/* STEP 5 — REVIEW */}
        {/* ============================================================ */}

        {state.currentStep === 5 && (
          <>
            {/* ITEMS */}

            <Card style={styles.card}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Review Your Order
              </Text>

              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color:
                      theme.colors.text.tertiary,
                  },
                ]}
              >
                ITEMS ({items.length})
              </Text>

              {items.map((item) => {
                const price =
                  parsePrice(item.price);

                return (
                  <View
                    key={item.uniqueId || item.id}
                    style={styles.reviewItem}
                  >
                    <View
                      style={
                        styles.reviewItemLeft
                      }
                    >
                      <Text
                        style={[
                          styles.reviewItemName,
                          {
                            color:
                              theme.colors
                                .text.primary,
                          },
                        ]}
                      >
                        {item.name} ×{' '}
                        {item.quantity}
                      </Text>

                      {item.vendor && (
                        <View style={styles.inlineIconRow}>
                          <Ionicons
                            name="storefront-outline"
                            size={11}
                            color={theme.colors.text.secondary}
                            style={styles.inlineIcon}
                          />
                          <Text
                            style={[
                              styles.reviewVendor,
                              {
                                color:
                                  theme.colors
                                    .text.secondary,
                                marginTop: 0,
                              },
                            ]}
                          >
                            {item.vendor}
                          </Text>
                        </View>
                      )}

                      {renderReservationBadge(
                        item
                      )}
                    </View>

                    <Text
                      style={[
                        styles.reviewPrice,
                        {
                          color:
                            theme.colors
                              .text.primary,
                        },
                      ]}
                    >
                      Rs.{' '}
                      {formatCurrency(
                        price *
                          item.quantity
                      )}
                    </Text>
                  </View>
                );
              })}
            </Card>

            {/* DELIVERY */}

            <Card style={styles.card}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color:
                      theme.colors.text.tertiary,
                  },
                ]}
              >
                DELIVERY
              </Text>

              <View style={styles.inlineIconRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.colors.text.primary}
                  style={styles.inlineIcon}
                />
                <Text
                  style={[
                    styles.reviewText,
                    {
                      color:
                        theme.colors.text.primary,
                      marginBottom: 0,
                    },
                  ]}
                >
                  {state.deliveryAddress
                    .address ||
                    'No address selected'}
                </Text>
              </View>

              <View style={[styles.inlineIconRow, { marginTop: 8 }]}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.colors.text.primary}
                  style={styles.inlineIcon}
                />
                <Text
                  style={[
                    styles.reviewText,
                    {
                      color:
                        theme.colors.text.primary,
                      marginBottom: 0,
                    },
                  ]}
                >
                  {state.deliveryTimeSlot
                    ? state.deliveryTimeSlot
                        .replace(
                          /_/g,
                          ' '
                        )
                    : 'No time slot selected'}
                </Text>
              </View>

              {state.specialInstructions ? (
                <View style={[styles.inlineIconRow, { marginTop: 8, alignItems: 'flex-start' }]}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={theme.colors.text.primary}
                    style={[styles.inlineIcon, { marginTop: 2 }]}
                  />
                  <Text
                    style={[
                      styles.reviewText,
                      {
                        color:
                          theme.colors
                            .text.primary,
                        marginBottom: 0,
                        flex: 1,
                      },
                    ]}
                  >
                    {
                      state.specialInstructions
                    }
                  </Text>
                </View>
              ) : null}
            </Card>

            {/* PAYMENT */}

            <Card style={styles.card}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color:
                      theme.colors.text.tertiary,
                  },
                ]}
              >
                PAYMENT
              </Text>

              <View
                style={styles.summaryRow}
              >
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color:
                        theme.colors
                          .text.secondary,
                    },
                  ]}
                >
                  Subtotal
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        theme.colors
                          .text.primary,
                    },
                  ]}
                >
                  Rs.{' '}
                  {formatCurrency(
                    cartTotals.subtotal
                  )}
                </Text>
              </View>

              <View
                style={styles.summaryRow}
              >
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color:
                        theme.colors
                          .text.secondary,
                    },
                  ]}
                >
                  Tax (10%)
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        theme.colors
                          .text.primary,
                    },
                  ]}
                >
                  Rs.{' '}
                  {formatCurrency(
                    cartTotals.tax
                  )}
                </Text>
              </View>

              {cartTotals.discount > 0 && (
                <View
                  style={styles.summaryRow}
                >
                  <Text
                    style={[
                      styles.summaryLabel,
                      {
                        color:
                          theme.colors
                            .success ||
                          '#34d399',
                      },
                    ]}
                  >
                    Discount
                  </Text>

                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color:
                          theme.colors
                            .success ||
                          '#34d399',
                      },
                    ]}
                  >
                    - Rs.{' '}
                    {formatCurrency(
                      cartTotals.discount
                    )}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              <View
                style={styles.totalRow}
              >
                <Text
                  style={[
                    styles.totalLabel,
                    {
                      color:
                        theme.colors
                          .text.primary,
                    },
                  ]}
                >
                  Total Amount
                </Text>

                <Text
                  style={[
                    styles.totalValue,
                    {
                      color:
                        theme.colors
                          .primary.main,
                    },
                  ]}
                >
                  Rs.{' '}
                  {formatCurrency(
                    cartTotals.total
                  )}
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ================================================================ */}
      {/* NAVIGATION FOOTER */}
      {/* ================================================================ */}

      <View
        style={[
          styles.footer,
          {
            backgroundColor:
              theme.colors.background,
            borderTopColor:
              theme.colors.border,
          },
        ]}
      >
        <View style={styles.footerButtons}>
          {state.currentStep > 1 && (
            <TouchableOpacity
              style={[
                styles.previousButton,
                {
                  borderColor:
                    theme.colors.border,
                },
              ]}
              onPress={handlePreviousStep}
              disabled={state.loading}
            >
              <Ionicons
                name="arrow-back"
                size={15}
                color={theme.colors.text.primary}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.previousButtonText,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>
          )}

          {state.currentStep < 5 ? (
            <Button
              title="Next"
              onPress={handleNextStep}
              disabled={state.loading}
              style={[
                styles.nextButton,
                state.currentStep === 1 &&
                  styles.fullButton,
              ]}
            />
          ) : (
            <Button
              title={
                state.loading
                  ? 'Redirecting to payment…'
                  : 'Proceed to Payment'
              }
              onPress={handlePay}
              disabled={state.loading}
              style={styles.nextButton}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Cart')
          }
          disabled={state.loading}
          style={styles.backToCartRow}
        >
          <Ionicons
            name="arrow-back"
            size={12}
            color={theme.colors.text.secondary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.backToCart,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            Back to cart
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // --------------------------------------------------------------------------
  // HEADER
  // --------------------------------------------------------------------------

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },

  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },

  headerCenter: {
    alignItems: 'center',
  },

  backButton: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  stepText: {
    fontSize: 11,
    marginTop: 2,
  },

  // --------------------------------------------------------------------------
  // INLINE ICON ROW
  // --------------------------------------------------------------------------

  inlineIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inlineIcon: {
    marginRight: 4,
  },

  // --------------------------------------------------------------------------
  // PROGRESS
  // --------------------------------------------------------------------------

  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 5,
    marginBottom: 10,
  },

  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 10,
  },

  // --------------------------------------------------------------------------
  // ERROR
  // --------------------------------------------------------------------------

  errorBox: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // --------------------------------------------------------------------------
  // SCROLL
  // --------------------------------------------------------------------------

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 180,
  },

  // --------------------------------------------------------------------------
  // CARD
  // --------------------------------------------------------------------------

  card: {
    marginBottom: 12,
    padding: 16,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 15,
  },

  // --------------------------------------------------------------------------
  // ORDER ITEMS
  // --------------------------------------------------------------------------

  orderItem: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },

  orderItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
  },

  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  productDetails: {
    flex: 1,
    paddingRight: 6,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },

  itemMeta: {
    fontSize: 11,
    marginTop: 2,
  },

  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
  },

  reservationText: {
    fontSize: 11,
    fontWeight: '600',
  },

  expiredText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '600',
  },

  // --------------------------------------------------------------------------
  // HIGHLIGHT
  // --------------------------------------------------------------------------

  highlightBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  highlightLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  highlightValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  // --------------------------------------------------------------------------
  // ADDRESS
  // --------------------------------------------------------------------------

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },

  addressInput: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    textAlignVertical: 'top',
  },

  locationText: {
    fontSize: 11,
    marginTop: 7,
  },

  infoBox: {
    borderWidth: 1,
    borderRadius: 9,
    padding: 10,
    marginTop: 14,
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
  },

  // --------------------------------------------------------------------------
  // TIME SLOT
  // --------------------------------------------------------------------------

  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  timeSlotIconWrap: {
    width: 40,
    alignItems: 'flex-start',
  },

  timeSlotContent: {
    flex: 1,
  },

  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  timeSlotSub: {
    fontSize: 11,
    marginTop: 3,
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },

  // --------------------------------------------------------------------------
  // INSTRUCTIONS
  // --------------------------------------------------------------------------

  instructionsInput: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    fontSize: 14,
  },

  characterCount: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 5,
  },

  // --------------------------------------------------------------------------
  // REVIEW
  // --------------------------------------------------------------------------

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginBottom: 10,
  },

  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
  },

  reviewItemLeft: {
    flex: 1,
    paddingRight: 10,
  },

  reviewItemName: {
    fontSize: 13,
    fontWeight: '600',
  },

  reviewVendor: {
    fontSize: 11,
    marginTop: 3,
  },

  reviewPrice: {
    fontSize: 13,
    fontWeight: '600',
  },

  reviewText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },

  // --------------------------------------------------------------------------
  // PAYMENT
  // --------------------------------------------------------------------------

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  summaryLabel: {
    fontSize: 13,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },

  totalValue: {
    fontSize: 19,
    fontWeight: '700',
  },

  // --------------------------------------------------------------------------
  // FOOTER
  // --------------------------------------------------------------------------

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
  },

  footerButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  previousButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previousButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  nextButton: {
    flex: 1,
    minHeight: 48,
  },

  fullButton: {
    flex: 1,
  },

  backToCartRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 9,
  },

  backToCart: {
    textAlign: 'center',
    fontSize: 11,
  },
});

export default CheckoutScreen;