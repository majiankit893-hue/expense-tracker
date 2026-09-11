const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * Generate fallback insights directly from calculated statistics
 * if API key is missing or external AI call fails.
 */
function generateRuleBasedFallback(stats) {
  const { totalIncome, totalExpenses, balance, categoryTotals, recentSpendingPatterns } = stats;

  // Find top spending category
  let topCat = { category: 'None', amount: 0 };
  (categoryTotals || []).forEach(c => {
    const amt = Number(c.total_amount || c.amount || 0);
    if (amt > topCat.amount) {
      topCat = { category: c.category, amount: amt };
    }
  });

  const catPct = totalExpenses > 0 ? Math.round((topCat.amount / totalExpenses) * 100) : 0;

  // Detect potential unusual spending (expenses > 30% of total expenses)
  const unusualItems = (recentSpendingPatterns || [])
    .filter(t => t.type === 'expense' && Number(t.amount) > (totalExpenses * 0.25) && totalExpenses > 0)
    .map(t => `${t.title} (₹${t.amount})`);

  const unusualText = unusualItems.length > 0
    ? `Noticed high single purchases: ${unusualItems.join(', ')}.`
    : 'No single unusual spike detected in recent purchases.';

  return {
    isFallback: true,
    spendingSummary: `You have recorded a total income of ₹${totalIncome.toLocaleString('en-IN')} and total expenses of ₹${totalExpenses.toLocaleString('en-IN')}, leaving a current net balance of ₹${balance.toLocaleString('en-IN')}.`,
    highestCategory: topCat.amount > 0 
      ? `${topCat.category} is your highest expense area at ₹${topCat.amount.toLocaleString('en-IN')} (${catPct}% of total expenses).` 
      : 'No category spending recorded yet.',
    unusualSpending: unusualText,
    budgetSuggestions: [
      totalExpenses > totalIncome
        ? '⚠️ Your total expenses currently exceed your income. Prioritize essential hostel/mess fees first.'
        : `✅ You are staying within your total allowance. Keep reserving at least 15-20% for emergency campus needs.`,
      topCat.amount > 0 ? `Consider capping ${topCat.category} expenses to under ₹${Math.round(topCat.amount * 0.85).toLocaleString('en-IN')} next month.` : 'Track daily minor food & xerox expenses.'
    ],
    savingSuggestions: [
      'Pack a snack box from hostel to reduce daily campus canteen impulse spending.',
      'Check out the GitHub Student Developer Pack and Spotify Student discounts to save on tech tools.',
      'Share textbook costs or use college library digital copies.'
    ],
    personalizedAdvice: `As a first-year student, building consistent tracking habits now ensures your monthly pocket money lasts throughout the semester.`
  };
}

/**
 * Generate AI Insights by passing pre-calculated statistics to Google Gemini API
 */
