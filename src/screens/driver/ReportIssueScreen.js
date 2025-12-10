import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { findDeliveryById } from './deliveriesData';

const ReportIssueScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { deliveryId } = route.params || {};
  const delivery = deliveryId ? findDeliveryById(deliveryId) : null;

  const [issueType, setIssueType] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    // For demo purposes we just go back. Hook this up to your API later.
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {theme.isDarkMode && (
        <>
          <View style={styles.gradientCircle1} />
          <View style={styles.gradientCircle2} />
        </>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Report an issue
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Let dispatch know if something is blocking this delivery so they can help quickly.
        </Text>

        {delivery && (
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.deliveryCard}>
            <Text style={[styles.deliveryTitle, { color: theme.colors.text.primary }]}>
              {delivery.orderId} · {delivery.customer}
            </Text>
            <Text style={[styles.deliveryMeta, { color: theme.colors.text.secondary }]}>
              {delivery.address}
            </Text>
          </Card>
        )}

        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.formCard}>
          <Input
            label="Issue type"
            placeholder="Eg. Customer not available, Address mismatch, Vehicle breakdown"
            value={issueType}
            onChangeText={setIssueType}
          />
          <Input
            label="What happened?"
            placeholder="Describe the issue so the ops team can help you fast"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <View style={styles.hintBox}>
            <Text style={[styles.hintText, { color: theme.colors.text.secondary }]}>
              This is just a demo screen. In production you can hook this button to your support
              or dispatch workflow.
            </Text>
          </View>

          <Button title="Send to dispatch" onPress={handleSubmit} style={styles.submitButton} />
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
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
  gradientCircle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    opacity: 0.6,
    zIndex: 0,
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -192,
    right: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(35, 101, 113, 0.4)',
    opacity: 0.6,
    zIndex: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  deliveryCard: {
    padding: 14,
    marginBottom: 16,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  deliveryMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    padding: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hintBox: {
    marginTop: 8,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
  },
  submitButton: {
    marginTop: 4,
    marginBottom: 8,
  },
  cancelButton: {},
});

export default ReportIssueScreen;


