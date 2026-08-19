import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import AppIcon from '../../components/common/AppIcon';
import NotificationBell from '../../components/NotificationBell';
import ProductThumb from '../../components/common/ProductThumb';
import { getApprovedProducts } from '../../api/productsApi';
import { categoryIcon, formatMoney } from '../../utils/mediaUrl';

const DEFAULT_CATEGORIES = [
  { id: 'fruits', name: 'Fruits', icon: 'food-apple' },
  { id: 'vegetables', name: 'Vegetables', icon: 'food-leaf' },
  { id: 'dairy', name: 'Dairy', icon: 'food-dairy' },
  { id: 'grains', name: 'Grains', icon: 'food-grain' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const displayName = user?.name ?? user?.ownerName ?? 'Guest';
  const iconColor = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;

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
      setError(err?.response?.data?.message || 'Could not load products from the server.');
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

  const categories = useMemo(() => {
    const extras = [];
    const seen = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
    products.forEach((product) => {
      const name = String(product.category || '').trim();
      if (!name) return;
      const id = name.toLowerCase();
      if (seen.has(id)) return;
      seen.add(id);
      extras.push({ id, name, icon: categoryIcon(name) });
    });
    return [...DEFAULT_CATEGORIES, ...extras];
  }, [products]);

  const featuredProducts = products.slice(0, 10);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductBrowse', { category: item.id })}
      style={styles.categoryPillWrapper}
    >
      <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.categoryPill}>
        <AppIcon name={item.icon} size={28} color={iconColor} />
        <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.productCard}>
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
        <Text style={[styles.productName, { color: theme.colors.text.primary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: iconColor }]}>
            {formatMoney(item.price)}
          </Text>
          <View style={styles.rating}>
            <AppIcon name="star" size={13} color="#f59e0b" />
            <Text style={styles.ratingText}> {item.averageRating || 0}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {displayName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar name={displayName} size="medium" />
            </TouchableOpacity>
          </View>
        </View>

        <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.searchBarCard}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('ProductBrowse')}
          >
            <AppIcon name="search" size={20} color={theme.colors.text.tertiary} />
            <Text
              style={[
                styles.searchPlaceholder,
                { color: theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary },
              ]}
            >
              Search for organic products...
            </Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Categories
          </Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, paddingHorizontal: 0, marginBottom: 0 }]}>
              Featured Products
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductBrowse')}>
              <Text style={[styles.seeAll, { color: iconColor }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading && featuredProducts.length === 0 ? (
            <ActivityIndicator color={iconColor} style={{ marginVertical: 24 }} />
          ) : error && featuredProducts.length === 0 ? (
            <Text style={[styles.emptyHint, { color: theme.colors.text.secondary }]}>{error}</Text>
          ) : featuredProducts.length === 0 ? (
            <Text style={[styles.emptyHint, { color: theme.colors.text.secondary }]}>
              No approved products in the catalog yet.
            </Text>
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.actionCard} onPress={() => navigation.navigate('OrdersTab')}>
              <AppIcon name="orders" size={28} color={iconColor} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>My Orders</Text>
            </Card>
            <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.actionCard} onPress={() => navigation.navigate('CartTab')}>
              <AppIcon name="cart" size={28} color={iconColor} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>Cart</Text>
            </Card>
            <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.actionCard} onPress={() => navigation.navigate('Analytics')}>
              <AppIcon name="analytics" size={28} color={iconColor} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>Analytics</Text>
            </Card>
            <Card
              variant={theme.isDarkMode ? 'glass' : 'default'}
              style={styles.actionCard}
              onPress={() => navigation.navigate('TrackOrder')}
            >
              <AppIcon name="track" size={28} color={iconColor} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>Track Order</Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
    zIndex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchBarCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchPlaceholder: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryPillWrapper: {
    marginRight: 0,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  productsList: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: 140,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  productImage: {
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  actionCard: {
    width: '47%',
    margin: '1.5%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyHint: {
    paddingHorizontal: 20,
    fontSize: 14,
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

export default HomeScreen;
