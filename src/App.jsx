import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Unauthorized from './pages/errors/Unauthorized';
import NotFound from './pages/errors/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import MainLayout from './components/layout/MainLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import SyllabusManagement from './pages/admin/SyllabusManagement';
import ModelPaperManagement from './pages/admin/ModelPaperManagement';
import FacultyManagement from './pages/admin/FacultyManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import MaterialManagement from './pages/admin/MaterialManagement';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import { Settings } from './pages/Placeholders';
import Notifications from './pages/shared/Notifications';
import Discussions from './pages/shared/Discussions';

import HODDashboard from './pages/hod/HODDashboard';
import HODReports from './pages/hod/HODReports';
import HODProfile from './pages/hod/HODProfile';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import SyllabusCompletion from './pages/faculty/SyllabusCompletion';
import QuizGenerator from './pages/faculty/QuizGenerator';
import FacultyProfile from './pages/faculty/FacultyProfile';

import FacultyQuizzes from './pages/faculty/FacultyQuizzes';
import FacultyQuizResults from './pages/faculty/FacultyQuizResults';

import StudentDashboard from './pages/student/StudentDashboard';
import SyllabusStatus from './pages/student/SyllabusStatus';
import StudentQuizzes from './pages/student/TakeTest'; // Since I saved StudentQuizzes inside TakeTest.jsx
import QuizAttempt from './pages/student/QuizAttempt';
import QuizHistory from './pages/student/QuizHistory';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentModelPapers from './pages/student/StudentModelPapers';
import StudentProfile from './pages/student/StudentProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <RoleBasedRoute allowedRoles={['ADMIN']}>
            <MainLayout />
          </RoleBasedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="faculty" element={<FacultyManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="syllabus" element={<SyllabusManagement />} />
          <Route path="materials" element={<MaterialManagement />} />
          <Route path="model-papers" element={<ModelPaperManagement />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
        
        {/* HOD Routes */}
        <Route path="/hod/*" element={
          <RoleBasedRoute allowedRoles={['HOD', 'ADMIN']}>
            <MainLayout />
          </RoleBasedRoute>
        }>
          <Route path="dashboard" element={<HODDashboard />} />
          <Route path="faculty" element={<FacultyManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="syllabus" element={<SyllabusManagement />} />
          <Route path="syllabus-completion" element={<SyllabusCompletion />} />
          <Route path="materials" element={<MaterialManagement />} />
          <Route path="model-papers" element={<ModelPaperManagement />} />
          <Route path="reports" element={<HODReports />} />
          <Route path="discussions" element={<Discussions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<HODProfile />} />
          <Route path="quiz-generator" element={<QuizGenerator />} />
          <Route path="quizzes" element={<FacultyQuizzes />} />
          <Route path="quiz-results/:quizId" element={<FacultyQuizResults />} />
        </Route>
        
        {/* Faculty Routes */}
        <Route path="/faculty/*" element={
          <RoleBasedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
            <MainLayout />
          </RoleBasedRoute>
        }>
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="syllabus-completion" element={<SyllabusCompletion />} />
          <Route path="quiz-generator" element={<QuizGenerator />} />
          <Route path="quizzes" element={<FacultyQuizzes />} />
          <Route path="quiz-results/:quizId" element={<FacultyQuizResults />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="syllabus" element={<SyllabusManagement />} />
          <Route path="materials" element={<MaterialManagement />} />
          <Route path="model-papers" element={<ModelPaperManagement />} />
          <Route path="discussions" element={<Discussions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<FacultyProfile />} />
        </Route>
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <RoleBasedRoute allowedRoles={['STUDENT']}>
            <MainLayout />
          </RoleBasedRoute>
        }>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="take-test" element={<StudentQuizzes />} />
          <Route path="quiz/:quizId" element={<QuizAttempt />} />
          <Route path="quiz-history" element={<QuizHistory />} />
          
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="syllabus" element={<SyllabusStatus />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="model-papers" element={<StudentModelPapers />} />
          <Route path="discussions" element={<Discussions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
