import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMaterials = createAsyncThunk('materials/fetchMaterials', async () => {
  const response = await api.get('/materials');
  return response.data.data;
});

export const addMaterial = createAsyncThunk('materials/addMaterial', async (data) => {
  const response = await api.post('/materials', data);
  return response.data.data;
});

export const updateMaterial = createAsyncThunk('materials/updateMaterial', async ({ id, formData }) => {
  const response = await api.put('/materials/' + id, formData);
  return response.data.data;
});

export const deleteMaterial = createAsyncThunk('materials/deleteMaterial', async (id) => {
  await api.delete('/materials/' + id);
  return id;
});

const initialState = {
  materials: [],
  loading: false,
  error: null
};

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(addMaterial.fulfilled, (state, action) => {
        state.materials.push(action.payload);
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        const index = state.materials.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.materials[index] = action.payload;
        }
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default materialsSlice.reducer;
