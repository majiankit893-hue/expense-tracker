# AI Student Expense Tracker

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20SQLite-indigo.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-emerald.svg)](https://github.com/)

A modern, full-stack web application designed for college students to track daily campus expenses, visualize allowance trends, and receive personalized, data-driven financial advice powered by backend analytics and **Google Gemini AI**.

Built as a portfolio project for a 1st Year B.Tech Computer Science & Engineering (CSE) student.

---

## 📌 Problem Statement

Managing finances in college is a common challenge for students:
- **Impulse Campus Spending**: Daily canteen snacks, xerox copies, printouts, and small UPI transactions add up quickly.
- **Allowance Exhaustion**: Monthly pocket money often runs out well before the semester month ends.
- **Lack of Actionable Insights**: Traditional expense trackers are generic, cluttered, and do not provide student-tailored budget advice.

**AI Student Expense Tracker** solves this by offering a clean, student-centric interface backed by strict SQLite database transaction records and an AI Financial Coach that answers spending queries without inventing numbers.

---

## ✨ Features

- **📊 Comprehensive Financial Dashboard**: Real-time metrics for Current Balance, Total Income, Total Expenses, This Month's Spending, Top Spending Category, and Transaction Count.
- **💸 Expense & Income Management**: Full CRUD operations (Create, Read, Edit, Delete) for recording campus transactions with title, amount, category, date, type (Expense/Income), and optional notes.
- **📈 Interactive Analytics & Charts**:
  - **Monthly Trends Bar Chart**: Income vs Expense comparative view powered by **Recharts**.
  - **Category Spending Share**: Interactive Donut chart displaying spending percentages.
  - **Daily Spending Timeline**: Area chart tracking day-by-day cashflow.
- **🔍 Advanced Search & Filter Bar**: Filter transactions by search keyword, category (Food, Transport, Education, Bills, etc.), type (Expense vs Income), and sorting order (Date / Amount) with a 1-click **Reset Filters** button.
- **📱 Responsive Mobile Layout**: Responsive design with touch-friendly navigation, mobile cards, and drawer overlay backdrops for Mobile, Tablet, and Desktop screens.

---

## 🤖 AI Features

### 1. AI Campus Financial Coach Page
Analyzes recorded transactions and generates structured insights:
- **Spending Summary**: Concise breakdown of net balance and monthly allowance usage.
- **Top Expense Area**: Highlights the highest spending category and percentage share.
- **Unusual Spending Detection**: Flags high single transactions exceeding 25% of total expenses.
- **Budget & Savings Tips**: Practical campus tips (canteen snacks, digital textbook sharing, student discounts).

### 2. Interactive AI Finance Assistant Chat
An interactive chat interface directly connected to backend database statistics:
- **Example Quick Queries**:
  - *"Where am I spending the most?"*
  - *"How much did I spend on food?"*
  - *"Give me a budget for next month."*
  - *"How can I reduce my spending?"*
  - *"Compare this month with last month."*
- **Strict Anti-Hallucination**: The AI model is strictly instructed to answer using *only* pre-calculated database statistics. If a category or item has no recorded entries, it explicitly notifies the user.
- **Intelligent Fallback Engine**: If no Gemini API key is configured or the AI service is unreachable, a rule-based engine answers financial questions smoothly without breaking the application.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Modern Vanilla CSS Design Tokens (Custom Slate Dark Theme, HSL Variables)
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js 5
- **Database Engine**: SQLite 3 (`sqlite3`)
- **AI Integration**: Google Gemini API (`gemini-2.5-flash`) via Node Fetch
- **Config**: Dotenv, CORS

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 18 / Vite)               │
│  - Dashboard, Analytics, Expense Form, AI Chat UI      │
└──────────────────────────┬─────────────────────────────┘
                           │  HTTP / REST API Requests
                           ▼
