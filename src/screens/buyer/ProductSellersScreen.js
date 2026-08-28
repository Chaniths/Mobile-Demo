import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../api/client';

const ProductSellersScreen = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // ============================================================
  // HIDE TAB BAR
  // ============================================================

  useEffect(() => {
    const parent = navigation.getParent?.();

    if (parent?.setOptions) {
      parent.setOptions({
        tabBarStyle: {
          display: 'none',
        },
      });
    }

    return () => {
      if (parent?.setOptions) {
        parent.setOptions({
          tabBarStyle: {
            display: 'flex',
          },
        });
      }
    };
  }, [navigation]);

  // ============================================================
  // PRODUCT ID
  // ============================================================

  const productId = route?.params?.productId;

  console.log(
    'ProductSellersScreen productId:',
    productId
  );

  // ============================================================
  // STATE
  // ============================================================

  const [product, setProduct] = useState(null);
  const [sellers, setSellers] = useState([]);

  const [selectedSellerId, setSelectedSellerId] =
    useState(null);

  const [quantity, setQuantity] = useState(1);

  const [requirements, setRequirements] =
    useState('');

  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [error, setError] = useState(null);

  // ============================================================
  // IMAGE
  // ============================================================

  const getImageForProduct = (item) => {
    if (item?.imageUrl) {
      return item.imageUrl;
    }

    switch (item?.category) {
      case 'Fruits':
        return 'https://images.unsplash.com/photo-1576179635662-9d1983e97f5d?auto=format&fit=crop&w=600&q=80';

      case 'Vegetables':
        return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

      case 'Dairy':
        return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80';

      case 'Bakery':
        return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';

      default:
        return 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80';
    }
  };

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = useCallback(async () => {
    if (!productId) {
      console.error(
        'Product ID is missing'
      );

      setError(
        'Product ID is missing. Please go back and select a product again.'
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        'Loading product:',
        productId
      );

      // --------------------------------------------------------
      // PRODUCT + SELLERS
      // --------------------------------------------------------

      const [
        productRes,
        sellersRes,
      ] = await Promise.all([
        api.get(`/products/${productId}`),

        api.get(
          `/products/${productId}/sellers`
        ),
      ]);

      console.log(
        'Product response:',
        productRes.data
      );

      console.log(
        'Sellers response:',
        sellersRes.data
      );

      // --------------------------------------------------------
      // PRODUCT
      // --------------------------------------------------------

      const productData =
        productRes.data;

      setProduct({
        id: productData.id,

        name:
          productData.name ||
          'Unnamed Product',

        category:
          productData.category ||
          'General',

        price:
          Number(productData.price) || 0,

        unit:
          productData.unit ||
          'unit',

        stock:
          Number(productData.stock) || 0,

        availableStock:
          Number(
            productData.availableStock
          ) || 0,

        imageUrl:
          productData.imageUrl,

        description:
          productData.description ||
          '',
      });

      // --------------------------------------------------------
      // SELLERS
      // --------------------------------------------------------

      const sellerData =
        Array.isArray(sellersRes.data)
          ? sellersRes.data
          : Array.isArray(
              sellersRes.data?.sellers
            )
          ? sellersRes.data.sellers
          : Array.isArray(
              sellersRes.data?.data
            )
          ? sellersRes.data.data
          : [];

      const formattedSellers =
        sellerData.map((item) => ({
          id: item.id,

          sellerId:
            item.seller?.id ||
            item.sellerId ||
            item.userId,

          sellerName:
            item.seller?.businessName ||
            item.seller?.user?.name ||
            item.businessName ||
            item.sellerName ||
            'Unknown Seller',

          sellerProductName:
            item.name ||
            item.productName ||
            item.sellerProductName ||
            productData.name,

          price:
            Number(item.price) || 0,

          stock:
            Number(
              item.stock ??
                item.stockQuantity ??
                item.availableStock ??
                0
            ),

          rating:
            Number(item.rating) || 4.5,

          deliveriesPerWeek:
            Number(
              item.deliveriesPerWeek
            ) || 5,

          etaLabel:
            item.etaLabel ||
            item.estimatedDelivery ||
            '',
        }));

      console.log(
        'Formatted sellers:',
        formattedSellers
      );

      setSellers(
        formattedSellers
      );

      // --------------------------------------------------------
      // CART
      // --------------------------------------------------------

      let currentCartItems = [];

      try {
        const cartRes =
          await api.get('/cart');

        const cartData =
          cartRes.data;

        if (Array.isArray(cartData)) {
          currentCartItems =
            cartData;
        } else if (
          Array.isArray(
            cartData?.items
          )
        ) {
          currentCartItems =
            cartData.items;
        } else if (
          Array.isArray(
            cartData?.cartItems
          )
        ) {
          currentCartItems =
            cartData.cartItems;
        }
      } catch (cartError) {
        console.log(
          'Cart could not be loaded:',
          cartError?.response?.data ||
            cartError?.message
        );
      }

      setCartItems(
        currentCartItems
      );

      console.log(
        'Product and sellers loaded'
      );
    } catch (err) {
      console.error(
        'Error fetching product/sellers:',
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load product or sellers.'
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================================
  // SELECTED SELLER
  // ============================================================

  const selectedSeller = useMemo(() => {
    return (
      sellers.find(
        (seller) =>
          String(seller.sellerId) ===
          String(selectedSellerId)
      ) || null
    );
  }, [
    sellers,
    selectedSellerId,
  ]);

  // ============================================================
  // CART QUANTITY FOR SELLER
  // ============================================================

  const getQuantityInCart =
    useCallback(
      (sellerId) => {
        return cartItems
          .filter((item) => {
            const itemProductId =
              item.productId ||
              item.product?.id ||
              item.id;

            const itemSellerId =
              item.sellerId ||
              item.seller?.id;

            return (
              String(itemProductId) ===
                String(productId) &&
              String(itemSellerId) ===
                String(sellerId)
            );
          })
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.quantity || 0
              ),
            0
          );
      },
      [cartItems, productId]
    );

  // ============================================================
  // REMAINING STOCK
  // ============================================================

  const getRemainingStockForSeller =
    useCallback(
      (
        sellerId,
        totalSellerStock
      ) => {
        const quantityInCart =
          getQuantityInCart(
            sellerId
          );

        return Math.max(
          0,
          Number(
            totalSellerStock || 0
          ) - quantityInCart
        );
      },
      [getQuantityInCart]
    );

  // ============================================================
  // SELECT SELLER
  // ============================================================

  const handleSelectSeller = (
    seller
  ) => {
    const remainingStock =
      getRemainingStockForSeller(
        seller.sellerId,
        seller.stock
      );

    if (remainingStock <= 0) {
      Alert.alert(
        'Out of stock',
        `${seller.sellerName} does not have this product available.`
      );

      return;
    }

    setSelectedSellerId(
      seller.sellerId
    );

    setQuantity(1);

    setError(null);
  };

  // ============================================================
  // QUANTITY
  // ============================================================

  const handleQuantityChange = (
    delta
  ) => {
    if (!selectedSeller) {
      return;
    }

    const remainingStock =
      getRemainingStockForSeller(
        selectedSeller.sellerId,
        selectedSeller.stock
      );

    setQuantity((previous) => {
      const current =
        Number(previous) || 1;

      const next =
        current + delta;

      if (next < 1) {
        return 1;
      }

      if (
        next >
        remainingStock
      ) {
        return remainingStock;
      }

      return next;
    });

    setError(null);
  };

  // ============================================================
  // QUANTITY INPUT
  // ============================================================

  const handleQuantityInput = (
    text
  ) => {
    if (!selectedSeller) {
      return;
    }

    if (text === '') {
      setQuantity('');
      return;
    }

    const value =
      Number(text);

    if (
      Number.isNaN(value)
    ) {
      return;
    }

    const remainingStock =
      getRemainingStockForSeller(
        selectedSeller.sellerId,
        selectedSeller.stock
      );

    if (
      value >
      remainingStock
    ) {
      setQuantity(
        remainingStock
      );

      setError(
        `Only ${remainingStock} ${
          product?.unit || ''
        } available from ${
          selectedSeller.sellerName
        }`
      );

      return;
    }

    if (value < 1) {
      setQuantity(1);
      setError(null);
      return;
    }

    setQuantity(value);
    setError(null);
  };

  // ============================================================
  // ADD TO CART
  // ============================================================

  const handleAddToCart =
    async () => {
      if (
        !selectedSeller ||
        !product
      ) {
        Alert.alert(
          'Select a seller',
          'Please select a seller before adding the product to your cart.'
        );

        return;
      }

      const safeQuantity =
        Number.isFinite(
          Number(quantity)
        ) &&
        Number(quantity) > 0
          ? Number(quantity)
          : 1;

      const remainingStock =
        getRemainingStockForSeller(
          selectedSeller.sellerId,
          selectedSeller.stock
        );

      if (
        safeQuantity >
        remainingStock
      ) {
        const message =
          `Only ${remainingStock} ${
            product.unit
          } available from ${
            selectedSeller.sellerName
          }`;

        setError(message);

        Alert.alert(
          'Not enough stock',
          message
        );

        return;
      }

      try {
        setAddingToCart(true);
        setError(null);

        console.log(
          'Adding to cart:',
          {
            productId:
              product.id,
            quantity:
              safeQuantity,
            sellerId:
              selectedSeller.sellerId,
          }
        );

        await api.post(
          '/cart/add',
          {
            productId:
              product.id,

            quantity:
              safeQuantity,

            sellerId:
              selectedSeller.sellerId,
          }
        );

        Alert.alert(
          'Added to cart',
          `${product.name} was added to your cart.`,
          [
            {
              text: 'Continue Shopping',
              onPress: () =>
                navigation.goBack(),
            },

            {
              text: 'View Cart',
              onPress: () =>
                navigation
                  .getParent()
                  ?.navigate(
                    'CartTab'
                  ),
            },
          ]
        );
      } catch (err) {
        console.error(
          'Add to cart error:',
          err?.response?.data ||
            err
        );

        const message =
          err?.response?.data
            ?.message ||
          'Failed to add item to cart. Please try again.';

        setError(message);

        Alert.alert(
          'Could not add to cart',
          message
        );
      } finally {
        setAddingToCart(false);
      }
    };

  // ============================================================
  // MISSING PRODUCT ID
  // ============================================================

  if (!productId) {
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
        <Header
          theme={theme}
          navigation={navigation}
        />

        <View style={styles.centered}>
          <Ionicons
            name="warning-outline"
            size={46}
            color="#f59e0b"
            style={styles.statusIcon}
          />

          <Text
            style={[
              styles.errorTitle,
              {
                color:
                  theme.colors.text
                    .primary,
              },
            ]}
          >
            Product ID missing
          </Text>

          <Text
            style={[
              styles.errorMessage,
              {
                color:
                  theme.colors.text
                    .secondary,
              },
            ]}
          >
            Please go back and select a
            product again.
          </Text>

          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor:
                  theme.colors.primary
                    .main,
              },
            ]}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={styles.retryText}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              theme.colors.background,
          },
        ]}
      >
        <Header
          theme={theme}
          navigation={navigation}
        />

        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={
              theme.colors.primary
                .main
            }
          />

          <Text
            style={[
              styles.loadingText,
              {
                color:
                  theme.colors.text
                    .secondary,
              },
            ]}
          >
            Fetching product and
            sellers...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    error &&
    !product
  ) {
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
        <Header
          theme={theme}
          navigation={navigation}
        />

        <View style={styles.centered}>
          <Ionicons
            name="warning-outline"
            size={46}
            color="#f59e0b"
            style={styles.statusIcon}
          />

          <Text
            style={[
              styles.errorTitle,
              {
                color:
                  theme.colors.text
                    .primary,
              },
            ]}
          >
            Product not found
          </Text>

          <Text
            style={[
              styles.errorMessage,
              {
                color:
                  theme.colors.text
                    .secondary,
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
                  theme.colors.primary
                    .main,
              },
            ]}
            onPress={fetchData}
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
  // NO SELLERS
  // ============================================================

  if (
    sellers.length === 0
  ) {
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
        <Header
          theme={theme}
          navigation={navigation}
        />

        <View style={styles.centered}>
          <Ionicons
            name="storefront-outline"
            size={52}
            color={
              theme.colors.primary
                .main
            }
            style={styles.statusIcon}
          />

          <Text
            style={[
              styles.errorTitle,
              {
                color:
                  theme.colors.text
                    .primary,
              },
            ]}
          >
            No sellers available
          </Text>

          <Text
            style={[
              styles.errorMessage,
              {
                color:
                  theme.colors.text
                    .secondary,
              },
            ]}
          >
            Sorry, there are no sellers
            currently offering this
            product.
          </Text>

          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor:
                  theme.colors.primary
                    .main,
              },
            ]}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={styles.retryText}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const productImage =
    getImageForProduct(
      product
    );

  const selectedRemainingStock =
    selectedSeller
      ? getRemainingStockForSeller(
          selectedSeller.sellerId,
          selectedSeller.stock
        )
      : 0;

  const estimatedTotal =
    selectedSeller
      ? Number(
          selectedSeller.price ||
            0
        ) *
        Number(quantity || 0)
      : 0;

  // ============================================================
  // MAIN UI
  // ============================================================

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
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.headerSide}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={
              theme.colors.primary
                .main
            }
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color:
                theme.colors.text
                  .primary,
            },
          ]}
        >
          Select Seller
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation
              .getParent()
              ?.navigate('CartTab')
          }
          style={
            styles.headerSideRight
          }
        >
          <Ionicons
            name="cart-outline"
            size={25}
            color={
              theme.colors.text
                .primary
            }
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                selectedSeller
                  ? 190
                  : 40,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* PRODUCT SUMMARY */}

          <Card
            style={
              styles.productSummaryCard
            }
          >
            <Image
              source={{
                uri: productImage,
              }}
              style={
                styles.productImage
              }
              resizeMode="cover"
            />

            <View
              style={
                styles.productSummaryInfo
              }
            >
              <Text
                style={[
                  styles.productTypeLabel,
                  {
                    color:
                      theme.colors.text
                        .tertiary,
                  },
                ]}
              >
                PRODUCT
              </Text>

              <Text
                style={[
                  styles.productName,
                  {
                    color:
                      theme.colors.text
                        .primary,
                  },
                ]}
                numberOfLines={2}
              >
                {product.name}
              </Text>

              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      theme.colors.text
                        .secondary,
                  },
                ]}
              >
                Category:{' '}
                <Text
                  style={
                    styles.categoryStrong
                  }
                >
                  {product.category ||
                    'General'}
                </Text>
              </Text>

              {product.description ? (
                <Text
                  style={[
                    styles.description,
                    {
                      color:
                        theme.colors.text
                          .secondary,
                    },
                  ]}
                  numberOfLines={3}
                >
                  {product.description}
                </Text>
              ) : null}
            </View>
          </Card>

          {/* HOW IT WORKS */}

          <View
            style={[
              styles.howItWorks,
              {
                backgroundColor:
                  theme.colors.primary
                    .main + '12',

                borderColor:
                  theme.colors.primary
                    .main + '50',
              },
            ]}
          >
            <View
              style={
                styles.howTitleRow
              }
            >
              <Ionicons
                name="cart-outline"
                size={18}
                color={
                  theme.colors.primary
                    .main
                }
              />

              <Text
                style={[
                  styles.howTitle,
                  {
                    color:
                      theme.colors.text
                        .primary,
                  },
                ]}
              >
                How this works
              </Text>
            </View>

            <Text
              style={[
                styles.howText,
                {
                  color:
                    theme.colors.text
                      .secondary,
                },
              ]}
            >
              1. Pick your preferred seller
            </Text>

            <Text
              style={[
                styles.howText,
                {
                  color:
                    theme.colors.text
                      .secondary,
                },
              ]}
            >
              2. Set quantity and requirements
            </Text>

            <Text
              style={[
                styles.howText,
                {
                  color:
                    theme.colors.text
                      .secondary,
                },
              ]}
            >
              3. Add the product to your cart
            </Text>
          </View>

          {/* SELLERS */}

          <View
            style={
              styles.sectionHeader
            }
          >
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
              Available Sellers
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color:
                    theme.colors.text
                      .secondary,
                },
              ]}
            >
              {sellers.length} seller
              {sellers.length !== 1
                ? 's'
                : ''}{' '}
              available
            </Text>
          </View>

          <View
            style={
              styles.sellerList
            }
          >
            {sellers.map(
              (seller) => {
                const remainingStock =
                  getRemainingStockForSeller(
                    seller.sellerId,
                    seller.stock
                  );

                const inYourCart =
                  getQuantityInCart(
                    seller.sellerId
                  );

                const isSelected =
                  String(
                    selectedSellerId
                  ) ===
                  String(
                    seller.sellerId
                  );

                const outOfStock =
                  remainingStock <= 0;

                return (
                  <TouchableOpacity
                    key={String(
                      seller.id
                    )}
                    activeOpacity={0.8}
                    disabled={
                      outOfStock
                    }
                    onPress={() =>
                      handleSelectSeller(
                        seller
                      )
                    }
                  >
                    <Card
                      style={[
                        styles.sellerCard,

                        isSelected && {
                          borderWidth: 2,

                          borderColor:
                            theme.colors
                              .primary
                              .main,

                          backgroundColor:
                            theme.colors
                              .primary
                              .main +
                            '12',
                        },

                        outOfStock &&
                          styles.sellerDisabled,
                      ]}
                    >
                      {/* TOP */}

                      <View
                        style={
                          styles.sellerTopRow
                        }
                      >
                        <View
                          style={
                            styles.sellerInfo
                          }
                        >
                          <View
                            style={
                              styles.sellerNameRow
                            }
                          >
                            <Text
                              style={[
                                styles.sellerName,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text
                                      .primary,
                                },
                              ]}
                              numberOfLines={
                                1
                              }
                            >
                              {
                                seller.sellerName
                              }
                            </Text>

                            {isSelected && (
                              <View
                                style={[
                                  styles.selectedBadge,
                                  {
                                    backgroundColor:
                                      theme
                                        .colors
                                        .primary
                                        .main,
                                  },
                                ]}
                              >
                                <Ionicons
                                  name="checkmark"
                                  size={12}
                                  color="#fff"
                                />

                                <Text
                                  style={
                                    styles.selectedBadgeText
                                  }
                                >
                                  Selected
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text
                            style={[
                              styles.listedAs,
                              {
                                color:
                                  theme
                                    .colors
                                    .text
                                    .secondary,
                              },
                            ]}
                            numberOfLines={
                              1
                            }
                          >
                            Listed as:{' '}
                            <Text
                              style={
                                styles.listedAsStrong
                              }
                            >
                              {
                                seller.sellerProductName
                              }
                            </Text>
                          </Text>
                        </View>

                        {/* PRICE */}

                        <View
                          style={
                            styles.priceContainer
                          }
                        >
                          <Text
                            style={[
                              styles.sellerPrice,
                              {
                                color:
                                  theme
                                    .colors
                                    .primary
                                    .main,
                              },
                            ]}
                          >
                            Rs.{' '}
                            {Number(
                              seller.price
                            ).toFixed(
                              2
                            )}
                          </Text>

                          <Text
                            style={[
                              styles.priceUnit,
                              {
                                color:
                                  theme
                                    .colors
                                    .text
                                    .secondary,
                              },
                            ]}
                          >
                            /{' '}
                            {product.unit}
                          </Text>
                        </View>
                      </View>

                      {/* META */}

                      <View
                        style={
                          styles.sellerMetaRow
                        }
                      >
                        <View
                          style={
                            styles.metaItem
                          }
                        >
                          <Ionicons
                            name="star"
                            size={13}
                            color="#f59e0b"
                          />

                          {/* <Text
                            style={[
                              styles.ratingText,
                              {
                                color:
                                  theme
                                    .colors
                                    .text
                                    .secondary,
                              },
                            ]}
                          >
                            {Number(
                              seller.rating
                            ).toFixed(
                              1
                            )}
                          </Text> */}
                        </View>

                        <View
                          style={
                            styles.metaItem
                          }
                        >
                          <Ionicons
                            name="car-outline"
                            size={14}
                            color={
                              theme
                                .colors
                                .text
                                .secondary
                            }
                          />

                          <Text
                            style={[
                              styles.deliveryText,
                              {
                                color:
                                  theme
                                    .colors
                                    .text
                                    .secondary,
                              },
                            ]}
                          >
                            {
                              seller.deliveriesPerWeek
                            }{' '}
                            deliveries/week
                          </Text>
                        </View>
                      </View>

                      {/* STOCK */}

                      <View
                        style={
                          styles.stockArea
                        }
                      >
                        {outOfStock ? (
                          <View
                            style={
                              styles.statusRow
                            }
                          >
                            <Ionicons
                              name="close-circle-outline"
                              size={15}
                              color="#ef4444"
                            />

                            <Text
                              style={
                                styles.outOfStock
                              }
                            >
                              Out of stock
                            </Text>
                          </View>
                        ) : remainingStock <=
                          5 ? (
                          <View
                            style={
                              styles.statusRow
                            }
                          >
                            <Ionicons
                              name="warning-outline"
                              size={15}
                              color="#f59e0b"
                            />

                            <Text
                              style={
                                styles.lowStock
                              }
                            >
                              Low stock:{' '}
                              {
                                remainingStock
                              }{' '}
                              {
                                product.unit
                              }{' '}
                              left
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={
                              styles.statusRow
                            }
                          >
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={15}
                              color="#22c55e"
                            />

                            <Text
                              style={
                                styles.availableStock
                              }
                            >
                              {
                                remainingStock
                              }{' '}
                              {
                                product.unit
                              }{' '}
                              available
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* CART INFO */}

                      {inYourCart >
                        0 && (
                        <View
                          style={
                            styles.cartInfo
                          }
                        >
                          <View
                            style={
                              styles.cartInfoRow
                            }
                          >
                            <Ionicons
                              name="cube-outline"
                              size={15}
                              color="#f59e0b"
                            />

                            <Text
                              style={
                                styles.cartInfoText
                              }
                            >
                              {
                                inYourCart
                              }{' '}
                              {
                                product.unit
                              }{' '}
                              already in
                              your cart
                              from this
                              seller
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* ETA */}

                      {seller.etaLabel ? (
                        <View
                          style={
                            styles.etaRow
                          }
                        >
                          <Ionicons
                            name="car-outline"
                            size={14}
                            color={
                              theme
                                .colors
                                .primary
                                .main
                            }
                          />

                          <Text
                            style={[
                              styles.etaText,
                              {
                                color:
                                  theme
                                    .colors
                                    .primary
                                    .main,
                              },
                            ]}
                          >
                            {
                              seller.etaLabel
                            }
                          </Text>
                        </View>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {/* REQUIREMENTS */}

          <View
            style={[
              styles.requirementsCard,
              {
                borderColor:
                  theme.colors.primary
                    .main + '55',

                backgroundColor:
                  theme.colors.primary
                    .main + '08',
              },
            ]}
          >
            <Text
              style={[
                styles.requirementsTitle,
                {
                  color:
                    theme.colors.text
                      .primary,
                },
              ]}
            >
              Your Requirements
            </Text>

            {!selectedSeller ? (
              <View
                style={[
                  styles.selectPrompt,
                  {
                    backgroundColor:
                      theme.colors.card,

                    borderColor:
                      theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-up-outline"
                  size={28}
                  color={
                    theme.colors.primary
                      .main
                  }
                  style={
                    styles.selectPromptIcon
                  }
                />

                <Text
                  style={[
                    styles.selectPromptText,
                    {
                      color:
                        theme.colors.text
                          .secondary,
                    },
                  ]}
                >
                  Select a seller above to
                  set quantity and add
                  this product to your
                  cart.
                </Text>
              </View>
            ) : (
              <View
                style={
                  styles.requirementsContent
                }
              >
                {/* SELECTED SELLER */}

                <View
                  style={[
                    styles.selectedSellerBox,
                    {
                      backgroundColor:
                        theme.colors
                          .primary
                          .main +
                        '12',

                      borderColor:
                        theme.colors
                          .primary
                          .main +
                        '45',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectedSellerLabel,
                      {
                        color:
                          theme.colors
                            .text
                            .secondary,
                      },
                    ]}
                  >
                    Selected seller
                  </Text>

                  <Text
                    style={[
                      styles.selectedSellerName,
                      {
                        color:
                          theme.colors
                            .text
                            .primary,
                      },
                    ]}
                  >
                    {
                      selectedSeller.sellerName
                    }
                  </Text>

                  <Text
                    style={[
                      styles.selectedSellerProduct,
                      {
                        color:
                          theme.colors
                            .text
                            .secondary,
                      },
                    ]}
                  >
                    Listed as:{' '}
                    {
                      selectedSeller.sellerProductName
                    }
                  </Text>

                  <View
                    style={
                      styles.selectedSellerPriceRow
                    }
                  >
                    <Ionicons
                      name="star"
                      size={13}
                      color="#f59e0b"
                    />

                    <Text
                      style={[
                        styles.selectedSellerPrice,
                        {
                          color:
                            theme.colors
                              .primary
                              .main,
                        },
                      ]}
                    >
                      {Number(
                        selectedSeller.rating
                      ).toFixed(
                        1
                      )}{' '}
                      • Rs.{' '}
                      {Number(
                        selectedSeller.price
                      ).toFixed(
                        2
                      )}{' '}
                      /{' '}
                      {product.unit}
                    </Text>
                  </View>
                </View>

                {/* QUANTITY */}

                <View
                  style={
                    styles.inputSection
                  }
                >
                  <View
                    style={
                      styles.quantityLabelRow
                    }
                  >
                    <Text
                      style={[
                        styles.inputLabel,
                        {
                          color:
                            theme.colors
                              .text
                              .primary,
                        },
                      ]}
                    >
                      Quantity (
                      {product.unit})
                    </Text>

                    <Text
                      style={[
                        styles.maxStockText,
                        {
                          color:
                            theme.colors
                              .primary
                              .main,
                        },
                      ]}
                    >
                      Max:{' '}
                      {
                        selectedRemainingStock
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.quantityControl
                    }
                  >
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        {
                          backgroundColor:
                            theme.colors
                              .card,

                          borderColor:
                            theme.colors
                              .border,
                        },
                      ]}
                      onPress={() =>
                        handleQuantityChange(
                          -1
                        )
                      }
                      disabled={
                        Number(
                          quantity
                        ) <= 1
                      }
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={
                          theme.colors
                            .text
                            .primary
                        }
                      />
                    </TouchableOpacity>

                    <TextInput
                      value={String(
                        quantity
                      )}
                      onChangeText={
                        handleQuantityInput
                      }
                      keyboardType="numeric"
                      style={[
                        styles.quantityInput,
                        {
                          color:
                            theme.colors
                              .text
                              .primary,

                          backgroundColor:
                            theme.colors
                              .card,

                          borderColor:
                            theme.colors
                              .border,
                        },
                      ]}
                    />

                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        {
                          backgroundColor:
                            theme.colors
                              .primary
                              .main,
                        },
                      ]}
                      onPress={() =>
                        handleQuantityChange(
                          1
                        )
                      }
                      disabled={
                        Number(
                          quantity
                        ) >=
                        selectedRemainingStock
                      }
                    >
                      <Ionicons
                        name="add"
                        size={21}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ERROR */}

                {error && (
                  <View
                    style={
                      styles.errorBox
                    }
                  >
                    <View
                      style={
                        styles.errorRow
                      }
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={17}
                        color="#ef4444"
                      />

                      <Text
                        style={
                          styles.errorBoxText
                        }
                      >
                        {error}
                      </Text>
                    </View>
                  </View>
                )}

                {/* REQUIREMENTS */}

                <View
                  style={
                    styles.inputSection
                  }
                >
                  <Text
                    style={[
                      styles.inputLabel,
                      {
                        color:
                          theme.colors
                            .text
                            .primary,
                      },
                    ]}
                  >
                    Special Instructions{' '}
                    <Text
                      style={{
                        color:
                          theme.colors
                            .text
                            .tertiary,

                        fontWeight:
                          '400',
                      }}
                    >
                      (optional)
                    </Text>
                  </Text>

                  <TextInput
                    value={
                      requirements
                    }
                    onChangeText={
                      setRequirements
                    }
                    placeholder="E.g. medium-sized fruits, nicely packed..."
                    placeholderTextColor={
                      theme.colors.text
                        .tertiary
                    }
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={[
                      styles.requirementsInput,
                      {
                        color:
                          theme.colors
                            .text
                            .primary,

                        backgroundColor:
                          theme.colors
                            .card,

                        borderColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  />
                </View>

                {/* TOTAL */}

                <View
                  style={[
                    styles.totalBox,
                    {
                      backgroundColor:
                        theme.colors
                          .card,
                    },
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        styles.totalLabel,
                        {
                          color:
                            theme.colors
                              .text
                              .secondary,
                        },
                      ]}
                    >
                      Estimated total
                    </Text>

                    <Text
                      style={[
                        styles.totalCalculation,
                        {
                          color:
                            theme.colors
                              .text
                              .tertiary,
                        },
                      ]}
                    >
                      {quantity} × Rs.{' '}
                      {Number(
                        selectedSeller.price
                      ).toFixed(
                        2
                      )}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.totalAmount,
                      {
                        color:
                          theme.colors
                            .primary
                            .main,
                      },
                    ]}
                  >
                    Rs.{' '}
                    {estimatedTotal.toFixed(
                      2
                    )}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM BAR */}

      {selectedSeller && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor:
                theme.colors.background,

              borderTopColor:
                theme.colors.border,

              bottom:
                (insets.bottom || 0) +
                64,

              paddingBottom:
                (insets.bottom || 0) +
                (Platform.OS === 'ios'
                  ? 10
                  : 8),
            },
          ]}
        >
          <View
            style={
              styles.bottomSummary
            }
          >
            <View
              style={{ flex: 1 }}
            >
              <Text
                style={[
                  styles.bottomSellerLabel,
                  {
                    color:
                      theme.colors.text
                        .secondary,
                  },
                ]}
                numberOfLines={1}
              >
                {
                  selectedSeller.sellerName
                }
              </Text>

              <Text
                style={[
                  styles.bottomTotal,
                  {
                    color:
                      theme.colors.primary
                        .main,
                  },
                ]}
              >
                Rs.{' '}
                {estimatedTotal.toFixed(
                  2
                )}
              </Text>
            </View>

            <View
              style={
                styles.bottomQuantity
              }
            >
              <Text
                style={[
                  styles.bottomQuantityLabel,
                  {
                    color:
                      theme.colors.text
                        .secondary,
                  },
                ]}
              >
                Qty
              </Text>

              <Text
                style={[
                  styles.bottomQuantityValue,
                  {
                    color:
                      theme.colors.text
                        .primary,
                  },
                ]}
              >
                {quantity}
              </Text>
            </View>
          </View>

          <Button
            title={
              addingToCart
                ? 'Adding...'
                : 'Add to Cart'
            }
            onPress={
              handleAddToCart
            }
            disabled={
              addingToCart ||
              !selectedSeller ||
              selectedRemainingStock <=
                0 ||
              Number(quantity) <=
                0 ||
              !!error
            }
            style={
              styles.addToCartButton
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

// ============================================================
// HEADER COMPONENT
// ============================================================

const Header = ({
  theme,
  navigation,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
        style={styles.headerSide}
      >
        <Ionicons
          name="arrow-back"
          size={23}
          color={
            theme.colors.primary
              .main
          }
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.headerTitle,
          {
            color:
              theme.colors.text
                .primary,
          },
        ]}
      >
        Select Seller
      </Text>

      <View
        style={{
          width: 70,
        }}
      />
    </View>
  );
};

// ============================================================
// STYLES
// ============================================================

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

  statusIcon: {
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },

  headerSide: {
    width: 70,
  },

  headerSideRight: {
    width: 70,
    alignItems: 'flex-end',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  productSummaryCard: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 12,
  },

  productImage: {
    width: 100,
    height: 100,
    borderRadius: 14,
    marginRight: 14,
  },

  productSummaryInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  productTypeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },

  productName: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 5,
  },

  categoryText: {
    fontSize: 12,
  },

  categoryStrong: {
    fontWeight: '600',
  },

  description: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },

  howItWorks: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginBottom: 20,
  },

  howTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  howTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 7,
  },

  howText: {
    fontSize: 11,
    marginBottom: 3,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  sectionSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  sellerList: {
    marginBottom: 20,
  },

  sellerCard: {
    padding: 14,
    marginBottom: 10,
  },

  sellerDisabled: {
    opacity: 0.55,
  },

  sellerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  sellerInfo: {
    flex: 1,
    paddingRight: 8,
  },

  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 7,
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },

  selectedBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },

  listedAs: {
    fontSize: 10,
    marginTop: 4,
  },

  listedAsStrong: {
    fontWeight: '600',
  },

  priceContainer: {
    alignItems: 'flex-end',
  },

  sellerPrice: {
    fontSize: 16,
    fontWeight: '700',
  },

  priceUnit: {
    fontSize: 10,
    marginTop: 1,
  },

  sellerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },

  deliveryText: {
    fontSize: 10,
    marginLeft: 4,
  },

  stockArea: {
    marginTop: 9,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  availableStock: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  lowStock: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  outOfStock: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  cartInfo: {
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor:
      'rgba(245, 158, 11, 0.10)',
  },

  cartInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cartInfoText: {
    color: '#f59e0b',
    fontSize: 10,
    marginLeft: 5,
    flex: 1,
  },

  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  etaText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 5,
  },

  requirementsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },

  requirementsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  selectPrompt: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 20,
    alignItems: 'center',
  },

  selectPromptIcon: {
    marginBottom: 8,
  },

  selectPromptText: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },

  requirementsContent: {
    gap: 12,
  },

  selectedSellerBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },

  selectedSellerLabel: {
    fontSize: 10,
    marginBottom: 3,
  },

  selectedSellerName: {
    fontSize: 15,
    fontWeight: '700',
  },

  selectedSellerProduct: {
    fontSize: 10,
    marginTop: 3,
  },

  selectedSellerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  selectedSellerPrice: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },

  inputSection: {
    marginTop: 2,
  },

  quantityLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  maxStockText: {
    fontSize: 10,
    fontWeight: '600',
  },

  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityInput: {
    width: 65,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 8,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },

  errorBox: {
    backgroundColor:
      'rgba(239, 68, 68, 0.10)',
    borderColor:
      'rgba(239, 68, 68, 0.30)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorBoxText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },

  requirementsInput: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginTop: 3,
  },

  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  totalCalculation: {
    fontSize: 10,
    marginTop: 2,
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === 'ios' ? 20 : 12,
    borderTopWidth: 1,
  },

  bottomSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  bottomSellerLabel: {
    fontSize: 10,
  },

  bottomTotal: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },

  bottomQuantity: {
    alignItems: 'flex-end',
    marginLeft: 15,
  },

  bottomQuantityLabel: {
    fontSize: 9,
  },

  bottomQuantityValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  addToCartButton: {
    width: '100%',
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 7,
  },

  errorMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  retryButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProductSellersScreen;