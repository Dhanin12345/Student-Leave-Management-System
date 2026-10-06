import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin') setEmail('admin@college.edu');
    else if (newRole === 'faculty') setEmail('faculty@college.edu');
    else if (newRole === 'student') setEmail('student@college.edu');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        setLoading(false);
        if (status === 200) {
          onLoginSuccess(body.user);
        } else {
          setError(body.error || 'Login failed');
        }
      })
      .catch(err => {
        setLoading(false);
        setError('Server network error. Please try again.');
      });
  };

  return (
    <div className="auth-wrapper">
      <div className="bg-glow-orb" />
      <div className="bg-glow-orb-2" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">SL</div>
          <h2>College Leave Portal</h2>
          <p style={{ fontSize: '0.85rem', color: '#71717a', marginTop: '0.3rem' }}>
            Sign in to access your portal dashboard
          </p>
        </div>

        <div className="role-selector">
          <button 
            type="button" 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            Admin
          </button>
          <button 
            type="button" 
            className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
            onClick={() => handleRoleChange('faculty')}
          >
            Faculty
          </button>
          <button 
            type="button" 
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            Student
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="user@college.edu"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>💡 Quick Demo Logins:</div>
          <div>Click any role button above to switch credentials automatically. Default password is <code>password123</code>.</div>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" className="demo-btn" onClick={() => handleRoleChange('admin')}>Admin</button>
            <button type="button" className="demo-btn" onClick={() => handleRoleChange('faculty')}>Faculty</button>
            <button type="button" className="demo-btn" onClick={() => handleRoleChange('student')}>Student</button>
          </div>
        </div>

        {role === 'student' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            Don't have a student account?{' '}
            <button 
              onClick={onSwitchToRegister} 
              style={{ border: 'none', background: 'none', color: '#18181b', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Register here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
