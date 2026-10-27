import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Mail, Phone, BookOpen, Briefcase, Award, 
  Settings as SettingsIcon, Save, Eye, EyeOff, Edit3, CheckCircle2 
} from 'lucide-react';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { updateUser } from '../../store/slices/userSlice';
import { updateAuthUser } from '../../store/slices/authSlice';

const FacultyProfile = () => {
  const { user } = useSelector(state => state.auth);
  const departments = useSelector(state => state.departments.departments) || [];
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'edit'
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    _id: user?._id || user?.id,
    name: user?.name || '',
    phone: user?.phone || '',
    designation: user?.designation || 'Assistant Professor',
    password: ''
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id || user.id,
        name: user.name || '',
        phone: user.phone || '',
        designation: user.designation || 'Assistant Professor',
        password: ''
      });
    }
  }, [user]);

  // Generate initials for the avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'FP';
  };

  // Resolve department name cleanly
  const resolveDepartmentName = () => {
    if (!user) return 'N/A';
    if (user.department && typeof user.department === 'object' && user.department.name) {
      return user.department.name;
    }
    const deptId = String(user.department?._id || user.department?.id || user.department || '');
    const foundDept = departments.find(d => String(d._id || d.id) === deptId);
    if (foundDept) return foundDept.name;
    return user.department && typeof user.department === 'string' && user.department.length > 20
      ? 'Department of English' // fallback for default seeded dept
      : (user.department || 'Curriculum Department');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    const dataToSubmit = {
      _id: formData._id,
      name: formData.name,
      phone: formData.phone,
      designation: formData.designation
    };

    if (formData.password && formData.password.trim() !== '') {
      dataToSubmit.password = formData.password;
    }

    try {
      const updatedUser = await dispatch(updateUser(dataToSubmit)).unwrap();
      dispatch(updateAuthUser({
        name: updatedUser.name,
        phone: updatedUser.phone,
        designation: updatedUser.designation
      }));
      setFormData(prev => ({ ...prev, password: '' }));
      setSuccessMessage('Profile and settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert('Failed to update profile: ' + (err.message || 'Error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  const departmentName = resolveDepartmentName();

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out forwards', maxWidth: '850px', margin: '0 auto', padding: '10px' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.85rem' }}>Faculty Profile</h1>
        <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-muted)' }}>
          Manage your academic credentials, contact details, and account settings.
        </p>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {/* Profile Header Gradient */}
        <div style={{
          height: '140px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          position: 'relative'
        }}>
          {/* Avatar */}
          <div style={{
            position: 'absolute',
            bottom: '-45px',
            left: '40px',
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
              background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: 800
            }}>
              {user?.name ? getInitials(user.name) : <User size={36} />}
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div style={{ padding: '60px 40px 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.65rem', color: 'var(--color-text-main)' }}>
                {user?.name || 'Faculty Member'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  {user?.role || 'FACULTY'}
                </span>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {departmentName}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.88rem',
                  backgroundColor: activeTab === 'overview' ? 'white' : 'transparent',
                  color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: activeTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <User size={15} /> Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.88rem',
                  backgroundColor: activeTab === 'edit' ? 'white' : 'transparent',
                  color: activeTab === 'edit' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: activeTab === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            </div>
          </div>

          {successMessage && (
            <div style={{
              marginTop: '20px', padding: '12px 16px', backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'overview' ? (
            /* OVERVIEW TAB */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginTop: '30px'
            }}>
              {/* Contact Information Group */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Email Address</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{user?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Phone size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Phone Number</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{user?.phone || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information Group */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Department & Role
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Assigned Department</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                        {departmentName}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Academic Designation</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                        {user?.designation || 'Assistant Professor'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Award size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Faculty Status</div>
                      <div style={{ fontWeight: 600, color: '#10b981', fontSize: '0.95rem' }}>
                        {user?.status || 'Active'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT PROFILE TAB */
            <div style={{ marginTop: '25px', animation: 'fadeIn 0.3s' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-main)', fontSize: '1.15rem' }}>
                  Update Faculty Information
                </h3>
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Full Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g. Prof. Jane Smith"
                      style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.92rem', outline: 'none' }}
                    />
                  </div>

                  {/* Phone Number */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.92rem', outline: 'none' }}
                    />
                  </div>

                  {/* Academic Designation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Designation</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', backgroundColor: 'white' }}
                    >
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Head of Department">Head of Department</option>
                      <option value="Guest Lecturer">Guest Lecturer</option>
                    </select>
                  </div>

                  {/* Department (Read-only indication) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Department</label>
                    <input 
                      type="text" 
                      value={departmentName}
                      disabled
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.92rem', backgroundColor: '#e2e8f0', color: '#475569', cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Assigned by College Administration</span>
                  </div>

                  {/* Change Password */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Change Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'white', paddingRight: '12px' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ padding: '10px 14px', border: 'none', background: 'transparent', flex: 1, outline: 'none', fontSize: '0.92rem' }}
                        placeholder="Leave blank to keep current password"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Enter at least 6 characters if updating your password.</span>
                  </div>

                  {/* Submit Button */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button 
                      type="submit"
                      disabled={isSaving}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                        padding: '12px 24px', background: 'var(--color-primary)', color: 'white', 
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem'
                      }}
                    >
                      <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      style={{ 
                        padding: '12px 18px', background: 'white', color: 'var(--color-text-muted)', 
                        border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
