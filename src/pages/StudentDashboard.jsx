import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DocumentModal from '../components/DocumentModal';
import { Send, Clock, CheckCircle2, XCircle, FileText, Ban, Paperclip } from 'lucide-react';

export default function StudentDashboard({ user, initialOpenApplyModal = false }) {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(initialOpenApplyModal);
  const [viewingDoc, setViewingDoc] = useState(null);

  // Apply Form state
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStudentData = () => {
    fetch(`/api/leaves?student_id=${user.id}`)
      .then(res => res.json())
      .then(data => setLeaves(data));

    fetch('/api/leave-types')
      .then(res => res.json())
      .then(data => {
        setLeaveTypes(data);
        if (data.length > 0) setLeaveTypeId(data[0].id);
      });
  };

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const computeTotalDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setError('');
    const days = computeTotalDays();

    if (days <= 0) {
      setError('End date cannot be before start date.');
      return;
    }

    const selectedType = leaveTypes.find(lt => lt.id === Number(leaveTypeId));
    if (selectedType && selectedType.requires_document && !documentName) {
      setError(`Supporting document is required for ${selectedType.name}`);
      return;
    }

    setSubmitting(true);

    fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: user.id,
        leave_type_id: Number(leaveTypeId),
        start_date: startDate,
        end_date: endDate,
        total_days: days,
        reason,
        document_url: documentName || null
      })
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        setSubmitting(false);
        if (status === 201) {
          setShowApplyModal(false);
          setStartDate('');
          setEndDate('');
          setReason('');
          setDocumentName('');
          loadStudentData();
        } else {
          setError(body.error || 'Failed to submit leave request');
        }
      })
      .catch(() => {
        setSubmitting(false);
        setError('Failed to connect to server.');
      });
  };

  const handleCancelLeave = (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this pending leave request?')) {
      fetch(`/api/leaves/${leaveId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id })
      })
        .then(res => res.json())
        .then(() => loadStudentData());
    }
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;
  const selectedTypeObj = leaveTypes.find(lt => lt.id === Number(leaveTypeId));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Student Leave Portal</h1>
          <p>Welcome back, {user.name}. Apply for leave and track your application status.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowApplyModal(true)}>
          <Send size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#ffffff', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <img src={user.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user.name}</h2>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.3rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
            <span><strong>Reg No:</strong> <code>{user.register_no}</code></span>
            <span><strong>Department:</strong> {user.department_name}</span>
            <span><strong>Class:</strong> {user.class_name}</span>
            <span><strong>Faculty Advisor:</strong> {user.advisor_name}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Pending Applications" value={pendingCount} icon={Clock} colorTheme="yellow" />
        <StatCard title="Approved Leaves" value={approvedCount} icon={CheckCircle2} colorTheme="green" />
        <StatCard title="Rejected Leaves" value={rejectedCount} icon={XCircle} colorTheme="red" />
      </div>

      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem' }}>My Submitted Leave Requests</h3>

      {leaves.length === 0 ? (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#71717a' }}>No leave applications submitted yet.</div>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowApplyModal(true)}>
            Apply for your first leave
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates & Duration</th>
                <th>Reason</th>
                <th>Document</th>
                <th>Status</th>
                <th>Faculty Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  <td>
                    <span className="badge badge-gray">{l.leave_type.name}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.start_date} to {l.end_date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.total_days} Day(s)</div>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ fontSize: '0.85rem' }}>{l.reason}</div>
                  </td>
                  <td>
                    {l.document_url ? (
                      <button 
                        className="badge badge-blue" 
                        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => setViewingDoc({ url: l.document_url, student: user.name, leave: l })}
                      >
                        📎 View Document
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td>
                    {l.status === 'Pending' && <span className="badge badge-yellow">Pending</span>}
                    {l.status === 'Approved' && <span className="badge badge-green">Approved</span>}
                    {l.status === 'Rejected' && <span className="badge badge-red">Rejected</span>}
                    {l.status === 'Cancelled' && <span className="badge badge-gray">Cancelled</span>}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {l.remarks || (l.status === 'Pending' ? 'Awaiting faculty review' : 'No remarks')}
                    </span>
                  </td>
                  <td>
                    {l.status === 'Pending' && (
                      <button 
                        onClick={() => handleCancelLeave(l.id)} 
                        className="btn-outline" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}
                      >
                        <Ban size={12} /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Submit Leave Application</h3>
              <button 
                onClick={() => setShowApplyModal(false)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Leave Type *</label>
                  <select 
                    className="form-control" 
                    value={leaveTypeId} 
                    onChange={e => setLeaveTypeId(e.target.value)} 
                    required
                  >
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>
                        {lt.name} (Max {lt.max_days_per_year} days) {lt.requires_document ? '- Doc Required' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#166534', marginBottom: '1rem', fontWeight: 600 }}>
                    📅 Calculated Total Days: {computeTotalDays()} Day(s)
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Reason for Leave *</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="Provide a clear explanation..." 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Supporting Document {selectedTypeObj?.requires_document && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      id="docFile" 
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setDocumentName(e.target.files[0].name);
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn-outline"
                      onClick={() => document.getElementById('docFile').click()}
                    >
                      <Paperclip size={16} />
                      <span>{documentName ? 'Change File' : 'Upload Document'}</span>
                    </button>
                    {documentName && (
                      <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 500 }}>
                        {documentName}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                    Accepted formats: PDF, JPG, PNG (Max 5MB)
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDoc && (
        <DocumentModal 
          documentUrl={viewingDoc.url} 
          studentName={viewingDoc.student} 
          leaveInfo={viewingDoc.leave} 
          onClose={() => setViewingDoc(null)} 
        />
      )}
    </div>
  );
}
