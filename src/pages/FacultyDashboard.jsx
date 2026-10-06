import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DocumentModal from '../components/DocumentModal';
import { Clock, CheckCircle2, XCircle, Search, FileText, Check, X, Filter } from 'lucide-react';

export default function FacultyDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('Approved'); // Approved or Rejected
  const [remarks, setRemarks] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Document modal state
  const [viewingDoc, setViewingDoc] = useState(null);

  const loadRequests = () => {
    let url = `/api/leaves?faculty_id=${user.id}`;
    if (statusFilter !== 'All') url += `&status=${statusFilter}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setRequests(data));
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, searchQuery, user]);

  const openReviewModal = (reqItem, type) => {
    setSelectedRequest(reqItem);
    setActionType(type);
    setRemarks(type === 'Approved' ? 'Approved based on submitted request details.' : 'Rejected due to invalid dates/reasons.');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    fetch(`/api/leaves/${selectedRequest.id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: actionType,
        remarks,
        reviewer_id: user.id
      })
    })
      .then(res => res.json())
      .then(() => {
        setShowReviewModal(false);
        setSelectedRequest(null);
        loadRequests();
      });
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Faculty Portal</h1>
          <p>Review and manage student leave applications for your department.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Pending Review" value={pendingCount} icon={Clock} colorTheme="yellow" />
        <StatCard title="Approved Leaves" value={approvedCount} icon={CheckCircle2} colorTheme="green" />
        <StatCard title="Rejected Leaves" value={rejectedCount} icon={XCircle} colorTheme="red" />
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by student name, reg no, or reason..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
            {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
              <button 
                key={s}
                className={`btn-outline ${statusFilter === s ? 'btn-primary' : ''}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#71717a' }}>No leave applications match your filters.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Leave Type</th>
                <th>Dates & Duration</th>
                <th>Reason</th>
                <th>Document</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img src={r.student.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.student.register_no} ({r.student.class_name})</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{r.leave_type.name}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.start_date} to {r.end_date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.total_days} Day(s)</div>
                  </td>
                  <td style={{ maxWidth: '220px' }}>
                    <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>
                      {r.reason}
                    </div>
                  </td>
                  <td>
                    {r.document_url ? (
                      <button 
                        className="badge badge-blue" 
                        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} 
                        onClick={() => setViewingDoc({ url: r.document_url, student: r.student.name, leave: r })}
                      >
                        📎 View Document
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td>
                    {r.status === 'Pending' && <span className="badge badge-yellow">Pending</span>}
                    {r.status === 'Approved' && <span className="badge badge-green">Approved</span>}
                    {r.status === 'Rejected' && <span className="badge badge-red">Rejected</span>}
                    {r.status === 'Cancelled' && <span className="badge badge-gray">Cancelled</span>}
                  </td>
                  <td>
                    {r.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-success" onClick={() => openReviewModal(r, 'Approved')}>
                          <Check size={14} /> Approve
                        </button>
                        <button className="btn-danger" onClick={() => openReviewModal(r, 'Rejected')}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {r.remarks || 'Reviewed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showReviewModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div><strong>Student:</strong> {selectedRequest.student.name} ({selectedRequest.student.register_no})</div>
                  <div><strong>Leave Type:</strong> {selectedRequest.leave_type.name}</div>
                  <div><strong>Dates:</strong> {selectedRequest.start_date} to {selectedRequest.end_date} ({selectedRequest.total_days} days)</div>
                  <div style={{ marginTop: '0.3rem' }}><strong>Reason:</strong> {selectedRequest.reason}</div>
                  {selectedRequest.document_url && (
                    <div style={{ marginTop: '0.3rem' }}>
                      <strong>Document:</strong>{' '}
                      <button 
                        type="button" 
                        style={{ border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setViewingDoc({ url: selectedRequest.document_url, student: selectedRequest.student.name, leave: selectedRequest })}
                      >
                        {selectedRequest.document_url}
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Faculty Remarks / Comments</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Enter remarks for the student..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button 
                  type="submit" 
                  className={actionType === 'Approved' ? 'btn-success' : 'btn-danger'}
                >
                  Confirm {actionType}
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
