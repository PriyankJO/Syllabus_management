import React, { useState, useEffect } from 'react';
import { Save, User as UserIcon, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/userSlice';
import { updateAuthUser } from '../../store/slices/authSlice';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);

  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Institution Settings State
  const [settings, setSettings] = useState({
    collegeName: 'Arts and Science College',
    academicYear: '2026-2027',
    currentSemester: 'Odd',
    maxCreditsPerSem: 24,
    allowStudentRegistration: true,
    maintenanceMode: false
  });

  // Admin Profile State
  const [profile, setProfile] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        _id: user._id || user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '' // Don't show hashed password
      });
    }
  }, [user]);

  const handleSettingsChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('Global settings saved successfully!');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...profile };
    // Only send password if it was typed
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
    }

    dispatch(updateUser(dataToSubmit))
      .unwrap()
      .then((updatedUser) => {
        // Update the auth user state so the header updates instantly
        dispatch(updateAuthUser({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        }));
        setProfile({ ...profile, password: '' }); // clear password field
        alert('Admin profile updated successfully!');
      })
      .catch((err) => {
        alert('Failed to update profile: ' + (err.message || 'Error occurred'));
      });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Settings</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '2px solid var(--color-border)' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ 
            padding: '10px 20px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'profile' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'profile' ? 'var(--color-primary)' : '#666',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserIcon size={18} /> My Profile
        </button>
        <button 
          onClick={() => setActiveTab('global')}
          style={{ 
            padding: '10px 20px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'global' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'global' ? 'var(--color-primary)' : '#666',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <SettingsIcon size={18} /> Global Settings
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-xl)', boxShadow: '0 10px 30px rgba(233, 119, 138, 0.08)', border: '1px solid rgba(233, 119, 138, 0.1)' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '15px' }}>Admin Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
              <input required type="text" name="name" value={profile.name} onChange={handleProfileChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                <input required type="email" name="email" value={profile.email} onChange={handleProfileChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number</label>
                <input type="text" name="phone" value={profile.phone} onChange={handleProfileChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Password <span style={{fontWeight: 'normal', color: '#888'}}>(Leave blank to keep current)</span></label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={profile.password} 
                  onChange={handleProfileChange} 
                  style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#888', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
              <Save size={20} /> Update Profile
            </button>
          </div>
        </form>
      )}

      {activeTab === 'global' && (
        <form onSubmit={handleSaveSettings} style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-xl)', boxShadow: '0 10px 30px rgba(233, 119, 138, 0.08)', border: '1px solid rgba(233, 119, 138, 0.1)' }}>
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '15px' }}>Institution Configuration</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Institution Name</label>
                <input type="text" name="collegeName" value={settings.collegeName} onChange={handleSettingsChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Current Academic Year</label>
                  <input type="text" name="academicYear" value={settings.academicYear} onChange={handleSettingsChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Active Semester</label>
                  <select name="currentSemester" value={settings.currentSemester} onChange={handleSettingsChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <option value="Odd">Odd Semester (1,3,5)</option>
                    <option value="Even">Even Semester (2,4,6)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '15px' }}>Academic Rules</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Credits Per Semester</label>
                <input type="number" name="maxCreditsPerSem" value={settings.maxCreditsPerSem} onChange={handleSettingsChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '15px' }}>System Access</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" name="allowStudentRegistration" checked={settings.allowStudentRegistration} onChange={handleSettingsChange} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                <span style={{ fontWeight: '500' }}>Allow Open Student Registration</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleSettingsChange} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                <span style={{ fontWeight: '500', color: 'var(--color-danger)' }}>Enable Maintenance Mode (Restricts logins to Admins only)</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #F08A9B 0%, #E9778A 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 15px rgba(233, 119, 138, 0.3)' }}>
              <Save size={20} /> Save Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
