import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/AdminDashboard';
import StudentsPage from './pages/StudentsPage';
import FacultyPage from './pages/FacultyPage';
import DepartmentsPage from './pages/DepartmentsPage';
import LeaveTypesPage from './pages/LeaveTypesPage';
import AllLeavesPage from './pages/AllLeavesPage';

import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LeaveHistoryPage from './pages/LeaveHistoryPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('leave_portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authView, setAuthView] = useState('login'); // login or register
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user) {
      localStorage.setItem('leave_portal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('leave_portal_user');
    }
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthView('login');
  };

  if (!user) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Get active tab display title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'students': return 'Students';
      case 'faculty': return 'Faculty';
      case 'departments': return 'Departments';
      case 'leave-types': return 'Leave Types';
      case 'all-leaves': return 'All Leaves';
      case 'review-requests': return 'Leave Requests';
      case 'student-history': return 'Student History';
      case 'apply-leave': return 'Apply for Leave';
      case 'my-leaves': return 'My Leave History';
      case 'reports': return 'Reports';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    const role = user.role;

    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        case 'students': return <StudentsPage />;
        case 'faculty': return <FacultyPage />;
        case 'departments': return <DepartmentsPage />;
        case 'leave-types': return <LeaveTypesPage />;
        case 'all-leaves': return <AllLeavesPage />;
        case 'reports': return <ReportsPage />;
        default: return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      }
    } else if (role === 'faculty') {
      switch (activeTab) {
        case 'dashboard': return <FacultyDashboard user={user} />;
        case 'review-requests': return <FacultyDashboard user={user} />;
        case 'student-history': return <LeaveHistoryPage user={user} />;
        default: return <FacultyDashboard user={user} />;
      }
    } else if (role === 'student') {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard user={user} />;
        case 'apply-leave': return <StudentDashboard user={user} initialOpenApplyModal={true} />;
        case 'my-leaves': return <LeaveHistoryPage user={user} />;
        default: return <StudentDashboard user={user} />;
      }
    }

    return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      <div className="main-wrapper">
        <Topbar 
          activeTabTitle={getTabTitle()} 
          user={user} 
        />
        <main className="page-container">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
