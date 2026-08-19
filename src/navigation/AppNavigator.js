import React, { useEffect } from "react";
import { AppState, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../hooks/useTheme";
import { restoreSessionAsync, logoutAsync } from "../store/slices/authSlice";
import { fetchCart } from "../store/slices/cartSlice";
import { driverTrackingService } from "../services/location/driverTrackingService";
import { normalizeRole } from "../utils/roles";

// Navigators
import AuthNavigator from "./AuthNavigator";
import BuyerNavigator from "./BuyerNavigator";
import SellerNavigator from "./SellerNavigator";
import DriverNavigator from "./DriverNavigator";
import FieldAdminNavigator from "./FieldAdminNavigator";
import ArchBackground from "../components/common/ArchBackground";

const Stack = createStackNavigator();

const UnsupportedRoleScreen = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const role = useSelector((state) => state.auth.user?.role);

  return (
    <View style={[styles.unsupported, { backgroundColor: theme.colors.background }]}>
      <ArchBackground />
      <Text style={[styles.unsupportedTitle, { color: theme.colors.text.primary }]}>
        This role is not available on mobile
      </Text>
      <Text style={[styles.unsupportedBody, { color: theme.colors.text.secondary }]}>
        {role === 'admin'
          ? 'Admin accounts use the FreshRoute web dashboard.'
          : `No mobile screens are set up for the "${role}" role.`}
      </Text>
      <TouchableOpacity
        style={[styles.unsupportedBtn, { backgroundColor: theme.colors.primary.main }]}
        onPress={() => dispatch(logoutAsync())}
      >
        <Text style={styles.unsupportedBtnText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth,
  );
  const { theme, loadThemePreference } = useTheme();
  const insets = useSafeAreaInsets();
  const role = normalizeRole(user?.role);

  useEffect(() => {
    loadThemePreference();
    dispatch(restoreSessionAsync())
      .unwrap()
      .then((session) => {
        if (session?.user && normalizeRole(session.user.role) === "buyer") {
          dispatch(fetchCart());
        }
      })
      .catch(() => {});
  }, [loadThemePreference]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "background" || nextState === "inactive") {
          void driverTrackingService.handleAppExit();
        }
      },
    );

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  // Determine which navigator to show based on user role
  const getRoleNavigator = () => {
    if (!user || !role) return null;
    switch (role) {
      case "buyer":       return { name: "BuyerMain",       component: BuyerNavigator };
      case "seller":      return { name: "SellerMain",      component: SellerNavigator };
      case "driver":      return { name: "DriverMain",      component: DriverNavigator };
      case "field_admin": return { name: "FieldAdminMain",  component: FieldAdminNavigator };
      case "admin":       return { name: "UnsupportedMain", component: UnsupportedRoleScreen };
      default:            return { name: "UnsupportedMain", component: UnsupportedRoleScreen };
    }
  };

  const roleRoute = getRoleNavigator();

  return (
    <View style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background },
          }}
        >
          {isLoading || !isAuthenticated || !roleRoute ? (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <Stack.Screen
              key={roleRoute.name}
              name={roleRoute.name}
              component={roleRoute.component}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {(!isAuthenticated || !roleRoute) && (
        <View
          pointerEvents="none"
          style={[
            styles.footer,
            {
              backgroundColor: "transparent",
              bottom: Math.max(insets.bottom, 8) + 8,
            },
          ]}
        >
          <Text
            style={[styles.footerText, { color: theme.colors.text.tertiary }]}
          >
            © {new Date().getFullYear()} FreshRoute. All rights reserved.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  footerText: { fontSize: 10 },
  unsupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    overflow: 'hidden',
  },
  unsupportedTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  unsupportedBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  unsupportedBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  unsupportedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AppNavigator;
