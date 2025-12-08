// Application constants

export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  DRIVER: 'driver',
  FIELD_ADMIN: 'fieldadmin',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PRODUCT_CATEGORIES = {
  FRUITS: 'fruits',
  VEGETABLES: 'vegetables',
  DAIRY: 'dairy',
  GRAINS: 'grains',
  HERBS: 'herbs',
  OTHERS: 'others',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME_PREFERENCE: '@theme_preference',
  LANGUAGE: '@language',
};

export const NOTIFICATION_TYPES = {
  ORDER_UPDATE: 'order_update',
  DELIVERY_UPDATE: 'delivery_update',
  PAYMENT_UPDATE: 'payment_update',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
};

export default {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRODUCT_CATEGORIES,
  STORAGE_KEYS,
  NOTIFICATION_TYPES,
};

