import React, { useState } from 'react';
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

const mockProducts = [
  { id: '1', name: 'Organic Apples', price: 4.99, stock: 45, image: '🍎', status: 'active' },
  { id: '2', name: 'Fresh Spinach', price: 2.99, stock: 12, image: '🥬', status: 'active' },
  { id: '3', name: 'Raw Honey', price: 8.99, stock: 8, image: '🍯', status: 'low_stock' },
  { id: '4', name: 'Tomatoes', price: 3.99, stock: 0, image: '🍅', status: 'out_of_stock' },
];

const ProductsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [products] = useState(mockProducts);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'low_stock':
        return theme.colors.warning;
      case 'out_of_stock':
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  const renderProduct = ({ item }) => (
    <Card style={styles.productCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
        style={styles.productContent}
      >
        <View style={[styles.productImage, { backgroundColor: theme.colors.primary.light }]}>
          <Text style={styles.productEmoji}>{item.image}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.productPrice, { color: theme.colors.primary.main }]}>
            ${item.price.toFixed(2)}
          </Text>
          <View style={styles.productMeta}>
            <Text style={[styles.stockText, { color: theme.colors.text.secondary }]}>
              Stock: {item.stock}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(item.status)}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.arrow, { color: theme.colors.text.tertiary }]}>→</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
          <Text style={[styles.addButton, { color: theme.colors.primary.main }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📦</Text>}
            title="No products yet"
            message="Start by adding your first product"
            actionLabel="Add Product"
            onAction={() => navigation.navigate('AddProduct')}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
  },
  productCard: {
    marginBottom: 12,
    padding: 0,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 13,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  emptyIcon: {
    fontSize: 64,
  },
});

export default ProductsScreen;

