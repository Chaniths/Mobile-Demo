import apiClient from './client';

const statusTabMap = {
  all: '/fieldadmin/order/all',
  pending: '/fieldadmin/order/pending',
  scheduled: '/fieldadmin/order/scheduled',
  in_transit: '/fieldadmin/order/inTransit',
  delivered: '/fieldadmin/order/delivered',
};

const unwrap = (payload) => {
  if (payload == null) return payload;
  if (Array.isArray(payload)) return payload;
  if (
    payload.data !== undefined &&
    payload.assignedOrders === undefined &&
    payload.token === undefined &&
    payload.batch === undefined &&
    payload.route === undefined
  ) {
    return payload.data;
  }
  return payload;
};

const unwrapList = (payload) => {
  const value = unwrap(payload);
  return Array.isArray(value) ? value : [];
};

export const getDashboardOverview = async () => {
  const response = await apiClient.get('/fieldadmin/order/overview');
  return unwrap(response.data);
};

export const getOrdersByTab = async (tab = 'all') => {
  const path = statusTabMap[tab] ?? statusTabMap.all;
  const response = await apiClient.get(path);
  return unwrapList(response.data);
};

export const getAssignedTasks = async () => {
  const response = await apiClient.get('/fieldadmin/tasks/assigned');
  return response.data;
};

export const getRoutes = async () => {
  const response = await apiClient.get('/fieldadmin/route/all');
  return unwrapList(response.data);
};

export const getRouteHandoffs = async () => {
  const response = await apiClient.get('/fieldadmin/route/handoff');
  return unwrapList(response.data);
};

export const getRouteHandoff = async (routeId) => {
  const response = await apiClient.get(`/fieldadmin/route/${routeId}/handoff`);
  return response.data;
};

export const markStopComplete = async ({ stopId, notes }) => {
  const response = await apiClient.post(`/fieldadmin/stops/${stopId}/complete`, { notes });
  return response.data;
};

export const confirmOrderFulfillment = async ({ orderId, action, notes }) => {
  const response = await apiClient.post(`/fieldadmin/order/${orderId}/fulfill`, { action, notes });
  return response.data;
};

export const getAllHistory = async () => {
  const response = await apiClient.get('/fieldadmin/history/all');
  return response.data;
};

export const getTruckHistory = async () => {
  const response = await apiClient.get('/fieldadmin/history/trucks');
  return response.data;
};

export const getDriverHistory = async () => {
  const response = await apiClient.get('/fieldadmin/history/drivers');
  return response.data;
};

export const submitQualityReview = async ({
  orderItemId,
  notes,
  approvedQuantity,
  rejected,
  rejectionReason,
  rejectionDetails,
}) => {
  const path = rejected ? '/fieldadmin/reject/submit' : '/fieldadmin/quality/confirm';
  const response = await apiClient.post(path, {
    orderItemId,
    notes,
    approvedQuantity,
    rejectionReason,
    rejectionDetails,
  });
  return unwrap(response.data);
};

export const submitDamageReport = async ({
  description,
  stopId,
  images,
  damageType,
  severity,
  affectedItems,
  orderItemId,
  orderItemIds,
  inspectionId,
  inspectionIds,
}) => {
  const response = await apiClient.post('/fieldadmin/report/damage', {
    description,
    stopId,
    images,
    damageType,
    severity,
    affectedItems,
    orderItemId: orderItemId ?? orderItemIds?.[0],
    inspectionId: inspectionId ?? inspectionIds?.[0],
  });
  return unwrap(response.data);
};

export const markDeliveryComplete = async ({ stopId, notes }) => {
  const response = await apiClient.post('/fieldadmin/delivery/complete', { stopId, notes });
  return response.data;
};

export const getAssessmentCandidates = async () => {
  const response = await apiClient.get('/fieldadmin/assessment/candidates');
  return response.data;
};

export const submitAssessment = async ({ type, targetUserId, rating, comment }) => {
  const pathMap = {
    driver: '/fieldadmin/assessment/driver',
    buyer: '/fieldadmin/assessment/buyer',
    seller: '/fieldadmin/assessment/seller',
  };
  const response = await apiClient.post(pathMap[type], { targetUserId, rating, comment });
  return response.data;
};

export const submitRouteReassessment = async ({ routeId, reason, oldData, newData }) => {
  const response = await apiClient.post('/fieldadmin/reassessment/route', {
    routeId,
    reason,
    oldData,
    newData,
  });
  return response.data;
};

export const initiateRefund = async ({ orderId, amount, reason, orderItemIds }) => {
  const response = await apiClient.post('/fieldadmin/payment/refunds/initiate', {
    orderId,
    amount,
    reason,
    orderItemIds,
  });
  return response.data;
};

export const getRefundEligibleOrders = async () => {
  const response = await apiClient.get('/fieldadmin/payment/refunds/eligible-orders');
  return unwrapList(response.data);
};

export const updateTruckCapacity = async ({ driverId, vehicleCapacity }) => {
  const response = await apiClient.post('/fieldadmin/truck/capacity/update', {
    driverId,
    vehicleCapacity,
  });
  return response.data;
};

export const getAggregationRuns = async (limit = 20) => {
  const response = await apiClient.get('/aggregator/runs', { params: { limit } });
  return response.data;
};

export const getAggregationRunById = async (id) => {
  const response = await apiClient.get(`/aggregator/runs/${id}`);
  return response.data;
};

export default {
  getDashboardOverview,
  getOrdersByTab,
  getAssignedTasks,
  getRoutes,
  getRouteHandoffs,
  getRouteHandoff,
  getAllHistory,
  getTruckHistory,
  getDriverHistory,
  submitQualityReview,
  markDeliveryComplete,
  markStopComplete,
  confirmOrderFulfillment,
  getAssessmentCandidates,
  submitAssessment,
  submitDamageReport,
  submitRouteReassessment,
  initiateRefund,
  getRefundEligibleOrders,
  updateTruckCapacity,
  getAggregationRuns,
  getAggregationRunById,
};
