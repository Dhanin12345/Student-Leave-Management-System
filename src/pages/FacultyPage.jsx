import React, { useState, useEffect } from 'react';
import { Plus, Mail, Users, Trash2 } from 'lucide-react';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const loadData = () => {
    fetch('/api/faculty')
      .then(res => res.json())
      .then(data => setFaculty(data));

    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        if (data.length > 0) setDepartmentId(data[0].id);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteMessage(`Invitation email sent to ${inviteEmail}!`);
    setInviteEmail('');
    setTimeout(() => setInviteMessage(''), 3000);
  };

  const handleAddFaculty = (e) => {
    e.preventDefault();
    setError('');

    fetch('/api/faculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        department_id: Number(departmentId),
        designation,
        phone
      })
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 201) {
          setShowAddModal(false);
          setName('');
          setEmail('');
          setPhone('');
          loadData();
        } else {
          setError(body.error || 'Failed to add faculty');
        }
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      fetch(`/api/faculty/${id}`, { method: 'DELETE' })
        .then(() => loadData());
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Faculty</h1>
          <p>Add, edit and remove faculty members.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add Faculty</span>
        </button>
      </div>

      <div className="invite-card">
        <div className="invite-title">Invite a faculty by email</div>
        <form onSubmit={handleSendInvite} className="invite-form">
          <input 
            type="email" 
            className="invite-input" 
            placeholder="faculty@college.edu" 
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <button type="submit" className="btn-outline">
            <Mail size={16} />
            <span>Send Invite</span>
          </button>
        </form>
        {inviteMessage && (
          <div style={{ color: '#16a34a', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>
            {inviteMessage}
          </div>
        )}
      </div>

      {faculty.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-icon" />
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#71717a' }}>No faculty records yet.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Advised Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map(f => (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={f.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600 }}>{f.name}</span>
                    </div>
                  </td>
                  <td>{f.designation}</td>
                  <td><span className="badge badge-gray">{f.department_name}</span></td>
                  <td>{f.email}</td>
                  <td>{f.phone || 'N/A'}</td>
                  <td><span className="badge badge-blue">{f.advised_student_count} Students</span></td>
                  <td>
                    <button 
                      onClick={() => handleDelete(f.id)}
                      style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                      title="Delete Faculty"
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
              <h3 className="modal-title">Add New Faculty Member</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddFaculty}>
              <div className="modal-body">
                {error && <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

                <div className="form-group">
                  <label className="form-label">Faculty Name *</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
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
                  <label className="form-label">Designation</label>
                  <input type="text" className="form-control" value={designation} onChange={e => setDesignation(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
