import React, { useState } from 'react';
import { 
  Search, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import TransactionItem from './TransactionItem';
import { CATEGORIES } from '../mockData';

export default function TransactionList({ 
  transactions, 
  onEditTransaction, 
  onDeleteTransaction, 
  limit 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Confirmation state for deleting
  const [deletingTx, setDeletingTx] = useState(null);

  // Filter logic
  const filtered = (transactions || []).filter((tx) => {
    const matchesSearch = 
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    const matchesType = selectedType === 'All' || tx.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date) - new Date(a.date);
    }
    if (sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    }
    if (sortBy === 'amount-desc') {
      return b.amount - a.amount;
    }
    if (sortBy === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  const displayList = limit ? sorted.slice(0, limit) : sorted;
  const isFiltered = searchTerm.trim() !== '' || selectedCategory !== 'All' || selectedType !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSortBy('date-desc');
  };

  const handleDeleteClick = (tx) => {
    setDeletingTx(tx);
  };

  const confirmDelete = async () => {
    if (deletingTx && onDeleteTransaction) {
      await onDeleteTransaction(deletingTx.id);
      setDeletingTx(null);
    }
  };

  return (
    <div>
      {/* Confirmation Modal */}
      {deletingTx && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Confirm Deletion</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{deletingTx.title}"</strong> (₹{deletingTx.amount.toLocaleString('en-IN')})? This record will be permanently deleted from the database.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={() => setDeletingTx(null)}
                style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sorting Bar (hidden if limit preview mode) */}
      {!limit && (
        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Type Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              style={{
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.825rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Reset Filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {displayList.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} style={{ color: 'var(--text-muted)' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.75rem' }}>No transactions found</p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: isFiltered ? '1rem' : 0 }}>
            {isFiltered ? 'No records match your active search and filter options.' : 'Start tracking your campus expenses by adding your first transaction.'}
          </span>
          {isFiltered && (
            <button
              onClick={resetFilters}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.825rem',
                marginTop: '0.5rem'
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Quick Preview List Mode (for Dashboard) */}
          {limit ? (
            <div className="transaction-list">
              {displayList.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onEdit={onEditTransaction}
                  onDelete={() => handleDeleteClick(tx)}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Full Desktop Table View */}
              <div className="table-desktop">
                <div className="transactions-table-wrapper" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Title & Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayList.map((tx) => {
                        const isExpense = tx.type === 'expense';
                        return (
                          <tr key={tx.id}>
                            <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              {tx.date}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.title}</div>
                              {tx.description && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  {tx.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="category-tag">{tx.category}</span>
                            </td>
                            <td>
                              <span className={`badge-type ${isExpense ? 'expense' : 'income'}`}>
                                {tx.type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }} className={isExpense ? 'tx-amount expense' : 'tx-amount income'}>
                              {isExpense ? '-' : '+'}₹{Number(tx.amount).toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                {onEditTransaction && (
                                  <button
                                    onClick={() => onEditTransaction(tx)}
                                    style={{ padding: '0.35rem 0.65rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Edit Transaction"
                                  >
                                    <Edit2 size={14} />
                                    <span>Edit</span>
                                  </button>
                                )}
                                {onDeleteTransaction && (
                                  <button
                                    onClick={() => handleDeleteClick(tx)}
                                    style={{ padding: '0.35rem 0.65rem', background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Delete Transaction"
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card List View */}
              <div className="cards-mobile">
                {displayList.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onEdit={onEditTransaction}
                    onDelete={() => handleDeleteClick(tx)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
