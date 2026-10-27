import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import syllabusStatusReducer from './slices/syllabusStatusSlice';
import subjectReducer from './slices/subjectSlice';
import departmentReducer from './slices/departmentSlice';
import syllabusReducer from './slices/syllabusSlice';
import materialReducer from './slices/materialSlice';
import modelPaperReducer from './slices/modelPaperSlice';
import quizReducer from './slices/quizSlice';
import notificationReducer from './slices/notificationSlice';
import discussionReducer from './slices/discussionSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    syllabusStatus: syllabusStatusReducer,
    subjects: subjectReducer,
    departments: departmentReducer,
    syllabus: syllabusReducer,
    materials: materialReducer,
    modelPapers: modelPaperReducer,
    quiz: quizReducer,
    notifications: notificationReducer,
    discussions: discussionReducer,
    dashboard: dashboardReducer
  }
});

export default store;
