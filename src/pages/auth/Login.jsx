import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logout } from '../../store/slices/authSlice';
import styles from './Login.module.css';
import { BookOpen, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('STUDENT');
  const [portalError, setPortalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setPortalError('');
    
    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        
        // Strict portal separation
        if (loginType === 'STUDENT' && user.role !== 'STUDENT') {
          dispatch(logout());
          setPortalError(`This account is registered as ${user.role} (Faculty/Staff). Please click the "Admin & Staff Portal" tab above to sign in.`);
          return;
        }

        if (loginType === 'STAFF' && user.role === 'STUDENT') {
          dispatch(logout());
          setPortalError('This account is registered as a Student. Please click the "Student Portal" tab above to sign in.');
          return;
        }
        
        // Redirect cleanly based on verified role
        if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user.role === 'HOD') navigate('/hod/dashboard');
        else if (user.role === 'FACULTY') navigate('/faculty/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Failed to login', err);
    }
  };

  const handleTabChange = (type) => {
    setLoginType(type);
    setPortalError('');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.leftSide}>
        <div className={styles.branding}>
          <BookOpen size={48} className={styles.logoIcon} />
          <h1>SPC Syllabus Management</h1>
          <p>Academic Syllabus, Learning & Assessment Management</p>
        </div>
      </div>
      <div className={styles.rightSide}>
        <div className={styles.loginCard}>
          <h2>Welcome Back</h2>
          <p className={styles.subtitle}>
            {loginType === 'STUDENT' ? 'Student Learning Portal' : 'Faculty, HOD & Administrator Portal'}
          </p>
          
          <div className={styles.tabContainer}>
            <button 
              type="button"
              className={`${styles.tabBtn} ${loginType === 'STUDENT' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('STUDENT')}
            >
              Student Portal
            </button>
            <button 
              type="button"
              className={`${styles.tabBtn} ${loginType === 'STAFF' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('STAFF')}
            >
              Admin & Staff Portal
            </button>
          </div>

          {(error || portalError) && (
            <div className={styles.errorAlert} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{portalError || error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className={styles.form}>
            
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder={`Enter your email`}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  className={styles.showHideBtn} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div className={styles.formFooter} style={{ justifyContent: 'flex-start' }}>
              <label className={styles.rememberMe}>
                <input type="checkbox" /> Remember me
              </label>
            </div>
            
            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Signing in...' : `Sign In`}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;
