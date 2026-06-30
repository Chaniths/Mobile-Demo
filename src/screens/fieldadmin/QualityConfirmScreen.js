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

const QualityConfirmScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [notes, setNotes] = useState('');
  const [partialQuantities, setPartialQuantities] = useState({});

  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-045',
    seller: 'Green Market',
    sellerId: 'seller-001',
    date: '2024-12-09',
    items: [
      { id: '1', name: 'Heirloom Tomatoes', quantity: '5kg', quantityValue: 5, quantityUnit: 'kg' },
      { id: '2', name: 'Organic Spinach', quantity: '10 bunches', quantityValue: 10, quantityUnit: 'bunches' },
      { id: '3', name: 'Baby Carrots', quantity: '3kg', quantityValue: 3, quantityUnit: 'kg' },
    ],
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

  const handleQualityCheck = (itemId, quality, item) => {
    setSelectedProducts((prev) => {
      const filtered = prev.filter((p) => p.itemId !== itemId);
      const entry = { itemId, quality };
      if (quality === 'approved') {
        entry.approvedQuantity = item.quantityValue;
        entry.approvedUnit = item.quantityUnit;
        setPartialQuantities((q) => { const n = { ...q }; delete n[itemId]; return n; });
      } else if (quality === 'rejected') {
        entry.approvedQuantity = 0;
        entry.approvedUnit = item.quantityUnit;
        setPartialQuantities((q) => { const n = { ...q }; delete n[itemId]; return n; });
      } else if (quality === 'partial') {
        entry.approvedQuantity = partialQuantities[itemId] || 0;
        entry.approvedUnit = item.quantityUnit;
      }
      return [...filtered, entry];
    });
  };

  const handlePartialQty = (itemId, value, item) => {
    const num = parseFloat(value) || 0;
    const max = item.quantityValue || 0;
    const clamped = Math.max(0, Math.min(num, max));
    setPartialQuantities((prev) => ({ ...prev, [itemId]: clamped }));
    if (clamped > 0 && clamped < max) {
      setSelectedProducts((prev) => {
        const filtered = prev.filter((p) => p.itemId !== itemId);
        return [...filtered, { itemId, quality: 'partial', approvedQuantity: clamped, approvedUnit: item.quantityUnit }];
      });
    } else if (clamped === max) {
      handleQualityCheck(itemId, 'approved', item);
    } else if (clamped === 0) {
      handleQualityCheck(itemId, 'rejected', item);
    }
  };

  const handleConfirm = () => {
    console.log('Quality reviews submitted:', { orderId: order.orderId, selectedProducts, notes });
    navigation.goBack();
  };

  const allChecked = order.items.every((item) =>
    selectedProducts.some((p) => p.itemId === item.id && ['approved', 'rejected', 'partial'].includes(p.quality))
  );

  const getQuality = (itemId) => selectedProducts.find((p) => p.itemId === itemId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes variant="detail" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Confirm Quality</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Order Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ORDER ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>SELLER</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.seller}</Text>
          <Text style={styles.fieldLabel}>DATE</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.date}</Text>
        </View>

        {/* Products */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Product Quality Check</Text>
        {order.items.map((item) => {
          const qd = getQuality(item.id);
          const quality = qd?.quality;
          const approvedQty = qd?.approvedQuantity || partialQuantities[item.id] || 0;
          const totalQty = item.quantityValue || 0;

          return (
            <View key={item.id} style={styles.productCard}>
              <Text style={[styles.productName, { color: theme.colors.text.primary }]}>{item.name}</Text>
              <Text style={styles.productQty}>Total: {item.quantity}</Text>

              {quality && (
                <View style={[styles.statusBadge, {
                  backgroundColor: quality === 'approved' ? '#dcfce7' : quality === 'partial' ? '#fef3c7' : '#fee2e2',
                }]}>
                  <Text style={[styles.statusText, {
                    color: quality === 'approved' ? '#22c55e' : quality === 'partial' ? '#f59e0b' : '#ef4444',
                  }]}>
                    {quality === 'approved' ? 'Fully Approved' : quality === 'partial' ? `Partial (${approvedQty}${item.quantityUnit})` : 'Rejected'}
                  </Text>
                </View>
              )}

              {quality === 'partial' && (
                <View style={styles.partialWrap}>
                  <Text style={styles.partialLabel}>Approved Quantity</Text>
                  <View style={styles.qtyRow}>
                    <TextInput
                      style={[styles.qtyInput, { color: theme.colors.text.primary }]}
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      value={approvedQty > 0 ? approvedQty.toString() : ''}
                      onChangeText={(v) => handlePartialQty(item.id, v, item)}
                    />
                    <Text style={styles.qtyUnit}>{item.quantityUnit} / {totalQty} {item.quantityUnit}</Text>
                  </View>
                  {approvedQty > 0 && totalQty > 0 && (
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${(approvedQty / totalQty) * 100}%`, backgroundColor: '#22c55e' }]} />
                    </View>
                  )}
                </View>
              )}

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.qualityBtn, quality === 'approved' && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}
                  onPress={() => handleQualityCheck(item.id, 'approved', item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qualityBtnText, quality === 'approved' ? { color: '#fff' } : { color: theme.colors.text.primary }]}>
                    {'✓ Approve All'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qualityBtn, quality === 'rejected' && { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                  onPress={() => {
                    handleQualityCheck(item.id, 'rejected', item);
                    navigation.navigate('SellerReject', { item, order });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qualityBtnText, quality === 'rejected' ? { color: '#fff' } : { color: theme.colors.text.primary }]}>
                    {'✗ Reject All'}
                  </Text>
                </TouchableOpacity>
              </View>

              {quality !== 'partial' && (
                <TouchableOpacity style={styles.partialToggle} onPress={() => handleQualityCheck(item.id, 'partial', item)}>
                  <Text style={[styles.partialToggleText, { color: teal }]}>Approve Partial Quantity</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Notes */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Additional Notes</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary }]}
            placeholder="Add notes about quality check..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: teal, opacity: allChecked ? 1 : 0.5 }]}
          onPress={handleConfirm}
          disabled={!allChecked}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {allChecked ? 'Submit Quality Reviews' : `Review ${order.items.length - selectedProducts.length} more item(s)`}
          </Text>
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
  orderId: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 14 },
  fieldValue: { fontSize: 15, fontWeight: '500', marginBottom: 4 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  productCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  productName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  productQty: { fontSize: 14, color: '#94a3b8', marginBottom: 10 },

  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },

  partialWrap: {
    backgroundColor: '#fffbeb', borderRadius: 16, padding: 14, marginBottom: 12,
  },
  partialLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyInput: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#e0dcd9', fontSize: 16, fontWeight: '600', backgroundColor: '#fff',
  },
  qtyUnit: { fontSize: 14, fontWeight: '500', color: '#94a3b8' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: '#e5e7eb', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  btnRow: { flexDirection: 'row', gap: 12 },
  qualityBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0dcd9',
    alignItems: 'center', backgroundColor: '#fff',
  },
  qualityBtnText: { fontSize: 14, fontWeight: '700' },

  partialToggle: { paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  partialToggleText: { fontSize: 13, fontWeight: '600' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, minHeight: 100, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default QualityConfirmScreen;
