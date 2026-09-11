import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardCard from './components/DashboardCard';
import ExpenseForm from './components/ExpenseForm';
import TransactionList from './components/TransactionList';
import CategoryChart from './components/CategoryChart';
import MonthlyChart from './components/MonthlyChart';
import AIInsightCard from './components/AIInsightCard';
import AnalyticsPage from './components/AnalyticsPage';
import AIInsightsPage from './components/AIInsightsPage';

import { apiService } from './services/api';
import { 
  INITIAL_AI_INSIGHTS, 
  USER_PROFILE,
  CATEGORIES 
} from './mockData';

import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  PieChart as PieChartIcon,
  Hash
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real backend data states
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    thisMonthExpense: 0,
    totalTransactions: 0,
    highestCategory: { category: 'None', amount: 0 }
  });
  const [analytics, setAnalytics] = useState({
    categoryBreakdown: [],
    monthlyTrends: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [aiInsights] = useState(INITIAL_AI_INSIGHTS);
  const [profile, setProfile] = useState(USER_PROFILE);

  // Fetch all API data from backend
  const loadAppData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesRes, summaryRes, analyticsRes] = await Promise.all([
        apiService.getExpenses(),
        apiService.getSummary(),
        apiService.getAnalytics(),
      ]);

      setTransactions(expensesRes.data || []);
      setSummary(summaryRes.data || {
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        thisMonthExpense: 0,
        totalTransactions: 0,
        highestCategory: { category: 'None', amount: 0 }
      });
      setAnalytics(analyticsRes.data || { categoryBreakdown: [], monthlyTrends: [] });
    } catch (err) {
      console.error('Failed to load application data from API:', err);
      setError(err.message || 'Failed to connect to Express backend API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Create expense handler
  const handleAddExpense = async (payload) => {
    await apiService.createExpense(payload);
    await loadAppData();
  };

  // Update expense handler
  const handleUpdateExpense = async (payload) => {
    if (!editingTransaction) return;
    await apiService.updateExpense(editingTransaction.id, payload);
    setEditingTransaction(null);
    await loadAppData();
  };

  // Delete expense handler
  const handleDeleteExpense = async (id) => {
    try {
      await apiService.deleteExpense(id);
      await loadAppData();
    } catch (err) {
      alert(`Failed to delete transaction: ${err.message}`);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        totalExpense={summary.totalExpense || 0}
      />

      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="page-container">
          {/* Connection Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle size={20} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Backend Connection Error</strong>
                  <span style={{ fontSize: '0.825rem', opacity: 0.9 }}>{error}</span>
                </div>
              </div>
              <button 
                onClick={loadAppData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.825rem'
                }}
              >
                <RefreshCw size={14} /> Retry Sync
              </button>
            </div>
          )}

          {/* Global Loading State */}
          {loading && transactions.length === 0 ? (
            <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <Loader2 size={38} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', color: 'var(--primary)' }} />
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Loading Campus Financial Data...</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Syncing with Express REST API & SQLite database engine</p>
            </div>
          ) : (
            <>
              {/* Edit Modal / Inline Overlay */}
              {editingTransaction && (
                <div className="panel-card" style={{ marginBottom: '1.75rem', border: '2px solid var(--primary)' }}>
                  <div className="panel-header">
                    <h3>Edit Expense Record #{editingTransaction.id}</h3>
                  </div>
                  <ExpenseForm
                    initialData={editingTransaction}
                    onSubmit={handleUpdateExpense}
                    onCancel={() => setEditingTransaction(null)}
                  />
                </div>
              )}

              {/* SECTION 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div>
                  {/* Summary Metric Cards */}
                  <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <DashboardCard
                      title="Current Balance"
                      value={`₹${(summary.totalBalance || 0).toLocaleString('en-IN')}`}
                      icon={Wallet}
                      color="#6366f1"
                      trend={(summary.totalBalance || 0) >= 0 ? 'up' : 'down'}
                      trendText="Net Available"
                    />
                    <DashboardCard
                      title="Total Income"
                      value={`₹${(summary.totalIncome || 0).toLocaleString('en-IN')}`}
                      icon={TrendingUp}
                      color="#10b981"
                      trend="up"
                      trendText="Allowance & Earnings"
                    />
                    <DashboardCard
                      title="Total Expenses"
                      value={`₹${(summary.totalExpense || 0).toLocaleString('en-IN')}`}
                      icon={TrendingDown}
                      color="#ef4444"
                      trend="down"
                      trendText="SQLite Database"
                    />
                    <DashboardCard
                      title="This Month's Expenses"
                      value={`₹${(summary.thisMonthExpense || 0).toLocaleString('en-IN')}`}
                      icon={Calendar}
                      color="#f59e0b"
                      trend="neutral"
                      trendText={`Target: ₹${profile.monthlyBudget.toLocaleString('en-IN')}`}
                    />
                    <DashboardCard
                      title="Top Category"
                      value={summary.highestCategory ? summary.highestCategory.category : 'None'}
                      icon={PieChartIcon}
                      color="#ec4899"
                      trend="neutral"
                      trendText={summary.highestCategory && summary.highestCategory.amount > 0 ? `₹${summary.highestCategory.amount.toLocaleString('en-IN')} spent` : 'No expenses yet'}
                    />
                    <DashboardCard
                      title="Total Transactions"
                      value={String(summary.totalTransactions || 0)}
                      icon={Hash}
                      color="#3b82f6"
                      trend="neutral"
                      trendText="Recorded entries"
                    />
                  </div>

                  {/* Real Recharts Charts */}
                  <div className="section-row">
                    <div className="panel-card">
                      <div className="panel-header">
                        <h3>Monthly Spending & Income Trend</h3>
                      </div>
                      <MonthlyChart monthlyTrends={analytics.monthlyTrends} />
                    </div>

                    <div className="panel-card">
                      <div className="panel-header">
                        <h3>Category-wise Spending</h3>
                      </div>
                      <CategoryChart categoryBreakdown={analytics.categoryBreakdown} transactions={transactions} />
                    </div>
                  </div>

                  {/* AI Smart Insight Highlight */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div className="panel-header">
                      <h3>
                        <Sparkles size={20} style={{ color: '#818cf8' }} />
                        <span>AI Financial Recommendation</span>
                      </h3>
                      <button className="view-all-btn" onClick={() => setActiveTab('ai-insights')}>
                        View All Insights <ArrowRight size={14} />
                      </button>
                    </div>
                    {aiInsights.length > 0 && <AIInsightCard insight={aiInsights[0]} />}
                  </div>

                  {/* Recent Transactions List */}
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3>Recent Database Transactions</h3>
                      <button className="view-all-btn" onClick={() => setActiveTab('transactions')}>
                        View All ({transactions.length}) <ArrowRight size={14} />
                      </button>
                    </div>
                    <TransactionList
                      transactions={transactions}
                      onEditTransaction={(tx) => setEditingTransaction(tx)}
                      onDeleteTransaction={handleDeleteExpense}
                      limit={5}
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: ADD EXPENSE */}
              {activeTab === 'add-expense' && (
                <div className="section-row-equal">
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3>Record Expense / Income to SQLite</h3>
                    </div>
                    <ExpenseForm onSubmit={handleAddExpense} />
                  </div>

                  <div className="panel-card">
                    <div className="panel-header">
                      <h3>Recent SQLite Database Entries</h3>
                    </div>
                    <TransactionList
                      transactions={transactions}
                      onEditTransaction={(tx) => setEditingTransaction(tx)}
                      onDeleteTransaction={handleDeleteExpense}
                      limit={4}
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="panel-card">
                  <div className="panel-header">
                    <h3>All Database Transactions</h3>
                    <span className="page-subtitle">{transactions.length} items found</span>
                  </div>
                  <TransactionList
                    transactions={transactions}
                    onEditTransaction={(tx) => setEditingTransaction(tx)}
                    onDeleteTransaction={handleDeleteExpense}
                  />
                </div>
              )}

              {/* SECTION 4: ANALYTICS */}
              {activeTab === 'analytics' && (
                <AnalyticsPage
                  transactions={transactions}
                  analyticsData={analytics}
                  monthlyBudget={profile.monthlyBudget}
                />
              )}

              {/* SECTION 5: AI INSIGHTS */}
              {activeTab === 'ai-insights' && (
                <AIInsightsPage />
              )}

              {/* SECTION 6: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="section-row-equal">
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3>Student Profile Settings</h3>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={profile.name} 
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Academic Year & Course</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={profile.role} 
                          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>College / University</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={profile.college} 
                          onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Monthly Budget Target (₹)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={profile.monthlyBudget} 
                          onChange={(e) => setProfile({ ...profile, monthlyBudget: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="panel-card">
                    <div className="panel-header">
                      <h3>API & Database Connection Status</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 600 }}>Backend REST API</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Connected to SQLite DB</p>
                        </div>
                        <span style={{ padding: '0.25rem 0.65rem', backgroundColor: 'var(--success-light)', color: '#34d399', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>ONLINE</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 600 }}>API Base Endpoint</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 600 }}>Refresh API Data</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Re-fetch latest SQLite state</p>
                        </div>
                        <button 
                          onClick={loadAppData}
                          style={{ padding: '0.4rem 0.85rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          Sync Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
