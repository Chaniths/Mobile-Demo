import React from 'react';
import { Text, View } from 'react-native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
} from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../hooks/useTheme';

import DashboardScreen from '../screens/seller/DashboardScreen';
import ProductsScreen from '../screens/seller/ProductsScreen';
import AddProductScreen from '../screens/seller/AddProductScreen';
import EditProductScreen from '../screens/seller/EditProductScreen';
// FIX: this was pointing at the buyer's Orders screen — swapped to the
// seller Orders screen so the seller's Orders tab actually shows seller data.
import OrdersScreen from '../screens/seller/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import InventoryScreen from '../screens/seller/InventoryScreen';

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

const PlaceholderScreen = ({ route }) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text style={{ fontSize: 16 }}>
      {route.name} — Coming soon
    </Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATORS
// ─────────────────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─────────────────────────────────────────────────────────────────────────────
// ICON MAP
// ─────────────────────────────────────────────────────────────────────────────
// Each tab maps to a filled/outline Ionicons pair so the icon can swap based
// on focus state, matching standard bottom-tab conventions.

const TAB_ICONS = {
  Dashboard: {
    focused: 'stats-chart',
    unfocused: 'stats-chart-outline',
  },
  Products: {
    focused: 'storefront',
    unfocused: 'storefront-outline',
  },
  Orders: {
    focused: 'cube',
    unfocused: 'cube-outline',
  },
  Profile: {
    focused: 'person-circle',
    unfocused: 'person-circle-outline',
  },
};

const TabIcon = ({ routeName, focused, color, size }) => {
  const iconSet = TAB_ICONS[routeName];
  const iconName = focused ? iconSet.focused : iconSet.unfocused;

  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SELLER TABS
// ─────────────────────────────────────────────────────────────────────────────

const SellerTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          theme.colors.primary.main,

        tabBarInactiveTintColor:
          theme.colors.text.tertiary,

        tabBarStyle: {
          backgroundColor:
            theme.colors.card,

          borderTopColor:
            theme.colors.border,

          borderTopWidth: 0,

          height: 60,

          paddingBottom: 8,
          paddingTop: 8,

          position: 'absolute',

          left: 16,
          right: 16,
          bottom: 16,

          borderRadius: 24,

          elevation: 8,

          shadowColor: '#000',

          shadowOpacity: 0.08,

          shadowOffset: {
            width: 0,
            height: 4,
          },

          shadowRadius: 12,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            routeName={route.name}
            focused={focused}
            color={color}
            size={size ?? 24}
          />
        ),
      })}
    >
      {/* ─────────────────────────────────────────────── */}
      {/* DASHBOARD */}
      {/* ─────────────────────────────────────────────── */}

      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* PRODUCTS */}
      {/* ─────────────────────────────────────────────── */}

      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Products',
        }}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* ORDERS */}
      {/* ─────────────────────────────────────────────── */}

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
        }}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* PROFILE */}
      {/* ─────────────────────────────────────────────── */}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SELLER NAVIGATOR
// ─────────────────────────────────────────────────────────────────────────────

const SellerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ─────────────────────────────────────────────── */}
      {/* MAIN SELLER TABS */}
      {/* ─────────────────────────────────────────────── */}

      <Stack.Screen
        name="SellerTabs"
        component={SellerTabs}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* PRODUCT SCREENS */}
      {/* ─────────────────────────────────────────────── */}

      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
      />

      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* INVENTORY */}
      {/* ─────────────────────────────────────────────── */}

      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* OTHER SELLER SCREENS */}
      {/* ─────────────────────────────────────────────── */}

      <Stack.Screen
        name="Earnings"
        component={PlaceholderScreen}
      />

      <Stack.Screen
        name="OrderDetail"
        component={PlaceholderScreen}
      />

      <Stack.Screen
        name="Notifications"
        component={PlaceholderScreen}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* TRACKING */}
      {/* ─────────────────────────────────────────────── */}

      <Stack.Screen
        name="Tracking"
        component={PlaceholderScreen}
      />
    </Stack.Navigator>
  );
};

export default SellerNavigator;