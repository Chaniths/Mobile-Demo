import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LocationSelectionModal from '../../components/common/LocationSelectionModal';
import { clearCartAsync, fetchCart } from '../../store/slices/cartSlice';
import { createOrder, getBuyerAddresses } from '../../api/ordersApi';
import { formatMoney, getApiErrorMessage } from '../../utils/mediaUrl';

const TIME_SLOTS = [
  { id: 'MORNING', label: 'Morning' },
  { id: 'AFTERNOON', label: 'Afternoon' },
  { id: 'EVENING', label: 'Evening' },
];

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const totals = useSelector((state) => state.cart.totals);
  const iconColor = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;

  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: 'Loading your saved address...',
    coordinates: null,
  });
  const [timeSlot, setTimeSlot] = useState('AFTERNOON');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    const loadAddress = async () => {
      try {
        const data = await getBuyerAddresses();
        const primary = data?.primary || data?.addresses?.[0];
        if (primary?.address) {
          const lat = Number(primary.latitude);
          const lng = Number(primary.longitude);
          setDeliveryAddress({
            address: primary.address,
            coordinates: Number.isFinite(lat) && Number.isFinite(lng)
              ? { latitude: lat, longitude: lng }
              : null,
          });
        } else {
          setDeliveryAddress({
            address: 'Tap to set your delivery location',
            coordinates: null,
          });
        }
      } catch (err) {
        setDeliveryAddress({
          address: 'Tap to set your delivery location',
          coordinates: null,
        });
      }
    };
    loadAddress();
  }, [dispatch]);

  const subtotal = totals?.subtotal ?? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = totals?.tax ?? 0;
  const discount = totals?.discount ?? 0;
  const total = totals?.total ?? subtotal + tax - discount;

  const handlePlaceOrder = useCallback(async () => {
    if (cartItems.length === 0) {
      navigation.navigate('BrowseTab');
      return;
    }
    const coords = deliveryAddress.coordinates;
    if (!deliveryAddress.address || !coords?.latitude || !coords?.longitude) {
      Alert.alert('Delivery location needed', 'Please set a delivery address on the map.');
      return;
    }
    if (!timeSlot) {
      Alert.alert('Time slot needed', 'Choose a delivery window.');
      return;
    }

    setPlacing(true);
    try {
      await createOrder({
        items: cartItems.map((item) => ({
          productId: item.productId,
          sellerId: item.sellerId,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddress.address,
        deliveryLat: Number(coords.latitude),
        deliveryLng: Number(coords.longitude),
        deliveryTimeSlot: timeSlot,
      });
      await dispatch(clearCartAsync());
      Alert.alert('Order placed', 'Your order was sent to FreshRoute.', [
        { text: 'View orders', onPress: () => navigation.navigate('OrdersTab') },
      ]);
    } catch (err) {
      Alert.alert('Could not place order', getApiErrorMessage(err, 'Please try again.'));
    } finally {
      setPlacing(false);
    }
  }, [cartItems, deliveryAddress, dispatch, navigation, timeSlot]);

  const handleSelectLocation = (location) => {
    setDeliveryAddress(location);
    setIsLocationModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isDarkMode ? (
        <>
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      ) : (
        <>
          <View style={[styles.archStrip1, styles.lightModeArchStrip1]} />
          <View style={[styles.archStrip2, styles.lightModeArchStrip2]} />
          <View style={[styles.archStrip3, styles.lightModeArchStrip3]} />
          <View style={[styles.archStrip4, styles.lightModeArchStrip4]} />
        </>
      )}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Checkout</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Review your order and delivery details
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Order summary
          </Text>
          {cartItems.map((item) => (
            <View key={`${item.productId}:${item.sellerId}`} style={styles.itemRow}>
              <View>
                <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                  {item.quantity} × {formatMoney(item.price)}
                  {item.vendor ? ` from ${item.vendor}` : ''}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: theme.colors.text.primary }]}>
                {formatMoney(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          {cartItems.length === 0 && (
            <Text style={{ color: theme.colors.text.secondary, marginTop: 4 }}>
              Your cart is empty.
            </Text>
          )}
        </Card>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsLocationModalVisible(true)}
        >
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.card}>
            <View style={styles.deliveryHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                Delivery details
              </Text>
              <Text style={[styles.editText, { color: iconColor }]}>Edit</Text>
            </View>
            <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
              {deliveryAddress.address}
            </Text>
            <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
              {deliveryAddress.coordinates
                ? 'Location set • Tap to change'
                : 'Tap to select a map location'}
            </Text>
          </Card>
        </TouchableOpacity>

        <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Delivery window
          </Text>
          <View style={styles.slotRow}>
            {TIME_SLOTS.map((slot) => {
              const selected = timeSlot === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => setTimeSlot(slot.id)}
                  style={[
                    styles.slotChip,
                    {
                      borderColor: selected ? iconColor : theme.colors.border,
                      backgroundColor: selected ? `${iconColor}22` : 'transparent',
                    },
                  ]}
                >
                  <Text style={{ color: selected ? iconColor : theme.colors.text.secondary, fontWeight: '600' }}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>Payment</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              {formatMoney(subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              {formatMoney(tax)}
            </Text>
          </View>
          {discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
                -{formatMoney(discount)}
              </Text>
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>Total to pay</Text>
            <Text style={[styles.totalValue, { color: iconColor }]}>{formatMoney(total)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            cartItems.length === 0
              ? 'Back to products'
              : placing
                ? 'Placing order...'
                : 'Place order'
          }
          onPress={handlePlaceOrder}
          loading={placing}
          disabled={placing}
          style={styles.placeOrderButton}
        />
      </View>

      <LocationSelectionModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onSelectLocation={handleSelectLocation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  archStrip1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 200,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(35, 101, 113, 0.3)',
    opacity: 0.7,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  archStrip2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 350,
    height: 180,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: 'rgba(45, 122, 135, 0.35)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '25deg' }],
  },
  archStrip3: {
    position: 'absolute',
    bottom: 200,
    left: -60,
    width: 380,
    height: 190,
    borderTopLeftRadius: 190,
    borderTopRightRadius: 190,
    backgroundColor: 'rgba(35, 101, 113, 0.25)',
    opacity: 0.5,
    zIndex: 0,
    transform: [{ rotate: '20deg' }],
  },
  archStrip4: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 420,
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: 'rgba(45, 122, 135, 0.3)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '-30deg' }],
  },
  header: {
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    zIndex: 1,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
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
    opacity: 0.06,
    backgroundColor: '#000',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 90,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  placeOrderButton: {
    width: '100%',
  },
  lightModeArchStrip1: {
    backgroundColor: 'rgba(22, 163, 74, 0.3)',
    opacity: 0.7,
  },
  lightModeArchStrip2: {
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
    opacity: 0.6,
  },
  lightModeArchStrip3: {
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    opacity: 0.5,
  },
  lightModeArchStrip4: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    opacity: 0.6,
  },
});

export default CheckoutScreen;
