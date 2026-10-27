import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSubjects = createAsyncThunk('subjects/fetchSubjects', async () => {
  const response = await api.get('/subjects');
  return response.data.data;
});

export const addSubject = createAsyncThunk('subjects/addSubject', async (data) => {
  const response = await api.post('/subjects', data);
  return response.data.data;
});

export const updateSubject = createAsyncThunk('subjects/updateSubject', async (data) => {
  const id = data._id || data.id;
  const response = await api.put('/subjects/' + id, data);
  return response.data.data;
});

export const deleteSubject = createAsyncThunk('subjects/deleteSubject', async (id) => {
  await api.delete('/subjects/' + id);
  return id;
});

const initialState = {
  subjects: [],
  loading: false,
  error: null
};

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(addSubject.fulfilled, (state, action) => {
        state.subjects.push(action.payload);
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        const index = state.subjects.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default subjectsSlice.reducer;
