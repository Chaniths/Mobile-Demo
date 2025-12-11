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

const AssessmentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState(null); // 'driver', 'buyer', 'seller'
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  const assessmentTypes = [
    { id: 'driver', label: 'Driver Assessment', icon: '🚚', color: '#3b82f6' },
    { id: 'buyer', label: 'Buyer Assessment', icon: '👤', color: '#22c55e' },
    { id: 'seller', label: 'Seller Assessment', icon: '🏪', color: '#f59e0b' },
  ];

  const mockSubjects = {
    driver: {
      id: 'driver-001',
      name: 'Mike Johnson',
      orderId: '#ORD-2024-042',
      route: 'Route #12',
    },
    buyer: {
      id: 'buyer-001',
      name: 'John Doe',
      orderId: '#ORD-2024-042',
      totalOrders: 24,
    },
    seller: {
      id: 'seller-001',
      name: 'Green Market',
      orderId: '#ORD-2024-042',
      qualityScore: 4.5,
    },
  };

  const handleSubmitAssessment = () => {
    if (!selectedType || rating === 0 || !comments.trim()) {
      alert('Please complete all fields');
      return;
    }
    // In real app, this would make an API call
    console.log('Assessment submitted:', {
      type: selectedType,
      subject: mockSubjects[selectedType],
      rating,
      comments,
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Assessment
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Select Assessment Type
        </Text>
        <View style={styles.typeContainer}>
          {assessmentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                selectedType === type.id && {
                  borderWidth: 2,
                  borderColor: type.color,
                  backgroundColor: `${type.color}10`,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  { color: theme.colors.text.primary },
                  selectedType === type.id && { fontWeight: '700', color: type.color },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedType && (
          <>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.subjectCard}>
              <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
                {selectedType === 'driver' ? 'Driver' : selectedType === 'buyer' ? 'Buyer' : 'Seller'}
              </Text>
              <Text style={[styles.subjectName, { color: theme.colors.text.primary }]}>
                {mockSubjects[selectedType].name}
              </Text>
              <Text style={[styles.subjectDetail, { color: theme.colors.text.secondary }]}>
                Order: {mockSubjects[selectedType].orderId}
              </Text>
              {selectedType === 'driver' && (
                <Text style={[styles.subjectDetail, { color: theme.colors.text.secondary }]}>
                  Route: {mockSubjects[selectedType].route}
                </Text>
              )}
            </Card>

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Rating (1-5)
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Text style={[styles.star, rating >= star && styles.starFilled]}>
                    {rating >= star ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Comments
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.commentsCard}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder="Enter assessment comments..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={6}
                value={comments}
                onChangeText={setComments}
              />
            </Card>

            <Button
              title="Submit Assessment"
              onPress={handleSubmitAssessment}
              style={styles.submitButton}
            />
          </>
        )}
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
    paddingBottom: 32,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  typeIcon: { fontSize: 32, marginBottom: 8 },
  typeLabel: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  subjectCard: { padding: 16, marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  subjectName: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subjectDetail: { fontSize: 14, marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 12 },
  starButton: { padding: 8 },
  star: { fontSize: 40, color: '#d1d5db' },
  starFilled: { color: '#fbbf24' },
  commentsCard: { padding: 16, marginBottom: 24 },
  input: { fontSize: 14, minHeight: 150, textAlignVertical: 'top' },
  submitButton: { marginTop: 8 },
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

export default AssessmentScreen;