async function generateAIInsights(stats) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.log('ℹ️ GEMINI_API_KEY not configured. Using structured rule-based backend insights.');
    return generateRuleBasedFallback(stats);
  }

  const prompt = `
System Role & Guidelines:
- You are an AI Financial Advisor in a student expense tracker web app.
- This is a student expense tracker for college students (e.g. 1st year CSE student).
- Give practical, understandable, and encouraging advice.
- Do NOT make basic calculations yourself; base all observations strictly on the supplied pre-computed database statistics below.
- Do NOT claim certainty when the data is insufficient.
- Do NOT provide investment, loan, tax, or medical advice.
- Do NOT invent expenses or transactions not present in the supplied data.
- Base observations ONLY on the supplied structured statistics.

Supplied Pre-calculated Database Statistics:
- Total Income: ₹${stats.totalIncome}
- Total Expenses: ₹${stats.totalExpenses}
- Net Balance: ₹${stats.balance}
- Category Totals: ${JSON.stringify(stats.categoryTotals)}
- Monthly Income vs Expense Trends: ${JSON.stringify(stats.monthlyTotals)}
- Recent Spending Patterns: ${JSON.stringify(stats.recentSpendingPatterns)}

Respond ONLY with a JSON object in the exact format:
{
  "spendingSummary": "A concise 2-sentence summary of the student's financial state.",
  "highestCategory": "Observation about their top expense category and percentage.",
  "unusualSpending": "Comment on any high purchase spiker or say no unusual spending detected.",
  "budgetSuggestions": ["Suggestion 1", "Suggestion 2"],
  "savingSuggestions": ["Saving tip 1", "Saving tip 2"],
  "personalizedAdvice": "Personalized student-friendly encouragement for campus living."
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      console.warn(`AI API returned status ${response.status}. Falling back to rule-based insights.`);
      return generateRuleBasedFallback(stats);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return generateRuleBasedFallback(stats);
    }

    const parsedJSON = JSON.parse(rawText);
    return {
      isFallback: false,
      spendingSummary: parsedJSON.spendingSummary || '',
      highestCategory: parsedJSON.highestCategory || '',
      unusualSpending: parsedJSON.unusualSpending || '',
      budgetSuggestions: parsedJSON.budgetSuggestions || [],
      savingSuggestions: parsedJSON.savingSuggestions || [],
      personalizedAdvice: parsedJSON.personalizedAdvice || ''
    };
  } catch (err) {
    console.error('AI API Call Error:', err.message);
    return generateRuleBasedFallback(stats);
  }
}

/**
 * Generate fallback response for chat questions directly from calculated statistics
 * if API key is missing or external AI call fails.
 */
function generateChatRuleBasedFallback(question, stats) {
  const q = (question || '').toLowerCase();
  const { totalIncome, totalExpenses, balance, categoryTotals, monthlyTotals, thisMonthExpense, lastMonthExpense, recentSpendingPatterns } = stats;

  // Find top category
  let topCat = { category: 'None', amount: 0 };
  (categoryTotals || []).forEach(c => {
    const amt = Number(c.total_amount || c.amount || 0);
    if (amt > topCat.amount) {
      topCat = { category: c.category, amount: amt };
    }
  });
  const catPct = totalExpenses > 0 ? Math.round((topCat.amount / totalExpenses) * 100) : 0;

  // 1. Where spending the most?
  if (q.includes('spending the most') || q.includes('highest spending') || q.includes('most expensive')) {
    if (topCat.amount > 0) {
      return `You are spending the most on **${topCat.category}**, totaling **₹${topCat.amount.toLocaleString('en-IN')}** (${catPct}% of your total expenses).`;
    }
    return 'You have not recorded any expenses yet to determine your top spending area.';
  }

  // 2. How much did I spend on food / specific category?
  if (q.includes('food') || q.includes('canteen') || q.includes('eating out')) {
    const foodCat = (categoryTotals || []).find(c => c.category.toLowerCase() === 'food');
    const foodAmt = foodCat ? Number(foodCat.total_amount || 0) : 0;
    if (foodAmt > 0) {
      return `You have spent a total of **₹${foodAmt.toLocaleString('en-IN')}** on **Food**.`;
    }
    return 'I checked your recorded transactions, and you have not logged any expenses under **Food** yet.';
  }

  // 3. Give me a budget for next month
  if (q.includes('budget') || q.includes('next month')) {
    const avgExpense = totalExpenses > 0 ? totalExpenses : 5000;
    const suggestedCap = Math.round(avgExpense * 0.9);
    return `Based on your current spending, here is a suggested budget for next month:\n` +
      `• **Total Spending Cap:** ₹${suggestedCap.toLocaleString('en-IN')}\n` +
      `• **Food & Mess:** ~40% (₹${Math.round(suggestedCap * 0.4).toLocaleString('en-IN')})\n` +
      `• **Education & Books:** ~25% (₹${Math.round(suggestedCap * 0.25).toLocaleString('en-IN')})\n` +
      `• **Emergency Savings:** Reserve at least ₹${Math.round(suggestedCap * 0.15).toLocaleString('en-IN')}.`;
  }

  // 4. How can I reduce my spending?
  if (q.includes('reduce') || q.includes('cut down') || q.includes('save money') || q.includes('spending habits')) {
    let advice = 'Here are student-friendly ways to reduce your spending:\n';
    if (topCat.amount > 0) {
      advice += `1. **Target ${topCat.category}:** Try reducing this top category by 15% (save ~₹${Math.round(topCat.amount * 0.15).toLocaleString('en-IN')}).\n`;
    }
    advice += `2. **Avoid impulse canteen snacks:** Carry a reusable bottle and hostel snacks.\n`;
    advice += `3. **Use student perks:** Claim GitHub Student Pack, Spotify Student, and free campus Wi-Fi library resources.`;
    return advice;
  }

  // 5. Compare this month with last month
  if (q.includes('compare') || q.includes('last month') || q.includes('this month')) {
    const thisMonth = Number(thisMonthExpense || 0);
    const lastMonth = Number(lastMonthExpense || 0);
    const diff = thisMonth - lastMonth;

    if (lastMonth === 0 && thisMonth === 0) {
      return 'Insufficient monthly data to compare. Both this month and last month have ₹0 recorded expenses.';
    }

    if (lastMonth === 0) {
      return `This month's expenses are **₹${thisMonth.toLocaleString('en-IN')}**. (No expenses were recorded for last month to calculate a percentage change).`;
    }

    const pctChange = Math.round((Math.abs(diff) / lastMonth) * 100);
    if (diff > 0) {
      return `You spent **₹${thisMonth.toLocaleString('en-IN')}** this month compared to **₹${lastMonth.toLocaleString('en-IN')}** last month (+${pctChange}% increase, ₹${diff.toLocaleString('en-IN')} higher).`;
    } else if (diff < 0) {
      return `Great news! You spent **₹${thisMonth.toLocaleString('en-IN')}** this month compared to **₹${lastMonth.toLocaleString('en-IN')}** last month (-${pctChange}% reduction, saved ₹${Math.abs(diff).toLocaleString('en-IN')}).`;
    } else {
      return `Your spending is identical for both months at **₹${thisMonth.toLocaleString('en-IN')}**.`;
    }
  }

  // Generic fallback if question doesn't match above patterns
  return `Based on your recorded data:\n` +
    `• Total Income: ₹${totalIncome.toLocaleString('en-IN')}\n` +
    `• Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}\n` +
    `• Net Balance: ₹${balance.toLocaleString('en-IN')}\n` +
    (topCat.amount > 0 ? `• Highest Category: ${topCat.category} (₹${topCat.amount.toLocaleString('en-IN')})\n` : '') +
    `If your question asks about a specific item or period not recorded in the app, it cannot be determined from your current database records.`;
}

