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
import AppIcon from '../../components/common/AppIcon';

const categories = [
  { id: 'fruits', name: 'Fruits', icon: 'food-apple' },
  { id: 'vegetables', name: 'Vegetables', icon: 'food-leaf' },
  { id: 'dairy', name: 'Dairy', icon: 'food-dairy' },
  { id: 'grains', name: 'Grains', icon: 'food-grain' },
];

const featuredProducts = [
  { id: '1', name: 'Organic Apples', price: '$4.99', image: 'food-apple', rating: 4.8 },
  { id: '2', name: 'Fresh Spinach', price: '$2.99', image: 'food-leaf', rating: 4.6 },
  { id: '3', name: 'Raw Honey', price: '$8.99', image: 'food-honey', rating: 4.9 },
  { id: '4', name: 'Organic Bananas', price: '$3.99', image: 'food-banana', rating: 4.7 },
  { id: '5', name: 'Fresh Carrots', price: '$2.99', image: 'food-carrot', rating: 4.5 },
  { id: '6', name: 'Organic Milk', price: '$5.99', image: 'food-dairy', rating: 4.8 },
  { id: '7', name: 'Organic Eggs', price: '$1.99', image: 'food-egg', rating: 4.6 },
  { id: '8', name: 'Organic Wheat', price: '$4.99', image: 'food-grain', rating: 4.9 },
  { id: '9', name: 'Organic Rice', price: '$3.99', image: 'food-rice', rating: 4.7 },
  { id: '10', name: 'Organic Sugar', price: '$2.99', image: 'food-sugar', rating: 4.5 },
];

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductBrowse', { category: item.id })}
      style={styles.categoryPillWrapper}
    >
      <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.categoryPill}>
        <AppIcon name={item.icon} size={28} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
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
          <AppIcon name={item.image} size={36} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
        </View>
        <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
            {item.price}
          </Text>
          <View style={styles.rating}>
            <AppIcon name="star" size={13} color="#f59e0b" />
            <Text style={styles.ratingText}> {item.rating}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <AppIcon name="search" size={20} color={theme.colors.text.tertiary} />
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
              <AppIcon name="orders" size={28} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                My Orders
              </Text>
            </Card>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.actionCard} onPress={() => navigation.navigate('CartTab')}>
              <AppIcon name="cart" size={28} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Cart
              </Text>
            </Card>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.actionCard} onPress={() => navigation.navigate('Analytics')}>
              <AppIcon name="analytics" size={28} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Analytics
              </Text>
            </Card>
            <Card
              variant={theme.isDarkMode ? "glass" : "default"}
              style={styles.actionCard}
              onPress={() => navigation.navigate('TrackOrder')}
            >
              <AppIcon name="track" size={28} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
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

export default HomeScreen;

