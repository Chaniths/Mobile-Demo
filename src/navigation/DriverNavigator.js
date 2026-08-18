import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { TabBarIcon } from '../components/common/AppIcon';

import HomeScreen from '../screens/driver/HomeScreen';
import RouteScreen from '../screens/driver/RouteScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen'; // Reuse for deliveries tab
import ProfileScreen from '../screens/buyer/ProfileScreen'; // Reuse
import DeliveryDetailScreen from '../screens/driver/DeliveryDetailScreen';
import AllDeliveriesScreen from '../screens/driver/AllDeliveriesScreen';
import ReportIssueScreen from '../screens/driver/ReportIssueScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
    <Stack.Screen name="AllDeliveries" component={AllDeliveriesScreen} />
    <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
  </Stack.Navigator>
);

const DriverTabs = () => {
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
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Route"
        component={RouteScreen}
        options={{
          tabBarLabel: 'Route',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Deliveries"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Deliveries',
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

const DriverNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="DriverTabs" component={DriverTabs} />
    <RootStack.Screen name="Notifications" component={NotificationsScreen} />
  </RootStack.Navigator>
);

export default DriverNavigator;
