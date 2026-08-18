import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
import AppIcon from '../../components/common/AppIcon';

const mapHandoffOrder = (order, handoff) => ({
  id: order.id,
  orderId: `#${order.orderNumber}`,
  orderNumber: order.orderNumber,
  customer: order.customer ?? 'Customer',
  address: order.dropoff?.address || order.pickup?.sellerStops?.[0]?.address || order.address || order.deliveryAddress || '-',
  currentPhase: order.currentPhase,
  items: order.items?.map(
    (item) => `${item.product?.name ?? 'Item'} x${item.quantity}${item.isInspected ? '' : ' (inspect)'}`
  ) ?? [],
  pickup: order.pickup,
  dropoff: order.dropoff,
  routeId: handoff.route.id,
  routeNumber: handoff.route.routeNumber,
  batchNumber: handoff.batch.batchNumber,
});

const OrderCard = ({ order, theme, navigation, handoff }) => (
  <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>{order.orderId}</Text>
      <View
        style={[
          styles.phaseBadge,
          {
            backgroundColor:
              order.currentPhase === 'DROPOFF'
                ? `${theme.colors.success}20`
                : order.currentPhase === 'COMPLETED'
                  ? `${theme.colors.text.secondary}20`
                  : `${theme.colors.primary.main}20`,
          },
        ]}
      >
        <Text
          style={[
            styles.phaseBadgeText,
            {
              color:
                order.currentPhase === 'DROPOFF'
                  ? theme.colors.success
                  : order.currentPhase === 'COMPLETED'
                    ? theme.colors.text.secondary
                    : theme.colors.primary.main,
            },
          ]}
        >
          {order.currentPhase === 'PICKUP' ? 'Pickup' : order.currentPhase === 'DROPOFF' ? 'Dropoff' : 'Done'}
        </Text>
      </View>
    </View>
    <Text style={[styles.orderCustomer, { color: theme.colors.text.primary }]}>{order.customer}</Text>
    <View style={styles.addressRow}>
      <AppIcon name="location" size={14} color={theme.colors.text.secondary} />
      <Text style={[styles.orderAddress, { color: theme.colors.text.secondary }]}>{order.address}</Text>
    </View>
    <Text style={[styles.orderItems, { color: theme.colors.text.secondary }]}>
      Items: {order.items.join(', ') || 'No items'}
    </Text>
    {order.currentPhase !== 'COMPLETED' ? (
      <View style={styles.orderActions}>
        <Button
          title={order.currentPhase === 'PICKUP' ? 'Confirm Pickup' : 'Confirm Dropoff'}
          onPress={() => navigation.navigate('DeliveryPickup', { order, handoff })}
          variant="outline"
          style={styles.actionButton}
        />
      </View>
    ) : null}
  </Card>
);

const RouteOrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHandoffs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fieldAdminApi.getRouteHandoffs();
      setHandoffs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load route handoffs:', error?.message || error);
      setHandoffs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHandoffs();
    }, [loadHandoffs])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode ? (
        <>
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      ) : (
        <>
          <View style={[styles.archStrip1, styles.lightModeArchStrip1]} />
          <View style={[styles.archStrip2, styles.lightModeArchStrip2]} />
          <View style={[styles.archStrip3, styles.lightModeArchStrip3]} />
          <View style={[styles.archStrip4, styles.lightModeArchStrip4]} />
        </>
      )}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Route Orders</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? <ActivityIndicator color={theme.colors.primary.main} style={{ marginVertical: 24 }} /> : null}

        {!loading && handoffs.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            No active routes assigned to you.
          </Text>
        ) : null}

        {handoffs.map((handoff) => {
          const pickupOrders = handoff.orders
            .filter((order) => order.currentPhase === 'PICKUP')
            .map((order) => mapHandoffOrder(order, handoff));
          const dropoffOrders = handoff.orders
            .filter((order) => order.currentPhase === 'DROPOFF')
            .map((order) => mapHandoffOrder(order, handoff));
          const completedOrders = handoff.orders
            .filter((order) => order.currentPhase === 'COMPLETED')
            .map((order) => mapHandoffOrder(order, handoff));

          return (
            <Card variant={theme.isDarkMode ? 'glass' : 'default'} key={handoff.route.id} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <View>
                  <Text style={[styles.routeId, { color: theme.colors.text.primary }]}>
                    {handoff.route.routeNumber}
                  </Text>
                  <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>
                    Batch {handoff.batch.batchNumber}
                  </Text>
                  <Text style={[styles.routeDetail, { color: theme.colors.text.secondary }]}>
                    Phase: {handoff.route.currentPhase === 'PICKUP' ? 'Pickup cluster' : handoff.route.currentPhase === 'DROPOFF' ? 'Dropoff cluster' : 'Completed'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        handoff.route.currentPhase === 'DROPOFF'
                          ? `${theme.colors.success}20`
                          : `${theme.colors.info}20`,
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: theme.colors.info }]}>{handoff.route.status}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={[styles.ordersTitle, { color: theme.colors.text.primary }]}>
                Pickup phase ({pickupOrders.length})
              </Text>
              {pickupOrders.length === 0 ? (
                <Text style={[styles.sectionEmpty, { color: theme.colors.text.secondary }]}>
                  All orders moved to dropoff or completed.
                </Text>
              ) : (
                pickupOrders.map((order) => (
                  <OrderCard key={order.id} order={order} theme={theme} navigation={navigation} handoff={handoff} />
                ))
              )}

              <Text style={[styles.ordersTitle, { color: theme.colors.text.primary, marginTop: 16 }]}>
                Dropoff phase ({dropoffOrders.length})
              </Text>
              {dropoffOrders.length === 0 ? (
                <Text style={[styles.sectionEmpty, { color: theme.colors.text.secondary }]}>
                  Complete pickup for all orders before dropoff begins.
                </Text>
              ) : (
                dropoffOrders.map((order) => (
                  <OrderCard key={order.id} order={order} theme={theme} navigation={navigation} handoff={handoff} />
                ))
              )}

              {completedOrders.length > 0 ? (
                <>
                  <Text style={[styles.ordersTitle, { color: theme.colors.text.primary, marginTop: 16 }]}>
                    Completed ({completedOrders.length})
                  </Text>
                  {completedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} theme={theme} navigation={navigation} handoff={handoff} />
                  ))}
                </>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, zIndex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSpacer: { width: 56 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeCard: { padding: 16, marginBottom: 24 },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeId: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  routeDetail: { fontSize: 13, marginBottom: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  ordersTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  sectionEmpty: { fontSize: 13, marginBottom: 12 },
  emptyText: { textAlign: 'center', marginTop: 24, fontSize: 14 },
  orderCard: { padding: 12, marginBottom: 12 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontSize: 15, fontWeight: '700' },
  phaseBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  phaseBadgeText: { fontSize: 11, fontWeight: '700' },
  orderCustomer: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  orderAddress: { fontSize: 13, marginBottom: 4 },
  orderItems: { fontSize: 12, marginBottom: 12 },
  orderActions: { marginTop: 4 },
  actionButton: { marginBottom: 0 },
  lightModeArchStrip1: { backgroundColor: 'rgba(22, 163, 74, 0.3)', opacity: 0.7 },
  lightModeArchStrip2: { backgroundColor: 'rgba(34, 197, 94, 0.35)', opacity: 0.6 },
  lightModeArchStrip3: { backgroundColor: 'rgba(22, 163, 74, 0.25)', opacity: 0.5 },
  lightModeArchStrip4: { backgroundColor: 'rgba(34, 197, 94, 0.3)', opacity: 0.6 },
});

export default RouteOrdersScreen;
