import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
<<<<<<< HEAD
import BackgroundShapes from '../../components/common/BackgroundShapes';

const AssessmentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState(null);
=======
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
import AppIcon from '../../components/common/AppIcon';

const AssessmentScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState(null); // 'driver', 'buyer', 'seller'
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [candidates, setCandidates] = useState({ drivers: [], buyers: [], sellers: [] });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');

  const assessmentTypes = [
<<<<<<< HEAD
    { id: 'driver', label: 'Driver\nAssessment', icon: '🚚', color: '#3b82f6' },
    { id: 'buyer', label: 'Buyer\nAssessment', icon: '👤', color: '#22c55e' },
    { id: 'seller', label: 'Seller\nAssessment', icon: '🏪', color: '#f59e0b' },
  ];

  const mockSubjects = {
    driver: { name: 'Mike Johnson', orderId: '#ORD-2024-042', extra: 'Route: Route #12' },
    buyer: { name: 'John Doe', orderId: '#ORD-2024-042', extra: 'Total Orders: 24' },
    seller: { name: 'Green Market', orderId: '#ORD-2024-042', extra: 'Quality Score: 4.5' },
  };
=======
    { id: 'driver', label: 'Driver Assessment', icon: 'truck', color: '#3b82f6' },
    { id: 'buyer', label: 'Buyer Assessment', icon: 'profile', color: '#22c55e' },
    { id: 'seller', label: 'Seller Assessment', icon: 'store', color: '#f59e0b' },
  ];

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const data = await fieldAdminApi.getAssessmentCandidates();
        setCandidates(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load assessment candidates.');
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  const candidateList = useMemo(() => {
    if (!selectedType) return [];
    const map = {
      driver: candidates.drivers,
      buyer: candidates.buyers,
      seller: candidates.sellers,
    };
    return map[selectedType] || [];
  }, [selectedType, candidates]);

  useEffect(() => {
    if (!selectedType) {
      setSelectedCandidateId(null);
      setIsPickerVisible(false);
      return;
    }
    const defaultCandidate = candidateList[0] || null;
    setSelectedCandidateId(defaultCandidate?.id ?? null);
  }, [selectedType, candidateList]);

  const currentSubject = useMemo(
    () => candidateList.find((candidate) => candidate.id === selectedCandidateId) || null,
    [candidateList, selectedCandidateId]
  );

  const filteredCandidates = useMemo(() => {
    const query = candidateSearch.trim().toLowerCase();
    if (!query) return candidateList;
    return candidateList.filter((candidate) => candidate.name?.toLowerCase().includes(query));
  }, [candidateList, candidateSearch]);
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

  const handleSubmit = () => {
    if (!selectedType || rating === 0 || !comments.trim()) {
      alert('Please complete all fields');
      return;
    }
<<<<<<< HEAD
    console.log('Assessment submitted:', { type: selectedType, subject: mockSubjects[selectedType], rating, comments });
    navigation.goBack();
=======
    if (!currentSubject?.id) {
      Alert.alert('Unavailable', 'No candidate found for selected assessment type.');
      return;
    }
    const submit = async () => {
      try {
        setSubmitting(true);
        await fieldAdminApi.submitAssessment({
          type: selectedType,
          targetUserId: currentSubject.id,
          rating,
          comment: comments,
        });
        Alert.alert('Success', 'Assessment submitted.');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Failed to submit assessment.');
      } finally {
        setSubmitting(false);
      }
    };
    submit();
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  };

  const teal = theme.colors.primary?.main || '#14b8a6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
<<<<<<< HEAD
      <BackgroundShapes variant="form" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: teal }]}>{'<- Back'}</Text>
=======
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Assessment</Text>
          <View style={{ width: 70 }} />
        </View>

