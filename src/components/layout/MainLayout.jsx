import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './MainLayout.module.css';

import { fetchUsers } from '../../store/slices/userSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchSyllabus } from '../../store/slices/syllabusSlice';
import { fetchMaterials } from '../../store/slices/materialSlice';
import { fetchModelPapers } from '../../store/slices/modelPaperSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { fetchDiscussions } from '../../store/slices/discussionSlice';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user && user.role !== 'STUDENT') {
      dispatch(fetchUsers());
    }
    dispatch(fetchDepartments());
    dispatch(fetchSubjects());
    dispatch(fetchSyllabus());
    dispatch(fetchMaterials());
    dispatch(fetchModelPapers());
    dispatch(fetchNotifications());
    dispatch(fetchDiscussions());
  }, [dispatch, user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.mainContent}>
        <Header toggleSidebar={toggleSidebar} />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
