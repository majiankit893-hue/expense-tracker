const db = require('../database');
const aiService = require('../services/aiService');

const ALLOWED_CATEGORIES = [
  'Food', 
  'Transport', 
  'Education', 
  'Shopping', 
  'Entertainment', 
  'Bills', 
  'Health', 
  'Other'
];

const ALLOWED_TYPES = ['income', 'expense'];

// Helper for basic request validation
function validateExpenseInput(data) {
  const errors = [];
  const { title, amount, category, type, date } = data;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Title is required and must be a non-empty string.');
  }

  const numAmount = Number(amount);
  if (amount === undefined || amount === null || typeof amount === 'boolean' || isNaN(numAmount) || numAmount <= 0) {
    errors.push('Amount must be a positive number greater than 0.');
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`Category is required and must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  if (!type || !ALLOWED_TYPES.includes(type)) {
    errors.push("Type must be either 'income' or 'expense'.");
  }

  if (!date || isNaN(Date.parse(date)) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('A valid date string in YYYY-MM-DD format is required.');
  }

  return errors;
}

// GET /api/health
exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Expense Tracker API & SQLite Database are running cleanly.',
    timestamp: new Date().toISOString()
  });
};

// GET /api/expenses
exports.getAllExpenses = (req, res) => {
  const { search, category, type } = req.query;
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  sql += ' ORDER BY date DESC, id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error fetching expenses.', details: err.message });
    }
    res.status(200).json({ status: 'success', count: rows.length, data: rows });
  });
};

// GET /api/expenses/:id
exports.getExpenseById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM expenses WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error fetching expense.', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: `Expense with ID ${id} not found.` });
    }
    res.status(200).json({ status: 'success', data: row });
  });
};

// POST /api/expenses
exports.createExpense = (req, res) => {
  const { title, amount, category, type, date, description } = req.body;

  const validationErrors = validateExpenseInput({ title, amount, category, type, date });
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }

  const sql = `
    INSERT INTO expenses (title, amount, category, type, date, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [title.trim(), amount, category, type, date, description || ''];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create expense record.', details: err.message });
    }

    db.get('SELECT * FROM expenses WHERE id = ?', [this.lastID], (getErr, row) => {
      if (getErr) {
        return res.status(201).json({ status: 'success', id: this.lastID, message: 'Expense created successfully.' });
      }
      res.status(201).json({ status: 'success', message: 'Expense created successfully.', data: row });
    });
  });
};

// PUT /api/expenses/:id
exports.updateExpense = (req, res) => {
  const { id } = req.params;
  const { title, amount, category, type, date, description } = req.body;

  const validationErrors = validateExpenseInput({ title, amount, category, type, date });
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }

  db.get('SELECT * FROM expenses WHERE id = ?', [id], (checkErr, row) => {
    if (checkErr) {
      return res.status(500).json({ error: 'Database check failed.', details: checkErr.message });
    }
    if (!row) {
      return res.status(404).json({ error: `Expense with ID ${id} not found.` });
    }

    const sql = `
      UPDATE expenses 
      SET title = ?, amount = ?, category = ?, type = ?, date = ?, description = ?
      WHERE id = ?
    `;
    const params = [title.trim(), amount, category, type, date, description || '', id];

    db.run(sql, params, function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update expense record.', details: err.message });
      }

      db.get('SELECT * FROM expenses WHERE id = ?', [id], (getErr, updatedRow) => {
        res.status(200).json({
          status: 'success',
          message: 'Expense updated successfully.',
          data: updatedRow
        });
      });
    });
  });
};

// DELETE /api/expenses/:id
exports.deleteExpense = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM expenses WHERE id = ?', [id], (checkErr, row) => {
    if (checkErr) {
      return res.status(500).json({ error: 'Database check failed.', details: checkErr.message });
    }
    if (!row) {
      return res.status(404).json({ error: `Expense with ID ${id} not found.` });
    }

    db.run('DELETE FROM expenses WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete expense record.', details: err.message });
      }
      res.status(200).json({ status: 'success', message: `Expense with ID ${id} deleted successfully.` });
    });
  });
};

