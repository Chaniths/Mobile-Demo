<<<<<<< HEAD
import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";
=======
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { TabBarIcon } from '../components/common/AppIcon';
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

// Driver Screens
import HomeScreen from "../screens/driver/HomeScreen";
import RouteScreen from "../screens/driver/RouteScreen";
import OrdersScreen from "../screens/driver/OrdersScreen";
import ProfileScreen from "../screens/driver/DriverProfileScreen";
import DeliveryDetailScreen from "../screens/driver/DeliveryDetailScreen";
import AllDeliveriesScreen from "../screens/driver/AllDeliveriesScreen";
import ReportIssueScreen from "../screens/driver/ReportIssueScreen";
import EarningsScreen from "../screens/driver/EarningsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
    <Stack.Screen name="AllDeliveries" component={AllDeliveriesScreen} />
    <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
    <Stack.Screen name="Earnings" component={EarningsScreen} />
  </Stack.Navigator>
);

const DeliveriesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DriverOrders" component={OrdersScreen} />
    <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
    <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
    <Stack.Screen name="Route" component={RouteScreen} />
  </Stack.Navigator>
);

const DriverNavigator = () => {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#0f2942" : "#ffffff",
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          borderRadius: 28,
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
<<<<<<< HEAD
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🏠</Text>,
=======
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
        }}
      />
      <Tab.Screen
        name="Route"
        component={RouteScreen}
        options={{
<<<<<<< HEAD
          tabBarLabel: "Route",
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🗺️</Text>,
=======
          tabBarLabel: 'Route',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="map" color={color} focused={focused} />
          ),
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
        }}
      />
      <Tab.Screen
        name="Deliveries"
        component={DeliveriesStack}
        options={{
<<<<<<< HEAD
          tabBarLabel: "Deliveries",
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>📦</Text>,
=======
          tabBarLabel: 'Deliveries',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="orders" color={color} focused={focused} />
          ),
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
<<<<<<< HEAD
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>👤</Text>,
=======
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="profile" color={color} focused={focused} />
          ),
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
        }}
      />
    </Tab.Navigator>
  );
};

export default DriverNavigator;
