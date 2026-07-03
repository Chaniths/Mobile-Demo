import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ICONS = {
  home: { family: 'ionicons', outline: 'home-outline', filled: 'home' },
  search: { family: 'ionicons', outline: 'search-outline', filled: 'search' },
  cart: { family: 'ionicons', outline: 'cart-outline', filled: 'cart' },
  orders: { family: 'ionicons', outline: 'cube-outline', filled: 'cube' },
  profile: { family: 'ionicons', outline: 'person-outline', filled: 'person' },
  map: { family: 'ionicons', outline: 'map-outline', filled: 'map' },
  chart: { family: 'ionicons', outline: 'bar-chart-outline', filled: 'bar-chart' },
  store: { family: 'ionicons', outline: 'storefront-outline', filled: 'storefront' },
  truck: { family: 'ionicons', outline: 'car-outline', filled: 'car' },
  check: { family: 'ionicons', outline: 'checkmark-circle-outline', filled: 'checkmark-circle' },
  close: { family: 'ionicons', outline: 'close-circle-outline', filled: 'close-circle' },
  warning: { family: 'ionicons', outline: 'warning-outline', filled: 'warning' },
  cash: { family: 'ionicons', outline: 'cash-outline', filled: 'cash' },
  clipboard: { family: 'ionicons', outline: 'clipboard-outline', filled: 'clipboard' },
  add: { family: 'ionicons', outline: 'add-circle-outline', filled: 'add-circle' },
  star: { family: 'ionicons', outline: 'star', filled: 'star' },
  location: { family: 'ionicons', outline: 'location-outline', filled: 'location' },
  notifications: { family: 'ionicons', outline: 'notifications-outline', filled: 'notifications' },
  help: { family: 'ionicons', outline: 'help-circle-outline', filled: 'help-circle' },
  document: { family: 'ionicons', outline: 'document-text-outline', filled: 'document-text' },
  card: { family: 'ionicons', outline: 'card-outline', filled: 'card' },
  heart: { family: 'ionicons', outline: 'heart-outline', filled: 'heart' },
  moon: { family: 'ionicons', outline: 'moon-outline', filled: 'moon' },
  sun: { family: 'ionicons', outline: 'sunny-outline', filled: 'sunny' },
  time: { family: 'ionicons', outline: 'time-outline', filled: 'time' },
  eye: { family: 'ionicons', outline: 'eye-outline', filled: 'eye' },
  eyeOff: { family: 'ionicons', outline: 'eye-off-outline', filled: 'eye-off' },
  buyer: { family: 'ionicons', outline: 'cart-outline', filled: 'cart' },
  seller: { family: 'ionicons', outline: 'storefront-outline', filled: 'storefront' },
  driver: { family: 'ionicons', outline: 'car-outline', filled: 'car' },
  fieldadmin: { family: 'ionicons', outline: 'clipboard-outline', filled: 'clipboard' },
  analytics: { family: 'ionicons', outline: 'analytics-outline', filled: 'analytics' },
  track: { family: 'ionicons', outline: 'navigate-outline', filled: 'navigate' },
  'food-apple': { family: 'material', outline: 'food-apple-outline', filled: 'food-apple' },
  'food-leaf': { family: 'material', outline: 'leaf', filled: 'leaf' },
  'food-dairy': { family: 'material', outline: 'cup-outline', filled: 'cup' },
  'food-grain': { family: 'material', outline: 'barley', filled: 'barley' },
  'food-honey': { family: 'material', outline: 'bee-flower', filled: 'bee-flower' },
  'food-banana': { family: 'material', outline: 'fruit-grapes', filled: 'fruit-grapes' },
  'food-carrot': { family: 'material', outline: 'carrot', filled: 'carrot' },
  'food-egg': { family: 'material', outline: 'egg-outline', filled: 'egg' },
  'food-rice': { family: 'material', outline: 'rice', filled: 'rice' },
  'food-sugar': { family: 'material', outline: 'candy', filled: 'candy' },
  'food-tomato': { family: 'material', outline: 'food-variant', filled: 'food-variant' },
};

const EMOJI_MAP = {
  '🏠': 'home',
  '🔍': 'search',
  '🛒': 'cart',
  '📦': 'orders',
  '👤': 'profile',
  '🗺️': 'map',
  '📊': 'chart',
  '🏪': 'store',
  '🚚': 'truck',
  '✅': 'check',
  '✓': 'check',
  '❌': 'close',
  '⚠️': 'warning',
  '💰': 'cash',
  '📋': 'clipboard',
  '➕': 'add',
  '⭐': 'star',
  '📍': 'location',
  '🔔': 'notifications',
  '❓': 'help',
  '📄': 'document',
  '💳': 'card',
  '❤️': 'heart',
  '🌙': 'moon',
  '☀️': 'sun',
  '⏰': 'time',
  '👁️': 'eye',
  '👁️‍🗨️': 'eyeOff',
  '🍎': 'food-apple',
  '🥬': 'food-leaf',
  '🥛': 'food-dairy',
  '🌾': 'food-grain',
  '🍯': 'food-honey',
  '🍌': 'food-banana',
  '🥕': 'food-carrot',
  '🥚': 'food-egg',
  '🍚': 'food-rice',
  '🍬': 'food-sugar',
  '🍅': 'food-tomato',
};

function resolveIconName(name) {
  if (!name) return null;
  if (ICONS[name]) return name;
  if (EMOJI_MAP[name]) return EMOJI_MAP[name];
  return null;
}

function renderIcon(config, iconName, size, color, style) {
  if (config.family === 'material') {
    return (
      <MaterialCommunityIcons name={iconName} size={size} color={color} style={style} />
    );
  }
  return <Ionicons name={iconName} size={size} color={color} style={style} />;
}

const AppIcon = ({ name, size = 24, color = '#000', focused = false, style }) => {
  const resolvedName = resolveIconName(name);
  const config = resolvedName ? ICONS[resolvedName] : null;
  if (!config) return null;

  const iconName = focused && config.filled ? config.filled : config.outline;
  return renderIcon(config, iconName, size, color, style);
};

export const TabBarIcon = ({ name, color, focused, size = 24 }) => (
  <AppIcon name={name} size={size} color={color} focused={focused} />
);

export default AppIcon;
