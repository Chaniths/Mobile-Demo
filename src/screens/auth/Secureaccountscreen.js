// SecureAccountScreen.js
// Lets a user prove who they are (via Google) so they can undo an unauthorized password change.
//
// FIX: previously this screen sent the literal string
// 'TODO_REPLACE_WITH_REAL_GOOGLE_ID_TOKEN' to the backend instead of a real
// Google ID token — the flow never actually worked. This now uses
// @react-native-google-signin/google-signin to get a real credential,
// mirroring what SecureAccountPage.tsx does on web with Google Identity Services.
//
// SETUP REQUIRED before this works:
//   1. npm install @react-native-google-signin/google-signin
//   2. Get your Web Client ID from Google Cloud Console (OAuth 2.0 Client IDs —
//      same "Web application" client ID web already uses for VITE_GOOGLE_CLIENT_ID)
//   3. Replace GOOGLE_WEB_CLIENT_ID below with that value (or load from env/config)
//   4. Follow the native setup steps in the library's docs (Android SHA-1 fingerprint,
//      iOS URL scheme) — this step can't be done from JS alone.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTheme } from '../../hooks/useTheme';
import Button from '../../components/common/Button';
import apiClient from '../../api/client';

// TODO: replace with your real Web Client ID (same one web uses for VITE_GOOGLE_CLIENT_ID)
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

const SecureAccountScreen = ({ navigation, route }) => {
  const { theme } = useTheme();

  // NOTE: assumes your deep-link handler passes the email as a route param,
  // e.g. navigation.navigate('SecureAccount', { email })
  const email = route?.params?.email ?? '';

  const [status, setStatus] = useState(email ? 'idle' : 'error');
  const [message, setMessage] = useState(email ? '' : 'Invalid link. No email address found.');

  // Configure Google Sign-In once when the screen mounts.
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  // Sends the real Google ID token to the backend to verify and revert the password change.
  const handleGoogleResponse = async (googleIdToken) => {
    setStatus('verifying');
    try {
      await apiClient.post('/auth/secure-account', { email, googleIdToken });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err?.response?.data?.message ?? 'Verification failed');
    }
  };

  // Opens the real Google account picker and gets back a real ID token.
  const handleGooglePress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      // idToken lives at userInfo.data.idToken on recent library versions —
      // fall back to userInfo.idToken for older versions.
      const idToken = userInfo?.data?.idToken ?? userInfo?.idToken;
      if (!idToken) throw new Error('No ID token returned from Google');
      await handleGoogleResponse(idToken);
    } catch (err) {
      // User cancelled the picker, or something else went wrong before we
      // even reached the backend — show it the same way as a backend failure.
      if (err?.code !== 'SIGN_IN_CANCELLED') {
        setStatus('error');
        setMessage(err?.message ?? 'Google sign-in failed');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>

        {status === 'idle' && (
          <>
            <View style={[styles.icon, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.iconText}>!</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Secure Your Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Someone changed the password for{' '}
              <Text style={{ color: theme.colors.primary.main, fontWeight: '600' }}>{email}</Text>.
              Verify with Google to instantly revert the change.
            </Text>

            <View style={[styles.noticeCard, { borderColor: theme.colors.border, backgroundColor: `${theme.colors.error}12` }]}>
              <Text style={[styles.noticeTitle, { color: theme.colors.text.primary }]}>
                ⚠️ What happens after verification?
              </Text>
              <Text style={[styles.noticeLine, { color: theme.colors.text.secondary }]}>
                • The unauthorized password change is reverted
              </Text>
              <Text style={[styles.noticeLine, { color: theme.colors.text.secondary }]}>
                • All active sessions are signed out immediately
              </Text>
              <Text style={[styles.noticeLine, { color: theme.colors.text.secondary }]}>
                • You can sign in with your original password
              </Text>
            </View>

            <Text style={[styles.hintText, { color: theme.colors.text.secondary }]}>
              Verify it's you by signing in with Google
            </Text>
            <Button
              title="Continue with Google"
              onPress={handleGooglePress}
              style={styles.actionButton}
            />
          </>
        )}

        {status === 'verifying' && (
          <>
            <View style={[styles.icon, { backgroundColor: theme.colors.warning }]}>
              <Text style={styles.iconText}>…</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Verifying your identity...</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Reverting the password change and signing out all devices.
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={[styles.icon, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.iconText}>✓</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Account Secured!</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              The unauthorized change has been reverted and all sessions signed out.
              You can sign in with your original password.
            </Text>
            <Button
              title="Back to Sign In"
              onPress={() => navigation.navigate('Login')}
              style={styles.actionButton}
            />
          </>
        )}

        {status === 'error' && (
          <>
            <View style={[styles.icon, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.iconText}>!</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Something Went Wrong</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>{message}</Text>
            <Button
              title="Try Again"
              onPress={() => setStatus('idle')}
              style={styles.actionButton}
            />
          </>
        )}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  icon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  iconText: { fontSize: 32, color: '#ffffff', fontWeight: '700' },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },

  noticeCard: { width: '100%', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20 },
  noticeTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  noticeLine: { fontSize: 12, lineHeight: 18 },

  hintText: { fontSize: 12, marginBottom: 10 },
  actionButton: { width: '100%', marginTop: 4 },
});

export default SecureAccountScreen;