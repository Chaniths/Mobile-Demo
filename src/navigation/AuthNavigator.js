import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';
import SecureAccountScreen from '../screens/auth/SecureAccountScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      {/* FIX: was missing — needed for deep links from the reset-password email */}
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      {/* FIX: was missing — needed for deep links from the "secure my account" email */}
      <Stack.Screen name="SecureAccount" component={SecureAccountScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;