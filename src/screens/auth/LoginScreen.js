import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { loginDriverAsync } from "../../store/slices/authSlice";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const PRIMARY = "#14b8a6";
const DARK_BG = "#0a1929";

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("mike@freshroute.com");
  const [password, setPassword] = useState("driver123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");

  const handleLogin = async () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAuthError("");
    try {
      await dispatch(
        loginDriverAsync({ email: email.trim().toLowerCase(), password }),
      ).unwrap();
    } catch (error) {
      const message =
        typeof error === "string" ? error : "Invalid credentials. Please try again.";
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top brand area */}
            <View style={[styles.brandArea, { backgroundColor: DARK_BG }]}>
              <View style={[styles.logoBox, { backgroundColor: PRIMARY }]}>
                <Text style={styles.logoText}>🌱</Text>
              </View>
              <Text style={styles.brandName}>FreshRoute</Text>
              <Text style={styles.brandTagline}>Driver Portal</Text>
            </View>

            {/* Form area */}
            <View style={styles.formArea}>
              <Text style={styles.formTitle}>Sign In</Text>
              <Text style={styles.formSubtitle}>Enter your credentials to continue</Text>

              <View style={styles.inputGroup}>
                <Input
                  label="Email address"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  rightIcon={
                    <Text style={{ color: PRIMARY, fontSize: 16 }}>
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotRow}
              >
                <Text style={[styles.forgotText, { color: PRIMARY }]}>Forgot Password?</Text>
              </TouchableOpacity>

              {!!authError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{authError}</Text>
                </View>
              )}

              <Button
                title={loading ? "Signing in..." : "Sign In"}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text style={[styles.signupText, { color: PRIMARY }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  brandArea: {
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: "center",
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#14b8a6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: { fontSize: 36 },
  brandName: { fontSize: 28, fontWeight: "800", color: "#f8fafc", letterSpacing: -0.5 },
  brandTagline: { fontSize: 13, color: "#64748b", marginTop: 4, letterSpacing: 1 },

  formArea: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  formSubtitle: { fontSize: 14, color: "#64748b", marginBottom: 28 },

  inputGroup: { gap: 4, marginBottom: 8 },

  forgotRow: { alignSelf: "flex-end", marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: "600" },

  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBoxText: { fontSize: 13, color: "#b91c1c", fontWeight: "500", textAlign: "center" },

  loginButton: { marginBottom: 24 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14, color: "#64748b" },
  signupText: { fontSize: 14, fontWeight: "700" },
});

export default LoginScreen;
