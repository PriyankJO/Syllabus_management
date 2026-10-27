import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCog, Book, FileText, FolderOpen, ArrowRight, 
  ExternalLink, Download, Plus, CheckSquare, FileSpreadsheet, CheckCircle, Clock 
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import TypewriterText from '../../components/common/TypewriterText';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import { fetchMaterials } from '../../store/slices/materialSlice';
import styles from '../admin/AdminDashboard.module.css';

const HODDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { data, loading } = useSelector(state => state.dashboard);
  const { materials } = useSelector(state => state.materials);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDashboardData('HOD'));
    dispatch(fetchMaterials());
  }, [dispatch]);

  if (loading || !data) {
    return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  }

  // Filter department materials
  const userDeptId = user.department?._id || user.department?.id || (typeof user.department === 'string' ? user.department : null);
  const deptMaterials = (materials || []).filter(m => {
    const mDept = m.department?._id || m.department?.id || (typeof m.department === 'string' ? m.department : null);
    return userDeptId ? mDept === userDeptId : true;
  });

  const completionPct = data.completionPercentage ?? 0;

  return (
    <div className={styles.dashboard}>
      <h2 style={{ margin: '0 0 20px 0', color: 'var(--color-primary)', fontSize: '2rem' }}>
        <TypewriterText text={`Welcome, ${user.name} (${data.department || user.department})`} delay={60} />
      </h2>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-text-main)' }}>Department Overview</h3>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          Welcome to your Head of Department control panel. Below you will find real-time analysis of your department's data. 
          Currently, you are overseeing <strong>{data.studentCount || 0}</strong> students and coordinating with <strong>{data.facultyCount || 0}</strong> faculty members. 
          Use this dashboard to monitor syllabus completion, review study materials, and ensure academic excellence across all <strong>{data.subjectCount || 0}</strong> subjects in your department.
        </p>
      </div>
      
      <div className={styles.statsGrid}>
        <div onClick={() => navigate('/hod/students')} style={{ cursor: 'pointer' }}>
          <StatCard title="Department Students" value={data.studentCount || 0} icon={<Users size={24} />} color="#3B82F6" />
        </div>
        <div onClick={() => navigate('/hod/faculty')} style={{ cursor: 'pointer' }}>
          <StatCard title="Department Faculty" value={data.facultyCount || 0} icon={<UserCog size={24} />} color="#10B981" />
        </div>
        <div onClick={() => navigate('/hod/subjects')} style={{ cursor: 'pointer' }}>
          <StatCard title="Department Subjects" value={data.subjectCount || 0} icon={<Book size={24} />} color="#8B5CF6" />
        </div>
        <div onClick={() => navigate('/hod/syllabus-completion')} style={{ cursor: 'pointer' }}>
          <StatCard title="Syllabus Completion" value={`${completionPct}%`} icon={<CheckSquare size={24} />} color="#06B6D4" />
        </div>
        <div onClick={() => navigate('/hod/syllabus')} style={{ cursor: 'pointer' }}>
          <StatCard title="Syllabus Records" value={data.syllabusCount || 0} icon={<FileText size={24} />} color="#EC4899" />
        </div>
        <div onClick={() => navigate('/hod/materials')} style={{ cursor: 'pointer' }}>
          <StatCard title="Study Materials" value={data.materialCount || deptMaterials.length || 0} icon={<FolderOpen size={24} />} color="#14B8A6" />
        </div>
        <div onClick={() => navigate('/hod/model-papers')} style={{ cursor: 'pointer' }}>
          <StatCard title="Model Papers" value={data.modelPaperCount || 0} icon={<FileSpreadsheet size={24} />} color="#F59E0B" />
        </div>
      </div>

      {/* Syllabus Completion Quick-Action Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        borderRadius: '12px', padding: '24px', marginBottom: '25px',
        border: '1px solid #bbf7d0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckSquare size={22} color="#16a34a" />
              <h3 style={{ margin: 0, color: '#15803d', fontSize: '1.25rem' }}>
                Department Syllabus Completion & Unit Tracking
              </h3>
            </div>
            <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontSize: '0.92rem' }}>
              Track course coverage milestones, mark completed units, and review test assessments for all subjects in your department.
            </p>
            {data.totalUnits !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#16a34a' }}>
                  <CheckCircle size={16} /> {data.completedUnits || 0} Units Completed
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#6b7280' }}>
                  <Clock size={16} /> {(data.totalUnits || 0) - (data.completedUnits || 0)} Units Remaining
                </span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>
                  Overall Coverage: {completionPct}%
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/hod/syllabus-completion')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', backgroundColor: '#16a34a', color: 'white',
                border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)', fontSize: '0.95rem'
              }}
            >
              <CheckSquare size={18} /> Manage Syllabus Completion <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/hod/reports')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', backgroundColor: 'white', color: '#374151',
                border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Materials Dashboard Section */}
      <div style={{
        backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOpen size={22} color="var(--color-primary)" /> Department Materials Dashboard
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Review, verify, and manage study materials uploaded by your department faculty.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/hod/materials')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: 'white',
                border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Upload New Material
            </button>
            <button
              onClick={() => navigate('/hod/materials')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
                border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {deptMaterials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>No materials uploaded yet for this department.</p>
            <button
              onClick={() => navigate('/hod/materials')}
              style={{ marginTop: '10px', padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Upload First Material
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '10px' }}>Title</th>
                  <th style={{ padding: '10px' }}>Subject</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Semester</th>
                  <th style={{ padding: '10px' }}>Uploaded By</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deptMaterials.slice(0, 5).map(mat => (
                  <tr key={mat._id || mat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: 'var(--color-text-main)' }}>{mat.title}</td>
                    <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{mat.subject?.name || mat.subject || '-'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#eff6ff', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600 }}>
                        {mat.materialType || 'Notes'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>Sem {mat.semester || '-'}</td>
                    <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{mat.uploadedBy?.name || 'Faculty'}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      {mat.file && (
                        <button
                          onClick={() => {
                            const url = mat.file.startsWith('/') ? `http://localhost:5000${mat.file}` : mat.file;
                            window.open(url, '_blank');
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '4px 10px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
                            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                          }}
                        >
                          <ExternalLink size={12} /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.recentSection}>
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

export default HODDashboard;
