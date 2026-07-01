import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../api/client';

// ── Component ──────────────────────────────────────────────────────────────────

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const { theme } = useTheme();

  const [product, setProduct]               = useState(null);
  const [sellers, setSellers]               = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [quantity, setQuantity]             = useState(1);
  const [loading, setLoading]               = useState(true);
  const [addingToCart, setAddingToCart]     = useState(false);
  const [error, setError]                   = useState(null);

  // ── Fetch product + sellers ───────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!productId) return;
    try {
      setError(null);
      // Run both requests in parallel
      const [productRes, sellersRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/products/${productId}/sellers`),
      ]);

      setProduct(productRes.data);
      setSellers(sellersRes.data);

      // Auto-select the cheapest seller (already sorted by price asc from backend)
      if (sellersRes.data.length > 0) {
        setSelectedSellerId(sellersRes.data[0].sellerId);
      }
    } catch (err) {
      console.error('Product detail fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Quantity controls ─────────────────────────────────────────────────────────

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      // Cap at selected seller's stock
      const sellerStock = sellers.find((s) => s.sellerId === selectedSellerId)?.stock ?? 999;
      return next > sellerStock ? sellerStock : next;
    });
  };

  // ── Add to cart ───────────────────────────────────────────────────────────────

  const handleAddToCart = async () => {
    if (!selectedSellerId) {
      Alert.alert('Select a seller', 'Please select a seller before adding to cart.');
      return;
    }

    setAddingToCart(true);
    try {
      // POST /api/v1/cart/add
      await api.post('/cart/add', {
        productId,
        quantity,
        sellerId: selectedSellerId,
      });

      // Navigate to cart on success
      navigation.navigate('CartTab');
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert(
        'Could not add to cart',
        err?.response?.data?.message || 'Please try again.'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // ── Selected seller helper ────────────────────────────────────────────────────

  const selectedSeller = sellers.find((s) => s.sellerId === selectedSellerId);
  const estimatedTotal = selectedSeller
    ? (selectedSeller.price * quantity).toFixed(2)
    : '0.00';

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Product</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading product…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error / Not found ─────────────────────────────────────────────────────────

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Product</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={[{ fontSize: 15, textAlign: 'center', marginBottom: 20 }, { color: theme.colors.text.primary }]}>
            {error || 'Product not found.'}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary.main }]}
            onPress={() => { setLoading(true); fetchData(); }}
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
        <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CartTab')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <Card style={styles.heroCard} onPress={() => {}}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroImagePlaceholder, { backgroundColor: theme.colors.primary.light }]}>
              <Text style={styles.heroEmoji}>🛒</Text>
            </View>
          )}
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
            {product.name}
          </Text>
          <Text style={[styles.metaText, { color: theme.colors.text.secondary }]}>
            {product.unit} • {product.category}
          </Text>
          {product.description ? (
            <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
              {product.description}
            </Text>
          ) : null}

          {/* Stock info */}
          <View style={styles.stockRow}>
            {product.stock <= 0 ? (
              <Text style={[styles.stockBadge, { color: '#ef4444', backgroundColor: '#ef444420' }]}>
                Out of stock
              </Text>
            ) : product.stock <= 10 ? (
              <Text style={[styles.stockBadge, { color: '#f59e0b', backgroundColor: '#f59e0b20' }]}>
                Only {product.stock} {product.unit} left
              </Text>
            ) : (
              <Text style={[styles.stockBadge, { color: '#22c55e', backgroundColor: '#22c55e20' }]}>
                In stock • {product.stock} {product.unit}
              </Text>
            )}
          </View>
        </Card>

        {/* Sellers list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Available Sellers ({sellers.length})
          </Text>

          {sellers.length === 0 ? (
            <Text style={[{ fontSize: 14, color: theme.colors.text.secondary }]}>
              No sellers available for this product.
            </Text>
          ) : (
            sellers.map((sellerEntry) => {
              // Backend returns SellerProduct entries with nested seller
              const isSelected = sellerEntry.sellerId === selectedSellerId;
              const sellerName = sellerEntry.seller?.user?.name ?? 'Unknown Seller';
              const outOfStock = sellerEntry.stock <= 0;

              return (
                <TouchableOpacity
                  key={sellerEntry.sellerId}
                  onPress={() => {
                    if (!outOfStock) {
                      setSelectedSellerId(sellerEntry.sellerId);
                      setQuantity(1); // reset quantity on seller change
                    }
                  }}
                  disabled={outOfStock}
                >
                  <Card
                    style={[
                      styles.sellerCard,
                      outOfStock && { opacity: 0.5 },
                      isSelected && {
                        borderWidth: 1.5,
                        borderColor: theme.colors.primary.main,
                      },
                    ]}
                    onPress={() => {
                      if (!outOfStock) {
                        setSelectedSellerId(sellerEntry.sellerId);
                        setQuantity(1);
                      }
                    }}
                  >
                    <View style={styles.sellerHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.sellerName, { color: theme.colors.text.primary }]}>
                          {sellerName}
                        </Text>
                        <Text style={[styles.sellerMeta, { color: theme.colors.text.secondary }]}>
                          Stock: {sellerEntry.stock} {product.unit}
                        </Text>
                      </View>
                      <View style={styles.priceBlock}>
                        <Text style={[styles.price, { color: theme.colors.primary.main }]}>
                          Rs. {sellerEntry.price.toFixed(2)}
                        </Text>
                        <Text style={[styles.priceUnit, { color: theme.colors.text.secondary }]}>
                          per {product.unit}
                        </Text>
                      </View>
                    </View>

                    {/* Out of stock badge */}
                    {outOfStock && (
                      <Text style={[styles.outOfStockText, { color: '#ef4444' }]}>
                        Out of stock from this seller
                      </Text>
                    )}

                    {/* Selected checkmark */}
                    {isSelected && !outOfStock && (
                      <Text style={[styles.selectedText, { color: theme.colors.primary.main }]}>
                        ✓ Selected
                      </Text>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        {/* Quantity */}
        <View style={styles.quantityWrapper}>
          <Text style={[styles.bottomLabel, { color: theme.colors.text.secondary }]}>Quantity</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(-1)}
              style={[styles.quantityButton, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.quantityButtonText, { color: theme.colors.text.primary }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityValue, { color: theme.colors.text.primary }]}>
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => handleQuantityChange(1)}
              style={[styles.quantityButton, { backgroundColor: theme.colors.primary.main }]}
            >
              <Text style={[styles.quantityButtonText, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Estimated total */}
        <View style={styles.checkoutWrapper}>
          <Text style={[styles.totalLabel, { color: theme.colors.text.secondary }]}>
            Estimated total
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary.main }]}>
            Rs. {estimatedTotal}
          </Text>
        </View>

        {/* Add to cart button */}
        <Button
          title={addingToCart ? 'Adding…' : 'Add to Cart'}
          onPress={handleAddToCart}
          disabled={addingToCart || !selectedSellerId || product.stock <= 0}
          style={styles.addToCartButton}
        />
      </View>
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

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backButton: { fontSize: 16, fontWeight: '600' },
  title:      { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  cartIcon:   { fontSize: 24 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 200 },

  heroCard:               { alignItems: 'center', paddingVertical: 20, marginBottom: 16 },
  heroImage:              { width: 110, height: 110, borderRadius: 55, marginBottom: 12 },
  heroImagePlaceholder:   { justifyContent: 'center', alignItems: 'center' },
  heroEmoji:              { fontSize: 52 },
  productName:            { fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  metaText:               { fontSize: 13, marginBottom: 6, textTransform: 'capitalize' },
  description:            { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20, paddingHorizontal: 8 },
  stockRow:               { marginTop: 10 },
  stockBadge:             { fontSize: 12, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },

  section:      { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  sellerCard:      { marginBottom: 10, padding: 14 },
  sellerHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sellerName:      { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  sellerMeta:      { fontSize: 12 },
  priceBlock:      { alignItems: 'flex-end' },
  price:           { fontSize: 18, fontWeight: '700' },
  priceUnit:       { fontSize: 11 },
  outOfStockText:  { fontSize: 12, fontWeight: '600', marginTop: 6 },
  selectedText:    { fontSize: 12, fontWeight: '700', marginTop: 6 },

  bottomBar:       { position: 'absolute', left: 0, right: 0, bottom: 90, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1 },
  quantityWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  bottomLabel:     { fontSize: 13 },
  quantityControl: { flexDirection: 'row', alignItems: 'center' },
  quantityButton:  { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { fontSize: 18, fontWeight: '600' },
  quantityValue:   { fontSize: 16, fontWeight: '600', marginHorizontal: 16 },
  checkoutWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  totalLabel:      { fontSize: 12 },
  totalValue:      { fontSize: 18, fontWeight: '700' },
  addToCartButton: { marginTop: 4 },
});

export default ProductDetailScreen;