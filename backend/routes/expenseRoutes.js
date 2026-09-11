const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// Health check
router.get('/health', expenseController.getHealth);

// Summary & Analytics
router.get('/summary', expenseController.getSummary);
router.get('/analytics', expenseController.getAnalytics);

// AI Insights & Chat endpoints
router.post('/ai/insights', expenseController.getAIInsights);
router.post('/ai/chat', expenseController.getAIChatResponse);

// CRUD operations for expenses
router.get('/expenses', expenseController.getAllExpenses);
router.get('/expenses/:id', expenseController.getExpenseById);
router.post('/expenses', expenseController.createExpense);
router.put('/expenses/:id', expenseController.updateExpense);
router.delete('/expenses/:id', expenseController.deleteExpense);

module.exports = router;
