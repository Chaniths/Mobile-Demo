import apiClient from './client';

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getBuyerOrders = async () => {
  const response = await apiClient.get('/orders');
  return asList(response.data);
};

export const getBuyerOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data?.data || response.data;
};

export const getBuyerAddresses = async () => {
  const response = await apiClient.get('/orders/addresses');
  return response.data?.data || response.data || {};
};

export const createOrder = async (payload) => {
  const response = await apiClient.post('/orders', payload);
  return response.data?.data || response.data;
};
