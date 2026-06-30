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

const AssessmentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  const assessmentTypes = [
    { id: 'driver', label: 'Driver\nAssessment', icon: '🚚', color: '#3b82f6' },
    { id: 'buyer', label: 'Buyer\nAssessment', icon: '👤', color: '#22c55e' },
    { id: 'seller', label: 'Seller\nAssessment', icon: '🏪', color: '#f59e0b' },
  ];

  const mockSubjects = {
    driver: { name: 'Mike Johnson', orderId: '#ORD-2024-042', extra: 'Route: Route #12' },
    buyer: { name: 'John Doe', orderId: '#ORD-2024-042', extra: 'Total Orders: 24' },
    seller: { name: 'Green Market', orderId: '#ORD-2024-042', extra: 'Quality Score: 4.5' },
  };

  const handleSubmit = () => {
    if (!selectedType || rating === 0 || !comments.trim()) {
      alert('Please complete all fields');
      return;
    }
    console.log('Assessment submitted:', { type: selectedType, subject: mockSubjects[selectedType], rating, comments });
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
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Assessment</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Type Selection */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Select Assessment Type</Text>
        <View style={styles.typeRow}>
          {assessmentTypes.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, isSelected && { borderColor: type.color, borderWidth: 2, backgroundColor: `${type.color}08` }]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeLabel, { color: theme.colors.text.primary }, isSelected && { fontWeight: '700', color: type.color }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedType && (
          <>
            {/* Subject Card */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>
                {selectedType === 'driver' ? 'DRIVER' : selectedType === 'buyer' ? 'BUYER' : 'SELLER'}
              </Text>
              <Text style={[styles.subjectName, { color: theme.colors.text.primary }]}>
                {mockSubjects[selectedType].name}
              </Text>
              <Text style={styles.subjectMeta}>Order: {mockSubjects[selectedType].orderId}</Text>
              <Text style={styles.subjectMeta}>{mockSubjects[selectedType].extra}</Text>
            </View>

            {/* Rating */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Rating (1-5)</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                  <Text style={[styles.star, rating >= star && styles.starFilled]}>
                    {rating >= star ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comments */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Comments</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={[styles.textInput, { color: theme.colors.text.primary }]}
                placeholder="Enter assessment comments..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={6}
                value={comments}
                onChangeText={setComments}
              />
            </View>

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitText}>Submit Assessment</Text>
            </TouchableOpacity>
          </>
        )}
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
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 18, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  typeIcon: { fontSize: 32, marginBottom: 8 },
  typeLabel: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 18 },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4 },
  subjectName: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  subjectMeta: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 28 },
  starBtn: { padding: 4 },
  star: { fontSize: 42, color: '#d1d5db' },
  starFilled: { color: '#fbbf24' },

  inputCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textInput: { fontSize: 14, minHeight: 140, textAlignVertical: 'top', lineHeight: 22 },

  submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default AssessmentScreen;
