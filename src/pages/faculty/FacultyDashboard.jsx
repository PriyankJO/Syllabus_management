import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Book, CheckSquare, FileText, FolderOpen } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import TypewriterText from '../../components/common/TypewriterText';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import styles from '../admin/AdminDashboard.module.css';

const FacultyDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { data, loading } = useSelector(state => state.dashboard);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchDashboardData('FACULTY'));
  }, [dispatch]);

  if (loading || !data) {
    return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h2 style={{ margin: '0 0 20px 0', color: 'var(--color-primary)', fontSize: '2rem' }}>
        <TypewriterText text={`Welcome, ${user?.name || 'Faculty'}`} delay={60} />
      </h2>
      
      <div className={styles.statsGrid}>
        <StatCard title="My Subjects" value={data.mySubjectsCount || 0} icon={<Book size={24} />} color="#3B82F6" />
        <StatCard title="Completed Units" value={data.completedUnitsCount || 0} icon={<CheckSquare size={24} />} color="#10B981" />
        <StatCard title="Pending Units" value={data.pendingUnitsCount || 0} icon={<FileText size={24} />} color="#F59E0B" />
        <StatCard title="Uploaded Materials" value={data.materialsCount || 0} icon={<FolderOpen size={24} />} color="#8B5CF6" />
      </div>

      <div className={styles.recentSection}>
        <h3>Quick Actions</h3>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px'}}>
          <button 
            className="primary-btn" 
            style={{padding: '10px 20px', backgroundColor: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600}}
            onClick={() => navigate('/faculty/syllabus-completion')}
          >
            Add Syllabus Unit
          </button>
          <button 
            className="primary-btn" 
            style={{padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600}}
            onClick={() => navigate('/faculty/materials')}
          >
            Upload Material
          </button>
          <button 
            className="primary-btn" 
            style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600}}
            onClick={() => navigate('/faculty/quizzes')}
          >
            My Quizzes & Codes
          </button>
        </div>
      </div>
      <div className={styles.recentSection} style={{ marginTop: '20px' }}>
        <h3>Recent Department Activity</h3>
        <div className={styles.activityList}>
          {data.recentActivities && data.recentActivities.length > 0 ? data.recentActivities.map(activity => (
            <div key={activity._id} className={styles.activityItem} style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
              <p style={{ margin: 0, fontWeight: '500', color: 'var(--color-text)' }}>{activity.details}</p>
              <small style={{ color: 'var(--color-text-muted)' }}>
                {new Date(activity.createdAt).toLocaleString()} {activity.user ? `by ${activity.user.name}` : ''}
              </small>
            </div>
          )) : (
            <div className={styles.activityItem} style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
              <p>No recent activity in your department.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
