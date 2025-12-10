import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

// Driver Screens
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

const DriverNavigator = () => {
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
        name="Route"
        component={RouteScreen}
        options={{
          tabBarLabel: 'Route',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="Deliveries"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Deliveries',
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

export default DriverNavigator;

