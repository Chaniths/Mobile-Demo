import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import AppIcon from '../../components/common/AppIcon';
import Button from '../../components/common/Button';
import fieldAdminApi from '../../api/fieldAdminApi';
import { isCurrentBatchOrder } from '../../utils/fieldAdminRoutes';

const statusColors = {
  ASSIGNED: '#3b82f6',
  BATCHED: '#2563eb',
  IN_TRANSIT: '#06b6d4',
  DELIVERED: '#22c55e',
  PENDING: '#f59e0b',
  PAID: '#f59e0b',
  PAYMENT_PENDING: '#f59e0b',
  PAYMENT_FAILED: '#ef4444',
  CANCELLED: '#ef4444',
  FAILED: '#ef4444',
};

const statusLabels = {
  ASSIGNED: 'Assigned',
  BATCHED: 'Batched',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  PENDING: 'Pending',
  PAID: 'Paid',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_FAILED: 'Payment Failed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

const phaseLabels = {
  AWAITING_SELLER_PICKUP: 'Awaiting seller pickup',
  AWAITING_HUB: 'Awaiting hub',
  IN_TRANSIT: 'In transit',
  DELIVERED: 'Delivered',
};

const inspectionLabels = {
  APPROVED: 'Approved',
  PARTIAL: 'Partial',
  REJECTED: 'Rejected',
};

const formatLkr = (value) => `LKR ${Number(value ?? 0).toFixed(2)}`;

const formatWhen = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const OrdersScreen = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fieldAdminApi.getOrdersByTab(activeTab);
        const mapped = data.map((order) => ({
          id: order.id,
          orderId: `#${order.orderNumber}`,
          date: new Date(order.placedAt).toLocaleDateString(),
          status: order.status,
          customer: order.customer,
          address: order.address,
          coords: order.coords,
          items: order.itemCount,
          total: order.totalAmount,
          route: order.route?.routeNumber || 'Not assigned',
          driver: order.driver?.name || 'Pending',
          eta: order.eta ? new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
          raw: order,
        }));
        setOrders(mapped);
      } catch (error) {
        console.error('Failed to load orders:', error?.message || error);
        setOrders([]);
      }
    };
    loadOrders();
  }, [activeTab]);

  const filteredOrders = useMemo(() => {
    const currentOrders = orders.filter((entry) => isCurrentBatchOrder(entry.raw));
    if (activeTab === 'all') return currentOrders;
    return currentOrders.filter((order) => {
      if (activeTab === 'scheduled') {
        return order.status === 'ASSIGNED' || order.status === 'BATCHED';
      }
      if (activeTab === 'in_transit') {
        return order.status === 'IN_TRANSIT';
      }
      if (activeTab === 'delivered') {
        return order.status === 'DELIVERED';
      }
      if (activeTab === 'pending') {
        return ['PENDING', 'PAID', 'PAYMENT_PENDING', 'PAYMENT_FAILED'].includes(order.status);
      }
      return true;
    });
  }, [activeTab, orders]);

  const renderOrder = ({ item }) => (
    <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
            {item.orderId}
          </Text>
          <Text style={[styles.orderDate, { color: theme.colors.text.secondary }]}>
            {item.date}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusColors[item.status] ?? '#64748b'}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColors[item.status] ?? '#64748b' }]}>
            {statusLabels[item.status] ?? item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Customer:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.customer}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Address:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.address}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Route:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.route}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            Driver:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.driver}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text style={[styles.orderLabel, { color: theme.colors.text.secondary }]}>
            ETA:
          </Text>
          <Text style={[styles.orderValue, { color: theme.colors.text.primary }]}>
            {item.eta}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={[styles.orderItems, { color: theme.colors.text.secondary }]}>
          {item.items} items
        </Text>
        <Text style={[styles.orderTotal, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
          LKR {item.total.toFixed(2)}
        </Text>
      </View>

      <View style={styles.orderActions}>
        <Button
          title="View Details"
          onPress={() => setDetailOrder(item)}
          variant="outline"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['all', 'pending', 'scheduled', 'in_transit', 'delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab
                      ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main)
                      : theme.colors.text.secondary,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { zIndex: 1 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<AppIcon name="orders" size={64} color={theme.colors.text.tertiary} />}
            title="No orders found"
            message={`No ${activeTab === 'all' ? '' : activeTab.replace('_', ' ')} orders available`}
          />
        }
      />
      <OrderDetailModal
        visible={Boolean(detailOrder)}
        order={detailOrder}
        theme={theme}
        onClose={() => setDetailOrder(null)}
      />
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value, theme }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.isDarkMode ? '#f8fafc' : '#0f172a' }]}>
      {value || '—'}
    </Text>
  </View>
);

