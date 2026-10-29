import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'application' | 'screening' | 'assessment' | 'status' | 'view' | 'event';
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch<Notification[]>('/notifications');
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      return await apiFetch<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch('/notifications/read-all', { method: 'POST' });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
