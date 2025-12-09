import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';

const categories = [
  { id: '1', name: 'Fruits', icon: '🍎' },
  { id: '2', name: 'Vegetables', icon: '🥬' },
  { id: '3', name: 'Dairy', icon: '🥛' },
  { id: '4', name: 'Grains', icon: '🌾' },
];

const featuredProducts = [
  { id: '1', name: 'Organic Apples', price: '$4.99', image: '🍎', rating: 4.8 },
  { id: '2', name: 'Fresh Spinach', price: '$2.99', image: '🥬', rating: 4.6 },
  { id: '3', name: 'Raw Honey', price: '$8.99', image: '🍯', rating: 4.9 },
];

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductBrowse', { category: item.id })}
    >
      <Card style={styles.categoryCard}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
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
      <Card style={styles.productCard}>
        <View style={[styles.productImage, { backgroundColor: theme.colors.primary.light }]}>
          <Text style={styles.productEmoji}>{item.image}</Text>
        </View>
        <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: theme.colors.primary.main }]}>
            {item.price}
          </Text>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

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
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar name="John Doe" size="medium" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('ProductBrowse')}
        >
          <Text style={styles.searchIcon}>🔍</Text>
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
          <FlatList
            data={featuredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                My Orders
              </Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Cart')}>
              <Text style={styles.actionIcon}>🛒</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Cart
              </Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Analytics')}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Analytics
              </Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('TrackOrder')}>
              <Text style={styles.actionIcon}>📍</Text>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
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
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: 140,
    marginHorizontal: 4,
  },
  productImage: {
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 48,
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
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HomeScreen;

