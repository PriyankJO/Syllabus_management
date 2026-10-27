import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, X, PlayCircle } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { markNotificationAsRead, fetchNotifications } from '../../store/slices/notificationSlice';
import styles from './Header.module.css';

const Header = ({ toggleSidebar }) => {
  const { user } = useSelector(state => state.auth);
  const { notifications } = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.readBy?.includes(user?._id || user?.id)).length;

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setNotifOpen(true);
    setMenuOpen(false);
  };

  // Close when pressing escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button className={styles.menuBtn} onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <h2 className={styles.pageTitle}>Dashboard</h2>
        </div>

        <div className={styles.right}>
          <div className={styles.notificationWrapper}>
            <button className={styles.iconBtn} onClick={handleNotificationClick}>
              <Bell size={20} />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>
          </div>

          <div className={styles.profileWrapper}>
            <button className={styles.profileBtn} onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}>
              <div className={styles.avatar}>
                <User size={20} />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userRole}>{user?.role}</span>
              </div>
            </button>

            {menuOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
                <button 
                  className={styles.dropdownItem} 
                  onClick={() => {
                    setMenuOpen(false);
                    if (user?.role === 'ADMIN') navigate('/admin/profile');
                    else if (user?.role === 'HOD') navigate('/hod/profile');
                    else if (user?.role === 'FACULTY') navigate('/faculty/profile');
                    else navigate('/student/profile');
                  }}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer Overlay */}
      {notifOpen && <div className={styles.overlay} onClick={() => setNotifOpen(false)} />}

      {/* Notification Drawer */}
      <div className={`${styles.notificationDrawer} ${notifOpen ? styles.open : ''}`}>
        <div className={styles.drawerHeader}>
          <h3>Notifications</h3>
          <button className={styles.closeBtn} onClick={() => setNotifOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {notifications.length > 0 ? (
            notifications.map(notif => {
              const isUnread = !notif.readBy?.includes(user?._id || user?.id);
              return (
                <div
                  key={notif._id || notif.id}
                  className={`${styles.notificationItem} ${isUnread ? styles.unread : ''}`}
                  onClick={() => {
                    if (isUnread) dispatch(markNotificationAsRead(notif._id || notif.id));
                  }}
                >
                  <div className={styles.notifTitle}>{notif.title}</div>
                  <div className={styles.notifMessage}>{notif.message}</div>
                  
                  {(() => {
                    const match = notif.message?.match(/Quiz Code:\s*"?([A-Za-z0-9_-]+)"?/i);
                    const quizCode = match ? match[1] : null;
                    if (!quizCode) return null;

                    return (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                        <span style={{ 
                          padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', 
                          color: '#3730a3', fontWeight: 700, fontSize: '0.8rem' 
                        }}>
                          Code: {quizCode}
                        </span>
                        {user?.role === 'STUDENT' && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(quizCode);
                              if (isUnread) dispatch(markNotificationAsRead(notif._id || notif.id));
                              setNotifOpen(false);
                              navigate('/student/take-test');
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              background: '#10b981', color: 'white', border: 'none',
                              padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
                            }}
                          >
                            <PlayCircle size={13} /> Attend Test
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <span className={styles.notifDate}>
                    {new Date(notif.date).toLocaleDateString()} at {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyNotifications}>
              No notifications right now.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
