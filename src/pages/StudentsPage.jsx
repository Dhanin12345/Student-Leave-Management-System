import React, { useState, useEffect } from 'react';
import { Plus, Mail, GraduationCap, Trash2, Edit } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // SMTP Settings State
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpStatus, setSmtpStatus] = useState('');
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [classId, setClassId] = useState('');
  const [advisorId, setAdvisorId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const loadData = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(data));

    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        if (data.length > 0) setDepartmentId(data[0].id);
      });

    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].id);
      });

    fetch('/api/faculty')
      .then(res => res.json())
      .then(data => {
        setFaculty(data);
        if (data.length > 0) setAdvisorId(data[0].id);
      });

    fetch('/api/config/smtp')
      .then(res => res.json())
      .then(data => {
        setSmtpEmail(data.email || '');
        setIsSmtpConfigured(Boolean(data.isConfigured));
      })
      .catch(err => console.error('SMTP config fetch error:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSmtp = (e) => {
    e.preventDefault();
    setSmtpStatus('Saving Gmail SMTP settings...');
    fetch('/api/config/smtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: smtpEmail, password: smtpPassword, service: 'gmail' })
    })
      .then(res => res.json())
      .then(data => {
        setSmtpStatus('✓ Gmail SMTP credentials saved successfully!');
        setIsSmtpConfigured(true);
        setTimeout(() => {
          setShowSmtpModal(false);
          setSmtpStatus('');
        }, 1500);
      })
      .catch(err => setSmtpStatus('Failed to save SMTP settings.'));
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteMessage('');
    setInviteResult(null);

    const targetEmail = inviteEmail;

    fetch('/api/students/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail })
    })
      .then(res => res.json())
      .then(data => {
        setInviteLoading(false);
        setInviteResult(data);

        // Automatically open Gmail Compose window in a new tab if available
        if (data.gmailUrl && !data.isCustomSmtp) {
          window.open(data.gmailUrl, '_blank');
          setInviteMessage(`Gmail compose window launched for ${targetEmail}! Click Send in Gmail to deliver.`);
        } else if (data.isCustomSmtp && data.emailSent) {
          setInviteMessage(`✓ Real email invitation sent directly to ${targetEmail}!`);
        } else {
          setInviteMessage(`Invitation processed for ${targetEmail}`);
        }
      })
      .catch(err => {
        setInviteLoading(false);
        const subject = encodeURIComponent('Invitation to join College Leave Portal');
        const body = encodeURIComponent(`Hello,\n\nYou have been invited to register your student account on College Leave Portal:\nhttp://localhost:5000`);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${subject}&body=${body}`;
        const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${subject}&body=${body}`;
        
        window.open(gmailUrl, '_blank');
        setInviteResult({ gmailUrl, mailtoUrl });
        setInviteMessage(`Gmail Compose launched for ${targetEmail}`);
      });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    setError('');

    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        register_no: registerNo,
        email,
        department_id: Number(departmentId),
        class_id: Number(classId),
        advisor_id: Number(advisorId),
        phone
      })
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 201) {
          setShowAddModal(false);
          setName('');
          setRegisterNo('');
          setEmail('');
          setPhone('');
          loadData();
        } else {
          setError(body.error || 'Failed to add student');
        }
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      fetch(`/api/students/${id}`, { method: 'DELETE' })
        .then(() => loadData());
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Students</h1>
          <p>Add, edit and remove student records.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="invite-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div className="invite-title" style={{ marginBottom: 0 }}>Invite a student by email</div>
          <button 
            type="button" 
            onClick={() => setShowSmtpModal(true)} 
            className="btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            ⚙️ {isSmtpConfigured ? 'Gmail Direct Sending Configured ✓' : 'Setup Real Direct Email (Gmail App Password)'}
          </button>
        </div>

        <form onSubmit={handleSendInvite} className="invite-form">
          <input 
            type="email" 
            className="invite-input" 
            placeholder="student@college.edu or student@gmail.com" 
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={inviteLoading}>
            <Mail size={16} />
            <span>{inviteLoading ? 'Launching Gmail...' : 'Send Invite'}</span>
          </button>
        </form>

        {inviteMessage && (
          <div style={{ marginTop: '0.85rem', padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>✓</span> {inviteMessage}
            </div>

            {inviteResult && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
                {inviteResult.gmailUrl && (
                  <a 
                    href={inviteResult.gmailUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-outline"
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.45rem 0.85rem', 
                      textDecoration: 'none', 
                      backgroundColor: '#ffffff', 
                      borderColor: '#ea4335',
                      color: '#ea4335',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    ✉️ Launch Gmail Compose Window
                  </a>
                )}

                {inviteResult.mailtoUrl && (
                  <a 
                    href={inviteResult.mailtoUrl} 
                    className="btn-outline"
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.45rem 0.85rem', 
                      textDecoration: 'none', 
                      backgroundColor: '#ffffff',
                      color: '#1e293b'
                    }}
                  >
                    📬 Open Mail App
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <GraduationCap className="empty-icon" />
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#71717a' }}>No student records yet.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Register No</th>
                <th>Email</th>
                <th>Department</th>
                <th>Class</th>
                <th>Advisor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={s.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td><code>{s.register_no}</code></td>
                  <td>{s.email}</td>
                  <td><span className="badge badge-gray">{s.department_name}</span></td>
                  <td>{s.class_name}</td>
                  <td>{s.advisor_name}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                      title="Delete Student"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Student</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="modal-body">
                {error && <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

                <div className="form-group">
                  <label className="form-label">Student Name *</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Register Number *</label>
                  <input type="text" className="form-control" value={registerNo} onChange={e => setRegisterNo(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-control" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <select className="form-control" value={classId} onChange={e => setClassId(e.target.value)}>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Faculty Advisor</label>
                  <select className="form-control" value={advisorId} onChange={e => setAdvisorId(e.target.value)}>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gmail Direct Sending SMTP Setup Modal */}
      {showSmtpModal && (
        <div className="modal-overlay" onClick={() => setShowSmtpModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">⚙️ Configure Real Gmail Direct Email Sending</h3>
              <button 
                className="icon-btn" 
                onClick={() => setShowSmtpModal(false)}
                style={{ fontSize: '1.2rem', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSmtp}>
              <div className="modal-body">
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', lineHeight: '1.5', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <strong>💡 How to enable 1-click automatic email sending to Gmail:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    <li>Enter your admin Gmail address below.</li>
                    <li>Generate a 16-character <strong>Gmail App Password</strong> from Google:
                      <br /><a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>myaccount.google.com/apppasswords</a>
                    </li>
                    <li>Paste the 16-character password below and click Save.</li>
                  </ol>
                </div>

                {smtpStatus && (
                  <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {smtpStatus}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Your Admin Gmail Address *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={smtpEmail} 
                    onChange={e => setSmtpEmail(e.target.value)} 
                    placeholder="college.admin@gmail.com" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gmail App Password (16 characters) *</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={smtpPassword} 
                    onChange={e => setSmtpPassword(e.target.value)} 
                    placeholder="abcd efgh ijkl mnop" 
                    required 
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Note: Your standard Gmail account password will not work; Google requires a 16-digit App Password for automated sending.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowSmtpModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Gmail Config</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
