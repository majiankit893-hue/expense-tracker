import React from 'react';
import { 
  Utensils, 
  BookOpen, 
  Home, 
  Bus, 
  Tv, 
  Wallet, 
  DollarSign, 
  Film, 
  Tag, 
  ShoppingBag,
  HeartPulse,
  Edit2,
  Trash2 
} from 'lucide-react';
import { CATEGORIES } from '../mockData';

const iconMap = {
  Utensils,
  BookOpen,
  Home,
  Bus,
  Tv,
  Wallet,
  DollarSign,
  Film,
  Tag,
  ShoppingBag,
  HeartPulse,
};

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const categoryInfo = CATEGORIES.find(c => c.name === transaction.category) || CATEGORIES[CATEGORIES.length - 1];
  const IconComponent = iconMap[categoryInfo.icon] || Tag;

  const isExpense = transaction.type === 'expense';

  return (
    <div className="transaction-item">
      <div className="tx-left">
        <div 
          className="tx-icon-badge" 
          style={{ 
            backgroundColor: `${categoryInfo.color}18`, 
            color: categoryInfo.color,
            border: `1px solid ${categoryInfo.color}30`
          }}
        >
          <IconComponent size={20} />
        </div>
        <div className="tx-details">
          <h4>{transaction.title}</h4>
          <div className="tx-meta">
            <span className="category-tag">{transaction.category}</span>
            <span>{transaction.date}</span>
            {transaction.description && <span style={{ opacity: 0.85 }}>• {transaction.description}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <span className={`tx-amount ${isExpense ? 'expense' : 'income'}`}>
          {isExpense ? '-' : '+'}₹{Number(transaction.amount).toLocaleString('en-IN')}
        </span>
        
        {onEdit && (
          <button 
            onClick={() => onEdit(transaction)} 
            style={{
              color: 'var(--text-secondary)',
              padding: '0.35rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)'
            }}
            title="Edit transaction"
          >
            <Edit2 size={15} />
          </button>
        )}

        {onDelete && (
          <button 
            onClick={() => onDelete(transaction.id)} 
            style={{
              color: '#ef4444',
              padding: '0.35rem',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--danger-light)'
            }}
            title="Delete transaction"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
