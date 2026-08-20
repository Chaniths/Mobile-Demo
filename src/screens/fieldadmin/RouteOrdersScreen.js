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
import { selectCurrentRouteHandoffs } from '../../utils/fieldAdminRoutes';

const QUALITY_META = {
  APPROVED: { label: 'Passed', color: '#22c55e' },
  PARTIAL: { label: 'Partial', color: '#f59e0b' },
  REJECTED: { label: 'Rejected', color: '#ef4444' },
  PENDING: { label: 'Pending', color: '#94a3b8' },
};

const itemQualityStatus = (item) => {
  const status = String(item?.inspectionStatus ?? item?.inspections?.[0]?.result ?? '').toUpperCase();
  if (status === 'APPROVED' || status === 'PARTIAL' || status === 'REJECTED') return status;
  return 'PENDING';
};

const orderQualityStatus = (items) => {
  if (!items.length) return 'PENDING';
  const statuses = items.map((item) => item.quality);
  if (statuses.some((status) => status === 'PENDING')) return 'PENDING';
  if (statuses.every((status) => status === 'APPROVED')) return 'APPROVED';
  if (statuses.every((status) => status === 'REJECTED')) return 'REJECTED';
  return 'PARTIAL';
};

const qualityLabel = (status) => QUALITY_META[status]?.label ?? status;
const qualityColor = (status) => QUALITY_META[status]?.color ?? '#94a3b8';

const mapQualityItems = (order) =>
  (order.items ?? []).map((item) => {
    const latest = item.inspections?.[0] ?? {};
    const quality = itemQualityStatus(item);
    return {
      id: item.orderItemId ?? item.id,
      name: item.product?.name ?? item.name ?? 'Item',
      quantity: Number(item.quantity ?? 0),
      unit: item.product?.unit ?? item.unit ?? '',
      quality,
      approvedQuantity: latest.approvedQuantity ?? (quality === 'APPROVED' ? item.quantity : quality === 'REJECTED' ? 0 : null),
      rejectedQuantity: latest.rejectedQuantity ?? (quality === 'REJECTED' ? item.quantity : null),
    };
  });

const flattenQualityOrders = (handoffs) =>
  (handoffs ?? []).flatMap((handoff) =>
    (handoff.orders ?? []).map((order) => {
      const items = mapQualityItems(order);
      return {
        id: order.id,
        source: order,
        handoff,
        orderNumber: order.orderNumber,
        customer: order.customer ?? 'Customer',
        batchNumber: handoff.batch?.batchNumber ?? '',
        routeNumber: handoff.route?.routeNumber ?? '',
        items,
        quality: orderQualityStatus(items),
      };
    })
  );

const SummaryChip = ({ label, count, color }) => (
  <View style={[styles.summaryChip, { borderColor: `${color}55`, backgroundColor: `${color}18` }]}>
    <Text style={[styles.summaryCount, { color }]}>{count}</Text>
    <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
  </View>
);

const QualityBadge = ({ status }) => (
  <View style={[styles.qualityBadge, { backgroundColor: `${qualityColor(status)}22` }]}>
    <Text style={[styles.qualityBadgeText, { color: qualityColor(status) }]}>{qualityLabel(status)}</Text>
  </View>
);

