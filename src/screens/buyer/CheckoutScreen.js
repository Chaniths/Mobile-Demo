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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../api/client';

// ── Time slot options ──────────────────────────────────────────────────────────

const TIME_SLOTS = [
  { value: 'MORNING',   label: '🌅 Morning',   sub: '6 AM – 12 PM' },
  { value: 'AFTERNOON', label: '☀️ Afternoon', sub: '12 PM – 5 PM'  },
  { value: 'EVENING',   label: '🌆 Evening',   sub: '5 PM – 9 PM'  },
];

// ── Component ──────────────────────────────────────────────────────────────────

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [cart, setCart]               = useState(null);
  const [address, setAddress]         = useState(null);
  const [timeSlot, setTimeSlot]       = useState('MORNING');
  const [specialNote, setSpecialNote] = useState('');
  const [loading, setLoading]         = useState(true);
  const [placing, setPlacing]         = useState(false);
  const [error, setError]             = useState(null);

  // ── Fetch cart + address in parallel ─────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [cartRes, addrRes] = await Promise.all([
        api.get('/cart'),
        api.get('/orders/addresses'),
      ]);
      setCart(cartRes.data);
      setAddress(addrRes.data?.primary ?? null);
    } catch (err) {
      console.error('Checkout fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load checkout.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Place order ───────────────────────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty cart', 'Add items to your cart before placing an order.');
      return;
    }

    if (!address || !address.address) {
      Alert.alert(
        'No delivery address',
        'Please set a delivery address in your profile first.'
      );
      return;
    }

    setPlacing(true);
    try {
      const orderPayload = {
        // Map cart items to what the backend expects
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity:  item.quantity,
          sellerId:  item.sellerId,
        })),
        deliveryAddress: address.address,
        deliveryLat:     address.latitude,
        deliveryLng:     address.longitude,
        deliveryTimeSlot: timeSlot,
        specialInstructions: specialNote || undefined,
      };

      const response = await api.post('/orders', orderPayload);
      const order = response.data;

      // Success — navigate to confirmation
      navigation.replace('OrderConfirmation', {
        orderId:     order.id,
        orderNumber: order.orderNumber,
        total:       order.totalAmount,
      });
    } catch (err) {
      console.error('Place order error:', err);
      Alert.alert(
        'Order failed',
        err?.response?.data?.message || 'Could not place order. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Checkout</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading checkout…
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
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Checkout</Text>
        </View>
        <View style={styles.centered}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={[{ fontSize: 15, textAlign: 'center', marginBottom: 20 }, { color: theme.colors.text.primary }]}>
            {error}
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

  const cartItems = cart?.items ?? [];

  // ── Main ──────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Checkout</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Order summary ──────────────────────────────────────────────────── */}
        <Card style={styles.card} onPress={() => {}}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Order Summary
          </Text>
          {cartItems.length === 0 ? (
            <Text style={{ color: theme.colors.text.secondary, marginTop: 4 }}>
              Your cart is empty.
            </Text>
          ) : (
            cartItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {/* Thumbnail */}
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.itemThumb, styles.itemThumbPlaceholder, { backgroundColor: theme.colors.primary.light }]}>
                    <Text style={{ fontSize: 18 }}>🛒</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: theme.colors.text.primary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                    {item.quantity} {item.unit} × Rs. {item.price.toFixed(2)} · {item.vendor}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: theme.colors.text.primary }]}>
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </Card>

        {/* ── Delivery address ───────────────────────────────────────────────── */}
        <Card style={styles.card} onPress={() => {}}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Delivery Address
          </Text>
          {address?.address ? (
            <>
              <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
                {address.address}
              </Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Lat: {address.latitude?.toFixed(4)}, Lng: {address.longitude?.toFixed(4)}
              </Text>
            </>
          ) : (
            <Text style={{ color: theme.colors.error, fontSize: 13 }}>
              ⚠️ No delivery address found. Please update your profile.
            </Text>
          )}
        </Card>

        {/* ── Delivery time slot ─────────────────────────────────────────────── */}
        <Card style={styles.card} onPress={() => {}}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Delivery Time Slot
          </Text>
          <View style={styles.slotsRow}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = timeSlot === slot.value;
              return (
                <TouchableOpacity
                  key={slot.value}
                  style={[
                    styles.slotBtn,
                    {
                      borderColor: isSelected ? theme.colors.primary.main : theme.colors.border,
                      backgroundColor: isSelected ? `${theme.colors.primary.main}15` : 'transparent',
                    },
                  ]}
                  onPress={() => setTimeSlot(slot.value)}
                >
                  <Text style={{ fontSize: 20, marginBottom: 4 }}>{slot.label.split(' ')[0]}</Text>
                  <Text style={[styles.slotLabel, { color: isSelected ? theme.colors.primary.main : theme.colors.text.primary }]}>
                    {slot.label.split(' ').slice(1).join(' ')}
                  </Text>
                  <Text style={[styles.slotSub, { color: theme.colors.text.tertiary }]}>
                    {slot.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ── Payment summary ────────────────────────────────────────────────── */}
        <Card style={styles.card} onPress={() => {}}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Payment
          </Text>
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
            <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>Total to pay</Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary.main }]}>
              Rs. {(cart?.total ?? 0).toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* ── Footer button ────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Button
          title={placing ? 'Placing order…' : 'Place Order'}
          onPress={handlePlaceOrder}
          disabled={placing || cartItems.length === 0}
          style={styles.placeOrderButton}
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

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  backButton: { fontSize: 16, fontWeight: '600' },
  title:      { fontSize: 22, fontWeight: '700' },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },

  card:      { marginBottom: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  itemRow:             { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemThumb:           { width: 44, height: 44, borderRadius: 8, marginRight: 10 },
  itemThumbPlaceholder:{ justifyContent: 'center', alignItems: 'center' },
  itemName:            { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemMeta:            { fontSize: 12 },
  itemTotal:           { fontSize: 13, fontWeight: '700', marginLeft: 8 },

  slotsRow:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  slotBtn:   { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  slotLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  slotSub:   { fontSize: 10, textAlign: 'center', marginTop: 2 },

  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  divider:      { height: 1, marginVertical: 10 },
  totalLabel:   { fontSize: 15, fontWeight: '700' },
  totalValue:   { fontSize: 18, fontWeight: '700' },

  footer:           { position: 'absolute', left: 0, right: 0, bottom: 90, paddingHorizontal: 20, paddingVertical: 12 },
  placeOrderButton: { width: '100%' },
});

export default CheckoutScreen;