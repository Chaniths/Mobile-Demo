import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';

import DashboardScreen from '../screens/seller/DashboardScreen';
import ProductsScreen from '../screens/seller/ProductsScreen';
<<<<<<< HEAD
import AddProductScreen from '../screens/seller/AddProductScreen';
import EditProductScreen from '../screens/seller/EditProductScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';

// Extra screens (stack screens, not tabs)
// import EditProductScreen from '../screens/seller/EditProductScreen';
// import InventoryScreen from '../screens/seller/InventoryScreen';
// import EarningsScreen from '../screens/seller/EarningsScreen';
// import OrderDetailScreen from '../screens/seller/OrderDetailScreen';

// ── Placeholder screens (remove once real screens exist) ──────────────────────
import { View } from 'react-native';
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 16 }}>{route.name} — Coming soon</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Bottom tab navigator ───────────────────────────────────────────────────────

=======
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

>>>>>>> c75df1e3d71a01e29e1da79f35c6a98420225705
const SellerTabs = () => {
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
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏪</Text>,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
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

// ── Root stack (tabs + extra screens) ─────────────────────────────────────────

const SellerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tabs */}
      <Stack.Screen name="SellerTabs" component={SellerTabs} />

      {/* Stack screens — swap PlaceholderScreen with real screens when ready */}
      <Stack.Screen name="AddProduct"   component={AddProductScreen} />
      <Stack.Screen name="EditProduct"  component={EditProductScreen} />
      <Stack.Screen name="Inventory"    component={PlaceholderScreen} />
      <Stack.Screen name="Earnings"     component={PlaceholderScreen} />
      <Stack.Screen name="OrderDetail"  component={PlaceholderScreen} />
      <Stack.Screen name="Notifications" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

export default SellerNavigator;