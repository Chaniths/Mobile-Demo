import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const statusColor = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  cancelled: '#ef4444',
};

// Demo order details – in a real app this would come from API / store
const ORDER_DETAILS = [
  {
    id: '1',
    orderId: '#ORD-001',
    status: 'pending',
    customer: 'John Doe',
    createdAt: 'Today · 09:42 AM',
    slot: 'Pickup with morning truck · 10:30 - 10:45 AM',
    items: [
      { id: 'i1', name: 'Organic Apples', qty: '10 kg', price: 45.0 },
      { id: 'i2', name: 'Fresh Spinach', qty: '5 crates', price: 28.5 },
    ],
    subtotal: 73.5,
    fees: 3.5,
    payout: 70.0,
  },
  {
    id: '2',
    orderId: '#ORD-002',
    status: 'confirmed',
    customer: 'Jane Smith',
    createdAt: 'Today · 09:10 AM',
    slot: 'Pickup with morning truck · 10:00 - 10:15 AM',
    items: [
      { id: 'i1', name: 'Raw Honey', qty: '6 jars', price: 54.0 },
      { id: 'i2', name: 'Tomatoes', qty: '8 crates', price: 32.5 },
    ],
    subtotal: 86.5,
    fees: 4.0,
    payout: 82.5,
  },
  {
    id: '3',
    orderId: '#ORD-003',
    status: 'pending',
    customer: 'Bob Johnson',
    createdAt: 'Today · 08:55 AM',
    slot: 'Pickup with midday truck · 12:00 - 12:20 PM',
    items: [{ id: 'i1', name: 'Mixed Vegetables', qty: '12 crates', price: 72.0 }],
    subtotal: 72.0,
    fees: 3.0,
    payout: 69.0,
  },
];

const findOrderById = (id) =>
  ORDER_DETAILS.find((order) => order.id === id) || ORDER_DETAILS[0];

const OrderDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { orderId } = route.params || {};

  const order = useMemo(() => findOrderById(orderId), [orderId]);
  const status = order.status || 'pending';
  const pillColor = statusColor[status] || (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main);

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
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            {order.orderId}
          </Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${pillColor}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: pillColor }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.subHeader, { color: theme.colors.text.secondary }]}>
          {order.createdAt}
        </Text>

        {/* Customer & slot */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.sectionCard}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
            Customer
          </Text>
          <Text style={[styles.sectionMain, { color: theme.colors.text.primary }]}>
            {order.customer}
          </Text>
          <Text style={[styles.sectionMeta, { color: theme.colors.text.tertiary }]}>
            {order.slot}
          </Text>
        </Card>

        {/* Items */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.sectionCard}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
            Items in this order
          </Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View>
                <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQty, { color: theme.colors.text.secondary }]}>
                  {item.qty}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Financial summary */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.sectionCard}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
            Financial summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
              Platform & logistics fees
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
              -${order.fees.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryPayoutLabel, { color: theme.colors.text.primary }]}>
              Payout to you
            </Text>
            <Text style={[styles.summaryPayoutValue, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
              ${order.payout.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="View in orders"
            variant="outline"
            onPress={() => navigation.navigate('Orders')}
            style={styles.actionButton}
          />
          <Button
            title="Back to dashboard"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  subHeader: {
    fontSize: 13,
    marginBottom: 12,
  },
  sectionCard: {
    padding: 14,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionMain: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionMeta: {
    fontSize: 13,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.3)',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemQty: {
    fontSize: 13,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.3)',
    marginVertical: 8,
  },
  summaryPayoutLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryPayoutValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
});

export default OrderDetailScreen;


