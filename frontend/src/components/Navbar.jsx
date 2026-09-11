import React from 'react';
import { Menu, Sparkles, Calendar } from 'lucide-react';
import { USER_PROFILE } from '../mockData';

export default function Navbar({ activeTab, toggleSidebar }) {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Student Financial Dashboard';
      case 'add-expense': return 'Record Transaction';
      case 'transactions': return 'Transaction History';
      case 'analytics': return 'Spending & Budget Analytics';
      case 'ai-insights': return 'AI Financial Coach & Assistant';
      case 'settings': return 'Profile & Settings';
      default: return 'Dashboard';
    }
  };

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="page-title">{getTitle()}</h1>
          <p className="page-subtitle">Welcome back, {USER_PROFILE.name} • {USER_PROFILE.role}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span style={{ display: 'none', minWidth: '100px' }} className="desktop-date">{todayDate}</span>
        </div>

        <div className="student-badge">
          <Sparkles size={14} />
          <span>CSE '29</span>
        </div>

        <div className="user-profile-summary">
          <div className="avatar" title={`${USER_PROFILE.name} (${USER_PROFILE.college})`}>
            {USER_PROFILE.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  );
}
