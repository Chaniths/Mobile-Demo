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

const QualityConfirmScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [notes, setNotes] = useState('');
  const [partialQuantities, setPartialQuantities] = useState({});

  // Mock data - in real app, this would come from route params or API
  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-045',
    seller: 'Green Market',
    sellerId: 'seller-001',
    date: '2024-12-09',
    items: [
      { id: '1', name: 'Heirloom Tomatoes', quantity: '5kg', quantityValue: 5, quantityUnit: 'kg', quality: null },
      { id: '2', name: 'Organic Spinach', quantity: '10 bunches', quantityValue: 10, quantityUnit: 'bunches', quality: null },
      { id: '3', name: 'Baby Carrots', quantity: '3kg', quantityValue: 3, quantityUnit: 'kg', quality: null },
    ],
  };

  const handleQualityCheck = (itemId, quality, item) => {
    setSelectedProducts((prev) => {
      const filtered = prev.filter((p) => p.itemId !== itemId);
      const newQuality = { itemId, quality };
      
      // If approved, set default approved quantity to total quantity
      if (quality === 'approved') {
        newQuality.approvedQuantity = item.quantityValue;
        newQuality.approvedUnit = item.quantityUnit;
        // Clear partial quantity if fully approved
        setPartialQuantities((prevQty) => {
          const newQty = { ...prevQty };
          delete newQty[itemId];
          return newQty;
        });
      } else if (quality === 'rejected') {
        newQuality.approvedQuantity = 0;
        newQuality.approvedUnit = item.quantityUnit;
        // Clear partial quantity if rejected
        setPartialQuantities((prevQty) => {
          const newQty = { ...prevQty };
          delete newQty[itemId];
          return newQty;
        });
      } else if (quality === 'partial') {
        // Initialize with 0 for partial approval
        newQuality.approvedQuantity = partialQuantities[itemId] || 0;
        newQuality.approvedUnit = item.quantityUnit;
      }
      
      return [...filtered, newQuality];
    });
  };

  const handlePartialQuantityChange = (itemId, value, item) => {
    const numValue = parseFloat(value) || 0;
    const maxValue = item.quantityValue || 0;
    
    // Clamp value between 0 and max
    const clampedValue = Math.max(0, Math.min(numValue, maxValue));
    
    setPartialQuantities((prev) => ({
      ...prev,
      [itemId]: clampedValue,
    }));

    // Update the quality to partial if there's a valid quantity
    if (clampedValue > 0 && clampedValue < maxValue) {
      handleQualityCheck(itemId, 'partial', item);
      setSelectedProducts((prev) => {
        const filtered = prev.filter((p) => p.itemId !== itemId);
        return [...filtered, {
          itemId,
          quality: 'partial',
          approvedQuantity: clampedValue,
          approvedUnit: item.quantityUnit,
        }];
      });
    } else if (clampedValue === maxValue) {
      // If equals max, treat as fully approved
      handleQualityCheck(itemId, 'approved', item);
    } else if (clampedValue === 0) {
      // If 0, treat as rejected
      handleQualityCheck(itemId, 'rejected', item);
    }
  };

  const handleConfirm = () => {
    // In real app, this would make an API call
    const qualityReviews = order.items.map((item) => {
      const qualityData = selectedProducts.find((p) => p.itemId === item.id);
      return {
        itemId: item.id,
        itemName: item.name,
        totalQuantity: item.quantity,
        quality: qualityData?.quality || null,
        approvedQuantity: qualityData?.approvedQuantity || 0,
        approvedUnit: qualityData?.approvedUnit || item.quantityUnit,
        status: qualityData?.quality === 'partial' 
          ? 'partially_approved' 
          : qualityData?.quality === 'approved' 
          ? 'approved' 
          : qualityData?.quality === 'rejected' 
          ? 'rejected' 
          : null,
      };
    });

    console.log('Quality reviews submitted:', { 
      orderId: order.orderId,
      qualityReviews,
      notes,
    });
    navigation.goBack();
  };

  // Enable submit when all items have been quality-checked (approved, rejected, or partial)
  const allChecked = order.items.every((item) =>
    selectedProducts.some((p) => p.itemId === item.id && (p.quality === 'approved' || p.quality === 'rejected' || p.quality === 'partial'))
  );

  const getItemQuality = (item) => {
    return selectedProducts.find((p) => p.itemId === item.id);
  };

  const getApprovalStatus = (item, qualityData) => {
    if (!qualityData) return null;
    
    if (qualityData.quality === 'partial') {
      const approvedQty = qualityData.approvedQuantity || partialQuantities[item.id] || 0;
      const totalQty = item.quantityValue || 0;
      const percentage = totalQty > 0 ? Math.round((approvedQty / totalQty) * 100) : 0;
      return `Partially Approved (${approvedQty}${item.quantityUnit} / ${totalQty}${item.quantityUnit} - ${percentage}%)`;
    } else if (qualityData.quality === 'approved') {
      return 'Fully Approved';
    } else if (qualityData.quality === 'rejected') {
      return 'Rejected';
    }
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode && (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      )}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Confirm Quality
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Order Info */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Order ID
          </Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
            {order.orderId}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb' }]} />
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Seller
          </Text>
          <Text style={[styles.orderDetail, { color: theme.colors.text.primary }]}>
            {order.seller}
          </Text>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Date
          </Text>
          <Text style={[styles.orderDetail, { color: theme.colors.text.primary }]}>
            {order.date}
          </Text>
        </Card>

        {/* Products */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Product Quality Check
        </Text>
        {order.items.map((item) => {
          const qualityData = getItemQuality(item);
          const quality = qualityData?.quality;
          const approvedQty = qualityData?.approvedQuantity || partialQuantities[item.id] || 0;
          const totalQty = item.quantityValue || 0;
          const statusText = getApprovalStatus(item, qualityData);

          return (
            <Card variant={theme.isDarkMode ? "glass" : "default"} key={item.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.colors.text.primary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.productQuantity, { color: theme.colors.text.secondary }]}>
                    Total: {item.quantity}
                  </Text>
                  {statusText && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            quality === 'approved'
                              ? `${theme.colors.success}20`
                              : quality === 'partial'
                              ? `${theme.colors.warning}20`
                              : `${theme.colors.error}20`,
                          marginTop: 8,
                          alignSelf: 'flex-start',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              quality === 'approved'
                                ? theme.colors.success
                                : quality === 'partial'
                                ? theme.colors.warning
                                : theme.colors.error,
                          },
                        ]}
                      >
                        {statusText}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Partial Approval Input */}
              {quality === 'partial' && (
                <View style={styles.partialApprovalContainer}>
                  <Text style={[styles.partialLabel, { color: theme.colors.text.secondary }]}>
                    Approved Quantity
                  </Text>
                  <View style={styles.quantityInputRow}>
                    <TextInput
                      style={[
                        styles.quantityInput,
                        {
                          color: theme.colors.text.primary,
                          borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                          backgroundColor: theme.colors.background,
                        },
                      ]}
                      placeholder="0"
                      placeholderTextColor={theme.colors.text.tertiary}
                      keyboardType="numeric"
                      value={approvedQty > 0 ? approvedQty.toString() : ''}
                      onChangeText={(value) => handlePartialQuantityChange(item.id, value, item)}
                    />
                    <Text style={[styles.quantityUnit, { color: theme.colors.text.secondary }]}>
                      {item.quantityUnit} / {totalQty} {item.quantityUnit}
                    </Text>
                  </View>
                  {approvedQty > 0 && totalQty > 0 && (
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(approvedQty / totalQty) * 100}%`,
                            backgroundColor: theme.colors.success,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              )}

              <View style={styles.qualityButtons}>
                <TouchableOpacity
                  style={[
                    styles.qualityButton,
                    {
                      borderColor:
                        quality === 'approved'
                          ? theme.colors.success
                          : theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                      backgroundColor:
                        quality === 'approved' ? theme.colors.success : theme.colors.card || 'transparent',
                    },
                  ]}
                  onPress={() => handleQualityCheck(item.id, 'approved', item)}
                >
                  <Text
                    style={[
                      styles.qualityButtonText,
                      {
                        color: quality === 'approved' ? '#fff' : theme.colors.text.primary,
                      },
                    ]}
                  >
                    ✓ Approve All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.qualityButton,
                    {
                      borderColor:
                        quality === 'rejected'
                          ? theme.colors.error
                          : theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                      backgroundColor:
                        quality === 'rejected'
                          ? theme.colors.error
                          : theme.colors.card || 'transparent',
                    },
                  ]}
                  onPress={() => {
                    handleQualityCheck(item.id, 'rejected', item);
                    navigation.navigate('SellerReject', { item, order });
                  }}
                >
                  <Text
                    style={[
                      styles.qualityButtonText,
                      {
                        color: quality === 'rejected' ? '#fff' : theme.colors.text.primary,
                      },
                    ]}
                  >
                    ✗ Reject All
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Partial Approval Toggle */}
              {quality !== 'partial' && (
                <TouchableOpacity
                  style={styles.partialToggle}
                  onPress={() => handleQualityCheck(item.id, 'partial', item)}
                >
                  <Text style={[styles.partialToggleText, { color: theme.isDarkMode ? theme.colors.teal.main : (theme.colors.info || theme.colors.primary.main) }]}>
                    ⚡ Approve Partial Quantity
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}

        {/* Notes */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Additional Notes
        </Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.notesCard}>
          <TextInput
            style={[styles.notesInput, { color: theme.isDarkMode ? theme.colors.accent.peach : theme.colors.text.primary }]}
            placeholder="Add notes about quality check..."
            placeholderTextColor={theme.isDarkMode ? theme.colors.accent.peachSoft : theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        {/* Confirm Button */}
        <Button
          title={allChecked ? "Submit Quality Reviews" : `Review ${order.items.length - selectedProducts.length} more item(s)`}
          onPress={handleConfirm}
          disabled={!allChecked}
          style={styles.confirmButton}
        />
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
  orderCard: {
    padding: 16,
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  orderDetail: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  productCard: {
    padding: 16,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  qualityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  partialApprovalContainer: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  partialLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quantityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: '600',
  },
  quantityUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  partialToggle: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  partialToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesCard: {
    padding: 16,
    marginBottom: 24,
  },
  notesInput: {
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmButton: {
    marginTop: 8,
  },
});

export default QualityConfirmScreen;

