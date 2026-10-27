import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDiscussions = createAsyncThunk('discussions/fetchDiscussions', async () => {
  const response = await api.get('/discussions');
  return response.data.data;
});

export const addDiscussion = createAsyncThunk('discussions/addDiscussion', async (data) => {
  const response = await api.post('/discussions', data);
  return response.data.data;
});

export const updateDiscussion = createAsyncThunk('discussions/updateDiscussion', async (data) => {
  const response = await api.put('/discussions/' + data.id, data);
  return response.data.data;
});

export const addReply = createAsyncThunk('discussions/addReply', async (data) => {
  const response = await api.post('/discussions/' + data.id + '/replies', { message: data.message });
  return response.data.data;
});

export const deleteDiscussion = createAsyncThunk('discussions/deleteDiscussion', async (id) => {
  await api.delete('/discussions/' + id);
  return id;
});

const initialState = {
  discussions: [],
  loading: false,
  error: null
};

const discussionsSlice = createSlice({
  name: 'discussions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscussions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDiscussions.fulfilled, (state, action) => {
        state.loading = false;
        state.discussions = action.payload;
      })
      .addCase(addDiscussion.fulfilled, (state, action) => {
        const exists = state.discussions.find(d => (d._id || d.id) === (action.payload._id || action.payload.id));
        if (!exists) {
          state.discussions.push(action.payload);
        } else {
          Object.assign(exists, action.payload);
        }
      })
      .addCase(updateDiscussion.fulfilled, (state, action) => {
        const index = state.discussions.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.discussions[index] = action.payload;
        }
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const index = state.discussions.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.discussions[index] = action.payload;
        }
      })
      .addCase(deleteDiscussion.fulfilled, (state, action) => {
        state.discussions = state.discussions.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default discussionsSlice.reducer;
