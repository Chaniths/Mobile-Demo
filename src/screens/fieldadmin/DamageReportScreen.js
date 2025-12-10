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

const DamageReportScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [damageType, setDamageType] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [affectedItems, setAffectedItems] = useState('');

  const order = route?.params?.order || {
    id: '1',
    orderId: '#ORD-2024-042',
    customer: 'John Doe',
    items: [
      { name: 'Heirloom Tomatoes', quantity: '5kg' },
      { name: 'Organic Spinach', quantity: '10 bunches' },
    ],
  };

  const damageTypes = ['Product Damage', 'Packaging Damage', 'Transport Damage', 'Other'];
  const severityLevels = ['Minor', 'Moderate', 'Severe', 'Critical'];

  const handleSubmitReport = () => {
    if (!damageType || !severity || !description.trim()) {
      alert('Please fill all required fields');
      return;
    }
    // In real app, this would make an API call
    console.log('Damage reported:', {
      orderId: order.orderId,
      damageType,
      severity,
      description,
      affectedItems,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Report Damage
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Card style={styles.orderCard}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Order ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Customer</Text>
          <Text style={[styles.detail, { color: theme.colors.text.primary }]}>{order.customer}</Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Damage Type
        </Text>
        <View style={styles.optionsContainer}>
          {damageTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionCard,
                {
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.colors.card || '#f9fafb',
                },
                damageType === type && {
                  borderColor: theme.colors.error,
                  backgroundColor: `${theme.colors.error}20`,
                },
              ]}
              onPress={() => setDamageType(type)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: theme.colors.text.primary },
                  damageType === type && { color: theme.colors.error, fontWeight: '700' },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Severity Level
        </Text>
        <View style={styles.optionsContainer}>
          {severityLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionCard,
                {
                  borderColor: theme.colors.border.light || theme.colors.border?.light || '#e5e7eb',
                  backgroundColor: theme.colors.card || '#f9fafb',
                },
                severity === level && {
                  borderColor: theme.colors.warning,
                  backgroundColor: `${theme.colors.warning}20`,
                },
              ]}
              onPress={() => setSeverity(level)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: theme.colors.text.primary },
                  severity === level && { color: theme.colors.warning, fontWeight: '700' },
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Affected Items
        </Text>
        <Card style={styles.inputCard}>
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="List damaged items (e.g., Tomatoes - 2kg, Spinach - 5 bunches)..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={3}
            value={affectedItems}
            onChangeText={setAffectedItems}
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Description (Required)
        </Text>
        <Card style={styles.inputCard}>
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="Describe the damage in detail..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
          />
        </Card>

        <Button
          title="Submit Damage Report"
          onPress={handleSubmitReport}
          style={[styles.submitButton, { backgroundColor: theme.colors.primary.main }]}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { fontSize: 16, color: '#16a34a', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  orderCard: { padding: 16, marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  orderId: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  detail: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  optionsContainer: { gap: 10, marginBottom: 24 },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 15, fontWeight: '500' },
  inputCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  submitButton: { marginTop: 8 },
});

export default DamageReportScreen;

