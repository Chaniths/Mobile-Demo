import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { useTheme } from '../hooks/useTheme';

// Navigators
import AuthNavigator from './AuthNavigator';
import BuyerNavigator from './BuyerNavigator';
import SellerNavigator from './SellerNavigator';
import DriverNavigator from './DriverNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme, loadThemePreference } = useTheme();

  useEffect(() => {
    // Load saved theme preference on app start
    loadThemePreference();
  }, [loadThemePreference]);

  // Determine which navigator to show based on user role
  const getRoleNavigator = () => {
    if (!user || !user.role) return null;

    switch (user.role) {
      case 'buyer':
        return BuyerNavigator;
      case 'seller':
        return SellerNavigator;
      case 'driver':
        return DriverNavigator;
      case 'fieldadmin':
        return BuyerNavigator; // TODO: Create FieldAdminNavigator
      default:
        return BuyerNavigator;
    }
  };

  const RoleNavigator = getRoleNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {!isAuthenticated || !RoleNavigator ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={RoleNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

