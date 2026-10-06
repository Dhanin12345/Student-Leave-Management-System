import React, { useState, useEffect } from 'react';
import { Download, ClipboardList } from 'lucide-react';
import DocumentModal from '../components/DocumentModal';

export default function AllLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');

  // Document Modal state
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error(err));

    fetch('/api/leaves')
      .then(res => res.json())
      .then(data => setLeaves(data))
      .catch(err => console.error(err));
  }, []);

  const handleExportCSV = () => {
    if (filteredLeaves.length === 0) return;
    const headers = ['ID', 'Student Name', 'Register No', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
    const rows = filteredLeaves.map(l => [
      l.id,
      `"${l.student.name}"`,
      `"${l.student.register_no}"`,
      `"${l.student.department_name}"`,
      `"${l.leave_type.name}"`,
      l.start_date,
      l.end_date,
      l.total_days,
      l.status,
      `"${l.reason.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `all_leave_applications_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeaves = leaves.filter(l => {
    if (statusFilter !== 'All Status' && l.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (departmentFilter !== 'All Departments' && l.student.department_name !== departmentFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.student.name.toLowerCase().includes(q);
      const matchReg = l.student.register_no.toLowerCase().includes(q);
      const matchReason = l.reason.toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchReason) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>All Leave Applications</h1>
          <p>View and filter every leave request across the college.</p>
        </div>
        <button className="btn-outline" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select 
          className="form-control" 
          style={{ width: 'auto', minWidth: '160px', backgroundColor: '#ffffff' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select 
          className="form-control" 
          style={{ width: 'auto', minWidth: '180px', backgroundColor: '#ffffff' }}
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
        >
          <option value="All Departments">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <input 
          type="text" 
          className="form-control" 
          style={{ flex: 1, minWidth: '240px', backgroundColor: '#ffffff' }}
          placeholder="Search student or roll no..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="empty-state" style={{ padding: '5rem 2rem' }}>
          <ClipboardList className="empty-icon" size={44} />
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#71717a' }}>
            No leave requests match your filters.
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Start - End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Document</th>
                <th>Status</th>
                <th>Reviewed By</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img src={r.student.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.student.register_no}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{r.student.department_code}</span></td>
                  <td>{r.leave_type.name}</td>
                  <td>
                    <div>{r.start_date} to {r.end_date}</div>
                  </td>
                  <td><strong>{r.total_days}</strong></td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>
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
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {r.reviewed_by_faculty || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
