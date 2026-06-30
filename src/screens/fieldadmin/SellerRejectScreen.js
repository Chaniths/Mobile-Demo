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
import BackgroundShapes from '../../components/common/BackgroundShapes';

const SellerRejectScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const item = route?.params?.item || {
    id: '1',
    name: 'Baby Carrots',
    quantity: '3kg',
  };

  const order = route?.params?.order || {
    orderId: '#ORD-2024-045',
    seller: 'Green Market',
  };

  const rejectionReasons = [
    'Poor Quality',
    'Damaged Items',
    'Expired/ Stale',
    'Wrong Quantity',
    'Not Fresh',
    'Packaging Issues',
    'Other',
  ];

  const handleReject = () => {
    if (!selectedReason && !customReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    console.log('Product rejected:', { item, order: order.orderId, reason: selectedReason || customReason });
    navigation.goBack();
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes variant="form" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Reject Products</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Product Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PRODUCT</Text>
          <Text style={[styles.productName, { color: theme.colors.text.primary }]}>{item.name}</Text>
          <Text style={styles.productQty}>{item.quantity}</Text>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>ORDER ID</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <Text style={styles.fieldLabel}>SELLER</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.seller}</Text>
        </View>

        {/* Rejection Reasons */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Select Rejection Reason</Text>
        <View style={styles.reasonsList}>
          {rejectionReasons.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonPill, isSelected && styles.reasonPillActive]}
                onPress={() => {
                  setSelectedReason(reason);
                  if (reason !== 'Other') setCustomReason('');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.reasonText, { color: theme.colors.text.primary }, isSelected && styles.reasonTextActive]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {(selectedReason === 'Other' || !selectedReason) && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Additional Details</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={[styles.textInput, { color: theme.colors.text.primary }]}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={5}
                value={customReason}
                onChangeText={setCustomReason}
              />
            </View>
          </>
        )}

        {/* Actions */}
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleReject} activeOpacity={0.8}>
          <Text style={styles.submitText}>Submit Rejection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={[styles.cancelText, { color: theme.colors.text.secondary }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
  backText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  productName: { fontSize: 18, fontWeight: '800' },
  productQty: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  fieldValue: { fontSize: 15, fontWeight: '500', marginBottom: 4 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  reasonsList: { gap: 10, marginBottom: 24 },
  reasonPill: {
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  reasonPillActive: {
    backgroundColor: '#fee2e2', borderColor: '#ef4444',
  },
  reasonText: { fontSize: 15, fontWeight: '500' },
  reasonTextActive: { color: '#ef4444', fontWeight: '700' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, minHeight: 120, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  cancelText: { fontSize: 16, fontWeight: '600' },
});

export default SellerRejectScreen;
