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

const SellerRejectScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const item = route?.params?.item || {
    id: '1',
    name: 'Heirloom Tomatoes',
    quantity: '5kg',
  };

  const order = route?.params?.order || {
    orderId: '#ORD-2024-045',
    seller: 'Green Market',
  };

  const rejectionReasons = [
    'Poor Quality',
    'Damaged Items',
    'Expired/Stale',
    'Wrong Quantity',
    'Not Fresh',
    'Packaging Issues',
    'Other',
  ];

  const handleReject = () => {
    if (!selectedReason && !reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    // In real app, this would make an API call
    console.log('Product rejected:', {
      item,
      order: order.orderId,
      reason: selectedReason || reason,
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Reject Product
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Product Info */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.productCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Product
          </Text>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.productQuantity, { color: theme.colors.text.secondary }]}>
            {item.quantity}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb' }]} />
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Order ID
          </Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
            {order.orderId}
          </Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Seller
          </Text>
          <Text style={[styles.seller, { color: theme.colors.text.primary }]}>
            {order.seller}
          </Text>
        </Card>

        {/* Rejection Reasons */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Select Rejection Reason
        </Text>
        <View style={styles.reasonsContainer}>
          {rejectionReasons.map((reasonOption) => (
            <TouchableOpacity
              key={reasonOption}
              style={[
                styles.reasonCard,
                {
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.colors.card || '#f9fafb',
                },
                selectedReason === reasonOption && {
                  backgroundColor: `${theme.colors.error}20`,
                  borderColor: theme.colors.error,
                },
              ]}
              onPress={() => {
                setSelectedReason(reasonOption);
                if (reasonOption !== 'Other') {
                  setReason('');
                }
              }}
            >
              <Text
                style={[
                  styles.reasonText,
                  { color: theme.colors.text.primary },
                  selectedReason === reasonOption && { color: theme.colors.error, fontWeight: '700' },
                ]}
              >
                {reasonOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Details */}
        {(selectedReason === 'Other' || !selectedReason) && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Additional Details (Required)
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.detailsCard}>
              <TextInput
                style={[styles.detailsInput, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
                multiline
                numberOfLines={5}
                value={reason}
                onChangeText={setReason}
              />
            </Card>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Submit Rejection"
            onPress={handleReject}
            style={styles.rejectButton}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
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
    paddingBottom: 120,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  productCard: {
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  orderId: {
    fontSize: 14,
    marginBottom: 8,
  },
  seller: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  reasonsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  reasonCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  reasonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  detailsCard: {
    padding: 16,
    marginBottom: 24,
  },
  detailsInput: {
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  rejectButton: {
    marginBottom: 0,
  },
  cancelButton: {
    marginBottom: 0,
  },
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

export default SellerRejectScreen;

