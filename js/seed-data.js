/**
 * Seed Data for Budget Tool
 * Provides realistic demo data and utilities for resetting
 */

const SEED_DATA = {
  // Demo transactions
  transactions: [
    { id: 'txn-001', type: 'expense', description: 'Whole Foods Market', amount: 127.43, category: 'cat-groceries', account: 'acc-checking', date: '2026-03-21', tags: ['groceries', 'food'] },
    { id: 'txn-002', type: 'expense', description: 'Starbucks', amount: 6.50, category: 'cat-dining', account: 'acc-checking', date: '2026-03-21', tags: ['coffee'] },
    { id: 'txn-003', type: 'expense', description: 'AWS Invoice', amount: 250.00, category: 'cat-utilities', account: 'acc-checking', date: '2026-03-20', tags: ['infrastructure', 'work'] },
    { id: 'txn-004', type: 'income', description: 'Monthly Salary', amount: 5000.00, incomeSource: 'src-salary', account: 'acc-checking', date: '2026-03-15', tags: ['salary', 'recurring'] },
    { id: 'txn-005', type: 'expense', description: 'Nike Running Shoes', amount: 129.99, category: 'cat-shopping', account: 'acc-checking', date: '2026-03-19', tags: ['clothing', 'sports'] },
    { id: 'txn-006', type: 'expense', description: 'Chipotle', amount: 14.50, category: 'cat-dining', account: 'acc-checking', date: '2026-03-18', tags: ['lunch'] },
    { id: 'txn-007', type: 'expense', description: 'Verizon Mobile Bill', amount: 89.99, category: 'cat-utilities', account: 'acc-checking', date: '2026-03-17', tags: ['mobile', 'recurring'] },
    { id: 'txn-008', type: 'expense', description: 'Costco Shopping', amount: 156.20, category: 'cat-groceries', account: 'acc-checking', date: '2026-03-16', tags: ['bulk', 'groceries'] },
    { id: 'txn-009', type: 'expense', description: 'Movie Tickets', amount: 32.00, category: 'cat-entertainment', account: 'acc-checking', date: '2026-03-14', tags: ['entertainment'] },
    { id: 'txn-010', type: 'expense', description: 'Netflix Subscription', amount: 15.99, category: 'cat-entertainment', account: 'acc-checking', date: '2026-03-01', tags: ['subscription', 'recurring'] },
  ],

  // Demo accounts
  accounts: [
    { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 2500.00, currency: 'USD' },
    { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 5000.00, currency: 'USD' },
    { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: -150.00, currency: 'USD' },
  ],

  // Demo categories (expanded)
  categories: [
    { id: 'cat-groceries', name: 'Groceries', emoji: '🛒', color: '#4ade80', budgetLimit: 500 },
    { id: 'cat-dining', name: 'Dining', emoji: '🍔', color: '#f97316', budgetLimit: 300 },
    { id: 'cat-utilities', name: 'Utilities', emoji: '💡', color: '#06b6d4', budgetLimit: 200 },
    { id: 'cat-shopping', name: 'Shopping', emoji: '🛍️', color: '#ec4899', budgetLimit: 400 },
    { id: 'cat-entertainment', name: 'Entertainment', emoji: '🎬', color: '#a78bfa', budgetLimit: 200 },
    { id: 'cat-transportation', name: 'Transportation', emoji: '🚗', color: '#fb923c', budgetLimit: 250 },
    { id: 'cat-healthcare', name: 'Healthcare', emoji: '⚕️', color: '#ef4444', budgetLimit: 150 },
  ],

  // Demo income sources
  incomeSources: [
    { id: 'src-salary', name: 'Salary', emoji: '💼', isRecurring: true, frequency: 'monthly' },
    { id: 'src-freelance', name: 'Freelance', emoji: '💻', isRecurring: false, frequency: 'ad-hoc' },
    { id: 'src-investment', name: 'Investment Returns', emoji: '📈', isRecurring: true, frequency: 'quarterly' },
    { id: 'src-other', name: 'Other', emoji: '💵', isRecurring: false, frequency: 'ad-hoc' },
  ],

  // Demo budgets
  budgets: [
    { id: 'bud-groceries', name: 'Groceries', categoryId: 'cat-groceries', emoji: '🛒', limit: 500, spent: 283.63, color: '#4ade80' },
    { id: 'bud-dining', name: 'Dining', categoryId: 'cat-dining', emoji: '🍔', limit: 300, spent: 53.00, color: '#f97316' },
    { id: 'bud-utilities', name: 'Utilities', categoryId: 'cat-utilities', emoji: '💡', limit: 200, spent: 340.00, color: '#06b6d4' }, // Over budget for demo
    { id: 'bud-shopping', name: 'Shopping', categoryId: 'cat-shopping', emoji: '🛍️', limit: 400, spent: 129.99, color: '#ec4899' },
    { id: 'bud-entertainment', name: 'Entertainment', categoryId: 'cat-entertainment', emoji: '🎬', limit: 200, spent: 47.99, color: '#a78bfa' },
  ],

  // Demo goals
  goals: [
    { id: 'goal-emergency', name: 'Emergency Fund', emoji: '🚨', target: 10000, current: 5000, targetDate: '2026-12-31', category: 'savings', isActive: true },
    { id: 'goal-vacation', name: 'Vacation to Japan', emoji: '✈️', target: 5000, current: 2150, targetDate: '2026-08-31', category: 'travel', isActive: true },
    { id: 'goal-laptop', name: 'New Laptop', emoji: '💻', target: 2000, current: 500, targetDate: '2026-06-30', category: 'tech', isActive: true },
  ],

  // Demo bills (recurring)
  bills: [
    { id: 'bill-rent', description: 'Apartment Rent', amount: 1500.00, dueDate: '2026-04-01', category: 'housing', isRecurring: true, frequency: 'monthly', status: 'pending' },
    { id: 'bill-internet', description: 'Internet Bill', amount: 79.99, dueDate: '2026-03-25', category: 'utilities', isRecurring: true, frequency: 'monthly', status: 'pending' },
    { id: 'bill-insurance', description: 'Car Insurance', amount: 120.00, dueDate: '2026-03-28', category: 'insurance', isRecurring: true, frequency: 'monthly', status: 'pending' },
    { id: 'bill-gym', description: 'Gym Membership', amount: 49.99, dueDate: '2026-03-29', category: 'health', isRecurring: true, frequency: 'monthly', status: 'pending' },
  ],
};

