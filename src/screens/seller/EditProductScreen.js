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

        <Card style={styles.formCard}>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
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
});

export default EditProductScreen;


