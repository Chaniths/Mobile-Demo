export const FLOW_STEPS = {
  QUALITY: 1,
  REJECT: 2,
  DAMAGE: 3,
  REFUND: 4,
};

export const FLOW_STEP_LABELS = ['Quality', 'Reject', 'Damage', 'Refund'];

export const createFlowId = () => `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const buildQualityFlow = ({ order, selectedOrder, rejectedItems, notes = '' }) => ({
  flowId: createFlowId(),
  orderId: order.id,
  order: {
    id: order.id,
    orderId: order.orderId,
    customer: order.customer,
    stopId: selectedOrder?.deliveryStopId ?? null,
    items: order.items,
  },
  rejectedItems,
  inspectionIds: [],
  damageReportId: null,
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
