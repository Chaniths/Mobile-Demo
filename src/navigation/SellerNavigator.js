import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';

import DashboardScreen from '../screens/seller/DashboardScreen';
import ProductsScreen from '../screens/seller/ProductsScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

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
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text> }}
      />
      <Tab.Screen name="Products" component={ProductsScreen}
        options={{ tabBarLabel: 'Products', tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏪</Text> }}
      />
      <Tab.Screen name="Orders" component={OrdersScreen}
        options={{ tabBarLabel: 'Orders', tabBarIcon: () => <Text style={{ fontSize: 24 }}>📦</Text> }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
};

const SellerNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="SellerTabs" component={SellerTabs} />
    <RootStack.Screen name="Notifications" component={NotificationsScreen} />
  </RootStack.Navigator>
);

export default SellerNavigator;