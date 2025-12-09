import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { productId, sellerId, quantity } = action.payload;
      const id = `${productId}:${sellerId}`;

      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          id,
          ...action.payload,
        });
      }
    },
    changeItemQuantity: (state, action) => {
      const { id, delta } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (!item) return;

      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        item.quantity = nextQty;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, changeItemQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;



