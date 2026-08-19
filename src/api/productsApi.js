import apiClient from './client';

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getApprovedProducts = async () => {
  try {
    const response = await apiClient.get('/products/approved');
    return asList(response.data);
  } catch (error) {
    const fallback = await apiClient.get('/products');
    return asList(fallback.data);
  }
};

export const getProductById = async (productId) => {
  const response = await apiClient.get(`/products/${productId}`);
  return response.data?.data || response.data;
};

export const getProductSellers = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}/sellers`);
    return asList(response.data);
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};
