import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useDispatch } from 'react-redux';
import { addItemAsync } from '../../store/slices/cartSlice';
import AppIcon from '../../components/common/AppIcon';
import ProductThumb from '../../components/common/ProductThumb';
import { getProductById, getProductSellers } from '../../api/productsApi';
import { categoryIcon, formatMoney, getApiErrorMessage } from '../../utils/mediaUrl';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const iconColor = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;

  const [product, setProduct] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      setError('Product not found.');
      return;
    }
    setLoading(true);
    try {
      const [productData, sellerRows] = await Promise.all([
        getProductById(productId),
        getProductSellers(productId),
      ]);
      setProduct(productData);
      const mappedSellers = (sellerRows || []).map((row) => ({
        id: row.sellerId || row.seller?.id,
        name: row.seller?.businessName || row.seller?.user?.name || 'Seller',
        price: Number(row.price) || Number(productData?.price) || 0,
        stock: Number(row.stock) || 0,
        rating: Number(row.seller?.averageRating) || 0,
      })).filter((seller) => seller.id);
      setSellers(mappedSellers);
      setSelectedSellerId(mappedSellers[0]?.id || null);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Product not found.'));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const selectedSeller = sellers.find((s) => s.id === selectedSellerId);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      return next < 1 ? 1 : next;
    });
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSeller) return;
    setAdding(true);
    try {
      await dispatch(
        addItemAsync({
          productId: product.id,
          sellerId: selectedSeller.id,
          quantity,
        })
      ).unwrap();
      navigation.navigate('CartTab');
    } catch (err) {
      Alert.alert('Could not add to cart', typeof err === 'string' ? err : 'Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
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
          <ActivityIndicator color={iconColor} />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={{ color: theme.colors.text.secondary }}>{error || 'Product not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CartTab')}>
          <AppIcon name="cart" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.heroCard}>
          <View
            style={[
              styles.heroImage,
              { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light },
            ]}
          >
            <ProductThumb
              imageUrl={product.imageUrl}
              icon={categoryIcon(product.category)}
              size={64}
              color={iconColor}
            />
          </View>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
            {product.name}
          </Text>
          {product.description ? (
            <Text style={[styles.metaText, { color: theme.colors.text.secondary, textAlign: 'center', marginBottom: 6 }]}>
              {product.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.colors.text.secondary }]}>
              {product.unit} •{' '}
            </Text>
            <AppIcon name="star" size={14} color="#f59e0b" />
            <Text style={[styles.metaText, { color: theme.colors.text.secondary }]}>
              {' '}{product.averageRating || 0}
            </Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Available sellers
          </Text>
          {sellers.length === 0 ? (
            <Text style={{ color: theme.colors.text.secondary }}>
              No sellers currently offer this product.
            </Text>
          ) : (
            sellers.map((seller) => {
              const isSelected = seller.id === selectedSellerId;
              return (
                <TouchableOpacity key={seller.id} onPress={() => setSelectedSellerId(seller.id)}>
                  <Card
                    variant={theme.isDarkMode ? 'glass' : 'default'}
                    style={[
                      styles.sellerCard,
                      isSelected && {
                        borderWidth: 1.5,
                        borderColor: iconColor,
                      },
                    ]}
                  >
                    <View style={styles.sellerHeader}>
                      <View>
                        <Text style={[styles.sellerName, { color: theme.colors.text.primary }]}>
                          {seller.name}
                        </Text>
                        <View style={styles.sellerRatingRow}>
                          <AppIcon name="star" size={13} color="#f59e0b" />
                          <Text style={[styles.sellerMeta, { color: theme.colors.text.secondary }]}>
                            {' '}{seller.rating} • {seller.stock} in stock
                          </Text>
                        </View>
                      </View>
                      <View style={styles.priceBlock}>
                        <Text style={[styles.price, { color: iconColor }]}>
                          {formatMoney(seller.price)}
                        </Text>
                        <Text style={[styles.priceUnit, { color: theme.colors.text.secondary }]}>
                          per {product.unit}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.sellerFooter}>
                      <Text style={[styles.deliveryMeta, { color: theme.colors.text.secondary }]}>
                        FreshRoute delivery
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

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
          <Text style={[styles.totalValue, { color: iconColor }]}>
            {formatMoney(selectedSeller ? selectedSeller.price * quantity : 0)}
          </Text>
        </View>

        <Button
          title={adding ? 'Adding...' : 'Add to cart'}
          onPress={handleAddToCart}
          loading={adding}
          disabled={!selectedSeller || adding}
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
    maxWidth: 180,
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
    overflow: 'hidden',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
