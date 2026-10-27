import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDepartments = createAsyncThunk('departments/fetchDepartments', async () => {
  const response = await api.get('/departments');
  return response.data.data;
});

export const addDepartment = createAsyncThunk('departments/addDepartment', async (data) => {
  const response = await api.post('/departments', data);
  return response.data.data;
});

export const updateDepartment = createAsyncThunk('departments/updateDepartment', async (data) => {
  const id = data._id || data.id;
  const response = await api.put('/departments/' + id, data);
  return response.data.data;
});

export const deleteDepartment = createAsyncThunk('departments/deleteDepartment', async (id) => {
  await api.delete('/departments/' + id);
  return id;
});

const initialState = {
  departments: [],
  loading: false,
  error: null
};

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default departmentsSlice.reducer;
