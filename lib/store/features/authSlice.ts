import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api";
import type { DemoRole, DemoUser } from "../../demo/types";

interface AuthState {
  user: DemoUser | null;
  role: DemoRole | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}
const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
};
export const enterPreviewSession = createAsyncThunk(
  "auth/enterPreview",
  async (role: DemoRole, { rejectWithValue }) => {
    try {
      return await apiFetch<DemoUser>("/auth/preview", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to open the local preview.",
      );
    }
  },
);
export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch<DemoUser>("/auth/me");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "No local preview session.",
      );
    }
  },
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => ({ ...initialState, initialized: true }),
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(enterPreviewSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enterPreviewSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(enterPreviewSession.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = String(action.payload);
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.loading = false;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
