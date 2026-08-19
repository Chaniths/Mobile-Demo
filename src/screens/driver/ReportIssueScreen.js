import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import BackgroundShapes from "../../components/common/BackgroundShapes";
import { useDriverData } from "../../hooks/useDriverData";
import { driverApi } from "../../api/driverApi";

const ISSUE_TYPES = [
  { key: "CUSTOMER_UNAVAILABLE", label: "Customer Unavailable" },
  { key: "ADDRESS_NOT_FOUND", label: "Address Not Found" },
  { key: "VEHICLE_ISSUE", label: "Vehicle Issue" },
  { key: "TRAFFIC_DELAY", label: "Traffic Delay" },
  { key: "PRODUCT_DAMAGED", label: "Product Damaged" },
  { key: "OTHER", label: "Other" },
];

const ReportIssueScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { deliveryId } = route.params || {};
  const { data } = useDriverData();
  const delivery = useMemo(
    () => data.orders.find((order) => order.id === deliveryId) || null,
    [data.orders, deliveryId],
  );

  const [issueType, setIssueType] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = issueType.length > 0 && details.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert("Required", "Please select an issue type and describe what happened.");
      return;
    }

    setSubmitting(true);
    try {
      await driverApi.reportIssue({
        issueType,
        description: details.trim(),
        deliveryId: delivery?.id,
        stopId: delivery?.currentStopId,
      });
      Alert.alert("Sent", "Your issue has been sent to dispatch.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not send issue report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <BackgroundShapes variant="form" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Report an issue
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Let dispatch know what's blocking this delivery so they can help quickly.
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

        <Card style={styles.formCard}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
            Issue type
          </Text>
          <View style={styles.pillRow}>
            {ISSUE_TYPES.map((item) => {
              const selected = issueType === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setIssueType(item.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected
                        ? theme.colors.primary.main
                        : `${theme.colors.primary.main}14`,
                      borderColor: theme.colors.primary.main,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: selected ? "#fff" : theme.colors.primary.main },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="What happened?"
            placeholder="Describe the issue so the ops team can help you fast"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <Button
            title={submitting ? "" : "Send to dispatch"}
            onPress={handleSubmit}
            disabled={submitting || !canSubmit}
            style={[styles.submitButton, (!canSubmit && !submitting) && styles.submitDisabled]}
          >
            {submitting && <ActivityIndicator color="#fff" size="small" />}
          </Button>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={submitting}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 8 },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 16 },
  deliveryCard: { padding: 14, marginBottom: 16 },
  deliveryTitle: { fontSize: 16, fontWeight: "700" },
  deliveryMeta: { fontSize: 13, marginTop: 4 },
  formCard: { padding: 14 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: { fontSize: 13, fontWeight: "600" },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  submitButton: { marginTop: 8, marginBottom: 8 },
  submitDisabled: { opacity: 0.5 },
  cancelButton: {},
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

export default ReportIssueScreen;
