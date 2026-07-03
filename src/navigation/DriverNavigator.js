import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';

import HomeScreen from '../screens/driver/HomeScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import RouteScreen from '../screens/driver/RouteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

const DriverTabs = () => {
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
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text> }}
      />
      <Tab.Screen name="Route" component={RouteScreen}
        options={{ tabBarLabel: 'Route', tabBarIcon: () => <Text style={{ fontSize: 24 }}>🗺️</Text> }}
      />
      <Tab.Screen name="Deliveries" component={OrdersScreen}
        options={{ tabBarLabel: 'Deliveries', tabBarIcon: () => <Text style={{ fontSize: 24 }}>📦</Text> }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
};

const DriverNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="DriverTabs" component={DriverTabs} />
    <RootStack.Screen name="Notifications" component={NotificationsScreen} />
  </RootStack.Navigator>
);

export default DriverNavigator;