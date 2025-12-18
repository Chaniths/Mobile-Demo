// Seller Products Data Structure
// This demonstrates how products with size variants are organized

// Available Product Catalog (templates that sellers can choose from)
export const PRODUCT_CATALOG = [
  {
    id: 'catalog-1',
    name: 'Organic Apples',
    image: '🍎',
    category: 'Fruits',
    description: 'Fresh organic apples from local farms',
  },
  {
    id: 'catalog-2',
    name: 'Fresh Spinach',
    image: '🥬',
    category: 'Leafy greens',
    description: 'Organic spinach bunches',
  },
  {
    id: 'catalog-3',
    name: 'Raw Honey',
    image: '🍯',
    category: 'Pantry',
    description: 'Pure raw honey from local beekeepers',
  },
  {
    id: 'catalog-4',
    name: 'Tomatoes',
    image: '🍅',
    category: 'Vegetables',
    description: 'Fresh organic tomatoes',
  },
  {
    id: 'catalog-5',
    name: 'Carrots',
    image: '🥕',
    category: 'Vegetables',
    description: 'Organic carrots',
  },
  {
    id: 'catalog-6',
    name: 'Bananas',
    image: '🍌',
    category: 'Fruits',
    description: 'Fresh organic bananas',
  },
  {
    id: 'catalog-7',
    name: 'Organic Milk',
    image: '🥛',
    category: 'Dairy',
    description: 'Fresh organic milk',
  },
  {
    id: 'catalog-8',
    name: 'Organic Eggs',
    image: '🥚',
    category: 'Dairy',
    description: 'Farm fresh organic eggs',
  },
];

// Seller's Selected Products with Size Variants
// Each product can have multiple sizes (small, medium, large)
// Each size variant has its own price, stock, and pickup location
export const SELLER_PRODUCTS = [
  {
    // Product Type ID (references catalog)
    catalogId: 'catalog-1',
    productTypeName: 'Organic Apples',
    productTypeImage: '🍎',
    productTypeCategory: 'Fruits',
    // Size variants for this product
    sizeVariants: [
      {
        id: 'variant-1-1',
        size: 'small',
        price: 4.49,
        stock: 25, // in kg
        pickupLocation: {
          address: '24/B, Green Valley Apartments',
          coordinates: { latitude: 6.9155, longitude: 79.857 },
        },
        status: 'active',
      },
      {
        id: 'variant-1-2',
        size: 'medium',
        price: 4.99,
        stock: 45, // in kg
        pickupLocation: {
          address: '24/B, Green Valley Apartments',
          coordinates: { latitude: 6.9155, longitude: 79.857 },
        },
        status: 'active',
      },
      {
        id: 'variant-1-3',
        size: 'large',
        price: 5.49,
        stock: 30, // in kg
        pickupLocation: {
          address: '24/B, Green Valley Apartments',
          coordinates: { latitude: 6.9155, longitude: 79.857 },
        },
        status: 'active',
      },
    ],
  },
  {
    catalogId: 'catalog-2',
    productTypeName: 'Fresh Spinach',
    productTypeImage: '🥬',
    productTypeCategory: 'Leafy greens',
    sizeVariants: [
      {
        id: 'variant-2-1',
        size: 'small',
        price: 2.49,
        stock: 12, // in kg
        pickupLocation: {
          address: '24/B, Green Valley Apartments',
          coordinates: { latitude: 6.9155, longitude: 79.857 },
        },
        status: 'active',
      },
      {
        id: 'variant-2-2',
        size: 'medium',
        price: 2.99,
        stock: 18, // in kg
        pickupLocation: {
          address: '24/B, Green Valley Apartments',
          coordinates: { latitude: 6.9155, longitude: 79.857 },
        },
        status: 'low_stock',
      },
    ],
  },
  {
    catalogId: 'catalog-3',
    productTypeName: 'Raw Honey',
    productTypeImage: '🍯',
    productTypeCategory: 'Pantry',
    sizeVariants: [
      {
        id: 'variant-3-1',
        size: 'medium',
        price: 8.99,
        stock: 8, // in kg
        pickupLocation: {
          address: '24/B, Green Valley Apartments',
          coordinates: { latitude: 6.9155, longitude: 79.857 },
        },
        status: 'low_stock',
      },
    ],
  },
];

// Helper functions
export const getProductCatalog = () => PRODUCT_CATALOG;

export const getSellerProducts = () => SELLER_PRODUCTS;

export const getProductByCatalogId = (catalogId) => {
  return SELLER_PRODUCTS.find((p) => p.catalogId === catalogId);
};

export const isProductInCatalog = (catalogId) => {
  return SELLER_PRODUCTS.some((p) => p.catalogId === catalogId);
};

export const getTotalStockForProduct = (catalogId) => {
  const product = getProductByCatalogId(catalogId);
  if (!product) return 0;
  return product.sizeVariants.reduce((sum, variant) => sum + variant.stock, 0);
};

export const getProductStatus = (catalogId) => {
  const product = getProductByCatalogId(catalogId);
  if (!product) return 'not_added';
  
  const hasActiveVariants = product.sizeVariants.some((v) => v.status === 'active');
  const hasLowStock = product.sizeVariants.some((v) => v.status === 'low_stock');
  const allOutOfStock = product.sizeVariants.every((v) => v.status === 'out_of_stock');
  
  if (allOutOfStock) return 'out_of_stock';
  if (hasLowStock) return 'low_stock';
  if (hasActiveVariants) return 'active';
  return 'inactive';
};
