import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { useDispatch, useSelector } from 'react-redux';
import { changeItemQuantity } from '../../store/slices/cartSlice';

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const updateQuantity = (id, change) => {
    dispatch(changeItemQuantity({ id, delta: change }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 5.99;
  const total = subtotal + deliveryFee;

  const renderCartItem = ({ item }) => (
    <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.cartItem}>
      <View style={[styles.itemImage, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
        <Text style={styles.itemEmoji}>{item.image}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <Text style={[styles.itemPrice, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, -1)}
          style={[styles.quantityButton, { backgroundColor: theme.colors.cardSecondary }]}
        >
          <Text style={[styles.quantityButtonText, { color: theme.colors.text.primary }]}>
            −
          </Text>
        </TouchableOpacity>
        <Text style={[styles.quantity, { color: theme.colors.text.primary }]}>
          {item.quantity}
        </Text>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, 1)}
          style={[styles.quantityButton, { backgroundColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Cart</Text>
          <View style={{ width: 50 }} />
        </View>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>🛒</Text>}
          title="Your cart is empty"
          message="Add some organic products to get started"
          actionLabel="Browse Products"
          onAction={() => navigation.navigate('BrowseTab')}
        />
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Cart</Text>
        <Text style={[styles.itemCount, { color: theme.colors.text.secondary }]}>
          {cartItems.length} items
        </Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { zIndex: 1 }]}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.summary} elevation="lg">
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
            Delivery Fee
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
            ${deliveryFee.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
            ${total.toFixed(2)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  itemCount: {
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    margin: 20,
    marginTop: 0,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  checkoutButton: {
    marginTop: 16,
  },
  emptyIcon: {
    fontSize: 64,
  },
});

export default CartScreen;

