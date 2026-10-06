import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, Building2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const loadDepartments = () => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code, description })
    })
      .then(res => res.json())
      .then(() => {
        setShowAddModal(false);
        setName('');
        setCode('');
        setDescription('');
        loadDepartments();
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this department and all associated classes?')) {
      fetch(`/api/departments/${id}`, { method: 'DELETE' })
        .then(() => loadDepartments());
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Departments & Classes</h1>
          <p>Manage academic departments and their classes.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {departments.map(dept => (
          <div key={dept.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{dept.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{dept.code}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => alert(`Edit ${dept.name}`)}
                  style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(dept.id)}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {dept.description || `Department of ${dept.name}`}
            </p>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#09090b' }}>
                View classes ({dept.class_count || 4})
              </span>
              <span className="badge badge-gray">{dept.student_count || 0} Students</span>
            </div>

            {selectedDept?.id === dept.id && (
              <div style={{ marginTop: '1rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.4rem' }}>Classes in {dept.name}:</div>
                {dept.classes && dept.classes.map(c => (
                  <div key={c.id} style={{ fontSize: '0.8rem', color: '#475569', padding: '0.2rem 0' }}>
                    • {c.name} (Section {c.section}) - Batch {c.batch_year}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Academic Department</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddDepartment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input type="text" className="form-control" placeholder="Computer Science" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Code *</label>
                  <input type="text" className="form-control" placeholder="CSE" value={code} onChange={e => setCode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Department description..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
