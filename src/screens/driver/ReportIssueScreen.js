import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useDriverData } from "../../hooks/useDriverData";

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

  const handleSubmit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Report an issue
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Let dispatch know if something is blocking this delivery so they can
          help quickly.
        </Text>

        {delivery && (
          <Card style={styles.deliveryCard}>
            <Text
              style={[
                styles.deliveryTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              {delivery.orderId} · {delivery.customer}
            </Text>
            <Text
              style={[
                styles.deliveryMeta,
                { color: theme.colors.text.secondary },
              ]}
            >
              {delivery.address}
            </Text>
          </Card>
        )}

        <Card style={styles.formCard}>
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
            <Text
              style={[styles.hintText, { color: theme.colors.text.secondary }]}
            >
              Report issue API is not provided yet. This screen now uses real
              delivery data and is ready for backend issue endpoint wiring.
            </Text>
          </View>

          <Button
            title="Send to dispatch"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
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
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 8 },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 16 },
  deliveryCard: { padding: 14, marginBottom: 16 },
  deliveryTitle: { fontSize: 16, fontWeight: "700" },
  deliveryMeta: { fontSize: 13, marginTop: 4 },
  formCard: { padding: 14 },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  hintBox: { marginTop: 8, marginBottom: 12 },
  hintText: { fontSize: 12 },
  submitButton: { marginTop: 4, marginBottom: 8 },
  cancelButton: {},
});

export default ReportIssueScreen;
