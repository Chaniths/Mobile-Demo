import config from './config';

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  if (error?.message) return error.message;
  return fallback;
};

export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = String(config.apiOrigin || '').replace(/\/$/, '');
  const relative = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${relative}`;
};

export const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Rs. 0.00';
  return `Rs. ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const categoryIcon = (category) => {
  const value = String(category || '').toLowerCase();
  if (value.includes('fruit')) return 'food-apple';
  if (value.includes('veg')) return 'food-leaf';
  if (value.includes('dairy') || value.includes('milk')) return 'food-dairy';
  if (value.includes('grain') || value.includes('rice') || value.includes('wheat')) return 'food-grain';
  if (value.includes('honey')) return 'food-honey';
  if (value.includes('egg')) return 'food-egg';
  if (value.includes('bakery') || value.includes('bread')) return 'food-grain';
  return 'store';
};

export const matchesCategory = (productCategory, selectedCategory) => {
  if (!selectedCategory || selectedCategory === 'all') return true;
  const product = String(productCategory || '').toLowerCase();
  const selected = String(selectedCategory).toLowerCase();
  return product === selected || product.includes(selected) || selected.includes(product);
};

export const mapOrderTab = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'DELIVERED') return 'delivered';
  if (value === 'IN_TRANSIT') return 'in_transit';
  if (value === 'CANCELLED' || value === 'FAILED' || value === 'PAYMENT_FAILED') return 'cancelled';
  return 'processing';
};

export const orderStatusLabel = (status) => {
  const tab = mapOrderTab(status);
  const labels = {
    delivered: 'Delivered',
    in_transit: 'In Transit',
    processing: 'Processing',
    cancelled: 'Cancelled',
  };
  return labels[tab] || status;
};

export const timelineIndexForStatus = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'DELIVERED') return 4;
  if (value === 'IN_TRANSIT') return 3;
  if (value === 'ASSIGNED') return 2;
  if (value === 'BATCHED' || value === 'PAID') return 1;
  return 0;
};
