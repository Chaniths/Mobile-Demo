import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/auth/authService";
import { toUserMessage } from "../../api/errors";
import { buildSessionUser, unwrapStoredValue } from "../../utils/roles";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const loginDriverAsync = createAsyncThunk(
  "auth/loginDriver",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.loginDriver(credentials);
    } catch (error) {
      return rejectWithValue(
        toUserMessage(error, "Login failed. Please try again."),
      );
    }
  },
);

export const restoreSessionAsync = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const session = await authService.restoreSession();
      return session;
    } catch (error) {
      return rejectWithValue(
        toUserMessage(error, "Could not restore your session."),
      );
    }
  },
);

// Async thunk for logout to clear storage
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(
        toUserMessage(error, "Logout failed. Please try again."),
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      const rawUser = unwrapStoredValue(action.payload.user);
      state.user = rawUser ? buildSessionUser(rawUser) : null;
      state.token = unwrapStoredValue(action.payload.token);
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginDriverAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginDriverAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginDriverAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed.";
        state.isAuthenticated = false;
      })
      .addCase(restoreSessionAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.token && action.payload?.user) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
          return;
        }

        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(restoreSessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || null;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || null;
        state.isLoading = false;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;

export default authSlice.reducer;
