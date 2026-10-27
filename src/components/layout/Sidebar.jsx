import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, UserCog, Building2, Book, 
  FileText, FolderOpen, FileSpreadsheet, Bell, Settings,
  CheckSquare, MessageSquare, ClipboardList, X, LogOut, User
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    if (window.innerWidth <= 768) onClose();
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
    { name: 'Faculty', path: '/admin/faculty', icon: <UserCog size={20} /> },
    { name: 'Departments', path: '/admin/departments', icon: <Building2 size={20} /> },
    { name: 'Subjects', path: '/admin/subjects', icon: <Book size={20} /> },
    { name: 'Syllabus', path: '/admin/syllabus', icon: <FileText size={20} /> },
    { name: 'Study Materials', path: '/admin/materials', icon: <FolderOpen size={20} /> },
    { name: 'Model Papers', path: '/admin/model-papers', icon: <FileSpreadsheet size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/admin/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const hodLinks = [
    { name: 'Dashboard', path: '/hod/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Faculty', path: '/hod/faculty', icon: <UserCog size={20} /> },
    { name: 'Students', path: '/hod/students', icon: <Users size={20} /> },
    { name: 'Department Subjects', path: '/hod/subjects', icon: <Book size={20} /> },
    { name: 'Department Syllabus', path: '/hod/syllabus', icon: <FileText size={20} /> },
    { name: 'Syllabus Completion', path: '/hod/syllabus-completion', icon: <CheckSquare size={20} /> },
    { name: 'Study Materials', path: '/hod/materials', icon: <FolderOpen size={20} /> },
    { name: 'Model Papers', path: '/hod/model-papers', icon: <FileSpreadsheet size={20} /> },
    { name: 'My Quizzes', path: '/hod/quizzes', icon: <FileText size={20} /> },
    { name: 'Discussions', path: '/hod/discussions', icon: <MessageSquare size={20} /> },
    { name: 'Department Reports', path: '/hod/reports', icon: <ClipboardList size={20} /> },
    { name: 'Notifications', path: '/hod/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/hod/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/hod/settings', icon: <Settings size={20} /> },
  ];

  const facultyLinks = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/faculty/students', icon: <Users size={20} /> },
    { name: 'My Subjects', path: '/faculty/subjects', icon: <Book size={20} /> },
    { name: 'Syllabus', path: '/faculty/syllabus', icon: <FileText size={20} /> },
    { name: 'Syllabus Completion', path: '/faculty/syllabus-completion', icon: <CheckSquare size={20} /> },
    { name: 'Study Materials', path: '/faculty/materials', icon: <FolderOpen size={20} /> },
    { name: 'Model Papers', path: '/faculty/model-papers', icon: <FileSpreadsheet size={20} /> },
    { name: 'My Quizzes', path: '/faculty/quizzes', icon: <FileText size={20} /> },
    { name: 'Discussions', path: '/faculty/discussions', icon: <MessageSquare size={20} /> },
    { name: 'Notifications', path: '/faculty/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/faculty/profile', icon: <Settings size={20} /> },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Subjects', path: '/student/subjects', icon: <Book size={20} /> },
    { name: 'Syllabus', path: '/student/syllabus', icon: <FileText size={20} /> },
    { name: 'Study Materials', path: '/student/materials', icon: <FolderOpen size={20} /> },
    { name: 'Model Papers', path: '/student/model-papers', icon: <FileSpreadsheet size={20} /> },
    { name: 'Take Test', path: '/student/take-test', icon: <ClipboardList size={20} /> },
    { name: 'Quiz History', path: '/student/quiz-history', icon: <ClipboardList size={20} /> },
    { name: 'Discussions', path: '/student/discussions', icon: <MessageSquare size={20} /> },
    { name: 'Notifications', path: '/student/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/student/profile', icon: <Settings size={20} /> },
  ];

  let links = [];
  if (role === 'ADMIN') links = adminLinks;
  else if (role === 'HOD') links = hodLinks;
  else if (role === 'FACULTY') links = facultyLinks;
  else if (role === 'STUDENT') links = studentLinks;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <Book size={24} className={styles.logoIcon} />
          <h2>SPC Syllabus</h2>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            onClick={() => {
              if (window.innerWidth <= 768) onClose();
            }}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
