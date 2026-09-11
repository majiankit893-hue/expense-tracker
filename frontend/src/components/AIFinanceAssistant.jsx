import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  PieChart,
  Calendar,
  Layers,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';

const EXAMPLE_QUESTIONS = [
  { text: "Where am I spending the most?", icon: PieChart },
  { text: "How much did I spend on food?", icon: Layers },
  { text: "Give me a budget for next month.", icon: Calendar },
  { text: "How can I reduce my spending?", icon: TrendingDown },
  { text: "Compare this month with last month.", icon: ArrowRight },
];

export default function AIFinanceAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Hi! I'm your AI Student Finance Assistant. Ask me anything about your recorded expenses, monthly budgets, or saving tips!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);
    setError(null);

    // Format chat history for backend
    const historyPayload = messages
      .filter(m => m.id !== 'welcome-1')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    try {
      const res = await apiService.sendAIChatMessage(query, historyPayload);
      const replyText = res.data?.reply || "I couldn't process that request right now.";
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        isFallback: res.data?.isFallback || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to get response from AI assistant:', err);
      setError(err.message || 'Unable to connect to AI assistant service.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: "Chat cleared! How can I help with your campus finances today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  return (
    <div className="ai-chat-card panel-card" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', height: '620px', padding: 0, overflow: 'hidden' }}>
      {/* Chat Card Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'linear-gradient(90deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              AI Student Finance Assistant
              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'var(--primary-light)', color: '#818cf8', fontWeight: 600 }}>
                Live Data Connected
              </span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Ask questions about your transactions, categories, and monthly spending
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Reset Chat History"
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <Trash2 size={15} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Example Suggestion Chips */}
      <div style={{
        padding: '0.75rem 1.25rem',
        background: 'rgba(15, 23, 42, 0.6)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <Sparkles size={13} style={{ color: '#a855f7' }} /> Suggestions:
        </span>
        {EXAMPLE_QUESTIONS.map((q, idx) => {
          const IconComp = q.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(q.text)}
              disabled={loading}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; } }}
            >
              <IconComp size={13} style={{ color: 'var(--primary)' }} />
              <span>{q.text}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div style={{
        flex: 1,
        padding: '1.25rem 1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        background: 'rgba(15, 23, 42, 0.4)'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '0.75rem',
              maxWidth: '85%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: msg.sender === 'user' 
                ? 'linear-gradient(135deg, #3b82f6, #6366f1)' 
                : 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              {msg.sender === 'user' ? <User size={16} color="#ffffff" /> : <Bot size={16} color="#ffffff" />}
            </div>

            {/* Bubble Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                padding: '0.85rem 1.15rem',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-card-hover)',
                color: '#ffffff',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                {msg.text}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                {msg.isFallback && (
                  <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontStyle: 'italic' }}>
                    (Calculated from DB stats)
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', alignSelf: 'flex-start' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Bot size={16} color="#ffffff" />
            </div>

            <div style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '18px 18px 18px 4px',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem'
            }}>
              <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
              <span>Analyzing transactions & calculating answer...</span>
            </div>
          </div>
        )}

        {/* Error Alert inside chat */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-light)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            alignSelf: 'center',
            maxWidth: '90%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSend(messages[messages.length - 1]?.text)}
              style={{
                padding: '0.25rem 0.6rem',
                background: '#ef4444',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your expenses (e.g., How much did I spend on food?)..."
          disabled={loading}
          style={{
            flex: 1,
            background: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.4
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: (loading || !input.trim()) ? 'var(--bg-card-hover)' : 'var(--primary)',
            color: (loading || !input.trim()) ? 'var(--text-muted)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: (!loading && input.trim()) ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          {loading ? (
            <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
