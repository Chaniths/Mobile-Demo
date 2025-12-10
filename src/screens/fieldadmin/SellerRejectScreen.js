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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Reject Product
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Product Info */}
        <Card style={styles.productCard}>
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
            <Card style={styles.detailsCard}>
              <TextInput
                style={[styles.detailsInput, { color: theme.colors.text.primary }]}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={theme.colors.text.tertiary}
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
            style={[styles.rejectButton, { backgroundColor: theme.colors.info }]}
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
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
    color: '#16a34a',
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
});

export default SellerRejectScreen;

