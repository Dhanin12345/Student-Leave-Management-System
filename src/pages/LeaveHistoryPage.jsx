import React, { useState, useEffect } from 'react';
import { Search, Filter, History } from 'lucide-react';

export default function LeaveHistoryPage({ user }) {
  const [history, setHistory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = () => {
    let url = '/api/leaves?';
    if (user.role === 'student') url += `student_id=${user.id}&`;
    if (user.role === 'faculty') url += `faculty_id=${user.id}&`;
    if (statusFilter !== 'All') url += `status=${statusFilter}&`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setHistory(data));
  };

  useEffect(() => {
    loadHistory();
  }, [statusFilter, searchQuery, user]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Leave History & Records</h1>
          <p>Complete historical log of leave applications, review decisions, and remarks.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search history by name, reason or register no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Status:</span>
            {['All', 'Approved', 'Rejected', 'Pending', 'Cancelled'].map(s => (
              <button 
                key={s}
                className={`btn-outline ${statusFilter === s ? 'btn-primary' : ''}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <History className="empty-icon" />
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#71717a' }}>No leave history logs found.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Student</th>
                <th>Leave Category</th>
                <th>Dates & Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewed By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id}>
                  <td><code>#{item.id}</code></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.student.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.student.register_no} ({item.student.department_code})</div>
                  </td>
                  <td><span className="badge badge-gray">{item.leave_type.name}</span></td>
                  <td>
                    <div>{item.start_date} to {item.end_date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.total_days} day(s)</div>
                  </td>
                  <td style={{ maxWidth: '200px' }}>{item.reason}</td>
                  <td>
                    {item.status === 'Pending' && <span className="badge badge-yellow">Pending</span>}
                    {item.status === 'Approved' && <span className="badge badge-green">Approved</span>}
                    {item.status === 'Rejected' && <span className="badge badge-red">Rejected</span>}
                    {item.status === 'Cancelled' && <span className="badge badge-gray">Cancelled</span>}
                  </td>
                  <td>{item.reviewed_by_faculty || '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>{item.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
