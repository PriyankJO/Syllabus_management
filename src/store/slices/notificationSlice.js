import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async () => {
  const response = await api.get('/notifications');
  return response.data.data;
});

export const addNotification = createAsyncThunk('notifications/addNotification', async (data) => {
  const response = await api.post('/notifications', data);
  return response.data.data;
});

export const updateNotification = createAsyncThunk('notifications/updateNotification', async (data) => {
  const response = await api.put('/notifications/' + data.id, data);
  return response.data.data;
});

export const deleteNotification = createAsyncThunk('notifications/deleteNotification', async (id) => {
  await api.delete('/notifications/' + id);
  return id;
});

export const markNotificationAsRead = createAsyncThunk('notifications/markAsRead', async (id) => {
  const response = await api.patch('/notifications/' + id + '/read');
  return response.data.data;
});

const initialState = {
  notifications: [],
  loading: false,
  error: null
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload || n._id === action.payload);
      if (index !== -1) {
        state.notifications[index].read = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.notifications.push(action.payload);
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(item => item._id !== action.payload && item.id !== action.payload);
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      });
  }
});

export const { markAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
