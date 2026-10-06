import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [maxDays, setMaxDays] = useState(10);
  const [requiresDoc, setRequiresDoc] = useState(false);
  const [description, setDescription] = useState('');

  const loadLeaveTypes = () => {
    fetch('/api/leave-types')
      .then(res => res.json())
      .then(data => setLeaveTypes(data));
  };

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const handleAddLeaveType = (e) => {
    e.preventDefault();
    fetch('/api/leave-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        code,
        max_days_per_year: Number(maxDays),
        requires_document: requiresDoc,
        description
      })
    })
      .then(res => res.json())
      .then(() => {
        setShowAddModal(false);
        setName('');
        setCode('');
        setMaxDays(10);
        setRequiresDoc(false);
        setDescription('');
        loadLeaveTypes();
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this leave category?')) {
      fetch(`/api/leave-types/${id}`, { method: 'DELETE' })
        .then(() => loadLeaveTypes());
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Leave Types</h1>
          <p>Define leave categories and their limits.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add Leave Type</span>
        </button>
      </div>

      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {leaveTypes.map(type => (
          <div key={type.id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{type.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{type.code}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => alert(`Edit ${type.name}`)}
                  style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(type.id)}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span className="badge badge-gray">Max {type.max_days_per_year} days</span>
              {type.requires_document ? (
                <span className="badge badge-yellow">Document required</span>
              ) : (
                <span className="badge badge-green">No document</span>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {type.description}
            </p>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Leave Category</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddLeaveType}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Leave Name *</label>
                  <input type="text" className="form-control" placeholder="Duty Leave" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category Code *</label>
                  <input type="text" className="form-control" placeholder="DUTY" value={code} onChange={e => setCode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Days Per Year</label>
                  <input type="number" className="form-control" value={maxDays} onChange={e => setMaxDays(e.target.value)} min={1} required />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="reqDoc" checked={requiresDoc} onChange={e => setRequiresDoc(e.target.checked)} />
                  <label htmlFor="reqDoc" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Require supporting document upload
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Description..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Leave Type</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
