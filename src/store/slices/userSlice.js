import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await api.get('/users');
  return response.data.data;
});

export const addUser = createAsyncThunk('users/addUser', async (data) => {
  const response = await api.post('/users', data);
  return response.data.data;
});

export const updateUser = createAsyncThunk('users/updateUser', async (data) => {
  const id = data._id || data.id;
  const response = await api.put('/users/' + id, data);
  return response.data.data;
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id) => {
  await api.delete('/users/' + id);
  return id;
});

const initialState = {
  users: [],
  loading: false,
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default usersSlice.reducer;
