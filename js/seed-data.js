/**
 * Comprehensive Seed Data for Budget Tool
 * Realistic demo data across all features
 */

const SEED_DATA = {
  // Realistic transaction history (past 3 months)
  transactions: [
    // March 2026
    { id: 'txn-001', type: 'income', description: 'Monthly Salary', amount: 5000.00, incomeSource: 'src-salary', account: 'acc-checking', date: '2026-03-15', tags: ['salary', 'recurring'], isRecurring: true, frequency: 'monthly' },
    { id: 'txn-002', type: 'expense', description: 'Whole Foods Market', amount: 127.43, category: 'cat-groceries', account: 'acc-checking', date: '2026-03-21', tags: ['groceries'] },
    { id: 'txn-003', type: 'expense', description: 'Starbucks Coffee', amount: 6.50, category: 'cat-coffee', account: 'acc-checking', date: '2026-03-21', tags: ['coffee'] },
    { id: 'txn-004', type: 'expense', description: 'Chipotle Lunch', amount: 14.50, category: 'cat-dining', account: 'acc-checking', date: '2026-03-21', tags: ['lunch'] },
    { id: 'txn-005', type: 'expense', description: 'Nike Running Shoes', amount: 129.99, category: 'cat-shopping', account: 'acc-checking', date: '2026-03-19', tags: ['clothing'] },
    { id: 'txn-006', type: 'expense', description: 'Verizon Mobile Bill', amount: 89.99, category: 'cat-utilities', account: 'acc-checking', date: '2026-03-17', tags: ['mobile', 'recurring'], isRecurring: true, frequency: 'monthly' },
    { id: 'txn-007', type: 'expense', description: 'Costco Shopping', amount: 156.20, category: 'cat-groceries', account: 'acc-checking', date: '2026-03-16', tags: ['bulk'] },
    { id: 'txn-008', type: 'expense', description: 'Shell Gas Station', amount: 58.00, category: 'cat-gas', account: 'acc-checking', date: '2026-03-16', tags: ['fuel'] },
    { id: 'txn-009', type: 'expense', description: 'Movie Tickets (2x)', amount: 32.00, category: 'cat-entertainment', account: 'acc-checking', date: '2026-03-14', tags: ['movies'] },
    { id: 'txn-010', type: 'expense', description: 'Netflix Subscription', amount: 15.99, category: 'cat-entertainment', account: 'acc-checking', date: '2026-03-01', tags: ['subscription', 'recurring'], isRecurring: true, frequency: 'monthly' },
    { id: 'txn-011', type: 'expense', description: 'CVS Pharmacy', amount: 32.45, category: 'cat-healthcare', account: 'acc-checking', date: '2026-03-13', tags: ['medicine'] },
    { id: 'txn-012', type: 'expense', description: 'Uber to Airport', amount: 47.50, category: 'cat-transport', account: 'acc-checking', date: '2026-03-12', tags: ['uber'] },
    { id: 'txn-013', type: 'expense', description: 'Trader Joe\\'s Groceries', amount: 98.76, category: 'cat-groceries', account: 'acc-checking', date: '2026-03-11', tags: ['groceries'] },
    { id: 'txn-014', type: 'expense', description: 'Starbucks Coffee', amount: 5.45, category: 'cat-coffee', account: 'acc-checking', date: '2026-03-10', tags: ['coffee'] },
    { id: 'txn-015', type: 'expense', description: 'Pizza Hut Delivery', amount: 28.99, category: 'cat-dining', account: 'acc-checking', date: '2026-03-09', tags: ['dinner'] },
    
    // February 2026
    { id: 'txn-016', type: 'income', description: 'Monthly Salary', amount: 5000.00, incomeSource: 'src-salary', account: 'acc-checking', date: '2026-02-15', tags: ['salary', 'recurring'], isRecurring: true, frequency: 'monthly' },
    { id: 'txn-017', type: 'expense', description: 'Safeway Groceries', amount: 143.22, category: 'cat-groceries', account: 'acc-checking', date: '2026-02-28', tags: ['groceries'] },
    { id: 'txn-018', type: 'expense', description: 'Verizon Mobile Bill', amount: 89.99, category: 'cat-utilities', account: 'acc-checking', date: '2026-02-17', tags: ['mobile', 'recurring'] },
    { id: 'txn-019', type: 'expense', description: 'Netflix Subscription', amount: 15.99, category: 'cat-entertainment', account: 'acc-checking', date: '2026-02-01', tags: ['subscription', 'recurring'] },
    { id: 'txn-020', type: 'expense', description: 'Target Shopping', amount: 87.34, category: 'cat-shopping', account: 'acc-checking', date: '2026-02-22', tags: ['misc'] },
    { id: 'txn-021', type: 'expense', description: 'Shell Gas Station', amount: 62.00, category: 'cat-gas', account: 'acc-checking', date: '2026-02-20', tags: ['fuel'] },
    { id: 'txn-022', type: 'expense', description: 'Starbucks Coffee', amount: 6.25, category: 'cat-coffee', account: 'acc-checking', date: '2026-02-19', tags: ['coffee'] },
    { id: 'txn-023', type: 'expense', description: 'Dine-In Restaurant', amount: 65.00, category: 'cat-dining', account: 'acc-checking', date: '2026-02-18', tags: ['dinner'] },
    { id: 'txn-024', type: 'expense', description: 'Apple Watch Band', amount: 99.99, category: 'cat-shopping', account: 'acc-checking', date: '2026-02-14', tags: ['tech'] },
    { id: 'txn-025', type: 'income', description: 'Freelance Project', amount: 1200.00, incomeSource: 'src-freelance', account: 'acc-checking', date: '2026-02-10', tags: ['freelance'] },
    
    // January 2026
    { id: 'txn-026', type: 'income', description: 'Monthly Salary', amount: 5000.00, incomeSource: 'src-salary', account: 'acc-checking', date: '2026-01-15', tags: ['salary', 'recurring'], isRecurring: true, frequency: 'monthly' },
    { id: 'txn-027', type: 'expense', description: 'Whole Foods', amount: 134.56, category: 'cat-groceries', account: 'acc-checking', date: '2026-01-28', tags: ['groceries'] },
    { id: 'txn-028', type: 'expense', description: 'Netflix Subscription', amount: 15.99, category: 'cat-entertainment', account: 'acc-checking', date: '2026-01-01', tags: ['subscription', 'recurring'] },
    { id: 'txn-029', type: 'expense', description: 'Verizon Bill', amount: 89.99, category: 'cat-utilities', account: 'acc-checking', date: '2026-01-17', tags: ['mobile', 'recurring'] },
    { id: 'txn-030', type: 'expense', description: 'Uber Rides (3x)', amount: 52.47, category: 'cat-transport', account: 'acc-checking', date: '2026-01-25', tags: ['uber'] },
    { id: 'txn-031', type: 'expense', description: 'Starbucks Coffee', amount: 5.95, category: 'cat-coffee', account: 'acc-checking', date: '2026-01-20', tags: ['coffee'] },
    { id: 'txn-032', type: 'expense', description: 'Shell Gas', amount: 55.00, category: 'cat-gas', account: 'acc-checking', date: '2026-01-19', tags: ['fuel'] },
    { id: 'txn-033', type: 'expense', description: 'Japanese Restaurant', amount: 48.00, category: 'cat-dining', account: 'acc-checking', date: '2026-01-18', tags: ['dinner'] },
    { id: 'txn-034', type: 'expense', description: 'CVS Pharmacy', amount: 18.76, category: 'cat-healthcare', account: 'acc-checking', date: '2026-01-12', tags: ['medicine'] },
    { id: 'txn-035', type: 'expense', description: 'Amazon Purchase', amount: 79.99, category: 'cat-shopping', account: 'acc-checking', date: '2026-01-08', tags: ['online'] },
  ],

  // Accounts with realistic balances
  accounts: [
    { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 7342.15, apr: 0, minPayment: 0 },
    { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 8750.00, apr: 4.5, minPayment: 0 },
    { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: -742.34, limit: 10000, apr: 18.9, minPayment: 25 },
  ],

  // Categories (same as app initializes)
  categories: [
    { id: 'cat-groceries', name: 'Groceries', emoji: '🛒', color: '#4ade80' },
    { id: 'cat-dining', name: 'Dining', emoji: '🍔', color: '#f97316' },
    { id: 'cat-coffee', name: 'Coffee', emoji: '☕', color: '#a16207' },
    { id: 'cat-gas', name: 'Gas', emoji: '⛽', color: '#ef4444' },
    { id: 'cat-shopping', name: 'Shopping', emoji: '🛍️', color: '#ec4899' },
    { id: 'cat-utilities', name: 'Utilities', emoji: '💡', color: '#06b6d4' },
    { id: 'cat-healthcare', name: 'Healthcare', emoji: '⚕️', color: '#8b5cf6' },
    { id: 'cat-entertainment', name: 'Entertainment', emoji: '🎬', color: '#6366f1' },
    { id: 'cat-transport', name: 'Transport', emoji: '🚕', color: '#10b981' },
    { id: 'cat-other', name: 'Other', emoji: '📌', color: '#6b7280' },
  ],

  // Income sources
  incomeSources: [
    { id: 'src-salary', name: 'Salary', emoji: '💼', isRecurring: true, frequency: 'monthly' },
    { id: 'src-freelance', name: 'Freelance', emoji: '💻', isRecurring: false, frequency: 'ad-hoc' },
    { id: 'src-investment', name: 'Investment Returns', emoji: '📈', isRecurring: true, frequency: 'quarterly' },
    { id: 'src-other', name: 'Other', emoji: '💵', isRecurring: false, frequency: 'ad-hoc' },
  ],

  // Budgets with realistic spent amounts
  budgets: [
    { id: 'bud-groceries', name: 'Groceries', categoryId: 'cat-groceries', emoji: '🛒', limit: 500, spent: 460.17, color: '#4ade80' },
    { id: 'bud-dining', name: 'Dining', categoryId: 'cat-dining', emoji: '🍔', limit: 300, spent: 156.49, color: '#f97316' },
    { id: 'bud-utilities', name: 'Utilities', categoryId: 'cat-utilities', emoji: '💡', limit: 200, spent: 179.98, color: '#06b6d4' },
    { id: 'bud-shopping', name: 'Shopping', categoryId: 'cat-shopping', emoji: '🛍️', limit: 400, spent: 397.31, color: '#ec4899' },
    { id: 'bud-entertainment', name: 'Entertainment', categoryId: 'cat-entertainment', emoji: '🎬', limit: 150, spent: 63.97, color: '#6366f1' },
    { id: 'bud-gas', name: 'Gas', categoryId: 'cat-gas', emoji: '⛽', limit: 300, spent: 237.47, color: '#ef4444' },
    { id: 'bud-coffee', name: 'Coffee', categoryId: 'cat-coffee', emoji: '☕', limit: 100, spent: 59.90, color: '#a16207' },
    { id: 'bud-transport', name: 'Transport', categoryId: 'cat-transport', emoji: '🚕', limit: 200, spent: 144.84, color: '#10b981' },
  ],

  // Financial goals
  goals: [
    { id: 'goal-emergency', name: 'Emergency Fund', emoji: '🚨', target: 15000, current: 8750, targetDate: '2026-12-31', category: 'savings', isActive: true, monthlyContribution: 500 },
    { id: 'goal-vacation', name: 'Vacation to Japan', emoji: '✈️', target: 5000, current: 2150, targetDate: '2026-08-31', category: 'travel', isActive: true, monthlyContribution: 400 },
    { id: 'goal-laptop', name: 'New Laptop', emoji: '💻', target: 2000, current: 850, targetDate: '2026-06-30', category: 'tech', isActive: true, monthlyContribution: 300 },
    { id: 'goal-car', name: 'Used Car Fund', emoji: '🚗', target: 12000, current: 4200, targetDate: '2027-01-31', category: 'transport', isActive: false, monthlyContribution: 250 },
  ],

  // Recurring bills
  bills: [
    { id: 'bill-rent', description: 'Apartment Rent', amount: 1500.00, dueDate: '2026-04-01', category: 'housing', isRecurring: true, frequency: 'monthly', status: 'pending', lastPaid: '2026-03-01' },
    { id: 'bill-internet', description: 'Internet Bill', amount: 79.99, dueDate: '2026-03-25', category: 'utilities', isRecurring: true, frequency: 'monthly', status: 'pending', lastPaid: '2026-02-25' },
    { id: 'bill-insurance', description: 'Car Insurance', amount: 120.00, dueDate: '2026-03-28', category: 'insurance', isRecurring: true, frequency: 'monthly', status: 'pending', lastPaid: '2026-02-28' },
    { id: 'bill-gym', description: 'Gym Membership', amount: 49.99, dueDate: '2026-03-29', category: 'health', isRecurring: true, frequency: 'monthly', status: 'pending', lastPaid: '2026-02-29' },
    { id: 'bill-subscriptions', description: 'Software Subscriptions', amount: 85.00, dueDate: '2026-04-05', category: 'other', isRecurring: true, frequency: 'monthly', status: 'pending', lastPaid: '2026-03-05' },
  ],
};

/**
 * Initialize app with realistic seed data
 */
function initializeSeedData(appState) {
  appState.transactions = [...SEED_DATA.transactions];
  appState.accounts = [...SEED_DATA.accounts];
  appState.categories = [...SEED_DATA.categories];
  appState.incomeSources = [...SEED_DATA.incomeSources];
  appState.budgets = [...SEED_DATA.budgets];
  appState.goals = [...SEED_DATA.goals];
  appState.bills = [...SEED_DATA.bills];
}

/**
 * Clear only demo data, keeping user's custom categories
 */
function wipeDemoData(appState) {
  appState.transactions = [];
  appState.budgets = [];
  appState.goals = [];
  appState.bills = [];
  
  // Reset accounts to empty state
  appState.accounts = [
    { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 0, apr: 0, minPayment: 0 },
    { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 0, apr: 0, minPayment: 0 },
    { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: 0, limit: 5000, apr: 18.9, minPayment: 25 },
  ];
  
  // Keep categories for user to reuse
  appState.categories = [...SEED_DATA.categories];
  appState.incomeSources = [...SEED_DATA.incomeSources];
}

// Export for use in app.js
window.SeedDataUtils = {
  SEED_DATA,
  initializeSeedData,
  wipeDemoData,
};
