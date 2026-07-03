import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LocationSelectionModal from '../../components/common/LocationSelectionModal';
import { clearCart } from '../../store/slices/cartSlice';

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '24/B, Green Valley Apartments',
    coordinates: null,
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    dispatch(clearCart());
    navigation.replace('Cart');
  };

  const handleSelectLocation = (location) => {
    setDeliveryAddress(location);
    setIsLocationModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isDarkMode ? (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      ) : (
        <>
          {/* Arch-like strips in green colors for light mode */}
          <View style={[styles.archStrip1, styles.lightModeArchStrip1]} />
          <View style={[styles.archStrip2, styles.lightModeArchStrip2]} />
          <View style={[styles.archStrip3, styles.lightModeArchStrip3]} />
          <View style={[styles.archStrip4, styles.lightModeArchStrip4]} />
        </>
      )}
      {/* Header */}
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
        {/* Order summary */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Order summary
          </Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View>
                <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
                  {item.productName}
                </Text>
                <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                  {item.quantity} × ${item.price.toFixed(2)} from {item.sellerName}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: theme.colors.text.primary }]}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          {cartItems.length === 0 && (
            <Text style={{ color: theme.colors.text.secondary, marginTop: 4 }}>
              Your cart is empty.
            </Text>
          )}
        </Card>

        {/* Delivery details */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsLocationModalVisible(true)}
        >
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.card}>
            <View style={styles.deliveryHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                Delivery details
              </Text>
              <Text style={[styles.editText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                Edit
              </Text>
            </View>
            <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
              {deliveryAddress.address}
            </Text>
            {deliveryAddress.coordinates ? (
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Location set • Tap to change
              </Text>
            ) : (
              <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
                Default address • Tap to select location
              </Text>
            )}
          </Card>
        </TouchableOpacity>

        {/* Payment summary */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Payment
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
              Delivery fee
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              ${deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>
              Total to pay
            </Text>
            <Text style={[styles.totalValue, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={cartItems.length === 0 ? 'Back to products' : 'Place order'}
          onPress={cartItems.length === 0 ? () => navigation.navigate('BrowseTab') : handlePlaceOrder}
          style={styles.placeOrderButton}
        />
      </View>

      {/* Location Selection Modal */}
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
  // Arch-like strips pattern for dark mode
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
  // Light mode arch strips with green colors
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


