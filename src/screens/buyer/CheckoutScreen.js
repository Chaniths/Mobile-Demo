import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { clearCart } from '../../store/slices/cartSlice';

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    dispatch(clearCart());
    navigation.replace('Cart');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isDarkMode && (
        <>
          <View style={styles.gradientCircle1} />
          <View style={styles.gradientCircle2} />
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

        {/* Delivery details (static placeholder) */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Delivery details
          </Text>
          <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
            24/B, Green Valley Apartments
          </Text>
          <Text style={[styles.itemMeta, { color: theme.colors.text.secondary }]}>
            Default address • You can wire this to real profile data later
          </Text>
        </Card>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  gradientCircle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    opacity: 0.6,
    zIndex: 0,
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -192,
    right: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(35, 101, 113, 0.4)',
    opacity: 0.6,
    zIndex: 0,
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
});

export default CheckoutScreen;


