import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CATEGORIES } from '../mockData';

export default function CategoryChart({ categoryBreakdown, transactions }) {
  let chartData = [];

  if (categoryBreakdown && categoryBreakdown.length > 0) {
    chartData = categoryBreakdown.map(item => {
      const catObj = CATEGORIES.find(c => c.name === item.category) || { color: '#64748b' };
      return {
        name: item.category,
        value: Number(item.total_amount),
        color: catObj.color,
      };
    }).filter(d => d.value > 0);
  } else if (transactions && transactions.length > 0) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    expenseTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    chartData = Object.keys(categoryTotals).map(catName => {
      const catObj = CATEGORIES.find(c => c.name === catName) || { color: '#64748b' };
      return {
        name: catName,
        value: categoryTotals[catName],
        color: catObj.color,
      };
    }).filter(d => d.value > 0);
  }

  if (chartData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.9rem' }}>No expense transactions recorded yet.</p>
        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Add an expense to populate category charts.</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e293b" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