const OrderQualityCard = ({ order, theme, navigation }) => {
  const pending = order.items.some((item) => item.quality === 'PENDING');
  return (
    <Card variant={theme.isDarkMode ? 'glass' : 'default'} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>#{order.orderNumber}</Text>
          <Text style={[styles.orderCustomer, { color: theme.colors.text.primary }]}>{order.customer}</Text>
          <Text style={[styles.orderMeta, { color: theme.colors.text.secondary }]}>
            {order.batchNumber || order.routeNumber}
          </Text>
        </View>
        <QualityBadge status={order.quality} />
      </View>

      {order.items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.productRow,
            { borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' },
          ]}
        >
          <View style={styles.productRowTop}>
            <Text style={[styles.productName, { color: theme.colors.text.primary }]}>{item.name}</Text>
            <Text style={[styles.productStatus, { color: qualityColor(item.quality) }]}>
              {qualityLabel(item.quality)}
            </Text>
          </View>
          <Text style={[styles.productDetail, { color: theme.colors.text.secondary }]}>
            Ordered {item.quantity} {item.unit}
            {item.quality === 'PARTIAL' && item.approvedQuantity != null
              ? ` · Approved ${item.approvedQuantity} ${item.unit}`
              : ''}
            {item.quality === 'REJECTED'
              ? ` · Rejected ${item.rejectedQuantity ?? item.quantity} ${item.unit}`
              : ''}
            {item.quality === 'APPROVED' ? ' · Full quantity passed' : ''}
            {item.quality === 'PENDING' ? ' · Not inspected yet' : ''}
          </Text>
        </View>
      ))}

      {pending ? (
        <Button
          title="Inspect Quality"
          onPress={() =>
            navigation.navigate('QualityConfirm', {
              order: order.source,
              handoff: order.handoff,
            })
          }
          variant="outline"
          style={styles.actionButton}
        />
      ) : null}
    </Card>
  );
};

const RouteOrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const visibleHandoffs = useMemo(() => selectCurrentRouteHandoffs(handoffs), [handoffs]);
  const qualityOrders = useMemo(() => flattenQualityOrders(visibleHandoffs), [visibleHandoffs]);

  const summary = useMemo(() => {
    const counts = { APPROVED: 0, PARTIAL: 0, REJECTED: 0, PENDING: 0 };
    qualityOrders.forEach((order) => {
      counts[order.quality] = (counts[order.quality] ?? 0) + 1;
    });
    return counts;
  }, [qualityOrders]);

  const loadHandoffs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fieldAdminApi.getRouteHandoffs();
      setHandoffs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load quality orders:', error?.message || error);
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

  const canGoBack = navigation.canGoBack();

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
          {canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.backButton, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                ← Back
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Quality</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.pageHint, { color: theme.colors.text.secondary }]}>
          Today’s batch quality inspections by order and product.
        </Text>

        <View style={styles.summaryRow}>
          <SummaryChip label="Passed" count={summary.APPROVED} color="#22c55e" />
          <SummaryChip label="Partial" count={summary.PARTIAL} color="#f59e0b" />
          <SummaryChip label="Rejected" count={summary.REJECTED} color="#ef4444" />
          <SummaryChip label="Pending" count={summary.PENDING} color="#94a3b8" />
        </View>

        {loading ? <ActivityIndicator color={theme.colors.primary.main} style={{ marginVertical: 24 }} /> : null}

        {!loading && qualityOrders.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            No quality inspections for today’s batches.
          </Text>
        ) : null}

        {qualityOrders.map((order) => (
          <OrderQualityCard key={order.id} order={order} theme={theme} navigation={navigation} />
        ))}
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
    paddingBottom: 8,
  },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSpacer: { width: 56 },
  pageHint: { fontSize: 13, marginBottom: 14, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryCount: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 24, fontSize: 14 },
  orderCard: { padding: 14, marginBottom: 14 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  orderHeaderLeft: { flex: 1 },
  orderId: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  orderCustomer: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  orderMeta: { fontSize: 12 },
  qualityBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  qualityBadgeText: { fontSize: 11, fontWeight: '800' },
  productRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  productRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  productName: { fontSize: 13, fontWeight: '700', flex: 1 },
  productStatus: { fontSize: 12, fontWeight: '800' },
  productDetail: { fontSize: 12, marginTop: 4 },
  actionButton: { marginTop: 6 },
  lightModeArchStrip1: { backgroundColor: 'rgba(22, 163, 74, 0.3)', opacity: 0.7 },
  lightModeArchStrip2: { backgroundColor: 'rgba(34, 197, 94, 0.35)', opacity: 0.6 },
  lightModeArchStrip3: { backgroundColor: 'rgba(22, 163, 74, 0.25)', opacity: 0.5 },
  lightModeArchStrip4: { backgroundColor: 'rgba(34, 197, 94, 0.3)', opacity: 0.6 },
});

export default RouteOrdersScreen;
