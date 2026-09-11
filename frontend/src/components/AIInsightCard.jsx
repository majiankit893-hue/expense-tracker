import React from 'react';
import { AlertTriangle, CheckCircle, Info, Lightbulb, ArrowRight } from 'lucide-react';

export default function AIInsightCard({ insight }) {
  const getIcon = () => {
    switch (insight.type) {
      case 'warning': return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'success': return <CheckCircle size={18} style={{ color: 'var(--success)' }} />;
      case 'info': return <Info size={18} style={{ color: 'var(--info)' }} />;
      case 'tip': return <Lightbulb size={18} style={{ color: 'var(--primary)' }} />;
      default: return <Lightbulb size={18} />;
    }
  };

  return (
    <div className={`ai-card ${insight.type}`}>
      <div>
        <div className="ai-card-header">
          <div className="ai-card-title">
            {getIcon()}
            <span>{insight.title}</span>
          </div>
          <span className={`ai-badge ${insight.type}`}>
            {insight.type}
          </span>
        </div>

        <p className="ai-card-body" style={{ marginTop: '0.75rem' }}>
          {insight.description}
        </p>
      </div>

      <div className="ai-card-footer">
        <span className="ai-impact">{insight.impact}</span>
        <button className="ai-action-btn">
          <span>{insight.actionText}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
