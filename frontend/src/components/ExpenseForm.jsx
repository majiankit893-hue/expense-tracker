import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle2, Save, XCircle, AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '../mockData';

export default function ExpenseForm({ onSubmit, initialData, onCancel }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Validation & feedback state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pre-fill form when editing an existing transaction
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setTitle(initialData.title || '');
      setAmount(initialData.amount !== undefined ? String(initialData.amount) : '');
      setCategory(initialData.category || CATEGORIES[0].name);
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setDescription(initialData.description || '');
      setErrors({});
    }
  }, [initialData]);

  // Client-side validation function
  const validateForm = () => {
    const newErrors = {};

    if (!title || !title.trim()) {
      newErrors.title = 'Title is required and cannot be empty.';
    }

    const numAmount = parseFloat(amount);
    if (amount === '' || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a valid number greater than 0.';
    }

    if (!category || !CATEGORIES.some(c => c.name === category)) {
      newErrors.category = 'Please select a valid category.';
    }

    if (!type || (type !== 'expense' && type !== 'income')) {
      newErrors.type = 'Type must be either Expense or Income.';
    }

    if (!date || isNaN(Date.parse(date))) {
      newErrors.date = 'Please enter a valid transaction date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (!validateForm()) {
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      type,
      date,
      description: description.trim(),
    };

    setLoading(true);

    try {
      await onSubmit(payload);
      const isEdit = Boolean(initialData);
      setSuccessMsg(isEdit ? 'Transaction updated successfully!' : 'Transaction saved successfully!');
      
      if (!isEdit) {
        setTitle('');
        setAmount('');
        setDescription('');
        setCategory(CATEGORIES[0].name);
        setDate(new Date().toISOString().split('T')[0]);
        setType('expense');
      }

      setErrors({});
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrors({ server: err.message || 'Failed to save transaction to database.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* General / Server Error Alert */}
      {errors.server && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <span>{errors.server}</span>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: 'var(--success-light)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="form-grid">
        {/* Type Switcher */}
        <div className="form-group full-width">
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Transaction Type *
          </label>
          <div className="type-toggle">
            <button
              type="button"
              className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
              onClick={() => { setType('expense'); setErrors({ ...errors, type: null }); }}
            >
              💸 Expense
            </button>
            <button
              type="button"
              className={`type-btn ${type === 'income' ? 'active income' : ''}`}
              onClick={() => { setType('income'); setErrors({ ...errors, type: null }); }}
            >
              💰 Income / Allowance
            </button>
          </div>
          {errors.type && <span className="field-error-hint">{errors.type}</span>}
        </div>

        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="tx-title">Title / Item Name *</label>
          <input
            id="tx-title"
            type="text"
            className={`form-input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Canteen Lunch, Xerox Copy, Bus Ticket"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({ ...errors, title: null }); }}
          />
          {errors.title && <span className="field-error-hint">{errors.title}</span>}
        </div>

        {/* Amount Field */}
        <div className="form-group">
          <label htmlFor="tx-amount">Amount (₹) *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>₹</span>
            <input
              id="tx-amount"
              type="number"
              step="1"
              min="1"
              className={`form-input ${errors.amount ? 'input-error' : ''}`}
              style={{ paddingLeft: '2.2rem' }}
              placeholder="e.g. 250"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); if (errors.amount) setErrors({ ...errors, amount: null }); }}
            />
          </div>
          {errors.amount && <span className="field-error-hint">{errors.amount}</span>}
        </div>

        {/* Category Field */}
        <div className="form-group">
          <label htmlFor="tx-category">Category *</label>
          <select
            id="tx-category"
            className={`form-select ${errors.category ? 'input-error' : ''}`}
            value={category}
            onChange={(e) => { setCategory(e.target.value); if (errors.category) setErrors({ ...errors, category: null }); }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <span className="field-error-hint">{errors.category}</span>}
        </div>

        {/* Date Field */}
        <div className="form-group">
          <label htmlFor="tx-date">Date *</label>
          <input
            id="tx-date"
            type="date"
            className={`form-input ${errors.date ? 'input-error' : ''}`}
            value={date}
            onChange={(e) => { setDate(e.target.value); if (errors.date) setErrors({ ...errors, date: null }); }}
          />
          {errors.date && <span className="field-error-hint">{errors.date}</span>}
        </div>

        {/* Description Field */}
        <div className="form-group full-width">
          <label htmlFor="tx-description">Description / Notes (Optional)</label>
          <textarea
            id="tx-description"
            className="form-textarea"
            rows="2"
            placeholder="Additional details (e.g. UPI payment, split with roommate)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1 }}>
          {loading ? (
            <span>Saving Record...</span>
          ) : initialData ? (
            <>
              <Save size={18} />
              <span>Update Record</span>
            </>
          ) : (
            <>
              <PlusCircle size={18} />
              <span>Add Record</span>
            </>
          )}
        </button>

        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            style={{ 
              padding: '0.85rem 1.25rem', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--bg-app)', 
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '1rem'
            }}
          >
            <XCircle size={18} />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </form>
  );
}
