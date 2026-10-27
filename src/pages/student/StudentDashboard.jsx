import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Book, CheckSquare, FolderOpen, ClipboardList, Zap, PlayCircle } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import TypewriterText from '../../components/common/TypewriterText';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import styles from '../admin/AdminDashboard.module.css';

const StudentDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { data, loading } = useSelector(state => state.dashboard);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDashboardData('STUDENT'));
  }, [dispatch]);

  if (loading || !data) {
    return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h2 style={{ margin: '0 0 20px 0', color: 'var(--color-primary)', fontSize: '2rem' }}>
        <TypewriterText text={`Welcome back, ${user.name}!`} delay={60} />
      </h2>
      
      <div className={styles.statsGrid}>
        <StatCard title="My Subjects" value={data.subjectsCount || 0} icon={<Book size={24} />} color="#4F46E5" />
        <StatCard title="Available Materials" value={data.materialsCount || 0} icon={<FolderOpen size={24} />} color="#0D9488" />
        <StatCard title="Quiz Attempts" value={data.quizAttemptsCount || 0} icon={<ClipboardList size={24} />} color="#E9778A" />
      </div>

      <div className={styles.recentSection} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <h3 style={{ margin: 0 }}>Quick Actions</h3>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Fast access to important academic tools.</p>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
          <button 
            onClick={() => navigate('/student/take-test')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', 
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold',
              transition: 'transform 0.2s', boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <PlayCircle size={18} /> Take Test / Enter Quiz Code
          </button>
          <button 
            onClick={() => navigate('/student/syllabus')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', 
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold',
              transition: 'transform 0.2s', boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <CheckSquare size={18} /> View Syllabus Status
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

export default StudentDashboard;
