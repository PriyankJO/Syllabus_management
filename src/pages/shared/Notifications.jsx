import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationAsRead, deleteNotification, addNotification } from '../../store/slices/notificationSlice';
import { Trash2, Bell, Plus, Send, PlayCircle, Copy, Check } from 'lucide-react';

const Notifications = () => {
  const { notifications } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'General',
    roleTarget: 'All'
  });

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'HOD';

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(addNotification(formData));
    setFormData({ title: '', message: '', type: 'General', roleTarget: 'All' });
    setShowForm(false);
  };

  const userRole = (user?.role || '').toUpperCase();
  const userNotifications = notifications.filter(n => {
    const target = (n.roleTarget || 'All').toUpperCase();
    return target === 'ALL' || target === userRole || userRole === 'ADMIN' || userRole === 'HOD';
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Notifications</h2>
        {canCreate && (
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', 
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' 
            }}
          >
            <Plus size={18} /> {showForm ? 'Cancel' : 'Create Notification'}
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginTop: 0 }}>New Notification</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
            />
            <textarea 
              placeholder="Message" 
              value={formData.message} 
              onChange={e => setFormData({...formData, message: e.target.value})}
              required
              rows="3"
              style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
                style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
              >
                <option value="General">General</option>
                <option value="Exam">Exam</option>
                <option value="Material">Material</option>
              </select>
              <select 
                value={formData.roleTarget} 
                onChange={e => setFormData({...formData, roleTarget: e.target.value})}
                style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
              >
                <option value="All">All Roles</option>
                <option value="FACULTY">Faculty Only</option>
                <option value="STUDENT">Students Only</option>
              </select>
            </div>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <Send size={18} /> Send Notification
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {userNotifications.length > 0 ? userNotifications.map(n => {
          const isRead = n.readBy?.includes(user?._id || user?.id);
          return (
            <div 
              key={n._id || n.id} 
              style={{ 
                backgroundColor: isRead ? 'var(--color-surface)' : 'var(--color-primary-light)', 
                color: isRead ? 'var(--color-text-main)' : 'white',
                padding: '15px', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: isRead ? '1px solid var(--color-border)' : 'none'
              }}
            >
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ backgroundColor: isRead ? 'var(--color-bg)' : 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}>
                  <Bell size={20} color={isRead ? 'var(--color-secondary)' : 'white'} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{n.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{n.message}</p>
                  
                  {/* Quick Action for Quiz Code Notifications */}
                  {(() => {
                    const match = n.message?.match(/Quiz Code:\s*"?([A-Za-z0-9_-]+)"?/i);
                    const quizCode = match ? match[1] : null;
                    if (!quizCode) return null;

                    return (
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          padding: '3px 8px', borderRadius: '4px', background: isRead ? '#f1f5f9' : 'rgba(255,255,255,0.25)', 
                          color: isRead ? 'var(--color-primary)' : 'white', fontWeight: 800, fontSize: '0.85rem' 
                        }}>
                          Code: {quizCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(quizCode);
                            setCopiedCode(quizCode);
                            setTimeout(() => setCopiedCode(null), 2500);
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: isRead ? 'white' : 'rgba(255,255,255,0.2)',
                            color: isRead ? 'var(--color-primary)' : 'white',
                            border: isRead ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.4)',
                            padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                          }}
                        >
                          {copiedCode === quizCode ? <Check size={14} /> : <Copy size={14} />}
                          {copiedCode === quizCode ? 'Copied' : 'Copy'}
                        </button>
                        {userRole === 'STUDENT' && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(quizCode);
                              navigate('/student/take-test');
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              background: '#10b981', color: 'white', border: 'none',
                              padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700
                            }}
                          >
                            <PlayCircle size={14} /> Attend Test
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <span style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px', display: 'block' }}>{new Date(n.date).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!isRead && (
                  <button 
                    onClick={() => dispatch(markNotificationAsRead(n._id || n.id))}
                    style={{ background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Mark Read
                  </button>
                )}
                {(canCreate || !isRead) && (
                  <button 
                    onClick={() => dispatch(deleteNotification(n._id || n.id))}
                    style={{ background: 'none', border: 'none', color: isRead ? 'var(--color-danger)' : 'white', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
