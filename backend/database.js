const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'student_expenses.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database: student_expenses.db');
  }
});

// Create expenses table if it does not exist
db.serialize(() => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL CHECK (
        category IN (
          'Food', 
          'Transport', 
          'Education', 
          'Shopping', 
          'Entertainment', 
          'Bills', 
          'Health', 
          'Other'
        )
      ),
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      date TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('❌ Error creating expenses table:', err.message);
    } else {
      console.log('✅ Expenses table initialized successfully.');
      seedInitialData();
    }
  });
});

function seedInitialData() {
  db.get('SELECT COUNT(*) AS count FROM expenses', [], (err, row) => {
    if (!err && row && row.count === 0) {
      console.log('🌱 Seeding initial student expenses database records...');
      const seedStmt = db.prepare(`
        INSERT INTO expenses (title, amount, category, type, date, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const initialRecords = [
        ['College Canteen Lunch', 240, 'Food', 'expense', '2026-09-11', 'Samosa, coffee & lunch with batchmates'],
        ['Monthly Pocket Money', 8000, 'Other', 'income', '2026-09-01', 'Received from parents for September'],
        ['Data Structures Textbook', 650, 'Education', 'expense', '2026-09-08', 'Cormen Algorithms reference book'],
        ['Hostel Room Rent', 3500, 'Bills', 'expense', '2026-09-02', 'Monthly hostel maintenance share'],
        ['Freelance Web Project', 2500, 'Other', 'income', '2026-09-06', 'Built landing page for tech fest']
      ];

      initialRecords.forEach(rec => seedStmt.run(rec));
      seedStmt.finalize();
      console.log('✅ Seed data inserted successfully.');
    }
  });
}

module.exports = db;
