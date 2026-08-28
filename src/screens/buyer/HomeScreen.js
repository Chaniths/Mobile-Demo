import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useEffect, useState } from 'react';
import api from '../../api/client';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import NotificationBell from '../../components/NotificationBell';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const categories = [
  { id: 'fruits', name: 'Fruits', iconSet: 'mci', icon: 'food-apple-outline' },
  { id: 'vegetables', name: 'Vegetables', iconSet: 'mci', icon: 'carrot' },
  { id: 'dairy', name: 'Dairy', iconSet: 'mci', icon: 'cup-outline' },
  { id: 'grains', name: 'Grains', iconSet: 'mci', icon: 'barley' },
];

// ── FIX 1: proper image URL builder using axios baseURL ───────────────────────
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl; // already absolute
  const serverBase = (api.defaults.baseURL || '')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/api\/?$/, '');
  const cleanPath = imageUrl.replace(/^\/+/, '');
  return `${serverBase}/${cleanPath}`;
};

const CategoryIcon = ({ item, color }) => {
  if (item.iconSet === 'mci') {
    return <MaterialCommunityIcons name={item.icon} size={18} color={color} />;
  }
  return <Ionicons name={item.icon} size={18} color={color} />;
};

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductBrowse', { category: item.id })}
      style={styles.categoryPillWrapper}
    >
      <View style={[styles.categoryPill, { backgroundColor: theme.colors.card }]}>
        <CategoryIcon item={item} color={theme.colors.text.primary} />
        <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => {
  const imageUri = buildImageUrl(item.imageUrl);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ProductDetail', { productId: item.id })
      }
    >
      <Card style={styles.productCard}>
        {/* Product Image */}
        <View
          style={[
            styles.productImage,
            { backgroundColor: theme.colors.primary.light },
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.productImageImg}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="cart-outline"
              size={40}
              color={theme.colors.primary.main}
            />
          )}
        </View>

        {/* Product Name */}
        <Text
          style={[
            styles.productName,
            { color: theme.colors.text.primary },
          ]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </Card>
    </TouchableOpacity>
  );
};

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const loadFeatured = async () => {
    try {
      setLoadingProducts(true);
      const res = await api.get('/products/approved');
      let products = [];
      if (Array.isArray(res.data)) products = res.data;
      else if (Array.isArray(res.data.products)) products = res.data.products;
      else if (Array.isArray(res.data.data)) products = res.data.data;
      setFeaturedProducts(products.slice(0, 50));
    } catch (err) {
      console.error('Error loading featured products', err?.response?.data || err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadFeatured();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
              Good Morning
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              John Doe
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar name="John Doe" size="medium" source={null} style={null} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('ProductBrowse')}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.text.tertiary}
            style={styles.searchIcon}
          />
          <Text style={[styles.searchPlaceholder, { color: theme.colors.text.tertiary }]}>
            Search for organic products...
          </Text>
        </TouchableOpacity>

        {/* Categories */}
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

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Featured Products
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductBrowse')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary.main }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {loadingProducts ? (
            <View style={{ padding: 20 }}>
              <Text style={{ color: theme.colors.text.secondary }}>Loading featured products...</Text>
            </View>
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('OrdersTab')}>
              <Ionicons
                name="cube-outline"
                size={32}
                color={theme.colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                My Orders
              </Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('CartTab')}>
              <Ionicons
                name="cart-outline"
                size={32}
                color={theme.colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Cart
              </Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Analytics')}>
              <Ionicons
                name="stats-chart-outline"
                size={32}
                color={theme.colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Analytics
              </Text>
            </Card>
            {/* ✅ FIX: Track Order now targets the TrackOrder screen nested
                inside OrdersStack (via the OrdersTab), instead of relying
                on the old root-level duplicate. Keeps the tab bar/back
                stack behavior consistent with the Orders tab. */}
            <Card
              style={styles.actionCard}
              onPress={() => navigation.navigate('OrdersTab', { screen: 'TrackOrder' })}
            >
              <Ionicons
                name="location-outline"
                size={32}
                color={theme.colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Track Order
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 14, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 24, padding: 16, borderRadius: 12 },
  searchIcon: { marginRight: 12 },
  searchPlaceholder: { fontSize: 15 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', paddingHorizontal: 20, marginBottom: 16 },
  seeAll: { fontSize: 14, fontWeight: '600' },
  categoriesList: { paddingHorizontal: 16 },
  categoryName: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  categoryPillWrapper: { marginRight: 8 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  productsList: { paddingHorizontal: 16 },
  productCard: {
  width: 160,
  height: 190,
  marginHorizontal: 6,
  marginBottom: 16,
  overflow: 'hidden',
},

productImage: {
  height: 130,
  width: '100%',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 0,
  marginBottom: 10,
  overflow: 'hidden',
},

productImageImg: {
  width: '100%',
  height: '100%',
  borderRadius: 8,
},

productName: {
  fontSize: 14,
  fontWeight: '600',
  marginHorizontal: 4,
  textAlign: 'center',
},
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '700' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  actionCard: { width: '47%', margin: '1.5%', alignItems: 'center', paddingVertical: 20 },
  actionIcon: { marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '600' },
});

export default HomeScreen;