┌────────────────────────────────────────────────────────┐
│               Backend (Node.js / Express)              │
│  - Input Validation & Controller Logic                 │
│  - SQLite Database Queries & Pre-computed Statistics   │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│    SQLite Database       │  │   Google Gemini AI API   │
│  (student_expenses.db)   │  │   (Server-Side Key)      │
└──────────────────────────┘  └──────────────────────────┘
```

> 🔒 **Security Note**: Neither database credentials nor the Gemini AI API key are ever exposed to the client. All database statistics aggregation and AI requests happen strictly on the Node.js backend server.

---

## 📁 Folder Structure

```
student-expense-tracker/
├── backend/
│   ├── controllers/
│   │   └── expenseController.js    # CRUD handlers, analytics & AI chat controller
│   ├── routes/
│   │   └── expenseRoutes.js        # Express API route declarations
│   ├── services/
│   │   └── aiService.js            # Gemini API Integration & Rule-Based Fallback Engine
│   ├── database.js                 # SQLite connection & table initialiser
│   ├── server.js                   # Express server startup
│   ├── test_all_cases.js           # Automated test suite (12 test scenarios)
│   ├── .env.example                # Example environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIFinanceAssistant.jsx  # AI Chat UI Component
│   │   │   ├── AIInsightsPage.jsx      # AI Financial Coach Page
│   │   │   ├── AnalyticsPage.jsx       # Analytics & Recharts Charts Page
│   │   │   ├── CategoryChart.jsx       # Category Donut Chart Component
│   │   │   ├── DashboardCard.jsx       # Metric Summary Card Component
│   │   │   ├── ExpenseForm.jsx         # Expense/Income Entry Form Component
│   │   │   ├── MonthlyChart.jsx        # Income vs Expense Bar Chart Component
│   │   │   ├── Navbar.jsx              # Header Navbar Component
│   │   │   ├── Sidebar.jsx             # Navigation Sidebar Drawer
│   │   │   ├── TransactionItem.jsx     # Individual Transaction Badge Item
│   │   │   └── TransactionList.jsx     # Filterable Table & Mobile Card List
│   │   ├── services/
│   │   │   └── api.js              # REST API Client Service
│   │   ├── App.jsx                 # Main React Application & State Handler
│   │   ├── index.css               # Design System & Responsive Styles
│   │   └── mockData.js             # Initial categories & default profile data
│   ├── vite.config.js
│   └── package.json
├── README.md
└── walkthrough.md
```

---

## ⚡ Installation Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/student-expense-tracker.git
cd student-expense-tracker
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> 💡 *Note: If `GEMINI_API_KEY` is omitted or left empty, the application automatically switches to its structured rule-based backend fallback engine.*

### Frontend Configuration (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run

### Running the Backend Server
From the `backend/` directory:
```bash
# Development mode with nodemon
npm run dev

# Or standard start
npm start
```
Backend server will start on **`http://localhost:5000`**. Test health endpoint at `http://localhost:5000/api/health`.

### Running the Frontend React App
From the `frontend/` directory in a new terminal:
```bash
npm run dev
```
Frontend development server will open at **`http://localhost:5173`**.

---

## 🗄️ Database Information

- **Database System**: SQLite 3
- **Database File**: `backend/student_expenses.db` (auto-created on server launch)

### Table Schema: `expenses`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique Record Identifier |
| `title` | `TEXT` | `NOT NULL` | Transaction title or item name |
| `amount` | `REAL` | `NOT NULL` | Positive amount in Rupees (₹) |
| `category` | `TEXT` | `NOT NULL CHECK (category IN (...))` | Category (`Food`, `Transport`, `Education`, `Shopping`, `Entertainment`, `Bills`, `Health`, `Other`) |
| `type` | `TEXT` | `NOT NULL CHECK (type IN ('income', 'expense'))` | Transaction type |
| `date` | `TEXT` | `NOT NULL` | Date string (`YYYY-MM-DD`) |
| `description` | `TEXT` | `NULL` | Optional transaction details |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | System creation timestamp |

---

## 📡 API Endpoints

### System & Core REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & SQLite database connection status |
| `GET` | `/api/expenses` | Get all expenses (supports `search`, `category`, `type` query filters) |
| `GET` | `/api/expenses/:id` | Get single expense by ID |
| `POST` | `/api/expenses` | Create new expense or income entry |
| `PUT` | `/api/expenses/:id` | Update existing expense entry |
| `DELETE` | `/api/expenses/:id` | Delete expense entry |
| `GET` | `/api/summary` | Get aggregated financial metrics (balance, income, expenses, top category) |
| `GET` | `/api/analytics` | Get category breakdown list & monthly trends data |

### AI Endpoints

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `POST` | `/api/ai/insights` | `{}` | Generates AI Financial Coach insights report |
| `POST` | `/api/ai/chat` | `{ "message": "...", "history": [] }` | Sends query to AI Student Finance Assistant |

---

## 📸 Screenshots

*(Replace placeholders below with actual project screenshots)*

```
+-----------------------------------------------------------------------+
|                                                                       |
|                     [ Dashboard Overview Screenshot ]                 |
|                                                                       |
+-----------------------------------------------------------------------+
```
*Figure 1: Student Financial Dashboard with summary metrics, charts, and recent transaction list.*

```
+-----------------------------------------------------------------------+
|                                                                       |
|                  [ AI Finance Assistant Chat Screenshot ]             |
|                                                                       |
+-----------------------------------------------------------------------+
```
*Figure 2: AI Assistant interactive chat with sample suggestion chips and data-backed responses.*

---

## 🔮 Future Improvements

- [ ] **Multi-User Authentication**: JWT-based registration and login for multiple students.
- [ ] **CSV / PDF Export**: Download monthly expense reports for hostel & parental allowance records.
- [ ] **Recurring Subscriptions Tracker**: Reminders for college fees, Wi-Fi bills, and OTT subscriptions.
- [ ] **Receipt OCR Scanning**: Upload canteen receipts to automatically extract amounts and categories.

---

## ⚠️ Known Limitations

1. **Single Student Local Storage**: SQLite stores records locally in single-user mode.
2. **AI API Rate Limits**: When using the free Google Gemini API tier (15 requests/minute), high request frequency will automatically trigger the backend rule-based engine fallback.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

*Developed with ❤️ as a 1st Year B.Tech CSE Project.*
