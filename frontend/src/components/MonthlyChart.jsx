import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MonthlyChart({ monthlyTrends }) {
  const chartData = (monthlyTrends && monthlyTrends.length > 0)
    ? monthlyTrends.map(t => ({
        month: t.month,
        income: Number(t.income || 0),
        expense: Number(t.expense || 0),
      }))
    : [];

  if (chartData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.9rem' }}>No monthly trend data recorded yet.</p>
        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Add transactions to visualize monthly trends.</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`]}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'capitalize' }}>{value}</span>}
          />
          <Bar dataKey="income" name="Allowance / Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expense" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
