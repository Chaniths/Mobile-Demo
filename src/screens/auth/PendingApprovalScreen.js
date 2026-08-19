import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import ArchBackground from '../../components/common/ArchBackground';

// ─── PendingApprovalScreen ─────────────────────────────────────────────────
// Mirrors web's PendingApprovalPage.tsx. Reusable from anywhere:
//   - right after a seller registers (RegisterScreen)
//   - if a seller tries to log in before being approved (LoginScreen)
// Navigate here with: navigation.navigate('PendingApproval')

const PendingApprovalScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ArchBackground />
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Clock icon */}
        <View style={s.iconWrap}>
          <Text style={{ fontSize: 48 }}>⏳</Text>
        </View>

        <Text style={s.heading}>Registration Received!</Text>
        <Text style={s.body}>
          Your account is under review by our admin team. You don't need to keep checking back —{' '}
          <Text style={s.bodyStrong}>we'll email you</Text> as soon as a decision is made.
        </Text>

        {/* Email notice */}
        <View style={s.infoBox}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>📧</Text>
          <Text style={s.infoText}>
            We'll send an email to the address you registered with once your account is{' '}
            <Text style={s.infoTextStrong}>approved or rejected</Text>.
            Check your inbox (and spam folder, just in case).
          </Text>
        </View>

        {/* Steps */}
        <View style={s.stepsCard}>
          <Text style={s.stepsLabel}>WHAT HAPPENS NEXT?</Text>
          {[
            { n: '1', text: 'Our team reviews your registration details' },
            { n: '2', text: 'You receive an email with the decision' },
            { n: '3', text: 'If approved, log in and start using FreshRoute!' },
          ].map(({ n, text }) => (
            <View key={n} style={s.stepRow}>
              <View style={s.stepBadge}><Text style={s.stepNum}>{n}</Text></View>
              <Text style={s.stepText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Time hint */}
        <View style={s.timeHint}>
          <Text style={s.timeText}>
            ⏱ Approval usually takes <Text style={{ fontWeight: '700' }}>less than 24 hours</Text>
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
          <Text style={s.primaryBtnText}>Go to Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('RoleSelect')} activeOpacity={0.8}>
          <Text style={s.outlineBtnText}>Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles (kept identical to the inline PendingScreen in RegisterScreen.js) ──

const styles = (theme) => StyleSheet.create({
  safe:        { flex: 1, backgroundColor: theme.colors.background, overflow: 'hidden' },
  container:   { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },

  iconWrap:    { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)', justifyContent: 'center', alignItems: 'center', marginVertical: 32 },
  heading:     { fontSize: 26, fontWeight: '700', color: theme.colors.text.primary, textAlign: 'center', marginBottom: 12 },
  body:        { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 20, paddingHorizontal: 8 },
  bodyStrong:  { color: theme.colors.text.primary, fontWeight: '600' },

  infoBox:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(14,165,233,0.10)', borderWidth: 1, borderColor: 'rgba(14,165,233,0.35)', borderRadius: 16, padding: 14, marginBottom: 20, width: '100%' },
  infoText:    { flex: 1, fontSize: 13, color: '#0369a1', lineHeight: 20 },
  infoTextStrong: { color: '#075985', fontWeight: '700' },

  stepsCard:   { width: '100%', backgroundColor: theme.colors.surface ?? 'rgba(0,0,0,0.03)', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  stepsLabel:  { fontSize: 10, fontWeight: '700', color: theme.colors.text.tertiary, letterSpacing: 1.5, marginBottom: 4 },
  stepRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBadge:   { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(20,184,166,0.18)', justifyContent: 'center', alignItems: 'center' },
  stepNum:     { fontSize: 13, fontWeight: '700', color: '#0f766e' },
  stepText:    { flex: 1, fontSize: 14, color: theme.colors.text.primary },

  timeHint:    { width: '100%', backgroundColor: 'rgba(20,184,166,0.08)', borderWidth: 1, borderColor: 'rgba(20,184,166,0.3)', borderRadius: 14, padding: 12, alignItems: 'center', marginBottom: 24 },
  timeText:    { fontSize: 13, color: '#0f766e', textAlign: 'center' },

  primaryBtn:     { width: '100%', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#10b981', marginBottom: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn:     { width: '100%', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  outlineBtnText: { color: theme.colors.text.primary, fontSize: 15, fontWeight: '600' },
});

export default PendingApprovalScreen;