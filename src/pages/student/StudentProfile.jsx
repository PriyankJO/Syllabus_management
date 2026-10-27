import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Mail, Phone, BookOpen, Hash, Award, 
  Settings as SettingsIcon, Save, Eye, EyeOff, 
  CheckCircle2, ShieldCheck, GraduationCap, Building2, Calendar
} from 'lucide-react';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { updateUser } from '../../store/slices/userSlice';
import { updateAuthUser } from '../../store/slices/authSlice';
import api from '../../services/api';

const StudentProfile = () => {
  const { user } = useSelector(state => state.auth);
  const departments = useSelector(state => state.departments.departments) || [];
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    _id: user?._id || user?.id,
    name: user?.name || '',
    phone: user?.phone || '',
    password: ''
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Sync fresh user data from server on mount
  useEffect(() => {
    const fetchLatestProfile = async () => {
      const uid = user?._id || user?.id;
      if (!uid) return;
      try {
        const res = await api.get(`/users/${uid}`);
        if (res.data?.data) {
          const fresh = res.data.data;
          dispatch(updateAuthUser({
            name: fresh.name,
            phone: fresh.phone,
            department: fresh.department,
            semester: fresh.semester,
            academicYear: fresh.academicYear,
            userCode: fresh.userCode
          }));
          setFormData({
            _id: fresh._id,
            name: fresh.name || '',
            phone: fresh.phone || '',
            password: ''
          });
        }
      } catch (err) {
        console.warn('Could not refresh student profile:', err.message);
      }
    };

    fetchLatestProfile();
  }, [dispatch, user?._id, user?.id]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        _id: user._id || user.id,
        name: user.name || prev.name,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  // Generate initials for the avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
  };

  // Safely resolve department name so React never crashes on Object
  const resolveDepartmentName = () => {
    if (!user) return 'Not Assigned';
    if (user.department && typeof user.department === 'object') {
      return user.department.name || user.department.code || 'Curriculum Department';
    }
    const deptId = String(user.department?._id || user.department?.id || user.department || '');
    const foundDept = departments.find(d => String(d._id || d.id) === deptId);
    if (foundDept) return foundDept.name;
    return (user.department && typeof user.department === 'string' && user.department.length < 20) 
      ? user.department 
      : 'Computer Science';
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const dataToSubmit = {
      _id: formData._id,
      name: formData.name,
      phone: formData.phone
    };

    if (formData.password && formData.password.trim() !== '') {
      dataToSubmit.password = formData.password;
    }

    try {
      const updatedUser = await dispatch(updateUser(dataToSubmit)).unwrap();
      dispatch(updateAuthUser({
        name: updatedUser.name,
        phone: updatedUser.phone
      }));
      setFormData(prev => ({ ...prev, password: '' }));
      setSuccessMessage('Student profile & security settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const deptName = resolveDepartmentName();
  const rollNumber = user?.userCode || 'STU-2024-001';

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out forwards', maxWidth: '850px', margin: '0 auto', padding: '10px' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.85rem' }}>Student Profile</h1>
        <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-muted)' }}>
          View your academic registration details, contact credentials, and manage your account.
        </p>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {/* Profile Banner */}
        <div style={{
          height: '140px',
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-45px',
            left: '35px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            border: '4px solid var(--color-surface)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.75rem',
              fontWeight: 800
            }}>
              {user?.name ? getInitials(user.name) : <User size={36} />}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 35px 35px 35px' }}>
          {/* Top Bar with Name, Badge and Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--color-text-main)' }}>
                  {user?.name || 'Student Name'}
                </h2>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', background: '#dcfce7', color: '#15803d',
                  borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  <ShieldCheck size={14} /> Active Student
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Roll No: <strong style={{ color: 'var(--color-primary)' }}>{rollNumber}</strong> • {deptName}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', background: 'var(--color-light-grey)', padding: '5px', borderRadius: 'var(--radius-md)' }}>
              <button 
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '8px 18px',
                  background: activeTab === 'profile' ? 'white' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <User size={16} /> Overview
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('settings')}
                style={{
                  padding: '8px 18px',
                  background: activeTab === 'settings' ? 'white' : 'transparent',
                  color: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: activeTab === 'settings' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <SettingsIcon size={16} /> Edit Profile & Security
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {successMessage && (
            <div style={{
              marginTop: '20px', padding: '12px 18px', backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success-text)', borderRadius: 'var(--radius-md)', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{
              marginTop: '20px', padding: '12px 18px', backgroundColor: '#fef2f2',
              color: '#991b1b', borderRadius: 'var(--radius-md)', fontWeight: 600,
              border: '1px solid #fecaca'
            }}>
              {errorMessage}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'profile' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginTop: '30px' }}>
              
              {/* Academic Registration Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} color="var(--color-primary)" /> Academic Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Department</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{deptName}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
                      <Hash size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Current Semester</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                        Semester {user?.semester || 1}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Academic Session</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {user?.academicYear || '2024 - 2025'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Program / Degree</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Undergraduate (Regular)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal & Contact Credentials Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="var(--color-secondary)" /> Contact & Identity
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                      <Hash size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Student Register / Roll ID</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{rollNumber}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Email Address</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{user?.email || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Mobile Number</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{user?.phone || 'Not Provided'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#be185d' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Institution</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Sri Parasakthi College for Women</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: EDIT PROFILE & SECURITY */
            <div style={{ marginTop: '25px', animation: 'fadeIn 0.3s' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                maxWidth: '560px'
              }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-main)', margin: '0 0 6px 0' }}>
                  Update Student Information
                </h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                  Keep your personal contact details and account security password up to date.
                </p>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Student Full Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        padding: '12px 14px', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)', outline: 'none', background: 'white',
                        fontSize: '0.95rem'
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Registered Email (Disabled) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Registered Email (Cannot be changed)
                    </label>
                    <input 
                      type="text" 
                      value={user?.email || ''}
                      disabled
                      style={{
                        padding: '12px 14px', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)', background: '#e2e8f0', color: '#64748b',
                        fontSize: '0.95rem', cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  {/* Mobile Phone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      Contact Phone Number
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        padding: '12px 14px', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)', outline: 'none', background: 'white',
                        fontSize: '0.95rem'
                      }}
                      placeholder="Enter mobile phone number"
                    />
                  </div>

                  {/* Change Password */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      Change Password
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)', background: 'white', paddingRight: '12px'
                    }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{
                          padding: '12px 14px', border: 'none', background: 'transparent',
                          flex: 1, outline: 'none', fontSize: '0.95rem'
                        }}
                        placeholder="Leave blank to retain current password"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Only type here if you wish to set a new login password.
                    </span>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSaving}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '13px 24px', background: 'var(--color-primary)', color: 'white',
                      border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold',
                      fontSize: '1rem', cursor: isSaving ? 'wait' : 'pointer', marginTop: '10px',
                      transition: 'background-color 0.2s', boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
                    }}
                  >
                    <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
