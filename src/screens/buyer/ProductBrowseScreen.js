import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

const mockProducts = [
  { id: '1', name: 'Organic Apples', price: '$4.99', image: '🍎', rating: 4.8, category: 'fruits' },
  { id: '2', name: 'Fresh Spinach', price: '$2.99', image: '🥬', rating: 4.6, category: 'vegetables' },
  { id: '3', name: 'Bananas', price: '$3.49', image: '🍌', rating: 4.7, category: 'fruits' },
  { id: '4', name: 'Carrots', price: '$2.49', image: '🥕', rating: 4.5, category: 'vegetables' },
  { id: '5', name: 'Raw Honey', price: '$8.99', image: '🍯', rating: 4.9, category: 'dairy' },
  { id: '6', name: 'Tomatoes', price: '$3.99', image: '🍅', rating: 4.8, category: 'vegetables' },
  { id: '7', name: 'Organic Milk', price: '$5.99', image: '🥛', rating: 4.8, category: 'dairy' },
  { id: '8', name: 'Organic Eggs', price: '$1.99', image: '🥚', rating: 4.6, category: 'dairy' },
  { id: '9', name: 'Organic Wheat', price: '$4.99', image: '🌾', rating: 4.9, category: 'grains' },
  { id: '10', name: 'Organic Rice', price: '$3.99', image: '🍚', rating: 4.7, category: 'grains' },
  { id: '11', name: 'Organic Sugar', price: '$2.99', image: '🍬', rating: 4.5, category: 'sugar' },
];

const ProductBrowseScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || 'all');

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderProduct = ({ item }) => (
    <Card
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={[styles.productImage, { backgroundColor: theme.colors.primary.light }]}>
        <Text style={styles.productEmoji}>{item.image}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: theme.colors.primary.main }]}>
            {item.price}
          </Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary.main }]}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary.main }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Search products..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No products found"
            message="Try adjusting your search or filters"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  cartIcon: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 20,
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
  },
  productEmoji: {
    fontSize: 36,
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
  emptyIcon: {
    fontSize: 64,
  },
});

export default ProductBrowseScreen;

