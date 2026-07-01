import React, { useEffect, useState, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

// ── Helpers ────────────────────────────────────────────────────────────────────

const getStockStatus = (stock) => {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 10) return 'low_stock';
  return 'active';
};

// ── Component ──────────────────────────────────────────────────────────────────

const ProductsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Products fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refresh list when coming back from AddProduct or EditProduct
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });
    return unsubscribe;
  }, [navigation, fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const getStatusColor = (stock) => {
    const status = getStockStatus(stock);
    switch (status) {
      case 'active':       return theme.colors.success;
      case 'low_stock':    return theme.colors.warning;
      case 'out_of_stock': return theme.colors.error;
      default:             return theme.colors.text.tertiary;
    }
  };

  const getStatusLabel = (stock) => {
    const status = getStockStatus(stock);
    switch (status) {
      case 'active':       return 'Active';
      case 'low_stock':    return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default:             return status;
    }
  };

  // ── Render item ───────────────────────────────────────────────────────────────

  const renderProduct = ({ item }) => (
    <Card
      style={styles.productCard}
      onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
    >
      <View style={styles.productContent}>
        {/* Thumbnail */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder, { backgroundColor: theme.colors.primary.light }]}>
            <Text style={styles.productEmoji}>🛒</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.productCategory, { color: theme.colors.text.tertiary }]}>
            {item.category}
          </Text>
          <Text style={[styles.productPrice, { color: theme.colors.primary.main }]}>
            Rs. {item.price.toFixed(2)} / {item.unit}
          </Text>
          <View style={styles.productMeta}>
            <Text style={[styles.stockText, { color: theme.colors.text.secondary }]}>
              Stock: {item.stock}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.stock)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.stock) }]}>
                {getStatusLabel(item.stock)}
              </Text>
            </View>
            {/* Approval badge */}
            {item.status === 'PENDING_APPROVAL' && (
              <View style={[styles.statusBadge, { backgroundColor: '#f59e0b20', marginLeft: 4 }]}>
                <Text style={[styles.statusText, { color: '#f59e0b' }]}>Pending</Text>
              </View>
            )}
            {item.status === 'REJECTED' && (
              <View style={[styles.statusBadge, { backgroundColor: '#ef444420', marginLeft: 4 }]}>
                <Text style={[styles.statusText, { color: '#ef4444' }]}>Rejected</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.arrow, { color: theme.colors.text.tertiary }]}>→</Text>
      </View>
    </Card>
  );

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Products</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading products…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Products</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary.main }]}
            onPress={() => { setLoading(true); fetchProducts(); }}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Products</Text>
          {products.length > 0 && (
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
          <Text style={[styles.addButton, { color: theme.colors.primary.main }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No products yet"
            message="Start by adding your first product"
            actionLabel="Add Product"
            onAction={() => navigation.navigate('AddProduct')}
            style={undefined}
          />
        }
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:  { flex: 1 },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  loadingText:  { marginTop: 12, fontSize: 14 },
  errorIcon:    { fontSize: 40, marginBottom: 12 },
  errorText:    { fontSize: 15, textAlign: 'center', marginBottom: 20 },
  retryBtn:     { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title:     { fontSize: 28, fontWeight: '700' },
  subtitle:  { fontSize: 13, marginTop: 2 },
  addButton: { fontSize: 16, fontWeight: '600' },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  productCard:             { marginBottom: 12, padding: 0 },
  productContent:          { flexDirection: 'row', alignItems: 'center', padding: 12 },
  productImage:            { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
  productImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  productEmoji:            { fontSize: 32 },
  productInfo:             { flex: 1 },
  productName:             { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  productCategory:         { fontSize: 12, marginBottom: 2 },
  productPrice:            { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  productMeta:             { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  stockText:               { fontSize: 13, marginRight: 8 },
  statusBadge:             { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText:              { fontSize: 11, fontWeight: '600' },
  arrow:                   { fontSize: 20, marginLeft: 8 },
  emptyIcon:               { fontSize: 64 },
});

export default ProductsScreen;