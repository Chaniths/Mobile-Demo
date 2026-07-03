import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { TabBarIcon } from '../components/common/AppIcon';

// Seller Screens
import DashboardScreen from '../screens/seller/DashboardScreen';
import ProductsScreen from '../screens/seller/ProductsScreen';
import AddProductScreen from '../screens/seller/AddProductScreen';
import EditProductScreen from '../screens/seller/EditProductScreen';
import ProductCatalogScreen from '../screens/seller/ProductCatalogScreen';
import TruckTrackingScreen from '../screens/seller/TruckTrackingScreen';
import OrderDetailScreen from '../screens/seller/OrderDetailScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen'; // Reuse
import ProfileScreen from '../screens/buyer/ProfileScreen'; // Reuse

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SellerTabs = () => {
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
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="chart" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="store" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="orders" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const SellerNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SellerTabs" component={SellerTabs} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />
    <Stack.Screen name="EditProduct" component={EditProductScreen} />
    <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
    <Stack.Screen name="TruckTracking" component={TruckTrackingScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

export default SellerNavigator;
