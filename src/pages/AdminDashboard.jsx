import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { 
  GraduationCap, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 4,
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin dashboard stats:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Admin Dashboard</h1>
          <p>Overview of leave activity and records.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={GraduationCap} 
          colorTheme="blue" 
        />
        <StatCard 
          title="Total Faculty" 
          value={stats.totalFaculty} 
          icon={Users} 
        />
        <StatCard 
          title="Departments" 
          value={stats.totalDepartments} 
          icon={Building2} 
        />
        <StatCard 
          title="Total Leaves" 
          value={stats.totalLeaves} 
          icon={Clock} 
        />
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard 
          title="Pending Leaves" 
          value={stats.pendingLeaves} 
          icon={Clock} 
          colorTheme="yellow" 
        />
        <StatCard 
          title="Approved Leaves" 
          value={stats.approvedLeaves} 
          icon={CheckCircle2} 
          colorTheme="green" 
        />
        <StatCard 
          title="Rejected Leaves" 
          value={stats.rejectedLeaves} 
          icon={XCircle} 
          colorTheme="red" 
        />
      </div>

      <div className="actions-grid">
        <div 
          className="card card-hover" 
          onClick={() => onNavigate('students')} 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={22} color="#18181b" />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>Manage Students</h3>
            <p style={{ fontSize: '0.85rem', color: '#71717a' }}>Add, edit, and view student records.</p>
          </div>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>
            <span>Go to Students</span>
            <ArrowRight size={16} />
          </div>
        </div>

        <div 
          className="card card-hover" 
          onClick={() => onNavigate('faculty')} 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="#18181b" />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>Manage Faculty</h3>
            <p style={{ fontSize: '0.85rem', color: '#71717a' }}>Add and manage faculty members.</p>
          </div>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>
            <span>Go to Faculty</span>
            <ArrowRight size={16} />
          </div>
        </div>

        <div 
          className="card card-hover" 
          onClick={() => onNavigate('reports')} 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={22} color="#18181b" />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>Leave Reports</h3>
            <p style={{ fontSize: '0.85rem', color: '#71717a' }}>Generate and view leave statistics.</p>
          </div>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#18181b' }}>
            <span>View Reports</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
