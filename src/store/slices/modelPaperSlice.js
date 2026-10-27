import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchModelPapers = createAsyncThunk('modelpapers/fetchModelPapers', async () => {
  const response = await api.get('/model-papers');
  return response.data.data;
});

export const addPaper = createAsyncThunk('modelpapers/addModelPaper', async (data) => {
  const response = await api.post('/model-papers', data);
  return response.data.data;
});

export const updateModelPaper = createAsyncThunk('modelpapers/updateModelPaper', async ({ id, formData }) => {
  const response = await api.put('/model-papers/' + id, formData);
  return response.data.data;
});

export const deletePaper = createAsyncThunk('modelpapers/deleteModelPaper', async (id) => {
  await api.delete('/model-papers/' + id);
  return id;
});

const initialState = {
  modelpapers: [],
  loading: false,
  error: null
};

const modelpapersSlice = createSlice({
  name: 'modelpapers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModelPapers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModelPapers.fulfilled, (state, action) => {
        state.loading = false;
        state.modelpapers = action.payload;
      })
      .addCase(addPaper.fulfilled, (state, action) => {
        state.modelpapers.push(action.payload);
      })
      .addCase(updateModelPaper.fulfilled, (state, action) => {
        const index = state.modelpapers.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.modelpapers[index] = action.payload;
        }
      })
      .addCase(deletePaper.fulfilled, (state, action) => {
        state.modelpapers = state.modelpapers.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default modelpapersSlice.reducer;
