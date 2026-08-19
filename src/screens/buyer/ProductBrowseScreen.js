import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import AppIcon from '../../components/common/AppIcon';
import ProductThumb from '../../components/common/ProductThumb';
import { getApprovedProducts } from '../../api/productsApi';
import { categoryIcon, formatMoney, matchesCategory } from '../../utils/mediaUrl';

const ProductBrowseScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const iconColor = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory] = useState(route?.params?.category || 'all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getApprovedProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = String(product.name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesSearch && matchesCategory(product.category, selectedCategory);
      }),
    [products, searchQuery, selectedCategory]
  );

  const renderProduct = ({ item }) => (
    <Card
      variant={theme.isDarkMode ? 'glass' : 'default'}
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View
        style={[
          styles.productImage,
          { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light },
        ]}
      >
        <ProductThumb
          imageUrl={item.imageUrl}
          icon={categoryIcon(item.category)}
          size={36}
          color={iconColor}
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: iconColor }]}>
            {formatMoney(item.price)}
          </Text>
          <View style={styles.ratingRow}>
            <AppIcon name="star" size={13} color="#f59e0b" />
            <Text style={styles.rating}> {item.averageRating || 0}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary.main }]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </Card>
  );

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
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CartTab')}>
          <AppIcon name="cart" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <AppIcon name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary },
            ]}
            placeholder="Search products..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Card>

      {loading && products.length === 0 ? (
        <ActivityIndicator color={iconColor} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<AppIcon name="orders" size={64} color={theme.colors.text.tertiary} />}
              title={error ? 'Could not load products' : 'No products found'}
              message={error || 'Try adjusting your search or filters'}
            />
          }
        />
      )}
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
  searchCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  rating: {
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
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

export default ProductBrowseScreen;
