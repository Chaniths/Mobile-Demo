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

const Stack = createStackNavigator();

// Tab bar sits at bottom:16 with height:60 → footer must clear 16+60+8 = 84
const TAB_BAR_HEIGHT  = 60;
const TAB_BAR_BOTTOM  = 16;
const FOOTER_BOTTOM   = TAB_BAR_BOTTOM + TAB_BAR_HEIGHT + 8; // 84

const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme, loadThemePreference } = useTheme();

  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  const getRoleNavigator = () => {
    if (!user || !user.role) return null;
    switch (user.role) {
      case 'buyer':      return BuyerNavigator;
      case 'seller':     return SellerNavigator;
      case 'driver':     return DriverNavigator;
      case 'fieldadmin': return BuyerNavigator;
      default:           return BuyerNavigator;
    }
  };

  const RoleNavigator = getRoleNavigator();

  // On auth screens there is no tab bar, so drop the footer to its original position
  

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

      <View
        pointerEvents="none"
        style={[styles.footer, { bottom: 0 }]}
      >
        <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>
          © {new Date().getFullYear()} FreshRoute. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footerText: { fontSize: 10 },
});

export default AppNavigator;