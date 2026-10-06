import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);

  const [name, setName] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [classId, setClassId] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        if (data.length > 0) setDepartmentId(data[0].id);
      })
      .catch(err => console.error('Error fetching departments:', err));

    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].id);
      })
      .catch(err => console.error('Error fetching classes:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        register_no: registerNo,
        email,
        password,
        department_id: Number(departmentId),
        class_id: Number(classId),
        phone
      })
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        setLoading(false);
        if (status === 201) {
          setSuccess('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            onSwitchToLogin();
          }, 1500);
        } else {
          setError(body.error || 'Registration failed');
        }
      })
      .catch(err => {
        setLoading(false);
        setError('Server network error. Please try again.');
      });
  };

  const filteredClasses = classes.filter(c => c.department_id === Number(departmentId));

  return (
    <div className="auth-wrapper">
      <div className="bg-glow-orb" />
      <div className="bg-glow-orb-2" />

      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-brand">SL</div>
          <h2>Student Registration</h2>
          <p style={{ fontSize: '0.85rem', color: '#71717a', marginTop: '0.3rem' }}>
            Create your student portal account to request leaves
          </p>
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

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Morgan"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Register Number *</label>
              <input 
                type="text" 
                className="form-control" 
                value={registerNo}
                onChange={e => setRegisterNo(e.target.value)}
                placeholder="CS2023005"
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">College Email *</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@college.edu"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555-0199"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select 
                className="form-control" 
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                required
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Class / Section *</label>
              <select 
                className="form-control" 
                value={classId}
                onChange={e => setClassId(e.target.value)}
                required
              >
                {filteredClasses.length > 0 ? (
                  filteredClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - Sec {c.section}</option>
                  ))
                ) : (
                  classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - Sec {c.section}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create strong password"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Student Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          Already registered?{' '}
          <button 
            onClick={onSwitchToLogin} 
            style={{ border: 'none', background: 'none', color: '#18181b', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
