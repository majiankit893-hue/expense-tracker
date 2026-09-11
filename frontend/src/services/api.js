const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api' 
    : '/api');

async function handleResponse(response) {
  const json = await response.json();
  if (!response.ok) {
    const errorMsg = json.details 
      ? (Array.isArray(json.details) ? json.details.join(', ') : json.details)
      : (json.error || 'An unexpected error occurred.');
    throw new Error(errorMsg);
  }
  return json;
}

export const apiService = {
  // GET /api/health
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // GET /api/expenses
  async getExpenses(queryParams = {}) {
    const url = new URL(`${API_BASE_URL}/expenses`);
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key]) url.searchParams.append(key, queryParams[key]);
    });
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  // GET /api/expenses/:id
  async getExpenseById(id) {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`);
    return handleResponse(res);
  },

  // POST /api/expenses
  async createExpense(expenseData) {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    return handleResponse(res);
  },

  // PUT /api/expenses/:id
  async updateExpense(id, expenseData) {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    return handleResponse(res);
  },

  // DELETE /api/expenses/:id
  async deleteExpense(id) {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // GET /api/summary
  async getSummary() {
    const res = await fetch(`${API_BASE_URL}/summary`);
    return handleResponse(res);
  },

  // GET /api/analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/analytics`);
    return handleResponse(res);
  },

  // POST /api/ai/insights
  async getAIInsights() {
    const res = await fetch(`${API_BASE_URL}/ai/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(res);
  },

  // POST /api/ai/chat
  async sendAIChatMessage(message, history = []) {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });
    return handleResponse(res);
  },
};
