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
  };

  const damageTypes = ['Product Damage', 'Packaging Damage', 'Transport Damage', 'Other'];
  const severityLevels = ['Minor', 'Moderate', 'Severe', 'Critical'];

  const handleSubmitReport = () => {
    if (!damageType || !severity || !description.trim()) {
      alert('Please fill all required fields');
      return;
    }
    console.log('Damage reported:', { orderId: order.orderId, damageType, severity, description, affectedItems });
    navigation.goBack();
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <BackgroundShapes variant="detail" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Report Damage</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Order Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ORDER ID</Text>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
          <Text style={styles.fieldLabel}>CUSTOMER</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>{order.customer}</Text>
        </View>

        {/* Damage Type */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Damage Type</Text>
        <View style={styles.pillList}>
          {damageTypes.map((type) => {
            const isSelected = damageType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.pill, isSelected && { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}
                onPress={() => setDamageType(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: theme.colors.text.primary }, isSelected && { color: '#ef4444', fontWeight: '700' }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Severity */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Severity Level</Text>
        <View style={styles.pillList}>
          {severityLevels.map((level) => {
            const isSelected = severity === level;
            return (
              <TouchableOpacity
                key={level}
                style={[styles.pill, isSelected && { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}
                onPress={() => setSeverity(level)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: theme.colors.text.primary }, isSelected && { color: '#f59e0b', fontWeight: '700' }]}>
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Affected Items */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Affected Items</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary, minHeight: 80 }]}
            placeholder="List damaged items..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={3}
            value={affectedItems}
            onChangeText={setAffectedItems}
          />
        </View>

        {/* Description */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Description (Required)</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text.primary, minHeight: 120 }]}
            placeholder="Describe the damage in detail..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleSubmitReport} activeOpacity={0.8}>
          <Text style={styles.submitText}>Submit Damage Report</Text>
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
  fieldValue: { fontSize: 15, fontWeight: '500' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  pillList: { gap: 10, marginBottom: 24 },
  pill: {
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  pillText: { fontSize: 15, fontWeight: '500' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default DamageReportScreen;
