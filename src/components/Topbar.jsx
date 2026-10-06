import React, { useState, useEffect } from 'react';
import { Bell, Palette, Check, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function Topbar({ activeTabTitle, user }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const [bgTheme, setBgTheme] = useState(() => {
    return localStorage.getItem('portal_bg_theme') || 'indigo';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bg-theme', bgTheme);
    localStorage.setItem('portal_bg_theme', bgTheme);
  }, [bgTheme]);

  const themes = [
    { id: 'indigo', name: 'Indigo Galaxy', class: 'bg-theme-indigo' },
    { id: 'cyber', name: 'Cyber Dark', class: 'bg-theme-cyber' },
    { id: 'sunset', name: 'Sunset Glow', class: 'bg-theme-sunset' },
    { id: 'emerald', name: 'Emerald Night', class: 'bg-theme-emerald' },
    { id: 'ocean', name: 'Ocean Midnight', class: 'bg-theme-ocean' },
    { id: 'light', name: 'Soft Light', class: 'bg-theme-light' }
  ];

  useEffect(() => {
    if (user?.id && user?.role) {
      fetch(`/api/notifications?user_id=${user.id}&user_role=${user.role}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error('Failed to fetch notifications:', err));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = () => {
    fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, user_role: user.role })
    })
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      })
      .catch(err => console.error('Failed to mark read:', err));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="topbar">
      <h2 className="topbar-page-title">{activeTabTitle}</h2>

      <div className="topbar-actions">
        {/* Background Theme Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => {
              setShowThemePicker(!showThemePicker);
              setShowNotifications(false);
            }}
            title="Change Background Theme"
          >
            <Palette size={20} />
          </button>

          {showThemePicker && (
            <div className="card" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '240px',
              zIndex: 100,
              padding: '0.85rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', color: '#09090b' }}>
                Background Color Theme
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {themes.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setBgTheme(t.id);
                      setShowThemePicker(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: bgTheme === t.id ? '1px solid #18181b' : '1px solid #e4e4e7',
                      backgroundColor: bgTheme === t.id ? '#f4f4f5' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: bgTheme === t.id ? 600 : 400,
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <span className={`bg-theme-chip ${t.class}`} style={{ width: '16px', height: '16px' }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowThemePicker(false);
            }}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge" />}
          </button>

          {showNotifications && (
            <div className="card" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              zIndex: 100,
              padding: '1rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#71717a', textAlign: 'center', padding: '1rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: n.is_read ? '#f8fafc' : '#eff6ff',
                        borderLeft: n.is_read ? '3px solid #cbd5e1' : '3px solid #2563eb',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#09090b', marginBottom: '0.2rem' }}>{n.title}</div>
                      <div style={{ color: '#52525b', fontSize: '0.75rem' }}>{n.message}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.3rem' }}>{n.created_at}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="avatar">
            {getInitials(user?.name)}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role-label">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
