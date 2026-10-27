import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const getInitialState = () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    return JSON.parse(savedAuth);
  }
  return {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
    },
    updateAuthUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('auth', JSON.stringify({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          loading: false,
          error: null
        }));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('auth', JSON.stringify({
          user: action.payload,
          isAuthenticated: true,
          loading: false,
          error: null
        }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
