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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

// ── Component ──────────────────────────────────────────────────────────────────

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [cart, setCart]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  // Track which item is currently being updated to show per-item loading
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // ── Fetch cart ───────────────────────────────────────────────────────────────

  const fetchCart = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCart();
  }, [fetchCart]);

  // ── Update quantity ──────────────────────────────────────────────────────────

  const updateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;

    // Remove item if quantity goes to 0
    if (newQty <= 0) {
      removeItem(item);
      return;
    }

    // Check against seller stock
    if (newQty > item.sellerStock + item.quantity) {
      Alert.alert('Out of stock', `Only ${item.sellerStock + item.quantity} available from this seller.`);
      return;
    }

    setUpdatingItemId(item.id);
    try {
      await api.patch('/cart', {
        productId: item.productId,
        quantity: newQty,
        sellerId: item.sellerId,
      });
      // Refresh cart to get updated totals
      await fetchCart();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update quantity.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ── Remove item ──────────────────────────────────────────────────────────────

  const removeItem = async (item) => {
    setUpdatingItemId(item.id);
    try {
      await api.delete(`/cart/${item.productId}?sellerId=${item.sellerId}`);
      await fetchCart();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to remove item.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ── Clear cart ───────────────────────────────────────────────────────────────

  const clearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.post('/cart/clear');
              await fetchCart();
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to clear cart.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ── Render item ───────────────────────────────────────────────────────────────

  const renderCartItem = ({ item }) => {
    const isUpdating = updatingItemId === item.id;

    return (
      <Card style={styles.cartItem} onPress={() => {}}>
        {/* Thumbnail */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={[styles.itemImage, styles.itemImagePlaceholder, { backgroundColor: theme.colors.primary.light }]}>
            <Text style={{ fontSize: 28 }}>🛒</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: theme.colors.text.primary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.itemVendor, { color: theme.colors.text.tertiary }]}>
            {item.vendor}
          </Text>
          <Text style={[styles.itemPrice, { color: theme.colors.primary.main }]}>
            Rs. {item.price.toFixed(2)} / {item.unit}
          </Text>
        </View>

        {/* Quantity controls */}
        {isUpdating ? (
          <ActivityIndicator size="small" color={theme.colors.primary.main} style={{ marginLeft: 12 }} />
        ) : (
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => updateQuantity(item, -1)}
              style={[styles.quantityButton, { backgroundColor: theme.colors.cardSecondary }]}
            >
              <Text style={[styles.quantityButtonText, { color: theme.colors.text.primary }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: theme.colors.text.primary }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item, 1)}
              disabled={item.availableStock <= 0}
              style={[
                styles.quantityButton,
                { backgroundColor: item.availableStock <= 0 ? theme.colors.border : theme.colors.primary.main },
              ]}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
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
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Cart</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading cart…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Cart</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.centered}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={[{ fontSize: 15, textAlign: 'center', marginBottom: 20 }, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary.main }]}
            onPress={() => { setLoading(true); fetchCart(); }}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cartItems = cart?.items ?? [];
  const isEmpty = cartItems.length === 0;

  // ── Empty ─────────────────────────────────────────────────────────────────────

  if (isEmpty) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Cart</Text>
          <View style={{ width: 50 }} />
        </View>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>🛒</Text>}
          title="Your cart is empty"
          message="Add some fresh products to get started"
          actionLabel="Browse Products"
          onAction={() => navigation.navigate('BrowseTab')}
          style={undefined}
        />
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
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={[styles.clearBtn, { color: theme.colors.error }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Item count */}
      <Text style={[styles.itemCount, { color: theme.colors.text.secondary }]}>
        {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
      </Text>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
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
      />

      {/* Summary */}
      <Card style={styles.summary} elevation="lg" onPress={() => {}}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
            Rs. {(cart?.subtotal ?? 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>Tax (10%)</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
            Rs. {(cart?.tax ?? 0).toFixed(2)}
          </Text>
        </View>
        {cart?.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>Discount</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
              − Rs. {(cart?.discount ?? 0).toFixed(2)}
            </Text>
          </View>
        )}
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>Total</Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary.main }]}>
            Rs. {(cart?.total ?? 0).toFixed(2)}
          </Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          style={styles.checkoutButton}
        />
      </Card>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:  { flex: 1 },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText:{ marginTop: 12, fontSize: 14 },
  retryBtn:   { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  retryBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backButton: { fontSize: 16, fontWeight: '600' },
  title:      { fontSize: 20, fontWeight: '700' },
  clearBtn:   { fontSize: 14, fontWeight: '600' },
  itemCount:  { fontSize: 13, paddingHorizontal: 20, marginBottom: 8 },

  list:       { paddingHorizontal: 20, paddingBottom: 20 },

  cartItem:              { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 12 },
  itemImage:             { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  itemImagePlaceholder:  { justifyContent: 'center', alignItems: 'center' },
  itemInfo:              { flex: 1 },
  itemName:              { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  itemVendor:            { fontSize: 11, marginBottom: 3 },
  itemPrice:             { fontSize: 13, fontWeight: '700' },

  quantityControl:    { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  quantityButton:     { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  quantity:           { fontSize: 16, fontWeight: '600', marginHorizontal: 12, minWidth: 20, textAlign: 'center' },

  summary:        { margin: 20, marginTop: 0, padding: 20 },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel:   { fontSize: 14 },
  summaryValue:   { fontSize: 14, fontWeight: '600' },
  divider:        { height: 1, marginVertical: 12 },
  totalLabel:     { fontSize: 18, fontWeight: '700' },
  totalValue:     { fontSize: 22, fontWeight: '700' },
  checkoutButton: { marginTop: 16 },
  emptyIcon:      { fontSize: 64 },
});

export default CartScreen;