<<<<<<< HEAD
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
=======
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
              <AppIcon name={type.icon} size={24} color={type.color} />
              <Text
                style={[
                  styles.typeLabel,
                  { color: theme.colors.text.primary },
                  selectedType === type.id && { fontWeight: '700', color: type.color },
                ]}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
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
<<<<<<< HEAD
            {/* Subject Card */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>
                {selectedType === 'driver' ? 'DRIVER' : selectedType === 'buyer' ? 'BUYER' : 'SELLER'}
=======
            {loading ? <ActivityIndicator color={theme.colors.primary.main} style={{ marginBottom: 16 }} /> : null}
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.subjectCard}>
              <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
                {selectedType === 'driver' ? 'Driver' : selectedType === 'buyer' ? 'Buyer' : 'Seller'}
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
              </Text>
              {candidateList.length > 0 ? (
                <TouchableOpacity
                  style={[
                    styles.openPickerButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                    },
                  ]}
                  onPress={() => setIsPickerVisible(true)}
                >
                  <Text style={[styles.openPickerText, { color: theme.colors.text.primary }]}>
                    {currentSubject?.name ? `Selected: ${currentSubject.name}` : 'Select candidate'}
                  </Text>
                  <Text style={[styles.openPickerChevron, { color: theme.colors.primary.main }]}>▼</Text>
                </TouchableOpacity>
              ) : null}
              <Text style={[styles.subjectName, { color: theme.colors.text.primary }]}>
                {currentSubject?.name ?? 'No assigned candidate'}
              </Text>
<<<<<<< HEAD
              <Text style={styles.subjectMeta}>Order: {mockSubjects[selectedType].orderId}</Text>
              <Text style={styles.subjectMeta}>{mockSubjects[selectedType].extra}</Text>
            </View>
=======
            </Card>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400

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

<<<<<<< HEAD
            {/* Comments */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Comments</Text>
            <View style={styles.inputCard}>
=======
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Comments
            </Text>
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.commentsCard}>
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
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

<<<<<<< HEAD
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: teal }]} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitText}>Submit Assessment</Text>
            </TouchableOpacity>
=======
            <Button
              title={submitting ? 'Submitting...' : 'Submit Assessment'}
              onPress={handleSubmitAssessment}
              disabled={submitting || !currentSubject}
              style={styles.submitButton}
            />
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
          </>
        )}
      </ScrollView>

      <Modal
        visible={isPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsPickerVisible(false)} />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Choose {selectedType === 'driver' ? 'Driver' : selectedType === 'buyer' ? 'Buyer' : 'Seller'}
            </Text>
            <TextInput
              style={[
                styles.modalSearchInput,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                },
              ]}
              placeholder="Search by name..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={candidateSearch}
              onChangeText={setCandidateSearch}
            />
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {filteredCandidates.map((candidate) => {
                const selected = selectedCandidateId === candidate.id;
                return (
                  <TouchableOpacity
                    key={candidate.id}
                    style={[
                      styles.modalListItem,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.02)' : '#ffffff',
                      },
                      selected && {
                        borderColor: theme.colors.primary.main,
                        backgroundColor: theme.isDarkMode ? 'rgba(45, 122, 135, 0.25)' : 'rgba(22, 163, 74, 0.12)',
                      },
                    ]}
                    onPress={() => {
                      setSelectedCandidateId(candidate.id);
                      setIsPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalListItemText,
                        { color: theme.colors.text.primary },
                        selected && { color: theme.colors.primary.main, fontWeight: '700' },
                      ]}
                    >
                      {candidate.name}
                    </Text>
                    {selected ? (
                      <Text style={[styles.modalSelectedTick, { color: theme.colors.primary.main }]}>✓</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
              {filteredCandidates.length === 0 ? (
                <Text style={[styles.modalEmptyText, { color: theme.colors.text.secondary }]}>
                  No matches found.
                </Text>
              ) : null}
            </ScrollView>
            <Button title="Close" onPress={() => setIsPickerVisible(false)} style={styles.modalCloseButton} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
=======
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
<<<<<<< HEAD
  backText: { fontSize: 16, fontWeight: '600' },
=======
  backButton: { fontSize: 16, fontWeight: '600' },
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
  headerTitle: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },

  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 18, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0dcd9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  typeIcon: { fontSize: 32, marginBottom: 8 },
<<<<<<< HEAD
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
=======
  typeLabel: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  subjectCard: { padding: 16, marginBottom: 24 },
  openPickerButton: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openPickerText: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  openPickerChevron: { fontSize: 14, fontWeight: '700' },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#94a3b8',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  modalSearchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  modalList: { maxHeight: 320 },
  modalListItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalListItemText: { fontSize: 15, fontWeight: '500' },
  modalSelectedTick: { fontSize: 16, fontWeight: '700' },
  modalEmptyText: { textAlign: 'center', paddingVertical: 16, fontSize: 13 },
  modalCloseButton: { marginTop: 4 },
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
>>>>>>> 6bb2a0aca91423e584391ea2099b3ef34a352400
});

export default AssessmentScreen;