/**
 * Generate AI Chat Response using Google Gemini API or intelligent fallback
 */
async function generateAIChatResponse(userQuestion, history, stats) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.log('ℹ️ GEMINI_API_KEY not configured. Using rule-based finance assistant fallback.');
    return {
      reply: generateChatRuleBasedFallback(userQuestion, stats),
      isFallback: true
    };
  }

  const prompt = `
System Role & Strict Guidelines:
- You are an AI Student Finance Assistant embedded in a student expense tracker web application.
- Answer the student's question concisely, clearly, and in a friendly, encouraging tone.
- Base ALL numerical answers, category amounts, and observations STRICTLY on the pre-computed database statistics provided below.
- Do NOT invent or hallucinate transaction details, dates, or amounts.
- IF THE USER ASKS ABOUT SOMETHING THAT CANNOT BE DETERMINED FROM THE DATA (e.g. expenses for a category with 0 transactions, or specific items not logged), state clearly that the requested information cannot be found in their recorded data.
- Keep responses short, direct, practical, and formatted cleanly with markdown bolding and bullet points where helpful.

Database Statistics (Truth Source):
- Total Income: ₹${stats.totalIncome}
- Total Expenses: ₹${stats.totalExpenses}
- Current Net Balance: ₹${stats.balance}
- Current Month Expense: ₹${stats.thisMonthExpense}
- Previous Month Expense: ₹${stats.lastMonthExpense}
- Category Breakdown: ${JSON.stringify(stats.categoryTotals)}
- Monthly Income vs Expense Trends: ${JSON.stringify(stats.monthlyTotals)}
- Recent Recorded Transactions: ${JSON.stringify(stats.recentSpendingPatterns)}

User Question: "${userQuestion}"
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      console.warn(`AI API returned status ${response.status}. Falling back to rule-based chat.`);
      return {
        reply: generateChatRuleBasedFallback(userQuestion, stats),
        isFallback: true
      };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText || rawText.trim() === '') {
      return {
        reply: generateChatRuleBasedFallback(userQuestion, stats),
        isFallback: true
      };
    }

    return {
      reply: rawText.trim(),
      isFallback: false
    };
  } catch (err) {
    console.error('AI Chat API Call Error:', err.message);
    return {
      reply: generateChatRuleBasedFallback(userQuestion, stats),
      isFallback: true
    };
  }
}

module.exports = {
  generateAIInsights,
  generateRuleBasedFallback,
  generateAIChatResponse,
  generateChatRuleBasedFallback
};

