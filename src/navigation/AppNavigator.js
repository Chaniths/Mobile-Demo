import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { useTheme } from '../hooks/useTheme';

// Navigators
import AuthNavigator from './AuthNavigator';
import BuyerNavigator from './BuyerNavigator';
import SellerNavigator from './SellerNavigator';
import DriverNavigator from './DriverNavigator';
import FieldAdminNavigator from './FieldAdminNavigator';

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
        return FieldAdminNavigator;
      default:
        return BuyerNavigator;
    }
  };

  const RoleNavigator = getRoleNavigator();

  return (
    <View style={styles.root}>
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
      {(!isAuthenticated || !RoleNavigator) && (
        <View
          pointerEvents="none"
          style={[
            styles.footer,
            {
              backgroundColor: 'transparent',
            },
          ]}
        >
          <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>
            © {new Date().getFullYear()} FreshRoute. All rights reserved.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 17,
    alignItems: 'center',
    paddingBottom: 0,
  },
  footerText: {
    fontSize: 10,
  },
});

export default AppNavigator;