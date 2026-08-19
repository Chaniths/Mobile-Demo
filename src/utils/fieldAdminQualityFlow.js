const INSPECTED_RESULTS = new Set(['APPROVED', 'PARTIAL', 'REJECTED']);

export const itemNeedsInspection = (item) => {
  const status = item?.inspectionStatus ?? item?.inspections?.[0]?.result ?? null;
  if (!status) return true;
  return !INSPECTED_RESULTS.has(String(status).toUpperCase());
};

export const orderNeedsQualityCheck = (order) =>
  (order?.items ?? []).some(itemNeedsInspection);

export const pendingQualityOrders = (orders) =>
  (Array.isArray(orders) ? orders : []).filter(orderNeedsQualityCheck);

export const FLOW_STEPS = {
  QUALITY: 1,
  REJECT: 2,
  DAMAGE: 3,
  REFUND: 4,
};

export const FLOW_STEP_LABELS = ['Quality', 'Reject', 'Damage', 'Refund'];

export const createFlowId = () => `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const rejectedQuantityForItem = (item) =>
  Math.max(0, Number(item?.totalQuantity ?? 0) - Number(item?.approvedQuantity ?? 0));

export const refundLineFromRejectedItem = (item) => {
  const refundableQuantity = rejectedQuantityForItem(item);
  const unitPrice = Number(item?.unitPrice ?? 0);
  const refundableAmount = Number((refundableQuantity * unitPrice).toFixed(2));
  return {
    id: item.itemId,
    name: item.name,
    unit: item.unit,
    quantity: item.totalQuantity,
    unitPrice,
    rejectedQuantity: refundableQuantity,
    refundedQuantity: 0,
    refundableQuantity,
    refundableAmount,
  };
};

export const buildFlowRefundOrder = (flow) => {
  if (!flow?.order) return null;
  const items = (flow.rejectedItems ?? []).map(refundLineFromRejectedItem);
  const refundableAmount = Number(items.reduce((sum, item) => sum + Number(item.refundableAmount ?? 0), 0).toFixed(2));
  return {
    id: flow.orderId ?? flow.order.id,
    orderNumber: flow.order.orderId ?? flow.order.id,
    customer: flow.order.customer ?? 'Customer',
    totalAmount: Number(flow.order.totalAmount ?? 0),
    status: flow.order.status ?? 'BATCHED',
    refundableAmount,
    items,
  };
};

export const mergeEligibleOrdersWithFlow = (eligibleOrders, flow) => {
  const normalized = Array.isArray(eligibleOrders) ? eligibleOrders : [];
  const flowOrder = buildFlowRefundOrder(flow);
  if (!flowOrder) return normalized;

  const existingIndex = normalized.findIndex((entry) => entry.id === flowOrder.id);
  if (existingIndex === -1) {
    return [flowOrder, ...normalized];
  }

  const apiOrder = normalized[existingIndex];
  const apiAmount = Number(apiOrder.refundableAmount ?? 0);
  const apiHasPricedLines = (apiOrder.items ?? []).some((item) => Number(item.refundableAmount ?? 0) > 0);
  if (apiAmount > 0 && apiHasPricedLines) {
    return normalized;
  }

  const mergedItems = (apiOrder.items ?? []).length
    ? apiOrder.items.map((item) => {
        if (Number(item.refundableAmount ?? 0) > 0) return item;
        const flowItem = flowOrder.items.find((entry) => entry.id === item.id);
        return flowItem ? { ...item, ...flowItem, id: item.id } : item;
      })
    : flowOrder.items;

  const merged = [...normalized];
  merged[existingIndex] = {
    ...apiOrder,
    totalAmount: Number(apiOrder.totalAmount ?? 0) || flowOrder.totalAmount,
    refundableAmount: apiAmount > 0 ? apiAmount : flowOrder.refundableAmount,
    items: mergedItems,
  };
  return merged;
};

export const buildQualityFlow = ({ order, selectedOrder, rejectedItems, notes = '' }) => ({
  flowId: createFlowId(),
  orderId: order.id,
  order: {
    id: order.id,
    orderId: order.orderId,
    customer: order.customer,
    stopId: selectedOrder?.deliveryStopId ?? null,
    totalAmount: Number(selectedOrder?.totalAmount ?? order.totalAmount ?? 0),
    status: selectedOrder?.status ?? null,
    items: order.items,
  },
  rejectedItems,
  inspectionIds: [],
  damageReportId: null,
  damageReportIds: [],
  qualityNotes: notes,
});

export const withFlowUpdate = (flow, patch) => ({
  ...flow,
  ...patch,
});

export const formatRejectedQtyLabel = (item) => {
  const rejectedQty = item.totalQuantity - (item.approvedQuantity ?? 0);
  const unit = item.unit || '';
  if (item.quality === 'rejected') {
    return `Rejecting all ${item.totalQuantity} ${unit}`.trim();
  }
  return `Rejecting ${rejectedQty} of ${item.totalQuantity} ${unit}`.trim();
};

export const buildAffectedItemsSummary = (rejectedItems) =>
  rejectedItems
    .map((item) => {
      const rejectedQty = item.totalQuantity - (item.approvedQuantity ?? 0);
      return `${item.name}: ${rejectedQty} ${item.unit || ''}`.trim();
    })
    .join('; ');

export const confirmLeaveFlow = (onLeave) => {
  const { Alert } = require('react-native');
  Alert.alert(
    'Leave workflow?',
    'Leaving will interrupt the quality issue workflow. Continue?',
    [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: onLeave },
    ]
  );
};
