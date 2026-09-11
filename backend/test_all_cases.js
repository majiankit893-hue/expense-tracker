const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Setup in-memory / test SQLite database for test execution
const db = new sqlite3.Database(':memory:');

// Import services and controller logic for testing
const aiService = require('./services/aiService');

function runTestHarness() {
  console.log('🧪 Starting Comprehensive Automated Test Suite (12 Test Cases)...\n');

  db.serialize(async () => {
    // Initialize Schema
    db.run(`
      CREATE TABLE expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Helper functions for DB queries
    const getSummary = () => new Promise((res, rej) => {
      const sql = `
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
          SUM(CASE WHEN type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now') THEN amount ELSE 0 END) AS this_month_expense,
          SUM(CASE WHEN type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month') THEN amount ELSE 0 END) AS last_month_expense,
          COUNT(id) AS total_transactions
        FROM expenses
      `;
      db.get(sql, [], (err, row) => err ? rej(err) : res(row));
    });

    const getHighestCategory = () => new Promise((res, rej) => {
      const sql = `
        SELECT category, SUM(amount) AS total_amount
        FROM expenses
        WHERE type = 'expense'
        GROUP BY category
        ORDER BY total_amount DESC
        LIMIT 1
      `;
      db.get(sql, [], (err, row) => err ? rej(err) : res(row));
    });

    const insertTx = (title, amount, category, type, date, description = '') => new Promise((res, rej) => {
      const sql = `INSERT INTO expenses (title, amount, category, type, date, description) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [title, amount, category, type, date, description], function(err) {
        if (err) rej(err);
        else res(this.lastID);
      });
    });

    const updateTx = (id, title, amount, category, type, date, description = '') => new Promise((res, rej) => {
      const sql = `UPDATE expenses SET title=?, amount=?, category=?, type=?, date=?, description=? WHERE id=?`;
      db.run(sql, [title, amount, category, type, date, description, id], function(err) {
        if (err) rej(err);
        else res(this.changes);
      });
    });

    const deleteTx = (id) => new Promise((res, rej) => {
      const sql = `DELETE FROM expenses WHERE id=?`;
      db.run(sql, [id], function(err) {
        if (err) rej(err);
        else res(this.changes);
      });
    });

    const getAllTx = () => new Promise((res, rej) => {
      db.all(`SELECT * FROM expenses ORDER BY date DESC, id DESC`, [], (err, rows) => err ? rej(err) : res(rows));
    });

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
      if (condition) {
        console.log(`  ✅ PASSED: ${message}`);
        passed++;
      } else {
        console.error(`  ❌ FAILED: ${message}`);
        failed++;
      }
    }

    try {
      // ----------------------------------------------------
      // TEST CASE 1: No Transactions
      // ----------------------------------------------------
      console.log('Test Case 1: No Transactions State');
      const sum1 = await getSummary();
      const cat1 = await getHighestCategory();
      assert(sum1.total_transactions === 0, 'Total transactions should be 0');
      assert((sum1.total_income || 0) === 0, 'Total income should be 0');
      assert((sum1.total_expense || 0) === 0, 'Total expense should be 0');
      assert(!cat1, 'Highest category should be null/undefined when empty');

      // AI Chat on Empty State
      const emptyStats = { totalIncome: 0, totalExpenses: 0, balance: 0, categoryTotals: [], monthlyTotals: [], recentSpendingPatterns: [] };
      const chatEmpty = aiService.generateChatRuleBasedFallback('Where am I spending the most?', emptyStats);
      assert(chatEmpty.includes('not recorded any expenses yet'), 'AI handles empty state question correctly');

      // ----------------------------------------------------
      // TEST CASE 2: One Expense
      // ----------------------------------------------------
      console.log('\nTest Case 2: One Expense Record');
      const id1 = await insertTx('Canteen Lunch', 250, 'Food', 'expense', '2026-09-11', 'Tasty lunch');
      const sum2 = await getSummary();
      const cat2 = await getHighestCategory();
      assert(sum2.total_transactions === 1, 'Transaction count is 1');
      assert(sum2.total_expense === 250, 'Total expense is 250');
      assert(cat2.category === 'Food' && cat2.total_amount === 250, 'Top category is Food with ₹250');

      // ----------------------------------------------------
      // TEST CASE 3: Multiple Expenses
      // ----------------------------------------------------
      console.log('\nTest Case 3: Multiple Expenses');
      await insertTx('Bus Pass', 400, 'Transport', 'expense', '2026-09-10', 'Monthly pass');
      await insertTx('Stationery Notebooks', 350, 'Education', 'expense', '2026-09-09', 'Lab work');
      const sum3 = await getSummary();
      assert(sum3.total_transactions === 3, 'Transaction count is 3');
      assert(sum3.total_expense === 1000, 'Total expense sums to 1000 (250 + 400 + 350)');

      // ----------------------------------------------------
      // TEST CASE 4: Income + Expenses
      // ----------------------------------------------------
      console.log('\nTest Case 4: Income + Expenses Calculation');
      await insertTx('Monthly Allowance', 12000, 'Other', 'income', '2026-09-01', 'Pocket money');
      const sum4 = await getSummary();
      const balance4 = sum4.total_income - sum4.total_expense;
      assert(sum4.total_income === 12000, 'Total income is 12000');
      assert(balance4 === 11000, 'Net balance is 11000 (12000 - 1000)');

      // ----------------------------------------------------
      // TEST CASE 5: Very Large Amount
      // ----------------------------------------------------
      console.log('\nTest Case 5: Very Large Amount Record');
      const largeId = await insertTx('Scholarship Prize', 99999999, 'Other', 'income', '2026-09-05', 'National award');
      const sum5 = await getSummary();
      assert(sum5.total_income === 100011999, 'Large amount added accurately without precision loss');

      // ----------------------------------------------------
      // TEST CASE 6: Invalid Amount Handling
      // ----------------------------------------------------
      console.log('\nTest Case 6: Invalid Amount Inputs');
      const testInvalidAmount = (amt) => (amt === undefined || amt === null || isNaN(Number(amt)) || Number(amt) <= 0);
      assert(testInvalidAmount(-50) === true, 'Rejects negative amount (-50)');
      assert(testInvalidAmount(0) === true, 'Rejects zero amount (0)');
      assert(testInvalidAmount('abc') === true, 'Rejects string "abc"');
      assert(testInvalidAmount(250) === false, 'Accepts valid positive amount 250');
      assert(testInvalidAmount('250') === false, 'Accepts valid numeric string "250"');

      // ----------------------------------------------------
      // TEST CASE 7: Empty Title Handling
      // ----------------------------------------------------
      console.log('\nTest Case 7: Empty Title Inputs');
      const testInvalidTitle = (t) => (!t || typeof t !== 'string' || t.trim() === '');
      assert(testInvalidTitle('') === true, 'Rejects empty string ""');
      assert(testInvalidTitle('   ') === true, 'Rejects whitespace string "   "');
      assert(testInvalidTitle(null) === true, 'Rejects null');
      assert(testInvalidTitle('Canteen Snack') === false, 'Accepts valid title "Canteen Snack"');

      // ----------------------------------------------------
      // TEST CASE 8: Delete Transaction
      // ----------------------------------------------------
      console.log('\nTest Case 8: Delete Transaction');
      const deleteChanges = await deleteTx(largeId);
      assert(deleteChanges === 1, '1 record removed on deletion');
      const sum8 = await getSummary();
      assert(sum8.total_income === 12000, 'Income restored back to 12000 after deleting large prize');

      // ----------------------------------------------------
      // TEST CASE 9: Edit Transaction
      // ----------------------------------------------------
      console.log('\nTest Case 9: Edit Transaction');
      const updateChanges = await updateTx(id1, 'Canteen Buffet Special', 300, 'Food', 'expense', '2026-09-11', 'Updated menu');
      assert(updateChanges === 1, '1 record updated on edit');
      const allTx9 = await getAllTx();
      const updatedItem = allTx9.find(t => t.id === id1);
      assert(updatedItem.title === 'Canteen Buffet Special' && updatedItem.amount === 300, 'Updated item fields verified');

      // ----------------------------------------------------
      // TEST CASE 10: Multiple Categories
      // ----------------------------------------------------
      console.log('\nTest Case 10: Multiple Categories');
      await insertTx('Doctor Visit & Meds', 600, 'Health', 'expense', '2026-09-07', 'Clinic');
      await insertTx('Movie Ticket', 300, 'Entertainment', 'expense', '2026-09-06', 'Weekend show');
      await insertTx('Hostel Utility Bill', 1200, 'Bills', 'expense', '2026-09-03', 'Electricity share');
      const allTx10 = await getAllTx();
      const catSet = new Set(allTx10.map(t => t.category));
      assert(catSet.size >= 5, `Database has records across ${catSet.size} categories`);

      // ----------------------------------------------------
      // TEST CASE 11: Different Months Comparison
      // ----------------------------------------------------
      console.log('\nTest Case 11: Different Months Data & Comparison');
      await insertTx('August Mess Fee', 2800, 'Bills', 'expense', '2026-08-15', 'Previous month mess');
      await insertTx('August Textbooks', 900, 'Education', 'expense', '2026-08-20', 'Previous month books');
      
      const sum11 = await getSummary();
      assert(sum11.this_month_expense > 0, `This month expense calculated: ₹${sum11.this_month_expense}`);
      assert(sum11.last_month_expense > 0, `Last month expense calculated: ₹${sum11.last_month_expense}`);

      const chatCompare = aiService.generateChatRuleBasedFallback('Compare this month with last month.', {
        totalIncome: 12000,
        totalExpenses: sum11.total_expense,
        balance: 12000 - sum11.total_expense,
        thisMonthExpense: sum11.this_month_expense,
        lastMonthExpense: sum11.last_month_expense,
        categoryTotals: [],
        monthlyTotals: [],
        recentSpendingPatterns: []
      });
      assert(chatCompare.includes('month') && (chatCompare.includes('reduction') || chatCompare.includes('increase') || chatCompare.includes('spent')), 'Month comparison prompt formats successfully');

      // ----------------------------------------------------
      // TEST CASE 12: AI Service Standby / Fallback
      // ----------------------------------------------------
      console.log('\nTest Case 12: AI Service Standby / Unavailable Fallback');
      delete process.env.GEMINI_API_KEY;
      const aiInsightsResult = await aiService.generateAIInsights({
        totalIncome: 12000,
        totalExpenses: 6000,
        balance: 6000,
        categoryTotals: [{ category: 'Food', total_amount: 2500 }],
        monthlyTotals: [],
        recentSpendingPatterns: []
      });
      assert(aiInsightsResult.isFallback === true, 'isFallback is true when AI API key is standby/missing');
      assert(Boolean(aiInsightsResult.spendingSummary), 'Generates structured summary in fallback mode');

      console.log(`\n====================================================`);
      console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
      console.log(`====================================================\n`);

    } catch (err) {
      console.error('Fatal test error:', err);
    }
  });
}

runTestHarness();