// GET /api/summary
exports.getSummary = (req, res) => {
  const summarySql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
      SUM(CASE WHEN type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now') THEN amount ELSE 0 END) AS this_month_expense,
      COUNT(id) AS total_transactions
    FROM expenses
  `;

  const highestCatSql = `
    SELECT category, SUM(amount) AS total_amount
    FROM expenses
    WHERE type = 'expense'
    GROUP BY category
    ORDER BY total_amount DESC
    LIMIT 1
  `;

  db.get(summarySql, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error calculating summary.', details: err.message });
    }

    const totalIncome = row.total_income || 0;
    const totalExpense = row.total_expense || 0;
    const totalBalance = totalIncome - totalExpense;
    const thisMonthExpense = row.this_month_expense || 0;
    const totalTransactions = row.total_transactions || 0;

    db.get(highestCatSql, [], (catErr, highestRow) => {
      const highestCategory = (highestRow && highestRow.category) ? {
        category: highestRow.category,
        amount: highestRow.total_amount || 0
      } : { category: 'None', amount: 0 };

      res.status(200).json({
        status: 'success',
        data: {
          totalBalance,
          totalIncome,
          totalExpense,
          thisMonthExpense,
          totalTransactions,
          highestCategory
        }
      });
    });
  });
};

// GET /api/analytics
exports.getAnalytics = (req, res) => {
  const categorySql = `
    SELECT category, SUM(amount) AS total_amount, COUNT(id) AS count
    FROM expenses
    WHERE type = 'expense'
    GROUP BY category
    ORDER BY total_amount DESC
  `;

  const monthlySql = `
    SELECT 
      strftime('%Y-%m', date) AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM expenses
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month ASC
  `;

  db.all(categorySql, [], (catErr, categoryRows) => {
    if (catErr) {
      return res.status(500).json({ error: 'Database error fetching category analytics.', details: catErr.message });
    }

    db.all(monthlySql, [], (monthErr, monthlyRows) => {
      if (monthErr) {
        return res.status(500).json({ error: 'Database error fetching monthly analytics.', details: monthErr.message });
      }

      res.status(200).json({
        status: 'success',
        data: {
          categoryBreakdown: categoryRows,
          monthlyTrends: monthlyRows
        }
      });
    });
  });
};

// POST /api/ai/insights
exports.getAIInsights = (req, res) => {
  // 1. Fetch user's expense data & calculate reliable statistics
  const summarySql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
    FROM expenses
  `;

  const categorySql = `
    SELECT category, SUM(amount) AS total_amount
    FROM expenses
    WHERE type = 'expense'
    GROUP BY category
    ORDER BY total_amount DESC
  `;

  const monthlySql = `
    SELECT 
      strftime('%Y-%m', date) AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM expenses
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month ASC
  `;

  const patternsSql = `
    SELECT title, amount, category, type, date
    FROM expenses
    ORDER BY date DESC, id DESC
    LIMIT 10
  `;

  db.get(summarySql, [], (err, summaryRow) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to compute backend summary for AI.', details: err.message });
    }

    const totalIncome = summaryRow ? (summaryRow.total_income || 0) : 0;
    const totalExpenses = summaryRow ? (summaryRow.total_expense || 0) : 0;
    const balance = totalIncome - totalExpenses;

    db.all(categorySql, [], (catErr, categoryRows) => {
      db.all(monthlySql, [], (monthErr, monthlyRows) => {
        db.all(patternsSql, [], async (patErr, patternRows) => {

          const structuredStats = {
            totalIncome,
            totalExpenses,
            balance,
            categoryTotals: categoryRows || [],
            monthlyTotals: monthlyRows || [],
            recentSpendingPatterns: patternRows || []
          };

          try {
            // 2. Pass pre-calculated structured info to AI Service
            const aiResponse = await aiService.generateAIInsights(structuredStats);
            res.status(200).json({
              status: 'success',
              data: aiResponse
            });
          } catch (aiErr) {
            console.error('Error generating AI insights:', aiErr);
            // Fallback response
            const fallback = aiService.generateRuleBasedFallback(structuredStats);
            res.status(200).json({
              status: 'success',
              data: fallback
            });
          }
        });
      });
    });
  });
};

// POST /api/ai/chat
exports.getAIChatResponse = (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
  }

  const summarySql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
      SUM(CASE WHEN type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now') THEN amount ELSE 0 END) AS this_month_expense,
      SUM(CASE WHEN type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month') THEN amount ELSE 0 END) AS last_month_expense
    FROM expenses
  `;

  const categorySql = `
    SELECT category, SUM(amount) AS total_amount, COUNT(id) AS transaction_count
    FROM expenses
    WHERE type = 'expense'
    GROUP BY category
    ORDER BY total_amount DESC
  `;

  const monthlySql = `
    SELECT 
      strftime('%Y-%m', date) AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM expenses
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month ASC
  `;

  const patternsSql = `
    SELECT title, amount, category, type, date
    FROM expenses
    ORDER BY date DESC, id DESC
    LIMIT 20
  `;

  db.get(summarySql, [], (err, summaryRow) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to compute database statistics for AI assistant.', details: err.message });
    }

    const totalIncome = summaryRow ? (summaryRow.total_income || 0) : 0;
    const totalExpenses = summaryRow ? (summaryRow.total_expense || 0) : 0;
    const balance = totalIncome - totalExpenses;
    const thisMonthExpense = summaryRow ? (summaryRow.this_month_expense || 0) : 0;
    const lastMonthExpense = summaryRow ? (summaryRow.last_month_expense || 0) : 0;

    db.all(categorySql, [], (catErr, categoryRows) => {
      db.all(monthlySql, [], (monthErr, monthlyRows) => {
        db.all(patternsSql, [], async (patErr, patternRows) => {

          const structuredStats = {
            totalIncome,
            totalExpenses,
            balance,
            thisMonthExpense,
            lastMonthExpense,
            categoryTotals: categoryRows || [],
            monthlyTotals: monthlyRows || [],
            recentSpendingPatterns: patternRows || []
          };

          try {
            const chatResponse = await aiService.generateAIChatResponse(message.trim(), history || [], structuredStats);
            res.status(200).json({
              status: 'success',
              data: chatResponse
            });
          } catch (aiErr) {
            console.error('Error generating AI chat response:', aiErr);
            const fallback = aiService.generateChatRuleBasedFallback(message.trim(), structuredStats);
            res.status(200).json({
              status: 'success',
              data: {
                reply: fallback,
                isFallback: true
              }
            });
          }
        });
      });
    });
  });
};

