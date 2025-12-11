import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { getProductById } from '../../utils/catalog';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const product = useMemo(() => getProductById(productId), [productId]);
  const [selectedSellerId, setSelectedSellerId] = useState(
    product?.sellers?.[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Product</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.center}>
          <Text style={{ color: theme.colors.text.secondary }}>
            Product not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedSeller = product.sellers.find((s) => s.id === selectedSellerId);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      return next < 1 ? 1 : next;
    });
  };

  const handleAddToCart = () => {
    if (!selectedSeller) return;

    dispatch(
      addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        sellerId: selectedSeller.id,
        sellerName: selectedSeller.name,
        unit: product.unit,
        price: selectedSeller.price,
        quantity,
      })
    );

    navigation.navigate('CartTab');
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
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
        {/* Product hero */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.heroCard}>
          <View
            style={[
              styles.heroImage,
              { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light },
            ]}
          >
            <Text style={styles.heroEmoji}>{product.image}</Text>
          </View>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
            {product.name}
          </Text>
          <Text style={[styles.metaText, { color: theme.colors.text.secondary }]}>
            {product.unit} • ⭐ {product.rating}
          </Text>
        </Card>

        {/* Sellers list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Available sellers
          </Text>
          {product.sellers.map((seller) => {
            const isSelected = seller.id === selectedSellerId;
            return (
              <TouchableOpacity
                key={seller.id}
                onPress={() => setSelectedSellerId(seller.id)}
              >
                <Card
                  variant={theme.isDarkMode ? "glass" : "default"}
                  style={[
                    styles.sellerCard,
                    isSelected && {
                      borderWidth: 1.5,
                      borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                    },
                  ]}
                >
                  <View style={styles.sellerHeader}>
                    <View>
                      <Text
                        style={[
                          styles.sellerName,
                          { color: theme.colors.text.primary },
                        ]}
                      >
                        {seller.name}
                      </Text>
                      <Text
                        style={[
                          styles.sellerMeta,
                          { color: theme.colors.text.secondary },
                        ]}
                      >
                        ⭐ {seller.rating} • {seller.distanceKm} km away
                      </Text>
                    </View>
                    <View style={styles.priceBlock}>
                      <Text
                        style={[
                          styles.price,
                          { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main },
                        ]}
                      >
                        ${seller.price.toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.priceUnit,
                          { color: theme.colors.text.secondary },
                        ]}
                      >
                        per {product.unit}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.sellerFooter}>
                    <Text
                      style={[
                        styles.deliveryMeta,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      ETA {seller.etaMinutes} min • FreshRoute delivery
                    </Text>
                    {seller.badge ? (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light },
                        ]}
                      >
                        <Text style={styles.badgeText}>{seller.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { borderTopColor: theme.colors.border }]}>
        <View style={styles.quantityWrapper}>
          <Text style={[styles.bottomLabel, { color: theme.colors.text.secondary }]}>
            Quantity
          </Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(-1)}
              style={[styles.quantityButton, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.quantityButtonText, { color: theme.colors.text.primary }]}>
                −
              </Text>
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

        <View style={styles.checkoutWrapper}>
          <Text style={[styles.totalLabel, { color: theme.colors.text.secondary }]}>
            Estimated total
          </Text>
          <Text style={[styles.totalValue, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
            ${selectedSeller ? (selectedSeller.price * quantity).toFixed(2) : '0.00'}
          </Text>
        </View>

        <Button
          title="Add to cart"
          onPress={handleAddToCart}
          style={styles.addToCartButton}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  cartIcon: {
    fontSize: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    zIndex: 1,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  heroImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 48,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sellerCard: {
    marginBottom: 10,
    padding: 14,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  sellerMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 11,
  },
  sellerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  deliveryMeta: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 90,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bottomLabel: {
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: '600',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  checkoutWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  addToCartButton: {
    marginTop: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ProductDetailScreen;


