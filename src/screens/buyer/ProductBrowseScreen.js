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
  TextInput,
  RefreshControl,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import api from '../../api/client';

// ============================================================
// CONSTANTS
// ============================================================

const SORT_OPTIONS = [
  {
    key: 'recommended',
    label: 'Recommended',
  },
  {
    key: 'price-low-high',
    label: 'Price: Low to High',
  },
  {
    key: 'price-high-low',
    label: 'Price: High to Low',
  },
  {
    key: 'rating',
    label: 'Rating',
  },
];

// ============================================================
// SCREEN
// ============================================================

const ProductBrowseScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------

  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState('recommended');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [filterModalVisible, setFilterModalVisible] =
    useState(false);

  const [availabilityFilter, setAvailabilityFilter] =
    useState('all');

  const [priceFilter, setPriceFilter] = useState('all');

  // ------------------------------------------------------------
  // CATEGORIES
  // ------------------------------------------------------------

  const categories = [
    'All',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Bakery',
    'Grains',
  ];

  // ------------------------------------------------------------
  // IMAGE
  // ------------------------------------------------------------

  const getImageForProduct = (product) => {
    if (product?.imageUrl) {
      return product.imageUrl;
    }

    const category = String(
      product?.category || ''
    ).toLowerCase();

    switch (category) {
      case 'fruits':
        return 'https://images.unsplash.com/photo-1576179635662-9d1983e97f5d?auto=format&fit=crop&w=600&q=80';

      case 'vegetables':
        return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';

      case 'dairy':
        return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80';

      case 'bakery':
        return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';

      case 'grains':
        return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';

      default:
        return 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80';
    }
  };

  // ------------------------------------------------------------
  // LOAD PRODUCTS
  // ------------------------------------------------------------

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);

      console.log('📦 Fetching products...');

      const response = await api.get('/products');

      console.log(
        '📦 Products API response:',
        response.data
      );

      let productData = [];

      if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (
        Array.isArray(response.data?.products)
      ) {
        productData = response.data.products;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        productData = response.data.data;
      }

      setProducts(productData);

      console.log(
        `✅ ${productData.length} products loaded`
      );
    } catch (err) {
      console.error(
        '❌ Error loading products:',
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load products. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ------------------------------------------------------------
  // INITIAL LOAD
  // ------------------------------------------------------------

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ------------------------------------------------------------
  // REFRESH
  // ------------------------------------------------------------

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // ------------------------------------------------------------
  // ACTIVE FILTER COUNT
  // ------------------------------------------------------------

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (selectedCategory !== 'All') {
      count++;
    }

    if (availabilityFilter !== 'all') {
      count++;
    }

    if (priceFilter !== 'all') {
      count++;
    }

    return count;
  }, [
    selectedCategory,
    availabilityFilter,
    priceFilter,
  ]);

  // ------------------------------------------------------------
  // FILTER PRODUCTS
  // ------------------------------------------------------------

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = String(
        product?.name || ''
      ).toLowerCase();

      const category = String(
        product?.category || ''
      ).toLowerCase();

      const search = searchText
        .trim()
        .toLowerCase();

      // SEARCH

      const matchesSearch =
        search === '' ||
        name.includes(search) ||
        category.includes(search);

      if (!matchesSearch) {
        return false;
      }

      // CATEGORY

      const matchesCategory =
        selectedCategory === 'All' ||
        category === selectedCategory.toLowerCase();

      if (!matchesCategory) {
        return false;
      }

      // STOCK

      const stock = Number(
        product?.stock ??
          product?.availableStock ??
          0
      );

      // AVAILABILITY

      if (
        availabilityFilter === 'in-stock' &&
        stock <= 0
      ) {
        return false;
      }

      if (
        availabilityFilter === 'out-of-stock' &&
        stock > 0
      ) {
        return false;
      }

      // PRICE FILTER
      // Price is still used for filtering,
      // but it is NOT displayed on the product card.

      const price = Number(
        product?.price ??
          product?.pricePerUnit ??
          0
      );

      if (
        priceFilter === 'under-500' &&
        price >= 500
      ) {
        return false;
      }

      if (
        priceFilter === '500-1000' &&
        (price < 500 || price > 1000)
      ) {
        return false;
      }

      if (
        priceFilter === 'over-1000' &&
        price <= 1000
      ) {
        return false;
      }

      return true;
    });
  }, [
    products,
    searchText,
    selectedCategory,
    availabilityFilter,
    priceFilter,
  ]);

  // ------------------------------------------------------------
  // SORT PRODUCTS
  // ------------------------------------------------------------

  const visibleProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-low-high':
        return sorted.sort((a, b) => {
          const priceA = Number(
            a?.price ??
              a?.pricePerUnit ??
              0
          );

          const priceB = Number(
            b?.price ??
              b?.pricePerUnit ??
              0
          );

          return priceA - priceB;
        });

      case 'price-high-low':
        return sorted.sort((a, b) => {
          const priceA = Number(
            a?.price ??
              a?.pricePerUnit ??
              0
          );

          const priceB = Number(
            b?.price ??
              b?.pricePerUnit ??
              0
          );

          return priceB - priceA;
        });

      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = Number(
            a?.rating ?? 0
          );

          const ratingB = Number(
            b?.rating ?? 0
          );

          return ratingB - ratingA;
        });

      case 'recommended':
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // ------------------------------------------------------------
  // SORT LABEL
  // ------------------------------------------------------------

  const selectedSortLabel =
    SORT_OPTIONS.find(
      (option) => option.key === sortBy
    )?.label || 'Recommended';

  // ------------------------------------------------------------
  // SORT SELECT
  // ------------------------------------------------------------

  const handleSortSelect = (sortKey) => {
    setSortBy(sortKey);
    setSortModalVisible(false);
  };

  // ------------------------------------------------------------
  // RESET FILTERS
  // ------------------------------------------------------------

  const resetFilters = () => {
    setSelectedCategory('All');
    setAvailabilityFilter('all');
    setPriceFilter('all');
  };

  // ------------------------------------------------------------
  // BROWSE SELLERS
  // ------------------------------------------------------------

  const handleBrowseSellers = (product) => {
    if (!product?.id) {
      console.error(
        'Cannot open sellers: product ID is missing',
        product
      );

      return;
    }

    console.log(
      'Opening sellers for product:',
      product.id,
      product.name
    );

    navigation.navigate('ProductSellers', {
      productId: product.id,
    });
  };

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
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Browse Products
          </Text>
        </View>

        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={
              theme.colors.primary.main
            }
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
            Loading products...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && products.length === 0) {
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
              styles.headerTitle,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Browse Products
          </Text>
        </View>

        <View style={styles.centered}>
          <Ionicons
            name="warning-outline"
            size={48}
            color="#ef4444"
            style={styles.errorIcon}
          />

          <Text
            style={[
              styles.errorTitle,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Unable to load products
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
              fetchProducts();
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
        <View>
          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Browse Products
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            Find products from different sellers
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CartTab')
          }
          style={styles.iconButton}
        >
          <Ionicons
            name="cart-outline"
            size={25}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={
              theme.colors.primary.main
            }
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* SEARCH */}

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor:
                theme.colors.card,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={theme.colors.text.tertiary}
            style={styles.searchIcon}
          />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search products..."
            placeholderTextColor={
              theme.colors.text.tertiary
            }
            style={[
              styles.searchInput,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearchText('')
              }
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={
                  theme.colors.text.tertiary
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORY BUTTONS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={
            styles.categoryContent
          }
        >
          {categories.map((category) => {
            const selected =
              selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                onPress={() =>
                  setSelectedCategory(category)
                }
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selected
                      ? theme.colors.primary.main
                      : theme.colors.card,

                    borderColor: selected
                      ? theme.colors.primary.main
                      : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selected
                        ? '#fff'
                        : theme.colors.text.primary,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FILTER + SORT ROW */}

        <View style={styles.filterSortRow}>
          {/* FILTER */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setFilterModalVisible(true)
            }
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  theme.colors.card,
                borderColor:
                  activeFilterCount > 0
                    ? theme.colors.primary.main
                    : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={theme.colors.text.primary}
              style={styles.filterIcon}
            />

            <Text
              style={[
                styles.filterButtonText,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Filters
            </Text>

            {activeFilterCount > 0 && (
              <View
                style={[
                  styles.filterBadge,
                  {
                    backgroundColor:
                      theme.colors.primary.main,
                  },
                ]}
              >
                <Text
                  style={styles.filterBadgeText}
                >
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* SORT */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setSortModalVisible(true)
            }
            style={[
              styles.sortButton,
              {
                backgroundColor:
                  theme.colors.card,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={17}
              color={theme.colors.text.primary}
              style={styles.sortIcon}
            />

            <Text
              style={[
                styles.sortButtonText,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
              numberOfLines={1}
            >
              Sort: {selectedSortLabel}
            </Text>

            <Ionicons
              name="chevron-down"
              size={12}
              color={
                theme.colors.text.tertiary
              }
            />
          </TouchableOpacity>
        </View>

        {/* RESULT COUNT */}

        <View style={styles.resultHeader}>
          <Text
            style={[
              styles.resultTitle,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Products
          </Text>

          <Text
            style={[
              styles.resultCount,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            {visibleProducts.length} found
          </Text>
        </View>

        {/* PRODUCTS */}

        {visibleProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={theme.colors.text.tertiary}
              style={styles.emptyIcon}
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              No products found
            </Text>

            <Text
              style={[
                styles.emptyMessage,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              Try changing your search or filters.
            </Text>

            <TouchableOpacity
              style={[
                styles.resetEmptyButton,
                {
                  backgroundColor:
                    theme.colors.primary.main,
                },
              ]}
              onPress={() => {
                setSearchText('');
                resetFilters();
              }}
            >
              <Text
                style={
                  styles.resetEmptyButtonText
                }
              >
                Clear Filters
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productList}>
            {visibleProducts.map((product) => {
              const image =
                getImageForProduct(product);

              const stock = Number(
                product?.stock ??
                  product?.availableStock ??
                  0
              );

              const rating = Number(
                product?.rating ?? 0
              );

              return (
                <Card
                  key={String(product.id)}
                  style={styles.productCard}
                >
                  {/* IMAGE */}

                  <Image
                    source={{ uri: image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />

                  {/* PRODUCT INFO */}

                  <View
                    style={styles.productInfo}
                  >
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color:
                            theme.colors.primary
                              .main,
                        },
                      ]}
                    >
                      {product.category ||
                        'General'}
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
                      {product.name ||
                        'Unnamed Product'}
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
                        numberOfLines={2}
                      >
                        {product.description}
                      </Text>
                    ) : null}

                    {/* RATING */}

                    {rating > 0 && (
                      <View
                        style={
                          styles.ratingRow
                        }
                      >
                        <Ionicons
                          name="star"
                          size={13}
                          color="#f59e0b"
                          style={
                            styles.ratingStars
                          }
                        />

                        <Text
                          style={[
                            styles.ratingText,
                            {
                              color:
                                theme.colors
                                  .text
                                  .secondary,
                            },
                          ]}
                        >
                          {rating.toFixed(1)}
                        </Text>
                      </View>
                    )}

                    {/* STOCK */}

                    <View
                      style={styles.stockRow}
                    >
                      <Ionicons
                        name={
                          stock > 0
                            ? 'checkmark-circle'
                            : 'close-circle'
                        }
                        size={13}
                        color={
                          stock > 0
                            ? '#22c55e'
                            : '#ef4444'
                        }
                      />

                      <Text
                        style={[
                          styles.stock,
                          {
                            color:
                              stock > 0
                                ? '#22c55e'
                                : '#ef4444',
                          },
                        ]}
                      >
                        {stock > 0
                          ? `${stock} ${
                              product.unit ||
                              'units'
                            } available`
                          : 'Out of stock'}
                      </Text>
                    </View>

                    {/* BUTTON */}

                    <TouchableOpacity
                      style={[
                        styles.sellerButton,
                        {
                          backgroundColor:
                            stock > 0
                              ? theme.colors
                                  .primary
                                  .main
                              : theme.colors
                                  .border,
                        },
                      ]}
                      disabled={stock <= 0}
                      onPress={() =>
                        handleBrowseSellers(
                          product
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.sellerButtonText,
                          {
                            color:
                              stock > 0
                                ? '#fff'
                                : theme.colors
                                    .text
                                    .tertiary,
                          },
                        ]}
                      >
                        {stock > 0
                          ? 'Browse Sellers'
                          : 'Out of Stock'}
                      </Text>

                      {stock > 0 && (
                        <Ionicons
                          name="arrow-forward"
                          size={15}
                          color="#fff"
                          style={
                            styles.buttonIcon
                          }
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ====================================================== */}
      {/* FILTER MODAL */}
      {/* ====================================================== */}

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setFilterModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.filterModal,
              {
                backgroundColor:
                  theme.colors.card,
              },
            ]}
          >
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Filters
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setFilterModalVisible(false)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    theme.colors.text.tertiary
                  }
                />
              </TouchableOpacity>
            </View>

            {/* CATEGORY */}

            <Text
              style={[
                styles.filterSectionTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.filterOptionScroll
              }
            >
              {categories.map((category) => {
                const selected =
                  selectedCategory === category;

                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor:
                          selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .background,
                        borderColor:
                          selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        {
                          color: selected
                            ? '#fff'
                            : theme.colors
                                .text.primary,
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* AVAILABILITY */}

            <Text
              style={[
                styles.filterSectionTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Availability
            </Text>

            <View
              style={styles.filterOptionsGrid}
            >
              {[
                {
                  key: 'all',
                  label: 'All',
                },
                {
                  key: 'in-stock',
                  label: 'In Stock',
                },
                {
                  key: 'out-of-stock',
                  label: 'Out of Stock',
                },
              ].map((option) => {
                const selected =
                  availabilityFilter ===
                  option.key;

                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      setAvailabilityFilter(
                        option.key
                      )
                    }
                    style={[
                      styles.largeFilterOption,
                      {
                        backgroundColor:
                          selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .background,
                        borderColor:
                          selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.largeFilterText,
                        {
                          color: selected
                            ? '#fff'
                            : theme.colors
                                .text.primary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* PRICE FILTER */}

            <Text
              style={[
                styles.filterSectionTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Price Range
            </Text>

            <View
              style={styles.filterOptionsGrid}
            >
              {[
                {
                  key: 'all',
                  label: 'Any Price',
                },
                {
                  key: 'under-500',
                  label: 'Under Rs. 500',
                },
                {
                  key: '500-1000',
                  label: 'Rs. 500 - 1000',
                },
                {
                  key: 'over-1000',
                  label: 'Over Rs. 1000',
                },
              ].map((option) => {
                const selected =
                  priceFilter === option.key;

                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      setPriceFilter(
                        option.key
                      )
                    }
                    style={[
                      styles.largeFilterOption,
                      {
                        backgroundColor:
                          selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .background,
                        borderColor:
                          selected
                            ? theme.colors
                                .primary.main
                            : theme.colors
                                .border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.largeFilterText,
                        {
                          color: selected
                            ? '#fff'
                            : theme.colors
                                .text.primary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ACTION BUTTONS */}

            <View
              style={styles.filterActions}
            >
              <TouchableOpacity
                onPress={resetFilters}
                style={[
                  styles.resetButton,
                  {
                    borderColor:
                      theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resetButtonText,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setFilterModalVisible(false)
                }
                style={[
                  styles.applyButton,
                  {
                    backgroundColor:
                      theme.colors.primary.main,
                  },
                ]}
              >
                <Text
                  style={styles.applyButtonText}
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================================== */}
      {/* SORT MODAL */}
      {/* ====================================================== */}

      <Modal
        visible={sortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setSortModalVisible(false)
        }
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() =>
            setSortModalVisible(false)
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={[
              styles.sortModal,
              {
                backgroundColor:
                  theme.colors.card,
              },
            ]}
          >
            {/* HEADER */}

            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Sort Products
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setSortModalVisible(false)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    theme.colors.text.tertiary
                  }
                />
              </TouchableOpacity>
            </View>

            {/* OPTIONS */}

            {SORT_OPTIONS.map((option) => {
              const selected =
                sortBy === option.key;

              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleSortSelect(
                      option.key
                    )
                  }
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor:
                        selected
                          ? `${theme.colors.primary.main}15`
                          : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      {
                        color: selected
                          ? theme.colors
                              .primary.main
                          : theme.colors
                              .text.primary,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={21}
                      color={
                        theme.colors.primary
                          .main
                      }
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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

  // ==========================================================
  // LOADING
  // ==========================================================

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

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
  },

  headerSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  iconButton: {
    padding: 4,
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  // ==========================================================
  // CATEGORY
  // ==========================================================

  categoryScroll: {
    marginBottom: 12,
  },

  categoryContent: {
    paddingRight: 8,
  },

  categoryButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  filterButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  filterIcon: {
    marginRight: 6,
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },

  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 5,
  },

  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  sortButton: {
    flex: 1.55,
    minHeight: 42,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  sortIcon: {
    marginRight: 6,
  },

  sortButtonText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
  },

  // ==========================================================
  // RESULT
  // ==========================================================

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  resultCount: {
    fontSize: 11,
  },

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  productList: {
    gap: 12,
  },

  productCard: {
    flexDirection: 'row',
    padding: 12,
  },

  productImage: {
    width: 115,
    height: 145,
    borderRadius: 12,
    marginRight: 12,
  },

  productInfo: {
    flex: 1,
  },

  categoryLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  description: {
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 5,
  },

  // ==========================================================
  // RATING
  // ==========================================================

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  ratingStars: {
    marginRight: 4,
  },

  ratingText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ==========================================================
  // STOCK
  // ==========================================================

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 8,
  },

  stock: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },

  // ==========================================================
  // SELLER BUTTON
  // ==========================================================

  sellerButton: {
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  sellerButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },

  buttonIcon: {
    marginLeft: 6,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 18,
  },

  resetEmptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9,
  },

  resetEmptyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorIcon: {
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
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

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  // ==========================================================
  // FILTER MODAL
  // ==========================================================

  filterModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
  },

  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },

  filterOptionScroll: {
    paddingBottom: 5,
  },

  filterOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },

  filterOptionText: {
    fontSize: 11,
    fontWeight: '600',
  },

  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  largeFilterOption: {
    minWidth: '47%',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  largeFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },

  filterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },

  resetButton: {
    flex: 1,
    minHeight: 45,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  applyButton: {
    flex: 2,
    minHeight: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // ==========================================================
  // SORT MODAL
  // ==========================================================

  sortModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  sortOption: {
    minHeight: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 5,
  },

  sortOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductBrowseScreen;