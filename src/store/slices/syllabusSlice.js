import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSyllabus = createAsyncThunk('syllabus/fetchSyllabus', async () => {
  const response = await api.get('/syllabus');
  return response.data.data;
});

export const addSyllabus = createAsyncThunk('syllabus/addSyllabus', async (data) => {
  const response = await api.post('/syllabus', data);
  return response.data.data;
});

export const updateSyllabus = createAsyncThunk('syllabus/updateSyllabus', async ({ id, formData }) => {
  const response = await api.put('/syllabus/' + id, formData);
  return response.data.data;
});

export const deleteSyllabus = createAsyncThunk('syllabus/deleteSyllabus', async (id) => {
  await api.delete('/syllabus/' + id);
  return id;
});

const initialState = {
  syllabus: [],
  loading: false,
  error: null
};

const syllabusSlice = createSlice({
  name: 'syllabus',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSyllabus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSyllabus.fulfilled, (state, action) => {
        state.loading = false;
        state.syllabus = action.payload;
      })
      .addCase(addSyllabus.fulfilled, (state, action) => {
        state.syllabus.push(action.payload);
      })
      .addCase(updateSyllabus.fulfilled, (state, action) => {
        const index = state.syllabus.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.syllabus[index] = action.payload;
        }
      })
      .addCase(deleteSyllabus.fulfilled, (state, action) => {
        state.syllabus = state.syllabus.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default syllabusSlice.reducer;
