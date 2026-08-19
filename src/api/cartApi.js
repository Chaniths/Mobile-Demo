import apiClient from './client';

export const getCart = async () => {
  const response = await apiClient.get('/cart');
  return response.data;
};

export const addItemToCart = async (productId, quantity, sellerId) => {
  const response = await apiClient.post('/cart/add', {
    productId,
    quantity,
    sellerId,
  });
  return response.data;
};

export const updateCartItemQuantity = async (productId, sellerId, quantity) => {
  const response = await apiClient.patch('/cart', {
    productId,
    sellerId,
    quantity,
  });
  return response.data;
};

export const removeItemFromCart = async (productId, sellerId) => {
  await apiClient.delete(`/cart/${productId}`, {
    params: { sellerId },
  });
};

export const clearCartApi = async () => {
  const response = await apiClient.post('/cart/clear');
  return response.data;
};
