import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardData = createAsyncThunk('dashboard/fetchDashboardData', async (role) => {
  let endpoint = '/dashboard/';
  if (role === 'ADMIN') endpoint += 'admin';
  else if (role === 'HOD') endpoint += 'hod';
  else if (role === 'FACULTY') endpoint += 'faculty';
  else endpoint += 'student';

  const response = await api.get(endpoint);
  return response.data.data;
});

const initialState = {
  data: null,
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default dashboardSlice.reducer;
