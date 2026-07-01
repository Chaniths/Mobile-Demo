import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';

// Buyer Screens
import HomeScreen from '../screens/buyer/HomeScreen';
import ProductBrowseScreen from '../screens/buyer/ProductBrowseScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import CartScreen from '../screens/buyer/CartScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';
import AnalyticsScreen from '../screens/buyer/AnalyticsScreen';
import TrackOrderScreen from '../screens/buyer/TrackOrderScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';

// TODO: create this screen — shows order number + success message after placing order
// import OrderConfirmationScreen from '../screens/buyer/OrderConfirmationScreen';

import { View } from 'react-native';
const OrderConfirmationScreen = ({ route, navigation }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
    <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
      Order Placed!
    </Text>
    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
      {route.params?.orderNumber}
    </Text>
    <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
      Total: Rs. {route.params?.total?.toFixed(2)}
    </Text>
    <Text
      style={{ fontSize: 15, fontWeight: '600', color: '#22c55e' }}
      onPress={() => navigation.navigate('OrdersTab')}
    >
      View My Orders →
    </Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Home stack ─────────────────────────────────────────────────────────────────

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home"          component={HomeScreen} />
    <Stack.Screen name="ProductBrowse" component={ProductBrowseScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Analytics"     component={AnalyticsScreen} />
  </Stack.Navigator>
);

// ── Browse stack ───────────────────────────────────────────────────────────────

const BrowseStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductBrowse" component={ProductBrowseScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

// ── Cart stack ─────────────────────────────────────────────────────────────────

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Cart"                component={CartScreen} />
    <Stack.Screen name="Checkout"            component={CheckoutScreen} />
    <Stack.Screen name="OrderConfirmation"   component={OrderConfirmationScreen} />
  </Stack.Navigator>
);

// ── Orders stack ───────────────────────────────────────────────────────────────
// Wrapped in a stack so TrackOrder can be pushed on top

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Orders"     component={OrdersScreen} />
    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
  </Stack.Navigator>
);

// ── Bottom tabs ────────────────────────────────────────────────────────────────

const BuyerTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
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
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={BrowseStack}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          tabBarLabel: 'My Orders',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// ── Root navigator ─────────────────────────────────────────────────────────────

const BuyerNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={BuyerTabs} />
  </Stack.Navigator>
);

export default BuyerNavigator;