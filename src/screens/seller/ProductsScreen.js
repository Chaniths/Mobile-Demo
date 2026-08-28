import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import api from '../../api/client';

const ProductsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // GET PRODUCT ID
  // ============================================================

  const getProductId = (product) => {
    return (
      product?.id ||
      product?.productId ||
      product?.product?.id ||
      product?.sellerProduct?.id ||
      null
    );
  };

  // ============================================================
  // GET PRODUCT NAME
  // ============================================================

  const getProductName = (product) => {
    return (
      product?.name ||
      product?.productName ||
      product?.title ||
      product?.product?.name ||
      'Unnamed product'
    );
  };

  // ============================================================
  // GET PRODUCT PRICE
  // ============================================================

  const getProductPrice = (product) => {
    const price =
      product?.sellerPrice ??
      product?.price ??
      product?.sellingPrice ??
      product?.unitPrice ??
      product?.productPrice ??
      product?.sellerProduct?.sellerPrice ??
      product?.sellerProduct?.price ??
      product?.product?.sellerPrice ??
      product?.product?.price;

    if (
      price === null ||
      price === undefined ||
      price === ''
    ) {
      return 'Price unavailable';
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return 'Price unavailable';
    }

    return `Rs. ${numericPrice.toLocaleString()}`;
  };

  // ============================================================
  // GET STOCK
  // ============================================================

  const getProductStock = (product) => {
    const stock =
      product?.sellerStock ??
      product?.stockQuantity ??
      product?.stock_quantity ??
      product?.stock ??
      product?.quantity ??
      product?.availableStock ??
      product?.sellerProduct?.sellerStock ??
      product?.sellerProduct?.stockQuantity ??
      product?.sellerProduct?.stock_quantity ??
      product?.sellerProduct?.stock ??
      product?.product?.sellerStock ??
      product?.product?.stockQuantity ??
      product?.product?.stock_quantity ??
      product?.product?.stock;

    if (
      stock === null ||
      stock === undefined ||
      stock === ''
    ) {
      return 0;
    }

    const numericStock = Number(stock);

    if (Number.isNaN(numericStock)) {
      return 0;
    }

    return numericStock;
  };

  // ============================================================
  // GET LOW STOCK THRESHOLD
  // ============================================================

  const getLowStockThreshold = (product) => {
    const threshold =
      product?.lowStockThreshold ??
      product?.low_stock_threshold ??
      product?.sellerProduct?.lowStockThreshold ??
      product?.sellerProduct?.low_stock_threshold ??
      10;

    const numericThreshold = Number(threshold);

    if (Number.isNaN(numericThreshold)) {
      return 10;
    }

    return numericThreshold;
  };

  // ============================================================
  // GET IMAGE
  // ============================================================

  const getProductImage = (product) => {
    return (
      product?.imageUrl ||
      product?.image ||
      product?.images?.[0]?.url ||
      product?.images?.[0] ||
      product?.sellerProduct?.imageUrl ||
      product?.product?.imageUrl ||
      product?.product?.image ||
      null
    );
  };

  // ============================================================
  // FETCH SELLER PRODUCTS
  // ============================================================

  const fetchProducts = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError(null);

        console.log(
          '🔵 Fetching seller products from:',
          `${api.defaults.baseURL}/products/seller/my-products`
        );

        const response = await api.get(
          '/products/seller/my-products'
        );

        console.log(
          '✅ Seller products response:',
          JSON.stringify(
            response.data,
            null,
            2
          )
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
        } else if (
          Array.isArray(response.data?.data?.products)
        ) {
          productData =
            response.data.data.products;
        }

        console.log(
          '🟢 Parsed seller products:',
          JSON.stringify(
            productData,
            null,
            2
          )
        );

        setProducts(productData);
      } catch (err) {
        console.log(
          '❌ Seller products error:',
          JSON.stringify(
            err?.response?.data ||
              err?.message,
            null,
            2
          )
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Failed to load products.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ============================================================
  // REFRESH WHEN SCREEN GETS FOCUS
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      fetchProducts(true);
    }, [fetchProducts])
  );

  // ============================================================
  // PULL TO REFRESH
  // ============================================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(false);
  }, [fetchProducts]);

  // ============================================================
  // EDIT PRODUCT
  // ============================================================

  const handleEdit = (product) => {
    const productId = getProductId(product);

    console.log(
      '✏️ Edit product:',
      productId
    );

    if (!productId) {
      console.log(
        '❌ Product object has no ID:',
        JSON.stringify(
          product,
          null,
          2
        )
      );

      return;
    }

    navigation.navigate(
      'EditProduct',
      {
        productId: String(productId),
        product: product,
      }
    );
  };

  // ============================================================
  // PRODUCT CARD
  // ============================================================

  const renderProduct = ({ item }) => {
    const name = getProductName(item);
    const price = getProductPrice(item);
    const stock = getProductStock(item);
    const lowStockThreshold =
      getLowStockThreshold(item);
    const image = getProductImage(item);

    // ========================================================
    // STOCK STATUS
    // ========================================================

    let stockStatus;
    let stockColor;
    let stockIcon;

    if (stock === 0) {
      stockStatus = 'Out of stock';
      stockColor = '#ef4444';
      stockIcon = 'close-circle';
    } else if (stock <= lowStockThreshold) {
      stockStatus = 'Low stock';
      stockColor = '#f59e0b';
      stockIcon = 'warning';
    } else {
      stockStatus = 'Healthy';
      stockColor = '#22c55e';
      stockIcon = 'checkmark-circle';
    }

    return (
      <View
        style={[
          styles.productCard,
          {
            backgroundColor:
              theme.colors.card,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        {/* ====================================================
            PRODUCT IMAGE
        ==================================================== */}

        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.productImage,
              styles.imagePlaceholder,
              {
                backgroundColor:
                  theme.colors.background,
              },
            ]}
          >
            <Ionicons
              name="leaf-outline"
              size={32}
              color={theme.colors.primary.main}
            />
          </View>
        )}

        {/* ====================================================
            PRODUCT INFORMATION
        ==================================================== */}

        <View style={styles.productInfo}>

          {/* PRODUCT NAME */}

          <Text
            style={[
              styles.productName,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
            numberOfLines={2}
          >
            {name}
          </Text>

          {/* PRICE */}

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="pricetag-outline"
                size={12}
                color={theme.colors.text.secondary}
              />

              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Price
              </Text>
            </View>

            <Text
              style={[
                styles.priceText,
                {
                  color:
                    theme.colors.primary.main,
                },
              ]}
            >
              {price}
            </Text>
          </View>

          {/* STOCK */}

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="cube-outline"
                size={12}
                color={theme.colors.text.secondary}
              />

              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Stock
              </Text>
            </View>

            <Text
              style={[
                styles.stockText,
                {
                  color: stockColor,
                },
              ]}
            >
              {stock} units
            </Text>
          </View>

          {/* STOCK STATUS */}

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  `${stockColor}20`,
              },
            ]}
          >
            <Ionicons
              name={stockIcon}
              size={11}
              color={stockColor}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: stockColor,
                },
              ]}
            >
              {stockStatus}
            </Text>
          </View>
        </View>

        {/* ====================================================
            EDIT BUTTON
        ==================================================== */}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor:
                  theme.colors.primary.main,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => handleEdit(item)}
          >
            <Ionicons
              name="create-outline"
              size={15}
              color="#fff"
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.loadingIconContainer,
            {
              backgroundColor:
                `${theme.colors.primary.main}15`,
            },
          ]}
        >
          <Ionicons
            name="cube-outline"
            size={32}
            color={theme.colors.primary.main}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={theme.colors.primary.main}
          style={{ marginTop: 18 }}
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
          Loading your products...
        </Text>
      </View>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.errorIconContainer,
            {
              backgroundColor:
                'rgba(239,68,68,0.12)',
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#ef4444"
          />
        </View>

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
            styles.errorText,
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
            fetchProducts(true);
          }}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color="#fff"
          />

          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================================
  // MAIN SCREEN
  // ============================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerTitleRow}>
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor:
                    `${theme.colors.primary.main}15`,
                },
              ]}
            >
              <Ionicons
                name="storefront-outline"
                size={20}
                color={theme.colors.primary.main}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.eyebrow,
                  {
                    color:
                      theme.colors.primary.main,
                  },
                ]}
              >
                SELLER
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
                My Products
              </Text>
            </View>
          </View>

          <View style={styles.productCountRow}>
            <Ionicons
              name="cube-outline"
              size={13}
              color={theme.colors.text.secondary}
            />

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              {products.length} product
              {products.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* ADD PRODUCT */}

        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor:
                theme.colors.primary.main,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('AddProduct')
          }
        >
          <Ionicons
            name="add"
            size={19}
            color="#fff"
          />

          <Text style={styles.addButtonText}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================
          PRODUCT LIST
      ====================================================== */}

      <FlatList
        data={products}
        keyExtractor={(item, index) =>
          String(
            getProductId(item) ?? index
          )
        }
        renderItem={renderProduct}
        contentContainerStyle={
          products.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={
              theme.colors.primary.main
            }
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>

            {/* EMPTY ICON */}

            <View
              style={[
                styles.emptyIconContainer,
                {
                  backgroundColor:
                    `${theme.colors.primary.main}15`,
                },
              ]}
            >
              <Ionicons
                name="bag-handle-outline"
                size={48}
                color={
                  theme.colors.primary.main
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              No products yet
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              Add your first product to
              start selling.
            </Text>

            <TouchableOpacity
              style={[
                styles.emptyButton,
                {
                  backgroundColor:
                    theme.colors.primary.main,
                },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(
                  'AddProduct'
                )
              }
            >
              <Ionicons
                name="add-circle-outline"
                size={17}
                color="#fff"
              />

              <Text
                style={styles.emptyButtonText}
              >
                Add Product
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ============================================================
  // CENTER
  // ============================================================

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },

  // ============================================================
  // ERROR
  // ============================================================

  errorIconContainer: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },

  errorText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 11,
  },

  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  // ============================================================
  // HEADER
  // ============================================================

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
  },

  productCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    marginLeft: 53,
    gap: 5,
  },

  subtitle: {
    fontSize: 12,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 11,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  // ============================================================
  // LIST
  // ============================================================

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  // ============================================================
  // PRODUCT CARD
  // ============================================================

  productCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  productImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    marginRight: 12,
  },

  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============================================================
  // PRODUCT INFO
  // ============================================================

  productInfo: {
    flex: 1,
    minWidth: 0,
  },

  productName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 9,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  infoLabelContainer: {
    width: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  infoLabel: {
    fontSize: 10,
  },

  priceText: {
    fontSize: 12,
    fontWeight: '800',
  },

  stockText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // ============================================================
  // STOCK STATUS
  // ============================================================

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },

  statusText: {
    fontSize: 8.5,
    fontWeight: '800',
  },

  // ============================================================
  // ACTIONS
  // ============================================================

  actions: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },

  editButton: {
    minWidth: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 9,
  },

  editButtonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  // ============================================================
  // EMPTY
  // ============================================================

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    width: 94,
    height: 94,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProductsScreen;