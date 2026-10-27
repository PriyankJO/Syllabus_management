const fs = require('fs');
const path = require('path');

const slicesDir = path.join(__dirname, 'src', 'store', 'slices');

const generateSlice = (name, file, endpoint, singular) => `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetch${name} = createAsyncThunk('${name.toLowerCase()}/fetch${name}', async () => {
  const response = await api.get('${endpoint}');
  return response.data.data;
});

export const add${singular} = createAsyncThunk('${name.toLowerCase()}/add${singular}', async (data) => {
  const response = await api.post('${endpoint}', data);
  return response.data.data;
});

export const update${singular} = createAsyncThunk('${name.toLowerCase()}/update${singular}', async (data) => {
  const response = await api.put('${endpoint}/' + data.id, data);
  return response.data.data;
});

export const delete${singular} = createAsyncThunk('${name.toLowerCase()}/delete${singular}', async (id) => {
  await api.delete('${endpoint}/' + id);
  return id;
});

const initialState = {
  ${name.toLowerCase()}: [],
  loading: false,
  error: null
};

const ${name.toLowerCase()}Slice = createSlice({
  name: '${name.toLowerCase()}',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetch${name}.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetch${name}.fulfilled, (state, action) => {
        state.loading = false;
        state.${name.toLowerCase()} = action.payload;
      })
      .addCase(add${singular}.fulfilled, (state, action) => {
        state.${name.toLowerCase()}.push(action.payload);
      })
      .addCase(update${singular}.fulfilled, (state, action) => {
        const index = state.${name.toLowerCase()}.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
        if (index !== -1) {
          state.${name.toLowerCase()}[index] = action.payload;
        }
      })
      .addCase(delete${singular}.fulfilled, (state, action) => {
        state.${name.toLowerCase()} = state.${name.toLowerCase()}.filter(item => item._id !== action.payload && item.id !== action.payload);
      });
  }
});

export default ${name.toLowerCase()}Slice.reducer;
`;

const slices = [
  { name: 'Departments', singular: 'Department', file: 'departmentSlice.js', endpoint: '/departments' },
  { name: 'Subjects', singular: 'Subject', file: 'subjectSlice.js', endpoint: '/subjects' },
  { name: 'Syllabus', singular: 'Syllabus', file: 'syllabusSlice.js', endpoint: '/syllabus' },
  { name: 'Materials', singular: 'Material', file: 'materialSlice.js', endpoint: '/materials' },
  { name: 'ModelPapers', singular: 'ModelPaper', file: 'modelPaperSlice.js', endpoint: '/model-papers' },
  { name: 'Discussions', singular: 'Discussion', file: 'discussionSlice.js', endpoint: '/discussions' },
  { name: 'Notifications', singular: 'Notification', file: 'notificationSlice.js', endpoint: '/notifications' },
  { name: 'Users', singular: 'User', file: 'userSlice.js', endpoint: '/users' },
  { name: 'Quizzes', singular: 'Quiz', file: 'quizSlice.js', endpoint: '/quizzes' }
];

slices.forEach(slice => {
  fs.writeFileSync(path.join(slicesDir, slice.file), generateSlice(slice.name, slice.file, slice.endpoint, slice.singular));
});

console.log('Slices generated with full CRUD!');
