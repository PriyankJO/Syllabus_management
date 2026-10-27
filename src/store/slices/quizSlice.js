import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchQuizzes = createAsyncThunk('quizzes/fetchQuizzes', async () => {
  const response = await api.get('/quizzes');
  return response.data.data;
});

export const fetchQuizAttempts = createAsyncThunk('quizzes/fetchQuizAttempts', async () => {
  const response = await api.get('/quizzes/attempts');
  return response.data.data;
});

export const addQuiz = createAsyncThunk('quizzes/addQuiz', async (data) => {
  const response = await api.post('/quizzes', data);
  return response.data.data;
});

export const updateQuiz = createAsyncThunk('quizzes/updateQuiz', async (data) => {
  const response = await api.put('/quizzes/' + data.id, data);
  return response.data.data;
});

export const deleteQuiz = createAsyncThunk('quizzes/deleteQuiz', async (id) => {
  await api.delete('/quizzes/' + id);
  return id;
});

export const startQuizAttempt = createAsyncThunk('quizzes/startQuizAttempt', async (id, { rejectWithValue }) => {
  try {
    const response = await api.post('/quizzes/' + id + '/start');
    if (response.data && response.data.success === false) {
      return rejectWithValue(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const submitQuiz = createAsyncThunk('quizzes/submitQuiz', async (data) => {
  const targetId = data.quizId || data.attemptId || 'submit';
  const response = await api.post('/quizzes/' + targetId + '/submit', data);
  return response.data.data;
});

export const analyzeMaterial = createAsyncThunk('quizzes/analyzeMaterial', async (formData) => {
  const response = await api.post('/quizzes/analyze', formData);
  return response.data;
});

export const generateQuiz = createAsyncThunk('quizzes/generateQuiz', async (data) => {
  const response = await api.post('/quizzes/generate', data);
  return response.data.data;
});

const initialState = {
  quizzes: [],
  quizHistory: [],
  loading: false,
  error: null
};

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizAttempts.fulfilled, (state, action) => {
        state.quizHistory = action.payload;
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.quizzes.push(action.payload);
      })
      .addCase(generateQuiz.fulfilled, (state, action) => {
        state.quizzes.push(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default quizzesSlice.reducer;
