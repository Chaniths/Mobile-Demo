import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';

// Field Admin Screens
import HomeScreen from '../screens/fieldadmin/HomeScreen';
import QualityConfirmScreen from '../screens/fieldadmin/QualityConfirmScreen';
import SellerRejectScreen from '../screens/fieldadmin/SellerRejectScreen';
import RefundInitiationScreen from '../screens/fieldadmin/RefundInitiationScreen';
import RouteReassessmentScreen from '../screens/fieldadmin/RouteReassessmentScreen';
import DeliveryPickupScreen from '../screens/fieldadmin/DeliveryPickupScreen';
import AssessmentScreen from '../screens/fieldadmin/AssessmentScreen';
import DamageReportScreen from '../screens/fieldadmin/DamageReportScreen';
import TruckCapacityScreen from '../screens/fieldadmin/TruckCapacityScreen';
import RouteOrdersScreen from '../screens/fieldadmin/RouteOrdersScreen';
import RouteMapScreen from '../screens/fieldadmin/RouteMapScreen';
import HistoryScreen from '../screens/fieldadmin/HistoryScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen'; // Reuse profile

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Field Admin Stack with all screens
const FieldAdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="QualityConfirm" component={QualityConfirmScreen} />
      <Stack.Screen name="SellerReject" component={SellerRejectScreen} />
      <Stack.Screen name="RefundInitiation" component={RefundInitiationScreen} />
      <Stack.Screen name="RouteReassessment" component={RouteReassessmentScreen} />
      <Stack.Screen name="DeliveryPickup" component={DeliveryPickupScreen} />
      <Stack.Screen name="Assessment" component={AssessmentScreen} />
      <Stack.Screen name="DamageReport" component={DamageReportScreen} />
      <Stack.Screen name="TruckCapacity" component={TruckCapacityScreen} />
      <Stack.Screen name="RouteOrders" component={RouteOrdersScreen} />
      <Stack.Screen name="RouteMap" component={RouteMapScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const FieldAdminNavigator = () => {
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
        name="Main"
        component={FieldAdminStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RouteOrdersScreen}
        listeners={{
          tabPress: (e) => {
            // Prevent default tab press, navigate within stack
          },
        }}
        options={{
          tabBarLabel: 'Routes',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="AssessmentTab"
        component={AssessmentScreen}
        options={{
          tabBarLabel: 'Assess',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default FieldAdminNavigator;

