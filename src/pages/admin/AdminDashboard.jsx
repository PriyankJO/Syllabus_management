import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, UserCog, UserCheck, Building2, Book, FileText, FolderOpen } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import TypewriterText from '../../components/common/TypewriterText';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData('ADMIN'));
  }, [dispatch]);

  const COLORS = ['#4F46E5', '#0D9488', '#E9778A', '#4338CA', '#0F766E', '#D86578'];

  if (loading || !data) {
    return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h2 style={{ margin: '0 0 20px 0', color: 'var(--color-primary)', fontSize: '2rem' }}>
        <TypewriterText text="Welcome back, Administrator!" delay={60} />
      </h2>
      <div className={styles.statsGrid}>
        <StatCard title="Total Students" value={data.totalStudents || 0} icon={<Users size={24} />} />
        <StatCard title="Total Faculty" value={data.totalFaculty || 0} icon={<UserCog size={24} />} />
        <StatCard title="Total HODs" value={data.totalHODs || 0} icon={<UserCheck size={24} />} />
        <StatCard title="Departments" value={data.totalDepartments || 0} icon={<Building2 size={24} />} />
        <StatCard title="Subjects" value={data.totalSubjects || 0} icon={<Book size={24} />} />
        <StatCard title="Total Syllabus" value={data.totalSyllabus || 0} icon={<FileText size={24} />} />
        <StatCard title="Study Materials" value={data.totalMaterials || 0} icon={<FolderOpen size={24} />} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Students by Department</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studentsByDept || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(233, 119, 138, 0.05)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="students" fill="#4F46E5" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Faculty Distribution</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.facultyByDept || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {(data.facultyByDept || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h3>Recent Activity</h3>
        <div className={styles.activityList}>
          {data.recentActivities && data.recentActivities.length > 0 ? (
            data.recentActivities.map((activity, index) => (
              <div key={index} className={styles.activityItem} style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ margin: 0, fontWeight: '500', color: 'var(--color-text)' }}>{activity.details}</p>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(activity.createdAt).toLocaleString()} {activity.user ? `by ${activity.user.name}` : ''}
                </small>
              </div>
            ))
          ) : (
            <div className={styles.activityItem} style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