/**
 * Initialize app with seed data
 * @param {Object} appState - The app's reactive state
 */
function initializeSeedData(appState) {
  // Load transactions
  appState.transactions = [...SEED_DATA.transactions];
  
  // Load accounts
  appState.accounts = [...SEED_DATA.accounts];
  
  // Load categories
  appState.categories = [...SEED_DATA.categories];
  
  // Load income sources
  appState.incomeSources = [...SEED_DATA.incomeSources];
  
  // Load budgets
  appState.budgets = [...SEED_DATA.budgets];
  
  // Load goals
  appState.goals = [...SEED_DATA.goals];
  
  // Load bills
  appState.bills = [...SEED_DATA.bills];
  
  // Persist to IndexedDB
  saveAllData(appState);
}

/**
 * Clear all data and reset to empty state
 * @param {Object} appState - The app's reactive state
 */
function clearAllData(appState) {
  appState.transactions = [];
  appState.accounts = [
    { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 0, currency: 'USD' },
    { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 0, currency: 'USD' },
    { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: 0, currency: 'USD' },
  ];
  appState.budgets = [];
  appState.goals = [];
  appState.bills = [];
  
  // Keep categories and income sources for next entry
  appState.categories = [...SEED_DATA.categories];
  appState.incomeSources = [...SEED_DATA.incomeSources];
  
  // Clear from IndexedDB
  clearAllIndexedDB();
}

/**
 * Save all data to IndexedDB
 */
function saveAllData(appState) {
  const db = window.app?.__openedDB;
  if (!db) return;
  
  try {
    const txn = db.transaction(['transactions', 'accounts', 'budgets', 'goals', 'bills'], 'readwrite');
    
    // Save transactions
    const txnStore = txn.objectStore('transactions');
    txnStore.clear();
    appState.transactions.forEach(t => txnStore.add(t));
    
    // Save accounts
    const accStore = txn.objectStore('accounts');
    accStore.clear();
    appState.accounts.forEach(a => accStore.add(a));
    
    // Save budgets
    const budStore = txn.objectStore('budgets');
    budStore.clear();
    appState.budgets.forEach(b => budStore.add(b));
    
    // Save goals
    const goalStore = txn.objectStore('goals');
    goalStore.clear();
    appState.goals.forEach(g => goalStore.add(g));
    
    // Save bills
    const billStore = txn.objectStore('bills');
    billStore.clear();
    appState.bills.forEach(b => billStore.add(b));
  } catch (err) {
    console.warn('Failed to save seed data to IndexedDB:', err);
  }
}

/**
 * Clear all data from IndexedDB
 */
function clearAllIndexedDB() {
  const db = window.app?.__openedDB;
  if (!db) return;
  
  try {
    const txn = db.transaction(['transactions', 'accounts', 'budgets', 'goals', 'bills'], 'readwrite');
    txn.objectStore('transactions').clear();
    txn.objectStore('accounts').clear();
    txn.objectStore('budgets').clear();
    txn.objectStore('goals').clear();
    txn.objectStore('bills').clear();
  } catch (err) {
    console.warn('Failed to clear IndexedDB:', err);
  }
}

// Export for use in app.js
window.SeedDataUtils = {
  SEED_DATA,
  initializeSeedData,
  clearAllData,
};