const OrderDetailModal = ({ visible, order, theme, onClose }) => {
  const raw = order?.raw ?? order ?? {};
  const status = raw.status ?? order?.status;
  const phase = raw.fulfillmentPhase;
  const lineItems = Array.isArray(raw.items) ? raw.items : [];
  const accent = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBlur} activeOpacity={1} onPress={onClose} />
        <Card
          variant="default"
          elevation="lg"
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.isDarkMode ? 'rgba(8, 16, 22, 0.97)' : '#ffffff',
              borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Text style={[styles.modalEyebrow, { color: theme.isDarkMode ? '#94a3b8' : '#64748b' }]}>
                Order status
              </Text>
              <Text style={[styles.modalTitle, { color: theme.isDarkMode ? '#ffffff' : '#0f172a' }]}>
                {order?.orderId ?? (raw.orderNumber ? `#${raw.orderNumber}` : 'Order')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColors[status] ?? '#64748b'}20` }]}>
              <Text style={[styles.statusText, { color: statusColors[status] ?? '#64748b' }]}>
                {statusLabels[status] ?? status ?? 'Unknown'}
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            <Text style={[styles.modalSection, { color: accent }]}>Fulfillment</Text>
            <DetailRow theme={theme} label="Phase" value={phaseLabels[phase] ?? phase} />
            <DetailRow theme={theme} label="Stop" value={raw.stopStatus} />
            <DetailRow theme={theme} label="Placed" value={formatWhen(raw.placedAt)} />
            <DetailRow theme={theme} label="Delivered" value={raw.deliveredAt ? formatWhen(raw.deliveredAt) : 'Not yet'} />

            <Text style={[styles.modalSection, { color: accent }]}>Customer</Text>
            <DetailRow theme={theme} label="Name" value={raw.customer ?? order?.customer} />
            <DetailRow theme={theme} label="Address" value={raw.address ?? order?.address} />
            <DetailRow theme={theme} label="Email" value={raw.customerEmail} />

            <Text style={[styles.modalSection, { color: accent }]}>Assignment</Text>
            <DetailRow theme={theme} label="Route" value={raw.route?.routeNumber ?? order?.route} />
            <DetailRow theme={theme} label="Driver" value={raw.driver?.name ?? order?.driver} />
            <DetailRow theme={theme} label="Truck" value={raw.truck?.vehicleNumber} />
            <DetailRow theme={theme} label="ETA" value={order?.eta} />

            <Text style={[styles.modalSection, { color: accent }]}>Items</Text>
            {lineItems.length === 0 ? (
              <Text style={[styles.modalEmptyItems, { color: theme.isDarkMode ? '#94a3b8' : '#64748b' }]}>
                No line items on this order.
              </Text>
            ) : (
              lineItems.map((item) => {
                const inspect = String(item.inspectionStatus ?? '').toUpperCase();
                const qty = `${item.quantity ?? 0} ${item.unit ?? ''}`.trim();
                const lineTotal = Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRow,
                      {
                        borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.1)',
                        backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                      },
                    ]}
                  >
                    <View style={styles.itemRowTop}>
                      <Text style={[styles.itemName, { color: theme.isDarkMode ? '#ffffff' : '#0f172a' }]}>
                        {item.name ?? 'Item'}
                      </Text>
                      <Text style={[styles.itemPrice, { color: accent }]}>{formatLkr(lineTotal)}</Text>
                    </View>
                    <Text style={[styles.itemMeta, { color: theme.isDarkMode ? '#cbd5e1' : '#475569' }]}>
                      {qty} · {formatLkr(item.unitPrice)} each
                    </Text>
                    <Text style={[styles.itemMeta, { color: theme.isDarkMode ? '#cbd5e1' : '#475569' }]}>
                      Quality: {inspectionLabels[inspect] ?? (inspect || 'Not inspected')}
                    </Text>
                  </View>
                );
              })
            )}

            <View style={styles.modalTotalRow}>
              <Text style={[styles.modalTotalLabel, { color: theme.isDarkMode ? '#cbd5e1' : '#475569' }]}>
                Order total
              </Text>
              <Text style={[styles.modalTotalValue, { color: accent }]}>
                {formatLkr(raw.totalAmount ?? order?.total)}
              </Text>
            </View>
          </ScrollView>

          <Button title="Close" onPress={onClose} variant="outline" style={styles.modalClose} />
        </Card>
      </View>
    </Modal>
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
  header: {
    zIndex: 1,
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    zIndex: 1,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  orderInfoRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  orderLabel: {
    fontSize: 13,
    width: 80,
  },
  orderValue: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItems: {
    fontSize: 13,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyIcon: {
    fontSize: 64,
  },
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
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 48,
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
  },
  modalCard: {
    maxHeight: '88%',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  modalHeaderLeft: { flex: 1 },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalScroll: { marginBottom: 8 },
  modalSection: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 88,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  modalEmptyItems: { fontSize: 13, marginBottom: 8 },
  itemRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemName: { fontSize: 14, fontWeight: '700', flex: 1 },
  itemPrice: { fontSize: 13, fontWeight: '700' },
  itemMeta: { fontSize: 12, marginTop: 4 },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  modalTotalLabel: { fontSize: 13, fontWeight: '600' },
  modalTotalValue: { fontSize: 18, fontWeight: '700' },
  modalClose: { marginTop: 8 },
});

export default OrdersScreen;
