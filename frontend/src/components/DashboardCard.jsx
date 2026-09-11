import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function DashboardCard({ title, value, icon: Icon, color, trend, trendText }) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={13} className="trend-up" />;
    if (trend === 'down') return <TrendingDown size={13} className="trend-down" />;
    return <Minus size={13} className="trend-neutral" />;
  };

  return (
    <div className="dashboard-card">
      <div className="card-info">
        <span className="card-title">{title}</span>
        <h2 className="card-value">{value}</h2>
        {trendText && (
          <div className="card-trend">
            {getTrendIcon()}
            <span className={`trend-${trend}`}>{trendText}</span>
          </div>
        )}
      </div>

      <div 
        className="card-icon-box" 
        style={{ 
          backgroundColor: `${color}18`, 
          color: color,
          border: `1px solid ${color}30`
        }}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}
