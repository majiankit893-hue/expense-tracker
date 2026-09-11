import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Award, 
  AlertCircle,
  Clock,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';

import { CATEGORIES } from '../mockData';

export default function AnalyticsPage({ transactions, analyticsData, monthlyBudget }) {
  // Available month options derived from real transactions
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    (transactions || []).forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Filter transactions based on selected month
  const filteredTx = useMemo(() => {
    if (selectedMonth === 'ALL') return transactions || [];
    return (transactions || []).filter(t => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Financial Metric Calculations
  const metrics = useMemo(() => {
    const incomeTx = filteredTx.filter(t => t.type === 'income');
    const expenseTx = filteredTx.filter(t => t.type === 'expense');

    const totalIncome = incomeTx.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = expenseTx.reduce((sum, t) => sum + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense;

    // Calculate Days in period for Average Daily Spending
    let daysCount = 30;
    if (selectedMonth !== 'ALL') {
      const [year, month] = selectedMonth.split('-').map(Number);
      daysCount = new Date(year, month, 0).getDate();
    } else if (expenseTx.length > 0) {
      const uniqueDates = new Set(expenseTx.map(t => t.date));
      daysCount = Math.max(uniqueDates.size, 1);
    }

    const avgDailySpending = Math.round(totalExpense / daysCount);

    // Calculate Category Breakdown & Highest Category
    const catTotals = {};
    expenseTx.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
    });

    let highestCat = { category: 'None', amount: 0, percentage: 0 };
    const categoryBreakdownList = Object.keys(catTotals).map(catName => {
      const amount = catTotals[catName];
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      const catMeta = CATEGORIES.find(c => c.name === catName) || { color: '#64748b' };
      
      if (amount > highestCat.amount) {
        highestCat = { category: catName, amount, percentage };
      }

      return {
        category: catName,
        amount,
        percentage,
        color: catMeta.color,
        count: expenseTx.filter(t => t.category === catName).length
      };
    }).sort((a, b) => b.amount - a.amount);

    let monthlyDiffPct = null;
    if (selectedMonth !== 'ALL') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const prevDate = new Date(year, month - 2, 1);
      const prevMonthStr = prevDate.toISOString().slice(0, 7);

      const prevExpense = (transactions || [])
        .filter(t => t.type === 'expense' && t.date && t.date.startsWith(prevMonthStr))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      if (prevExpense > 0) {
        monthlyDiffPct = Math.round(((totalExpense - prevExpense) / prevExpense) * 100);
      }
    }

    // Daily Spending Trend Data for Line Chart
    const dailyMap = {};
    expenseTx.forEach(t => {
      dailyMap[t.date] = (dailyMap[t.date] || 0) + Number(t.amount);
    });

    const dailyTrendData = Object.keys(dailyMap).sort().map(d => ({
      date: d,
      amount: dailyMap[d]
    }));

    return {
      totalIncome,
      totalExpense,
      netBalance,
      avgDailySpending,
      highestCat,
      categoryBreakdownList,
      monthlyDiffPct,
      dailyTrendData,
      expenseCount: expenseTx.length
    };
  }, [filteredTx, selectedMonth, transactions]);

  const hasData = metrics.expenseCount > 0 || metrics.totalIncome > 0;

  return (
    <div>
      {/* Month / Range Selector Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Spending & Budget Analytics</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time visual insights calculated from your database records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Timeframe:</span>
          <select
            className="form-select"
            style={{ width: '180px', padding: '0.5rem 0.85rem' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="ALL">All Time History</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Insufficient Data Check */}
      {!hasData ? (
        <div className="panel-card empty-state" style={{ borderStyle: 'solid' }}>
          <AlertCircle size={44} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>No analytics data for this timeframe</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Record expenses or select a different month to generate charts and insights.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Metrics Cards */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.75rem' }}>
            <div className="dashboard-card">
              <div className="card-info">
                <span className="card-title">Total Income</span>
                <h2 className="card-value" style={{ color: 'var(--success)' }}>₹{metrics.totalIncome.toLocaleString('en-IN')}</h2>
                <span className="card-trend trend-up"><TrendingUp size={13} /> Allowance & Income</span>
              </div>
              <div className="card-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-info">
                <span className="card-title">Total Expenses</span>
                <h2 className="card-value" style={{ color: '#f87171' }}>₹{metrics.totalExpense.toLocaleString('en-IN')}</h2>
                <span className="card-trend trend-down"><TrendingDown size={13} /> Outflow</span>
              </div>
              <div className="card-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <TrendingDown size={20} />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-info">
                <span className="card-title">Net Savings Balance</span>
                <h2 className="card-value">₹{metrics.netBalance.toLocaleString('en-IN')}</h2>
                <span className="card-trend trend-neutral"><Wallet size={13} /> Net Available</span>
              </div>
              <div className="card-icon-box" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Wallet size={20} />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-info">
                <span className="card-title">Avg Daily Spending</span>
                <h2 className="card-value">₹{metrics.avgDailySpending.toLocaleString('en-IN')}</h2>
                <span className="card-trend trend-neutral"><Clock size={13} /> Daily Run-rate</span>
              </div>
              <div className="card-icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Clock size={20} />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-info">
                <span className="card-title">Top Expense Category</span>
                <h2 className="card-value" style={{ fontSize: '1.25rem' }}>{metrics.highestCat.category}</h2>
                <span className="card-trend trend-neutral">
                  <Award size={13} /> {metrics.highestCat.percentage}% of total (₹{metrics.highestCat.amount.toLocaleString('en-IN')})
                </span>
              </div>
              <div className="card-icon-box" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                <Award size={20} />
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="section-row" style={{ marginBottom: '1.75rem' }}>
            <div className="panel-card">
              <div className="panel-header">
                <h3>
                  <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
                  <span>Income vs Expense Monthly Trend</span>
                </h3>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`]}
                      contentStyle={{ backgroundColor: '#131c2e', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend verticalAlign="top" align="right" />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <h3>
                  <PieIcon size={18} style={{ color: 'var(--primary)' }} />
                  <span>Category Spending Share</span>
                </h3>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.categoryBreakdownList}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {metrics.categoryBreakdownList.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} stroke="#131c2e" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`]}
                      contentStyle={{ backgroundColor: '#131c2e', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Daily Spending Timeline */}
          {metrics.dailyTrendData.length > 0 && (
            <div className="panel-card" style={{ marginBottom: '1.75rem' }}>
              <div className="panel-header">
                <h3>Daily Spending Timeline</h3>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Daily Expense']}
                      contentStyle={{ backgroundColor: '#131c2e', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Category Breakdown Progress Cards */}
          <div className="panel-card">
            <div className="panel-header">
              <h3>Category Breakdown Details</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {metrics.categoryBreakdownList.map((item) => (
                <div key={item.category} style={{ background: 'var(--bg-app)', padding: '1.15rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.925rem', color: item.color }}>{item.category}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>{item.count} transaction{item.count !== 1 ? 's' : ''}</span>
                    <span>{item.percentage}% of total</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
