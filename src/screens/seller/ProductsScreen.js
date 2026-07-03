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
import AppIcon from '../../components/common/AppIcon';
import { SELLER_PRODUCTS, getProductStatus, getTotalStockForProduct } from '../../utils/sellerProducts';

const ProductsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [products] = useState(SELLER_PRODUCTS);

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

  const getSizeLabel = (size) => {
    return size.charAt(0).toUpperCase() + size.slice(1);
  };

  const renderProduct = ({ item }) => {
    const productStatus = getProductStatus(item.catalogId);
    const totalStock = getTotalStockForProduct(item.catalogId);
    const sizeCount = item.sizeVariants.length;

    return (
      <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.productCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProduct', { 
            catalogId: item.catalogId,
            productName: item.productTypeName,
            productCategory: item.productTypeCategory,
          })}
          style={styles.productContent}
        >
          <View style={[styles.productImage, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
            <AppIcon name={item.productTypeImage} size={36} color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main} />
          </View>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
              {item.productTypeName}
            </Text>
            <Text style={[styles.productCategory, { color: theme.colors.text.secondary }]}>
              {item.productTypeCategory}
            </Text>
            
            {/* Size Variants Info */}
            <View style={styles.sizeVariantsContainer}>
              <Text style={[styles.sizeVariantsLabel, { color: theme.colors.text.secondary }]}>
                Sizes: {item.sizeVariants.map(v => getSizeLabel(v.size)).join(', ')}
              </Text>
              <Text style={[styles.sizeVariantsPrice, { color: theme.colors.text.tertiary }]}>
                ${item.sizeVariants[0]?.price?.toFixed(2)} - ${item.sizeVariants[item.sizeVariants.length - 1]?.price?.toFixed(2)}
              </Text>
            </View>

            <View style={styles.productMeta}>
              <Text style={[styles.stockText, { color: theme.colors.text.secondary }]}>
                Total Stock: {totalStock} kg ({sizeCount} {sizeCount === 1 ? 'size' : 'sizes'})
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(productStatus)}20` },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(productStatus) }]}>
                  {getStatusLabel(productStatus)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.arrow, { color: theme.colors.text.tertiary }]}>→</Text>
        </TouchableOpacity>
      </Card>
    );
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
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Products</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ProductCatalog')}
            style={styles.headerButton}
          >
            <Text style={[styles.addButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
              + Add from catalog
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
            <Text style={[styles.requestButton, { color: theme.colors.accent.blue }]}>
              Request new
            </Text>
          </TouchableOpacity>
        </View>
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
            icon={<AppIcon name="orders" size={64} color={theme.colors.text.tertiary} />}
            title="No products yet"
            message="Browse the catalog to add products, or request a new product type"
            actionLabel="Browse Catalog"
            onAction={() => navigation.navigate('ProductCatalog')}
          />
        }
      />
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
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    flex: 1,
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    zIndex: 1,
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
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 13,
    marginBottom: 2,
  },
  sizeVariantsContainer: {
    marginTop: 4,
    marginBottom: 6,
  },
  sizeVariantsLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  sizeVariantsPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
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

export default ProductsScreen;

