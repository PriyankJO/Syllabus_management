import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSyllabusStatus = createAsyncThunk('syllabusStatus/fetch', async () => {
  const response = await api.get('/syllabus/units');
  return response.data.data;
});

export const updateUnitStatus = createAsyncThunk('syllabusStatus/updateStatus', async ({ unitId, status }) => {
  const completionDate = status === 'Completed' ? new Date().toISOString() : null;
  const response = await api.put('/syllabus/units/' + unitId, { status, completionDate });
  return response.data.data;
});

export const addUnit = createAsyncThunk('syllabusStatus/addUnit', async (data) => {
  const response = await api.post('/syllabus/units', data);
  return response.data.data;
});

const initialState = {
  units: [],
  loading: false,
  error: null
};

const syllabusStatusSlice = createSlice({
  name: 'syllabusStatus',
  initialState,
  reducers: {
    updateUnit: (state, action) => {
      const index = state.units.findIndex(u => u.id === action.payload.id || u._id === action.payload.id);
      if (index !== -1) {
        state.units[index] = action.payload;
      }
    },
    deleteUnit: (state, action) => {
      state.units = state.units.filter(u => u.id !== action.payload && u._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSyllabusStatus.fulfilled, (state, action) => {
        state.units = action.payload;
      })
      .addCase(updateUnitStatus.fulfilled, (state, action) => {
        const index = state.units.findIndex(u => u.id === action.payload._id || u._id === action.payload._id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
      })
      .addCase(addUnit.fulfilled, (state, action) => {
        state.units.push(action.payload);
      });
  }
});

export const { updateUnit, deleteUnit } = syllabusStatusSlice.actions;
export default syllabusStatusSlice.reducer;
