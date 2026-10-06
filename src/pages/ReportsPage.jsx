import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { Clock, CheckCircle2, XCircle, FileText, PieChart, BarChart2 } from 'lucide-react';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalLeaves: 0
  });
  const [leaves, setLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch('/api/leaves')
      .then(res => res.json())
      .then(data => setLeaves(data))
      .catch(err => console.error(err));

    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Leave Reports</h1>
          <p>College-wide leave statistics and trends.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <StatCard 
          title="Pending" 
          value={stats.pendingLeaves} 
          icon={Clock} 
          colorTheme="yellow" 
        />
        <StatCard 
          title="Approved" 
          value={stats.approvedLeaves} 
          icon={CheckCircle2} 
          colorTheme="green" 
        />
        <StatCard 
          title="Rejected" 
          value={stats.rejectedLeaves} 
          icon={XCircle} 
          colorTheme="red" 
        />
        <StatCard 
          title="Total" 
          value={stats.totalLeaves} 
          icon={FileText} 
          colorTheme="blue" 
        />
      </div>

      {stats.totalLeaves === 0 ? (
        <div className="empty-state" style={{ padding: '5rem 2rem' }}>
          <FileText className="empty-icon" size={48} />
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#71717a' }}>
            No leave data available yet.
          </div>
        </div>
      ) : (
        <div>
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={18} /> Departmental Distribution
              </h3>
              {departments.map(d => {
                const deptLeaves = leaves.filter(l => l.student.department_name === d.name);
                const pct = stats.totalLeaves > 0 ? Math.round((deptLeaves.length / stats.totalLeaves) * 100) : 0;
                return (
                  <div key={d.id} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                      <span>{d.name} ({d.code})</span>
                      <span>{deptLeaves.length} Applications ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, backgroundColor: '#18181b', height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={18} /> Leave Category Distribution
              </h3>
              {['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Academic Leave'].map(cat => {
                const catLeaves = leaves.filter(l => l.leave_type.name === cat);
                const pct = stats.totalLeaves > 0 ? Math.round((catLeaves.length / stats.totalLeaves) * 100) : 0;
                return (
                  <div key={cat} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                      <span>{cat}</span>
                      <span>{catLeaves.length} Requests ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, backgroundColor: '#2563eb', height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>All Leave Applications Report</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Register No</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Start - End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td>#{l.id}</td>
                    <td style={{ fontWeight: 600 }}>{l.student.name}</td>
                    <td><code>{l.student.register_no}</code></td>
                    <td>{l.student.department_code}</td>
                    <td>{l.leave_type.name}</td>
                    <td>{l.start_date} to {l.end_date}</td>
                    <td>{l.total_days}</td>
                    <td>
                      {l.status === 'Pending' && <span className="badge badge-yellow">Pending</span>}
                      {l.status === 'Approved' && <span className="badge badge-green">Approved</span>}
                      {l.status === 'Rejected' && <span className="badge badge-red">Rejected</span>}
                      {l.status === 'Cancelled' && <span className="badge badge-gray">Cancelled</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
