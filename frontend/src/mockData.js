export const CATEGORIES = [
  { name: 'Food', icon: 'Utensils', color: '#f59e0b' },
  { name: 'Transport', icon: 'Bus', color: '#10b981' },
  { name: 'Education', icon: 'BookOpen', color: '#6366f1' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'Entertainment', icon: 'Film', color: '#f43f5e' },
  { name: 'Bills', icon: 'Home', color: '#8b5cf6' },
  { name: 'Health', icon: 'HeartPulse', color: '#ef4444' },
  { name: 'Other', icon: 'Tag', color: '#64748b' },
];

export const MONTHLY_TREND_DATA = [
  { month: 'May', income: 7500, expense: 5200 },
  { month: 'Jun', income: 8000, expense: 6100 },
  { month: 'Jul', income: 9000, expense: 5800 },
  { month: 'Aug', income: 8500, expense: 6400 },
  { month: 'Sep', income: 10500, expense: 4949 },
];

export const INITIAL_AI_INSIGHTS = [
  {
    id: 'ai-1',
    type: 'warning',
    title: 'Canteen Spending Alert',
    description: 'You spent 35% more on food & campus canteen this week compared to last week. Consider packing a snack box!',
    impact: 'Potential saving: ₹400/week',
    actionText: 'Set Canteen Limit',
  },
  {
    id: 'ai-2',
    type: 'success',
    title: 'Great Savings Goal Progress!',
    description: 'You saved 32% of your monthly pocket money so far. You are on track to fund your Tech Fest workshop ticket.',
    impact: 'Saved ₹2,500 this month',
    actionText: 'View Savings Target',
  },
  {
    id: 'ai-3',
    type: 'info',
    title: 'Upcoming Fixed Recurring Expense',
    description: 'Hostel mess dues (approx ₹3,500) will be due in 18 days. Ensure minimum balance is reserved.',
    impact: 'Due: Oct 1, 2026',
    actionText: 'Remind Me',
  },
  {
    id: 'ai-4',
    type: 'tip',
    title: 'Student Discount Opportunity',
    description: 'We detected 2 tech subscriptions. GitHub Student Developer Pack provides free cloud credits and tools.',
    impact: 'Save up to ₹1,200/mo',
    actionText: 'Explore Perks',
  },
];

export const USER_PROFILE = {
  name: 'Alex Sharma',
  role: 'B.Tech CSE - 1st Year',
  college: 'National Institute of Technology',
  monthlyBudget: 6000,
  currency: '₹',
  email: 'alex.cse26@student.edu',
};
