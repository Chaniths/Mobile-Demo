import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const EditProductScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { productId } = route.params || {};

  // Demo data – in a real app you would load this from API or state using productId
  const productName = 'Organic Apples';
  const productCategory = 'Fruits';

  const [price, setPrice] = useState('4.99');
  const [stock, setStock] = useState('45');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // Demo only – in production this would update stock/pricing only.
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Update stock & pricing
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          You can manage stock and commercial terms here. Catalog details like product name and
          category can only be changed by admin.
        </Text>

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.formCard}>
          {/* Read-only catalog info */}
          <View style={styles.readonlyBlock}>
            <Text style={[styles.readonlyLabel, { color: theme.colors.text.secondary }]}>
              Product
            </Text>
            <Text style={[styles.readonlyValue, { color: theme.colors.text.primary }]}>
              {productName}
            </Text>
            <Text style={[styles.readonlyMeta, { color: theme.colors.text.tertiary }]}>
              Category: {productCategory}
            </Text>
          </View>

          {/* Editable commercial fields */}
          <Input
            label="Selling price"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <Input
            label="Stock quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
          />
          <Input
            label="Notes to admin (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <View style={styles.actions}>
            <Button title="Save changes" onPress={handleSave} style={styles.primaryButton} />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
          </View>
        </Card>
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
    zIndex: 1,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  formCard: {
    padding: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    marginBottom: 4,
  },
  readonlyBlock: {
    marginBottom: 16,
  },
  readonlyLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readonlyValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  readonlyMeta: {
    fontSize: 13,
    marginTop: 2,
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

export default EditProductScreen;


