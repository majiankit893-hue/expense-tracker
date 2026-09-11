import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Receipt, 
  PieChart, 
  Sparkles, 
  Settings,
  GraduationCap,
  X
} from 'lucide-react';
import { USER_PROFILE } from '../mockData';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, totalExpense }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-expense', label: 'Add Expense', icon: PlusCircle },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const budgetUsed = Math.min(Math.round((totalExpense / USER_PROFILE.monthlyBudget) * 100), 100);

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="brand-logo" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="brand-icon">
                <GraduationCap size={24} />
              </div>
              <div className="brand-text">
                <h2>CampusSpend</h2>
                <span>AI Tracker</span>
              </div>
            </div>

            {/* Mobile close X button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="mobile-toggle"
              style={{ display: isOpen ? 'block' : 'none', padding: '0.35rem' }}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <button onClick={() => handleNavClick(item.id)}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="budget-widget">
            <div className="budget-header">
              <span>Monthly Budget</span>
              <span style={{ color: budgetUsed > 85 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{budgetUsed}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${budgetUsed}%`,
                  background: budgetUsed > 85 ? 'var(--danger)' : 'linear-gradient(90deg, #10b981, #6366f1)'
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
              ₹{totalExpense.toLocaleString('en-IN')} / ₹{USER_PROFILE.monthlyBudget.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
