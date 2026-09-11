import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  PiggyBank, 
  CheckCircle2, 
  RefreshCw, 
  Lightbulb, 
  GraduationCap,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';
import AIFinanceAssistant from './AIFinanceAssistant';

export default function AIInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAIInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAIInsights();
      setInsights(res.data || null);
    } catch (err) {
      console.error('Failed to fetch AI Insights:', err);
      setError(err.message || 'Unable to generate AI insights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAIInsights();
  }, [fetchAIInsights]);

  return (
    <div>
      {/* Banner Header */}
      <div style={{
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.18))',
        padding: '1.75rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <Sparkles size={26} style={{ color: '#a855f7' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>AI Campus Financial Coach</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px' }}>
            Powered by backend database analytics & AI model integration. Analyzes canteen receipts, allowance trends, and monthly bills without compromising calculation accuracy.
          </p>
        </div>

        <button
          onClick={fetchAIInsights}
          disabled={loading}
          style={{
            padding: '0.65rem 1.2rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          <span>{loading ? 'Analyzing Data...' : 'Refresh AI Analysis'}</span>
        </button>
      </div>

      {/* Mode Status Pill */}
      {insights && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} style={{ color: '#10b981' }} />
          <span>
            {insights.isFallback 
              ? 'Calculated via backend rule engine (AI API key standby mode).' 
              : 'Generated via Gemini AI Model connected to verified database statistics.'}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>AI Service Notice:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && !insights ? (
        <div className="panel-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', color: 'var(--primary)' }} />
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Computing Financial Statistics & AI Insights...</p>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Analyzing SQLite database transactions</span>
        </div>
      ) : insights ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1 & 2: Overview & Top Category Cards */}
          <div className="section-row-equal">
            {/* 1. Spending Summary */}
            <div className="panel-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="panel-header">
                <h3>
                  <Zap size={20} style={{ color: 'var(--primary)' }} />
                  <span>1. Spending Summary</span>
                </h3>
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {insights.spendingSummary}
              </p>
            </div>

            {/* 2. Highest Spending Category */}
            <div className="panel-card" style={{ borderLeft: '4px solid #ec4899' }}>
              <div className="panel-header">
                <h3>
                  <TrendingUp size={20} style={{ color: '#ec4899' }} />
                  <span>2. Highest Spending Category</span>
                </h3>
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {insights.highestCategory}
              </p>
            </div>
          </div>

          {/* Section 3: Possible Unusual Spending */}
          <div className="panel-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="panel-header">
              <h3>
                <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                <span>3. Unusual Spending Detection</span>
              </h3>
            </div>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {insights.unusualSpending}
            </p>
          </div>

          {/* Section 4 & 5: Budget & Saving Suggestions */}
          <div className="section-row-equal">
            {/* 4. Budget Suggestions */}
            <div className="panel-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="panel-header">
                <h3>
                  <CheckCircle2 size={20} style={{ color: '#3b82f6' }} />
                  <span>4. Budget Suggestions</span>
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(insights.budgetSuggestions || []).map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 700 }}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Simple Saving Suggestions */}
            <div className="panel-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="panel-header">
                <h3>
                  <PiggyBank size={20} style={{ color: '#10b981' }} />
                  <span>5. Simple Campus Savings Tips</span>
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(insights.savingSuggestions || []).map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 6: Personalized Student Advice */}
          <div className="panel-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid var(--primary)' }}>
            <div className="panel-header">
              <h3>
                <GraduationCap size={22} style={{ color: '#818cf8' }} />
                <span>6. Personalized Student-Friendly Guidance</span>
              </h3>
            </div>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.975rem', fontStyle: 'italic' }}>
              "{insights.personalizedAdvice}"
            </p>
          </div>
        </div>
      ) : null}

      {/* AI Student Finance Assistant Chat Interface */}
      <AIFinanceAssistant />
    </div>
  );
}
