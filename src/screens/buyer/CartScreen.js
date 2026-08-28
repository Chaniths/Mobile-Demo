import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

import apiClient from '../../api/client';

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // ============================================================
  // STATE
  // ============================================================

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);

  const [stockModal, setStockModal] = useState(null);

  const [expiryRefresh, setExpiryRefresh] = useState(0);

  // ============================================================
  // NORMALIZE CART ITEM
  // ============================================================

  const normalizeCartItem = (item, index) => {
    if (!item) {
      return null;
    }

    /*
     * Backend may return fields directly:
     *
     * {
     *   productId,
     *   sellerId,
     *   quantity,
     *   price,
     *   name
     * }
     *
     * OR nested product/seller information.
     */

    const product = item.product || {};
    const seller = item.seller || {};

    const sellerInfo =
      product.seller ||
      seller ||
      {};

    const productId =
      item.productId ||
      product.id ||
      item.id;

    const sellerId =
      item.sellerId ||
      product.sellerId ||
      sellerInfo.id ||
      '';

    const quantity =
      Number(item.quantity) || 0;

    const price =
      Number(
        item.price ??
          item.unitPrice ??
          product.price ??
          0
      );

    const availableStock =
      item.availableStock !== undefined &&
      item.availableStock !== null
        ? Number(item.availableStock)
        : item.stock !== undefined &&
            item.stock !== null
          ? Number(item.stock)
          : product.stock !== undefined &&
              product.stock !== null
            ? Number(product.stock)
            : undefined;

    const name =
      item.name ||
      item.productName ||
      product.name ||
      'Product';

    const unit =
      item.unit ||
      product.unit ||
      '';

    const category =
      item.category ||
      product.category ||
      '';

    const vendor =
      item.vendor ||
      item.sellerName ||
      sellerInfo.businessName ||
      sellerInfo.user?.name ||
      '';

    /*
     * VERY IMPORTANT:
     *
     * Never use only productId as FlatList key because
     * the same product can exist from different sellers.
     */

    const uniqueId =
      `${productId || 'product'}-${sellerId || 'seller'}-${index}`;

    return {
      ...item,

      id: uniqueId,

      productId,
      sellerId,

      quantity,
      price,

      availableStock,

      name,
      unit,
      category,
      vendor,

      reservation:
        item.reservation || null,
    };
  };

  // ============================================================
  // FETCH CART
  // ============================================================

  const syncCartFromDB = useCallback(async () => {
    try {
      setError(null);

      console.log('🛒 Fetching cart...');

      const response = await apiClient.get('/cart');

      console.log(
        '🛒 Cart API response:',
        JSON.stringify(response.data, null, 2)
      );

      const responseData =
        response?.data || {};

      /*
       * Support:
       *
       * { items: [] }
       *
       * OR
       *
       * { data: { items: [] } }
       */

      const cartData =
        responseData?.data &&
        typeof responseData.data === 'object'
          ? responseData.data
          : responseData;

      const rawItems =
        Array.isArray(cartData?.items)
          ? cartData.items
          : [];

      console.log(
        '🛒 Raw cart items:',
        JSON.stringify(rawItems, null, 2)
      );

      const normalizedItems =
        rawItems
          .map((item, index) =>
            normalizeCartItem(item, index)
          )
          .filter(Boolean)
          .filter(
            (item) =>
              item.productId &&
              item.quantity > 0
          );

      console.log(
        '🛒 Normalized cart items:',
        JSON.stringify(
          normalizedItems,
          null,
          2
        )
      );

      setItems(normalizedItems);

      /*
       * Use backend totals if available.
       */

      const backendSubtotal =
        Number(cartData?.subtotal);

      const backendTax =
        Number(cartData?.tax);

      const backendDiscount =
        Number(cartData?.discount);

      const backendTotal =
        Number(cartData?.total);

      if (Number.isFinite(backendSubtotal)) {
        setSubtotal(backendSubtotal);
      }

      if (Number.isFinite(backendTax)) {
        setTax(backendTax);
      }

      if (Number.isFinite(backendDiscount)) {
        setDiscount(backendDiscount);
      }

      if (Number.isFinite(backendTotal)) {
        setTotal(backendTotal);
      }

      console.log(
        `✅ Cart loaded: ${normalizedItems.length} item(s)`
      );
    } catch (err) {
      console.error(
        '❌ Cart fetch error:',
        err?.response?.data ||
          err?.message ||
          err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load cart.'
      );
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      await syncCartFromDB();

      setLoading(false);
    };

    load();
  }, [syncCartFromDB]);

  useFocusEffect(
    useCallback(() => {
      syncCartFromDB();
    }, [syncCartFromDB])
  );

  // ============================================================
  // REFRESH
  // ============================================================

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await syncCartFromDB();

    setRefreshing(false);
  }, [syncCartFromDB]);

  // ============================================================
  // RESERVATION TIMER
  // ============================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryRefresh(
        (previous) => previous + 1
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ============================================================
  // CALCULATE TOTALS
  // ============================================================

  useEffect(() => {
    const calculatedSubtotal =
      items.reduce((sum, item) => {
        const price =
          Number(item.price) || 0;

        const quantity =
          Number(item.quantity) || 0;

        return (
          sum +
          price * quantity
        );
      }, 0);

    const calculatedTax =
      calculatedSubtotal * 0.1;

    const calculatedTotal =
      calculatedSubtotal +
      calculatedTax -
      (Number(discount) || 0);

    setSubtotal(calculatedSubtotal);
    setTax(calculatedTax);
    setTotal(
      Math.max(0, calculatedTotal)
    );
  }, [items, discount]);

  // ============================================================
  // RESERVATION STATUS
  // ============================================================

  const getReservationStatus = (
    expiresAt
  ) => {
    if (!expiresAt) {
      return null;
    }

    const expiry =
      new Date(expiresAt).getTime();

    if (!Number.isFinite(expiry)) {
      return null;
    }

    const remaining =
      expiry - Date.now();

    if (remaining <= 0) {
      return {
        isExpired: true,
        isExpiring: true,
        timeRemaining: 'Expired',
      };
    }

    const hours = Math.floor(
      remaining /
        (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (remaining %
        (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
      (remaining %
        (1000 * 60)) /
        1000
    );

    let timeRemaining = '';

    if (hours > 0) {
      timeRemaining =
        `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      timeRemaining =
        `${minutes}m ${seconds}s`;
    } else {
      timeRemaining =
        `${seconds}s`;
    }

    /*
     * 24 hour reservation.
     */

    const percentage =
      (remaining /
        (24 * 60 * 60 * 1000)) *
      100;

    return {
      isExpired: false,
      isExpiring: percentage < 15,
      timeRemaining,
    };
  };

  // Prevent unused warning while keeping timer active
  useEffect(() => {
    if (expiryRefresh < 0) {
      return;
    }
  }, [expiryRefresh]);

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const handleRemoveItem = async (
    productId,
    sellerId,
    itemId
  ) => {
    if (!productId) {
      return;
    }

    setUpdatingItemId(itemId);

    const previousItems =
      [...items];

    /*
     * Optimistic removal
     */

    setItems((current) =>
      current.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.sellerId === sellerId
          )
      )
    );

    try {
      const url =
        sellerId
          ? `/cart/${productId}?sellerId=${sellerId}`
          : `/cart/${productId}`;

      await apiClient.delete(url);

      console.log(
        '✅ Cart item removed'
      );
    } catch (err) {
      console.error(
        '❌ Remove cart item error:',
        err?.response?.data ||
          err?.message
      );

      setItems(previousItems);

      Alert.alert(
        'Error',
        err?.response?.data?.message ||
          'Failed to remove item.'
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const handleUpdateQuantity = async (
    productId,
    sellerId,
    newQuantity,
    currentQuantity,
    availableStock,
    itemId
  ) => {
    const quantity =
      Number(newQuantity);

    if (
      !Number.isFinite(quantity)
    ) {
      return;
    }

    if (quantity <= 0) {
      await handleRemoveItem(
        productId,
        sellerId,
        itemId
      );

      return;
    }

    /*
     * availableStock usually represents
     * stock that is available in addition
     * to the quantity already reserved.
     */

    if (
      availableStock !== undefined &&
      availableStock !== null
    ) {
      const maxQuantity =
        Number(currentQuantity || 0) +
        Number(availableStock || 0);

      if (quantity > maxQuantity) {
        Alert.alert(
          'Not enough stock',
          `You can add up to ${maxQuantity} in total.`
        );

        return;
      }
    }

    setUpdatingItemId(itemId);

    const previousItems =
      [...items];

    /*
     * Optimistic update.
     */

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (
          item.productId === productId &&
          item.sellerId === sellerId
        ) {
          return {
            ...item,
            quantity,
          };
        }

        return item;
      })
    );

    try {
      await apiClient.patch(
        '/cart',
        {
          productId,
          sellerId,
          quantity,
        }
      );

      console.log(
        '✅ Quantity updated'
      );
    } catch (err) {
      console.error(
        '❌ Quantity update error:',
        err?.response?.data ||
          err?.message
      );

      setItems(previousItems);

      Alert.alert(
        'Error',
        err?.response?.data?.message ||
          'Failed to update quantity.'
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ============================================================
  // CLEAR CART
  // ============================================================

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',

          onPress: async () => {
            try {
              setClearingCart(true);

              await apiClient.post(
                '/cart/clear'
              );

              setItems([]);

              setSubtotal(0);
              setTax(0);
              setDiscount(0);
              setTotal(0);

              console.log(
                '✅ Cart cleared'
              );
            } catch (err) {
              console.error(
                '❌ Clear cart error:',
                err?.response?.data ||
                  err?.message
              );

              Alert.alert(
                'Error',
                err?.response?.data?.message ||
                  'Failed to clear cart.'
              );
            } finally {
              setClearingCart(false);
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // STOCK VALIDATION
  // ============================================================

  const handleProceed = async () => {
    if (items.length === 0) {
      return;
    }

    try {
      setCheckingStock(true);
      setError(null);

      const cartItems =
        items.map((item) => ({
          productId:
            item.productId,

          sellerId:
            item.sellerId,

          quantity:
            Number(item.quantity),

          cartQuantity:
            Number(item.quantity),
        }));

      console.log(
        '📦 Validating cart:',
        cartItems
      );

      const response =
        await apiClient.post(
          '/inventory/validate-cart',
          {
            cartItems,
          }
        );

      console.log(
        '📦 Validation response:',
        response.data
      );

      const validation =
        response?.data?.data ||
        response?.data ||
        {};

      if (
        validation.isValid === false
      ) {
        const rawIssues =
          Array.isArray(
            validation.issues
          )
            ? validation.issues
            : [];

        const issues =
          rawIssues.map(
            (issue) => {
              const matchingItem =
                items.find(
                  (item) =>
                    item.productId ===
                    issue.productId &&
                    (
                      !issue.sellerId ||
                      item.sellerId ===
                        issue.sellerId
                    )
                );

              return {
                ...issue,

                productName:
                  matchingItem?.name ||
                  `Product ${issue.productId}`,

                sellerId:
                  matchingItem?.sellerId ||
                  issue.sellerId ||
                  '',
              };
            }
          );

        /*
         * Remove products that have zero stock.
         */

        const zeroStockItems =
          issues.filter(
            (issue) =>
              Number(
                issue.available
              ) === 0
          );

        for (
          const issue of zeroStockItems
        ) {
          const matchingItem =
            items.find(
              (item) =>
                item.productId ===
                  issue.productId &&
                (
                  !issue.sellerId ||
                  item.sellerId ===
                    issue.sellerId
                )
            );

          if (!matchingItem) {
            continue;
          }

          try {
            const url =
              matchingItem.sellerId
                ? `/cart/${matchingItem.productId}?sellerId=${matchingItem.sellerId}`
                : `/cart/${matchingItem.productId}`;

            await apiClient.delete(
              url
            );
          } catch (removeError) {
            console.error(
              '❌ Could not remove zero-stock item:',
              removeError?.response
                ?.data ||
                removeError?.message
            );
          }
        }

        if (
          zeroStockItems.length > 0
        ) {
          setItems(
            (currentItems) =>
              currentItems.filter(
                (item) =>
                  !zeroStockItems.some(
                    (issue) =>
                      issue.productId ===
                        item.productId &&
                      (
                        !issue.sellerId ||
                        issue.sellerId ===
                          item.sellerId
                      )
                  )
              )
          );
        }

        if (issues.length > 0) {
          setStockModal({
            issues,
          });
        }

        return;
      }

      console.log(
        '✅ Cart stock validation passed'
      );

      navigation.navigate(
        'Checkout'
      );
    } catch (err) {
      console.error(
        '❌ Stock validation error:',
        err?.response?.data ||
          err?.message
      );

      const message =
        err?.response?.data?.message ||
        'Unable to validate stock. Please try again.';

      setError(message);

      Alert.alert(
        'Stock validation failed',
        message
      );
    } finally {
      setCheckingStock(false);
    }
  };

  // ============================================================
  // STOCK MODAL
  // ============================================================

  const renderStockModal = () => {
    if (!stockModal) {
      return null;
    }

    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() =>
          setStockModal(null)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor:
                  theme.colors.card ||
                  theme.colors.background,
              },
            ]}
          >
            <View
              style={styles.modalHeader}
            >
              <View
                style={[
                  styles.warningIcon,
                  {
                    backgroundColor:
                      theme.colors.error +
                      '20',
                  },
                ]}
              >
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color={theme.colors.error}
                />
              </View>

              <View
                style={{ flex: 1 }}
              >
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        theme.colors
                          .text.primary,
                    },
                  ]}
                >
                  Stock issue detected
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color:
                        theme.colors
                          .text.secondary,
                    },
                  ]}
                >
                  Adjust your cart before
                  proceeding
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.issuesContainer,
                {
                  backgroundColor:
                    theme.colors
                      .background,
                },
              ]}
            >
              {stockModal.issues.map(
                (issue, index) => {
                  const zero =
                    Number(
                      issue.available
                    ) === 0;

                  return (
                    <View
                      key={`${issue.productId || 'issue'}-${issue.sellerId || 'seller'}-${index}`}
                    >
                      {index > 0 && (
                        <View
                          style={[
                            styles.issueDivider,
                            {
                              backgroundColor:
                                theme.colors
                                  .border,
                            },
                          ]}
                        />
                      )}

                      <View
                        style={
                          styles.issueRow
                        }
                      >
                        <Text
                          style={[
                            styles.issueProduct,
                            {
                              color:
                                theme.colors
                                  .text
                                  .primary,
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {
                            issue.productName
                          }
                        </Text>

                        <View
                          style={[
                            styles.issueBadge,
                            {
                              backgroundColor:
                                zero
                                  ? theme
                                      .colors
                                      .error +
                                    '20'
                                  : theme
                                      .colors
                                      .warning +
                                    '20',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.issueBadgeText,
                              {
                                color:
                                  zero
                                    ? theme
                                        .colors
                                        .error
                                    : theme
                                        .colors
                                        .warning,
                              },
                            ]}
                          >
                            {zero
                              ? 'Out of stock'
                              : `Only ${issue.available} available`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }
              )}
            </View>

            <Text
              style={[
                styles.modalInfo,
                {
                  color:
                    theme.colors.text
                      .secondary,
                },
              ]}
            >
              Items with 0 stock have been
              removed automatically.
            </Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                {
                  backgroundColor:
                    theme.colors
                      .primary.main,
                },
              ]}
              onPress={() =>
                setStockModal(null)
              }
            >
              <Text
                style={
                  styles.modalButtonText
                }
              >
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ============================================================
  // CART ITEM
  // ============================================================

  const renderCartItem = ({
    item,
  }) => {
    const isUpdating =
      updatingItemId === item.id;

    const reservation =
      item.reservation;

    const reservationStatus =
      reservation?.expiresAt
        ? getReservationStatus(
            reservation.expiresAt
          )
        : null;

    const isExpired =
      reservationStatus?.isExpired;

    const isExpiring =
      reservationStatus?.isExpiring;

    const itemTotal =
      (Number(item.price) || 0) *
      (Number(item.quantity) || 0);

    return (
      <View
        style={[
          styles.cartItem,
          {
            backgroundColor:
              isExpired
                ? '#450a0a'
                : isExpiring
                  ? '#451a03'
                  : theme.colors
                      .cardSecondary ||
                    theme.colors.card,

            borderColor:
              isExpired
                ? '#ef444460'
                : isExpiring
                  ? '#f59e0b60'
                  : theme.colors.border,
          },
        ]}
      >
        {/* ================================================= */}
        {/* TOP */}
        {/* ================================================= */}

        <View
          style={styles.itemHeader}
        >
          <View
            style={styles.itemInfo}
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

            <View>
              {item.vendor ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Ionicons
                    name="storefront-outline"
                    size={13}
                    color={theme.colors.text.secondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{ color: theme.colors.text.secondary, fontSize: 12 }}
                    numberOfLines={1}
                  >
                    {item.vendor}
                  </Text>
                </View>
              ) : null}

              <Text
                style={[
                  styles.itemDetails,
                  {
                    color:
                      theme.colors
                        .text.secondary,
                  },
                ]}
                numberOfLines={3}
              >
                {item.category
                  ? ` · ${item.category}`
                  : ''}

                {'\n'}

                Rs.{' '}
                {Number(
                  item.price
                ).toFixed(2)}

                {item.unit
                  ? ` / ${item.unit}`
                  : ''}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.itemRight
            }
          >
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
              {itemTotal.toFixed(
                2
              )}
            </Text>

            <TouchableOpacity
              onPress={() =>
                handleRemoveItem(
                  item.productId,
                  item.sellerId,
                  item.id
                )
              }
              disabled={isUpdating}
              style={
                styles.removeButton
              }
            >
              <Text
                style={[
                  styles.removeText,
                  {
                    color:
                      theme.colors
                        .error,
                  },
                ]}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={theme.colors.error}
                />
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================= */}
        {/* BOTTOM */}
        {/* ================================================= */}

        <View
          style={styles.itemBottom}
        >
          {/* Quantity */}

          {isUpdating ? (
            <View
              style={
                styles.quantityLoading
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  theme.colors
                    .primary.main
                }
              />
            </View>
          ) : (
            <View
              style={[
                styles.quantityContainer,
                {
                  backgroundColor:
                    theme.colors
                      .background,
                },
              ]}
            >
              <TouchableOpacity
                style={
                  styles.quantityButton
                }
                onPress={() =>
                  handleUpdateQuantity(
                    item.productId,
                    item.sellerId,
                    item.quantity - 1,
                    item.quantity,
                    item.availableStock,
                    item.id
                  )
                }
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    {
                      color:
                        theme.colors
                          .primary
                          .main,
                    },
                  ]}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={theme.colors.primary.main}
                  />
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.quantityValue,
                  {
                    color:
                      theme.colors
                        .text.primary,
                  },
                ]}
              >
                {item.quantity}
              </Text>

              <TouchableOpacity
                style={
                  styles.quantityButton
                }
                onPress={() =>
                  handleUpdateQuantity(
                    item.productId,
                    item.sellerId,
                    item.quantity + 1,
                    item.quantity,
                    item.availableStock,
                    item.id
                  )
                }
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    {
                      color:
                        theme.colors
                          .primary
                          .main,
                    },
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={theme.colors.primary.main}
                  />
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status */}

          <View
            style={
              styles.statusContainer
            }
          >
            {item.availableStock !==
              undefined &&
              item.availableStock !==
                null && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.availableStock <
                        5
                          ? '#f9731625'
                          : '#3b82f625',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.availableStock <
                          5
                            ? '#fb923c'
                            : '#60a5fa',
                      },
                    ]}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={12}
                      color={
                        item.availableStock <
                        5
                          ? '#fb923c'
                          : '#60a5fa'
                      }
                    />{' '}
                    {item.availableStock} left
                  </Text>
                </View>
              )}

            {reservationStatus && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      isExpired
                        ? '#ef444425'
                        : isExpiring
                          ? '#f59e0b25'
                          : '#10b98125',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        isExpired
                          ? '#f87171'
                          : isExpiring
                            ? '#fbbf24'
                            : '#34d399',
                    },
                  ]}
                >
                  {isExpired ? (
                    <>
                      <Ionicons
                        name="warning-outline"
                        size={12}
                        color="#f87171"
                      />{' '}
                      Expired
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="lock-closed-outline"
                        size={12}
                        color="#34d399"
                      />{' '}
                      {reservationStatus.timeRemaining}
                    </>
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // ============================================================
  // HEADER
  // ============================================================

  const renderHeader = () => (
    <View
      style={styles.header}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
        style={[
          styles.headerSide,
          { flexDirection: 'row', alignItems: 'center' },
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={18}
          color={theme.colors.primary.main}
          style={{ marginRight: 2 }}
        />
        <Text
          style={[
            styles.backButton,
            {
              color:
                theme.colors
                  .primary.main,
            },
          ]}
        >
          Back
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.title,
          {
            color:
              theme.colors
                .text.primary,
          },
        ]}
      >
        Your Cart
      </Text>

      <TouchableOpacity
        onPress={handleClearCart}
        disabled={clearingCart}
        style={
          styles.headerSideRight
        }
      >
        {clearingCart ? (
          <ActivityIndicator
            size="small"
            color={
              theme.colors.error
            }
          />
        ) : (
          <Text
            style={[
              styles.clearText,
              {
                color:
                  theme.colors
                    .error,
              },
            ]}
          >
            Clear
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // ============================================================
  // FOOTER
  // ============================================================

  const renderFooter = () => (
    <View
      style={styles.footer}
    >
      <Card
        style={styles.summary}
        elevation="lg"
      >
        {/* Subtotal */}

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
            {subtotal.toFixed(2)}
          </Text>
        </View>

        {/* Tax */}

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
            {tax.toFixed(2)}
          </Text>
        </View>

        {/* Discount */}

        {discount > 0 && (
          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    theme.colors
                      .success,
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
                      .success,
                },
              ]}
            >
              − Rs.{' '}
              {discount.toFixed(
                2
              )}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.colors
                  .border,
            },
          ]}
        />

        {/* Total */}

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
            Total
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
            {total.toFixed(2)}
          </Text>
        </View>

        {/* Checkout */}

        <Button
          title={
            checkingStock
              ? 'Checking stock...'
              : 'Proceed to Payment'
          }
          onPress={
            handleProceed
          }
          disabled={
            checkingStock ||
            items.length === 0
          }
          style={
            styles.checkoutButton
          }
        />

        {/* Clear */}

        <TouchableOpacity
          onPress={
            handleClearCart
          }
          disabled={
            clearingCart
          }
          style={[
            styles.clearCartButton,
            {
              borderColor:
                theme.colors
                  .border,
            },
          ]}
        >
          <Text
            style={[
              styles.clearCartText,
              {
                color:
                  theme.colors
                    .text.secondary,
              },
            ]}
          >
            Clear Cart
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Continue shopping */}

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            'BrowseTab'
          )
        }
        style={
          styles.continueShopping
        }
      >
        <Text
          style={[
            styles.continueShoppingText,
            {
              color:
                theme.colors
                  .text.secondary,
            },
          ]}
        >
          Continue shopping
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        {renderHeader()}

        <View
          style={styles.centered}
        >
          <ActivityIndicator
            size="large"
            color={
              theme.colors
                .primary.main
            }
          />

          <Text
            style={[
              styles.loadingText,
              {
                color:
                  theme.colors
                    .text.secondary,
              },
            ]}
          >
            Loading cart...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ERROR + EMPTY
  // ============================================================

  if (
    error &&
    items.length === 0
  ) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        {renderHeader()}

        <View
          style={styles.centered}
        >
          <View style={styles.errorIcon}>
            <Ionicons
              name="warning-outline"
              size={34}
              color={theme.colors.error}
            />
          </View>

          <Text
            style={[
              styles.errorText,
              {
                color:
                  theme.colors
                    .text.primary,
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
                  theme.colors
                    .primary.main,
              },
            ]}
            onPress={async () => {
              setLoading(true);

              await syncCartFromDB();

              setLoading(false);
            }}
          >
            <Text
              style={styles.retryText}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (items.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        {renderHeader()}

        <EmptyState
          icon={
            <View style={styles.emptyIcon}>
              <Ionicons
                name="cart-outline"
                size={48}
                color={theme.colors.text.secondary}
              />
            </View>
          }
          title="Your cart is empty"
          message="Browse products to add items."
          actionLabel="Browse Products"
          onAction={() =>
            navigation.navigate(
              'BrowseTab'
            )
          }
        />
      </SafeAreaView>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors
              .background,
        },
      ]}
    >
      {renderStockModal()}

      {renderHeader()}

      {/* Error banner */}

      {error && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor:
                theme.colors.error +
                '15',

              borderColor:
                theme.colors.error +
                '50',
            },
          ]}
        >
          <Text
            style={{
              color:
                theme.colors
                  .error,
              fontSize: 13,
            }}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Cart */}

      <FlatList
        data={items}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={
          renderCartItem
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              theme.colors
                .primary.main
            }
          />
        }
        ListHeaderComponent={
          <View>
            <Text
              style={[
                styles.itemCount,
                {
                  color:
                    theme.colors
                      .text
                      .secondary,
                },
              ]}
            >
              {items.length}{' '}
              {items.length === 1
                ? 'item'
                : 'items'}
            </Text>
          </View>
        }
        ListFooterComponent={
          renderFooter
        }
      />
    </SafeAreaView>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    centered: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 24,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
    },

    // ========================================================
    // HEADER
    // ========================================================

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 20,

      paddingTop: 12,

      paddingBottom: 14,
    },

    headerSide: {
      width: 70,
    },

    headerSideRight: {
      width: 70,

      alignItems:
        'flex-end',
    },

    backButton: {
      fontSize: 15,

      fontWeight:
        '600',
    },

    title: {
      fontSize: 20,

      fontWeight:
        '700',
    },

    clearText: {
      fontSize: 14,

      fontWeight:
        '600',
    },

    // ========================================================
    // ERROR
    // ========================================================

    errorBanner: {
      marginHorizontal: 20,

      marginBottom: 10,

      padding: 12,

      borderWidth: 1,

      borderRadius: 10,
    },

    errorIcon: {
      marginBottom: 12,
    },

    errorText: {
      fontSize: 14,

      textAlign:
        'center',

      marginBottom: 20,

      lineHeight: 20,
    },

    retryButton: {
      paddingHorizontal: 28,

      paddingVertical: 12,

      borderRadius: 10,
    },

    retryText: {
      color: '#fff',

      fontSize: 14,

      fontWeight:
        '700',
    },

    // ========================================================
    // LIST
    // ========================================================

    listContent: {
      paddingHorizontal: 20,

      paddingBottom: 30,
    },

    itemCount: {
      fontSize: 13,

      marginBottom: 10,
    },

    // ========================================================
    // CART ITEM
    // ========================================================

    cartItem: {
      borderWidth: 1,

      borderRadius: 14,

      padding: 14,

      marginBottom: 10,
    },

    itemHeader: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',
    },

    itemInfo: {
      flex: 1,

      paddingRight: 10,
    },

    itemName: {
      fontSize: 16,

      fontWeight:
        '600',

      marginBottom: 6,
    },

    itemDetails: {
      fontSize: 12,

      lineHeight: 18,
    },

    itemRight: {
      alignItems:
        'flex-end',

      minWidth: 70,
    },

    itemTotal: {
      fontSize: 14,

      fontWeight:
        '700',
    },

    removeButton: {
      marginTop: 10,

      padding: 4,
    },

    removeText: {
      fontSize: 17,

      fontWeight:
        '600',
    },

    // ========================================================
    // BOTTOM
    // ========================================================

    itemBottom: {
      marginTop: 14,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      gap: 10,
    },

    // ========================================================
    // QUANTITY
    // ========================================================

    quantityContainer: {
      flexDirection:
        'row',

      alignItems:
        'center',

      borderRadius: 9,

      paddingHorizontal: 4,
    },

    quantityButton: {
      width: 34,

      height: 34,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    quantityButtonText: {
      fontSize: 21,

      fontWeight:
        '600',
    },

    quantityValue: {
      minWidth: 35,

      textAlign:
        'center',

      fontSize: 14,

      fontWeight:
        '700',
    },

    quantityLoading: {
      width: 108,

      height: 36,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    // ========================================================
    // STATUS
    // ========================================================

    statusContainer: {
      flex: 1,

      flexDirection:
        'row',

      justifyContent:
        'flex-end',

      alignItems:
        'center',

      flexWrap:
        'wrap',

      gap: 5,
    },

    statusBadge: {
      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 6,
    },

    statusText: {
      fontSize: 10,

      fontWeight:
        '600',
    },

    // ========================================================
    // FOOTER
    // ========================================================

    footer: {
      marginTop: 4,
    },

    summary: {
      padding: 16,
    },

    summaryRow: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      marginBottom: 10,
    },

    summaryLabel: {
      fontSize: 14,
    },

    summaryValue: {
      fontSize: 14,

      fontWeight:
        '600',
    },

    divider: {
      height: 1,

      marginVertical: 7,
    },

    totalRow: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      marginTop: 4,
    },

    totalLabel: {
      fontSize: 18,

      fontWeight:
        '700',
    },

    totalValue: {
      fontSize: 21,

      fontWeight:
        '700',
    },

    checkoutButton: {
      marginTop: 16,
    },

    clearCartButton: {
      marginTop: 10,

      height: 44,

      borderWidth: 1,

      borderRadius: 10,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    clearCartText: {
      fontSize: 14,

      fontWeight:
        '600',
    },

    continueShopping: {
      alignItems:
        'center',

      paddingVertical: 18,
    },

    continueShoppingText: {
      fontSize: 12,
    },

    // ========================================================
    // EMPTY
    // ========================================================

    emptyIcon: {},

    // ========================================================
    // MODAL
    // ========================================================

    modalOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.75)',

      justifyContent:
        'center',

      alignItems:
        'center',

      padding: 20,
    },

    modalContainer: {
      width: '100%',

      maxWidth: 420,

      borderRadius: 18,

      padding: 20,
    },

    modalHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom: 16,
    },

    warningIcon: {
      width: 40,

      height: 40,

      borderRadius: 20,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight: 12,
    },

    modalTitle: {
      fontSize: 16,

      fontWeight:
        '700',
    },

    modalSubtitle: {
      fontSize: 12,

      marginTop: 3,
    },

    issuesContainer: {
      borderRadius: 12,

      padding: 12,

      marginBottom: 14,
    },

    issueRow: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      gap: 8,
    },

    issueProduct: {
      flex: 1,

      fontSize: 12,
    },

    issueBadge: {
      maxWidth: '60%',

      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 6,
    },

    issueBadgeText: {
      fontSize: 9,

      fontWeight:
        '600',
    },

    issueDivider: {
      height: 1,

      marginVertical: 10,
    },

    modalInfo: {
      fontSize: 11,

      lineHeight: 17,

      marginBottom: 16,
    },

    modalButton: {
      height: 44,

      borderRadius: 10,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    modalButtonText: {
      color: '#fff',

      fontSize: 14,

      fontWeight:
        '700',
    },
  });

export default CartScreen;