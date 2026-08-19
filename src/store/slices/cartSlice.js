import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addItemToCart,
  clearCartApi,
  getCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from '../../api/cartApi';
import { getApiErrorMessage } from '../../utils/mediaUrl';
import { logout, logoutAsync } from './authSlice';

const emptyTotals = {
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
};

const initialState = {
  items: [],
  totals: emptyTotals,
  loading: false,
  error: null,
};

const mapCartItems = (items = []) =>
  items.map((item) => ({
    id: item.id || `${item.productId}:${item.sellerId}`,
    productId: item.productId,
    sellerId: item.sellerId,
    name: item.name,
    category: item.category,
    price: Number(item.price) || 0,
    unit: item.unit,
    quantity: Number(item.quantity) || 0,
    imageUrl: item.imageUrl,
    vendor: item.vendor || item.sellerName,
    sellerStock: item.sellerStock,
    availableStock: item.availableStock,
  }));

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getCart();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load cart'));
    }
  }
);

export const addItemAsync = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity, sellerId }, { dispatch, rejectWithValue }) => {
    try {
      await addItemToCart(productId, quantity, sellerId);
      await dispatch(fetchCart()).unwrap();
      return true;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to add item'));
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, sellerId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      if (quantity <= 0) {
        await removeItemFromCart(productId, sellerId);
      } else {
        await updateCartItemQuantity(productId, sellerId, quantity);
      }
      await dispatch(fetchCart()).unwrap();
      return true;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update quantity'));
    }
  }
);

export const removeItemAsync = createAsyncThunk(
  'cart/removeItem',
  async ({ productId, sellerId }, { dispatch, rejectWithValue }) => {
    try {
      await removeItemFromCart(productId, sellerId);
      await dispatch(fetchCart()).unwrap();
      return true;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to remove item'));
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearRemote',
  async (_, { rejectWithValue }) => {
    try {
      await clearCartApi();
      return true;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to clear cart'));
    }
  }
);

const applyCartPayload = (state, payload) => {
  state.items = mapCartItems(payload?.items || []);
  state.totals = {
    subtotal: Number(payload?.subtotal) || 0,
    tax: Number(payload?.tax) || 0,
    discount: Number(payload?.discount) || 0,
    total: Number(payload?.total) || 0,
  };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totals = emptyTotals;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        applyCartPayload(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateQuantityAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(updateQuantityAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.totals = emptyTotals;
        state.error = null;
      })
      .addCase(logout, () => initialState)
      .addCase(logoutAsync.fulfilled, () => initialState)
      .addCase(logoutAsync.rejected, () => initialState);
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
