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
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'grains', name: 'Grains', icon: '🌾' },
];

const featuredProducts = [
  { id: '1', name: 'Organic Apples', price: '$4.99', image: '🍎', rating: 4.8 },
  { id: '2', name: 'Fresh Spinach', price: '$2.99', image: '🥬', rating: 4.6 },
  { id: '3', name: 'Raw Honey', price: '$8.99', image: '🍯', rating: 4.9 },
  { id: '4', name: 'Organic Bananas', price: '$3.99', image: '🍌', rating: 4.7 },
  { id: '5', name: 'Fresh Carrots', price: '$2.99', image: '🥕', rating: 4.5 },
  { id: '6', name: 'Organic Milk', price: '$5.99', image: '🥛', rating: 4.8 },
  { id: '7', name: 'Organic Eggs', price: '$1.99', image: '🥚', rating: 4.6 },
  { id: '8', name: 'Organic Wheat', price: '$4.99', image: '🌾', rating: 4.9 },
  { id: '9', name: 'Organic Rice', price: '$3.99', image: '🍚', rating: 4.7 },
  { id: '10', name: 'Organic Sugar', price: '$2.99', image: '🍬', rating: 4.5 },
];

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductBrowse', { category: item.id })}
      style={styles.categoryPillWrapper}
    >
      <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.categoryPill}>
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
      <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.productCard}>
        <View style={[styles.productImage, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
          <Text style={styles.productEmoji}>{item.image}</Text>
        </View>
        <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
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
      {theme.isDarkMode && (
        <>
          <View style={styles.gradientCircle1} />
          <View style={styles.gradientCircle2} />
        </>
      )}
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
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.searchBarCard}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('ProductBrowse')}
          >
          <Text style={styles.searchIcon}>🔍</Text>
            <Text style={[styles.searchPlaceholder, { color: theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary }]}>
              Search for organic products...
            </Text>
          </TouchableOpacity>
        </Card>

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
              <Text style={[styles.seeAll, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
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
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.actionCard} onPress={() => navigation.navigate('OrdersTab')}>
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                My Orders
              </Text>
            </Card>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.actionCard} onPress={() => navigation.navigate('CartTab')}>
              <Text style={styles.actionIcon}>🛒</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Cart
              </Text>
            </Card>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.actionCard} onPress={() => navigation.navigate('Analytics')}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Analytics
              </Text>
            </Card>
            <Card
              variant={theme.isDarkMode ? "glass" : "default"}
              style={styles.actionCard}
              onPress={() => navigation.navigate('TrackOrder')}
            >
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
  gradientCircle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    opacity: 0.6,
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
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
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

