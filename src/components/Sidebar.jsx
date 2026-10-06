import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Building2, 
  Sliders, 
  FileText, 
  BarChart3, 
  LogOut,
  Send,
  History,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const role = user?.role || 'admin';

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'leave-types', label: 'Leave Types', icon: Sliders },
    { id: 'all-leaves', label: 'All Leaves', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const facultyNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review-requests', label: 'Leave Requests', icon: FileText },
    { id: 'student-history', label: 'Student History', icon: History },
  ];

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'apply-leave', label: 'Apply for Leave', icon: Send },
    { id: 'my-leaves', label: 'My Leave History', icon: History },
  ];

  let items = adminNav;
  if (role === 'faculty') items = facultyNav;
  if (role === 'student') items = studentNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">SL</div>
        <div>
          <div className="sidebar-title">Leave Portal</div>
          <div className="sidebar-role">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
