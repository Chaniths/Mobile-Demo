import React, { useCallback, useMemo, useState } from 'react';
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
import { orderNeedsQualityCheck } from '../../utils/fieldAdminQualityFlow';

const ACTIVE_ON_TRUCK = new Set(['BATCHED', 'ASSIGNED', 'IN_TRANSIT']);

const scheduledAtMs = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const inspectableItems = (order) =>
  Array.isArray(order?.items)
    ? order.items.filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    : [];

const itemLine = (item) => {
  const name = item.name || item.product?.name || 'Item';
  const qty = item.quantity ?? item.qty ?? '';
  const unit = item.unit || item.product?.unit || '';
  const status = item.inspectionStatus || item.inspections?.[0]?.result;
  const statusLabel = status ? ` · ${String(status).toLowerCase()}` : ' · pending quality';
  return `${name} ×${qty} ${unit}${statusLabel}`.trim();
};

const TruckCapacityScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllocatedTrucks = useCallback(async () => {
    try {
      setLoading(true);
      // Allocation is on the batch: each closed/routed batch has a fieldAdminId and a truckId.
      // Handoffs are those batches; route/all is only used to read the truck's max kg/m³.
      const [handoffs, routes] = await Promise.all([
        fieldAdminApi.getRouteHandoffs(),
        fieldAdminApi.getRoutes(),
      ]);

      const truckById = new Map();
      (Array.isArray(routes) ? routes : []).forEach((route) => {
        if (route?.truck?.id) truckById.set(route.truck.id, route.truck);
      });

      const allocated = (Array.isArray(handoffs) ? handoffs : [])
        .map((handoff) => {
          const truckId = handoff?.route?.truckId || handoff?.batch?.truckId || null;
          const truck = (truckId && truckById.get(truckId)) || {};
          const batchOrders = Array.isArray(handoff?.orders) ? handoff.orders : [];
          return {
            id: handoff?.batch?.id,
            truckId,
            licensePlate: truck.vehicleNumber || 'Allocated truck',
            truckType: truck.vehicleType || 'Van',
            driver: 'Assigned with this batch',
            currentWeight: Number(handoff?.batchTotals?.totalWeight ?? 0),
            maxWeight: Number(truck.maxWeight ?? 0),
            currentVolume: Number(handoff?.batchTotals?.totalVolume ?? 0),
            maxVolume: Number(truck.maxVolume ?? 0),
            currentStops: Number(handoff?.batchTotals?.orderCount ?? batchOrders.length),
            maxStops: truck.maxStops ?? handoff?.batchTotals?.maxStopsApplied ?? null,
            batchNumber: handoff?.batch?.batchNumber || 'Batch',
            routeNumber: handoff?.route?.routeNumber || handoff?.batch?.batchNumber || '—',
            scheduledDate: handoff?.batch?.scheduledDate ?? null,
            timeWindowStart: handoff?.batch?.timeWindowStart ?? null,
            orders: batchOrders,
          };
        })
        .filter((entry) => entry.id && entry.truckId)
        .sort((a, b) => {
          const bySchedule = scheduledAtMs(b.scheduledDate) - scheduledAtMs(a.scheduledDate);
          if (bySchedule !== 0) return bySchedule;
          const byWindow = scheduledAtMs(b.timeWindowStart) - scheduledAtMs(a.timeWindowStart);
          if (byWindow !== 0) return byWindow;
          return String(b.batchNumber).localeCompare(String(a.batchNumber));
        });

      setTrucks(allocated[0] ? [allocated[0]] : []);
    } catch (error) {
      console.error('Failed to load allocated batch trucks:', error?.message || error);
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllocatedTrucks();
    }, [loadAllocatedTrucks])
  );

  const truck = trucks[0] || null;

  const onTruckOrders = useMemo(
    () =>
      (truck?.orders ?? []).filter((order) =>
        ACTIVE_ON_TRUCK.has(String(order.status ?? '').toUpperCase())
      ),
    [truck]
  );

  const currentWeight = truck?.currentWeight ?? 0;
  const maxWeight = truck?.maxWeight ?? 0;
  const capacityPercent = maxWeight > 0 ? Math.min(100, (currentWeight / maxWeight) * 100) : 0;
  const remainingWeight = Math.max(0, maxWeight - currentWeight);

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
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Truck Capacity</Text>
          <View style={{ width: 60 }} />
        </View>

        {loading ? <ActivityIndicator color={theme.colors.primary.main} style={{ marginVertical: 24 }} /> : null}

        {!loading && trucks.length === 0 ? (
          <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.capacityCard}>
            <Text style={[styles.detail, { color: theme.colors.text.secondary }]}>
              No truck is allocated to your batches yet.
            </Text>
          </Card>
        ) : null}

        {truck ? (
          <>
            <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.capacityCard}>
              <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Allocated truck capacity</Text>
              <Text style={[styles.detail, { color: theme.colors.text.primary }]}>
                License: {truck.licensePlate}
              </Text>
              <Text style={[styles.detail, { color: theme.colors.text.primary }]}>
                Type: {truck.truckType}
              </Text>
              <Text style={[styles.detail, { color: theme.colors.text.primary }]}>
                Batch: {truck.batchNumber}
              </Text>
              <View style={styles.divider} />
              <View style={styles.capacityBarContainer}>
                <View style={styles.capacityBar}>
                  <View
                    style={[
                      styles.capacityBarFill,
                      {
                        width: `${capacityPercent}%`,
                        backgroundColor:
                          capacityPercent > 80
                            ? theme.colors.error
                            : capacityPercent > 60
                              ? theme.colors.warning
                              : theme.colors.success,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.capacityText, { color: theme.colors.text.primary }]}>
                  {currentWeight} / {maxWeight} kg ({Math.round(capacityPercent)}%)
                </Text>
              </View>
              <Text style={[styles.detail, { color: theme.colors.text.secondary }]}>
                Remaining: {remainingWeight} kg · Volume {truck.currentVolume.toFixed(3)} / {truck.maxVolume} m³
              </Text>
              <Text style={[styles.detail, { color: theme.colors.text.secondary }]}>
                Orders on truck: {truck.currentStops}
                {truck.maxStops != null ? ` / ${truck.maxStops} stops` : ''}
              </Text>
            </Card>

            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Orders on this truck ({onTruckOrders.length})
            </Text>
            {onTruckOrders.length === 0 ? (
              <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.orderCard}>
                <Text style={[styles.detail, { color: theme.colors.text.secondary, marginBottom: 0 }]}>
                  No active orders occupying this truck.
                </Text>
              </Card>
            ) : (
              onTruckOrders.map((order) => {
                const items = inspectableItems(order);
                const needsQuality = orderNeedsQualityCheck(order);
                return (
                  <Card variant={theme.isDarkMode ? 'glass' : 'default'} key={order.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text style={[styles.truckPlate, { color: theme.colors.text.primary }]}>
                        #{order.orderNumber}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.warning}20` }]}>
                        <Text style={[styles.statusText, { color: theme.colors.warning }]}>
                          {String(order.status ?? '').replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.truckDriver, { color: theme.colors.text.secondary }]}>
                      {order.customer || 'Customer'}
                    </Text>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <Text
                          key={item.id || item.name}
                          style={[styles.itemLine, { color: theme.colors.text.secondary }]}
                        >
                          {itemLine(item)}
                        </Text>
                      ))
                    ) : (
                      <Text style={[styles.itemLine, { color: theme.colors.text.secondary }]}>
                        {order.itemCount ?? 0} items
                      </Text>
                    )}
                    {needsQuality ? (
                      <Button
                        title="Inspect quality"
                        variant="outline"
                        style={styles.orderAction}
                        onPress={() => navigation.navigate('QualityConfirm', { order })}
                      />
                    ) : null}
                  </Card>
                );
              })
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
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
  truckPlate: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  truckDriver: { fontSize: 13, marginBottom: 4 },
  capacityCard: { padding: 16, marginBottom: 24 },
  orderCard: { padding: 14, marginBottom: 12 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderAction: { marginTop: 10 },
  itemLine: { fontSize: 12, marginBottom: 2 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  detail: { fontSize: 14, marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(148, 163, 184, 0.25)', marginVertical: 12 },
  capacityBarContainer: { marginTop: 8, marginBottom: 8 },
  capacityBar: {
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  capacityText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  lightModeArchStrip1: { backgroundColor: 'rgba(22, 163, 74, 0.3)', opacity: 0.7 },
  lightModeArchStrip2: { backgroundColor: 'rgba(34, 197, 94, 0.35)', opacity: 0.6 },
  lightModeArchStrip3: { backgroundColor: 'rgba(22, 163, 74, 0.25)', opacity: 0.5 },
  lightModeArchStrip4: { backgroundColor: 'rgba(34, 197, 94, 0.3)', opacity: 0.6 },
});

export default TruckCapacityScreen;
