import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const DeliveryPickupScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [actionType, setActionType] = useState(null); // 'delivery' or 'pickup'
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');

  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-042',
    customer: 'John Doe',
    address: '123 Main St, Downtown',
    items: [
      { name: 'Heirloom Tomatoes', quantity: '5kg' },
      { name: 'Organic Spinach', quantity: '10 bunches' },
    ],
    status: 'In Transit',
  };

  const handleMarkAction = () => {
    if (!actionType) {
      alert('Please select an action');
      return;
    }
    // In real app, this would make an API call
    console.log('Action marked:', {
      type: actionType,
      orderId: order.orderId,
      signature,
      notes,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode ? (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      ) : (
        <>
          {/* Arch-like strips in green colors for light mode */}
          <View style={[styles.archStrip1, styles.lightModeArchStrip1]} />
          <View style={[styles.archStrip2, styles.lightModeArchStrip2]} />
          <View style={[styles.archStrip3, styles.lightModeArchStrip3]} />
          <View style={[styles.archStrip4, styles.lightModeArchStrip4]} />
        </>
      )}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Delivery / Pickup
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <View style={styles.divider} />
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Customer</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.customer}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Address</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.address}</Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Select Action
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              actionType === 'delivery' && {
                backgroundColor: theme.colors.success,
                borderColor: theme.colors.success,
              },
              !actionType && {
                borderColor: theme.colors.border.light,
              },
            ]}
            onPress={() => setActionType('delivery')}
          >
            <Text
              style={[
                styles.actionButtonText,
                actionType === 'delivery' && { color: '#fff' },
                !actionType && { color: theme.colors.text.primary },
              ]}
            >
              ✓ Mark Delivered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              actionType === 'pickup' && {
                backgroundColor: theme.colors.primary.main,
                borderColor: theme.colors.primary.main,
              },
              !actionType && {
                borderColor: theme.colors.border.light,
              },
            ]}
            onPress={() => setActionType('pickup')}
          >
            <Text
              style={[
                styles.actionButtonText,
                actionType === 'pickup' && { color: '#fff' },
                !actionType && { color: theme.colors.text.primary },
              ]}
            >
              📦 Mark Picked Up
            </Text>
          </TouchableOpacity>
        </View>

        {actionType && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Customer Signature / Confirmation
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.signatureCard}>
              <TextInput
                style={[styles.input, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
                placeholder="Enter customer name or signature..."
                placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
                value={signature}
                onChangeText={setSignature}
              />
            </Card>

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Additional Notes
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.notesCard}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder="Add any notes..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </Card>

            <Button
              title={`Confirm ${actionType === 'delivery' ? 'Delivery' : 'Pickup'}`}
              onPress={handleMarkAction}
              style={styles.submitButton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    overflow: 'hidden',
  },
  // Arch-like strips pattern for dark mode
  archStrip1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 200,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(35, 101, 113, 0.3)',
    opacity: 0.7,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  archStrip2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 350,
    height: 180,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: 'rgba(45, 122, 135, 0.35)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '25deg' }],
  },
  archStrip3: {
    position: 'absolute',
    bottom: 200,
    left: -60,
    width: 380,
    height: 190,
    borderTopLeftRadius: 190,
    borderTopRightRadius: 190,
    backgroundColor: 'rgba(35, 101, 113, 0.25)',
    opacity: 0.5,
    zIndex: 0,
    transform: [{ rotate: '20deg' }],
  },
  archStrip4: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 420,
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: 'rgba(45, 122, 135, 0.3)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '-30deg' }],
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 32,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  orderCard: { padding: 16, marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  orderId: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  detail: { fontSize: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  actionButtonText: { fontSize: 15, fontWeight: '600' },
  signatureCard: { padding: 16, marginBottom: 24 },
  notesCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 50, textAlignVertical: 'top' },
  submitButton: { marginTop: 8 },
  // Light mode arch strips with green colors
  lightModeArchStrip1: {
    backgroundColor: 'rgba(22, 163, 74, 0.3)',
    opacity: 0.7,
  },
  lightModeArchStrip2: {
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
    opacity: 0.6,
  },
  lightModeArchStrip3: {
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    opacity: 0.5,
  },
  lightModeArchStrip4: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    opacity: 0.6,
  },
});

export default DeliveryPickupScreen;

