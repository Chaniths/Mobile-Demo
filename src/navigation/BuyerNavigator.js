import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="ProductBrowse" component={ProductBrowseScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
  </Stack.Navigator>
);

const BrowseStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductBrowse" component={ProductBrowseScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

const BuyerTabs = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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
          height: 55 + insets.bottom,
          paddingBottom: 0 + insets.bottom,
          paddingTop: 8,
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 0,
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
        component={OrdersScreen}
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

const BuyerNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={BuyerTabs} />
    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
  </Stack.Navigator>
);

export default BuyerNavigator;

