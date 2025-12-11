import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const AddProductScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [expectedVolume, setExpectedVolume] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmitRequest = () => {
    // Demo only – in a real app this would send a request to admin / back office.
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {theme.isDarkMode && (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Request new product
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Send a request to the FreshRoute admin team. They will review and create the product in
          the catalog for you.
        </Text>

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.formCard}>
          <Input
            label="Product name (requested)"
            placeholder="Eg. Organic apples"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Category (requested)"
            placeholder="Eg. Fruits, Leafy greens, Dairy"
            value={category}
            onChangeText={setCategory}
          />
          <Input
            label="Expected selling price"
            placeholder="Eg. 4.99"
            value={expectedPrice}
            onChangeText={setExpectedPrice}
            keyboardType="decimal-pad"
          />
          <Input
            label="Expected weekly volume"
            placeholder="Eg. 40kg per week"
            value={expectedVolume}
            onChangeText={setExpectedVolume}
            keyboardType="default"
          />
          <Input
            label="Notes to admin"
            placeholder="Any quality, sourcing or packaging details the admin should know"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <View style={styles.infoBox}>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Once approved by admin, the product will appear in your catalog and you can manage
              stock and pricing. You won&apos;t be able to change the product name or category
              yourself.
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              title="Send for approval"
              onPress={handleSubmitRequest}
              style={styles.primaryButton}
            />
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
    paddingBottom: 120,
    zIndex: 1,
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
  infoBox: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
  },
});

export default AddProductScreen;


