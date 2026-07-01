import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

// ── Category tabs ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all',        label: 'All' },
  { key: 'fruits',     label: '🍎 Fruits' },
  { key: 'vegetables', label: '🥬 Vegetables' },
  { key: 'dairy',      label: '🥛 Dairy' },
  { key: 'grains',     label: '🌾 Grains' },
];

// ── Component ──────────────────────────────────────────────────────────────────

const ProductBrowseScreen = ({ navigation, route }) => {
  const { theme } = useTheme();

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    route?.params?.category || 'all'
  );

  // ── Fetch approved products ───────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      // GET /api/v1/products/approved — returns APPROVED products with availableStock
      const response = await api.get('/products/approved');
      setProducts(response.data);
    } catch (err) {
      console.error('Browse fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // ── Filter by search + category ───────────────────────────────────────────────

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // ── Render product card ───────────────────────────────────────────────────────

  const renderProduct = ({ item }) => {
    const outOfStock = item.availableStock <= 0;

    return (
      <Card
        style={[styles.productCard, outOfStock && styles.productCardDimmed]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
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
          <Text
            style={[styles.productName, { color: theme.colors.text.primary }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.productCategory, { color: theme.colors.text.tertiary }]}>
            {item.category}
          </Text>
          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, { color: theme.colors.primary.main }]}>
              Rs. {item.price.toFixed(2)} / {item.unit}
            </Text>
            {/* Stock indicator */}
            {outOfStock ? (
              <Text style={[styles.stockBadge, { color: '#ef4444' }]}>Out of stock</Text>
            ) : item.availableStock <= 10 ? (
              <Text style={[styles.stockBadge, { color: '#f59e0b' }]}>
                Only {item.availableStock} left
              </Text>
            ) : null}
          </View>
          {/* Seller count */}
          {item.sellerCount > 1 && (
            <Text style={[styles.sellerCount, { color: theme.colors.text.tertiary }]}>
              {item.sellerCount} sellers available
            </Text>
          )}
        </View>

        {/* Add button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: outOfStock ? theme.colors.border : theme.colors.primary.main },
          ]}
          disabled={outOfStock}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Products</Text>
          <View style={{ width: 40 }} />
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Products</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={[{ fontSize: 15, textAlign: 'center', marginBottom: 20 }, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CartTab')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Search products..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: theme.colors.text.tertiary, fontSize: 18, paddingHorizontal: 4 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item.key;
          return (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isActive ? theme.colors.primary.main : theme.colors.card,
                  borderColor: isActive ? theme.colors.primary.main : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Text style={[styles.categoryTabText, { color: isActive ? '#fff' : theme.colors.text.secondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Results count */}
      {filteredProducts.length > 0 && (
        <Text style={[styles.resultsCount, { color: theme.colors.text.tertiary }]}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Product list */}
      <FlatList
        data={filteredProducts}
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
            title="No products found"
            message={
              searchQuery
                ? `No results for "${searchQuery}"`
                : 'No products available in this category'
            }
            style={undefined}
          />
        }
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1 },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  retryBtn:    { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  retryBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backButton: { fontSize: 16, fontWeight: '600' },
  title:      { fontSize: 20, fontWeight: '700' },
  cartIcon:   { fontSize: 24 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, padding: 12, borderRadius: 12 },
  searchIcon:      { fontSize: 18, marginRight: 10 },
  searchInput:     { flex: 1, fontSize: 15 },

  categoryList:    { paddingHorizontal: 20, paddingBottom: 12 },
  categoryTab:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  categoryTabText: { fontSize: 13, fontWeight: '600' },

  resultsCount: { fontSize: 12, paddingHorizontal: 20, marginBottom: 8 },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  productCard:             { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 12 },
  productCardDimmed:       { opacity: 0.6 },
  productImage:            { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
  productImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  productEmoji:            { fontSize: 32 },
  productInfo:             { flex: 1 },
  productName:             { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  productCategory:         { fontSize: 11, marginBottom: 4, textTransform: 'capitalize' },
  productFooter:           { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  productPrice:            { fontSize: 15, fontWeight: '700', marginRight: 8 },
  stockBadge:              { fontSize: 11, fontWeight: '600' },
  sellerCount:             { fontSize: 11, marginTop: 3 },

  addButton:     { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  addButtonText: { color: '#ffffff', fontSize: 24, fontWeight: '600' },

  emptyIcon: { fontSize: 64 },
});

export default ProductBrowseScreen;