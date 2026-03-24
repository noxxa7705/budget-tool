/**
 * Comprehensive demo data for Night Ledger.
 * Designed to show cross-feature interactions: transactions, budgets,
 * recurring items, goals, bills, account history, and richer transaction metadata.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const TODAY = new Date();
TODAY.setHours(12, 0, 0, 0);

function addDays(baseDate, offsetDays) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offsetDays);
  return date;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildReceiptSvg({ merchant, amount, date, accent = '#4ade80' }) {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
      <rect width="720" height="1080" fill="#f8fafc"/>
      <rect x="52" y="52" width="616" height="976" rx="18" fill="#ffffff" stroke="#d1d5db" stroke-width="4"/>
      <rect x="84" y="94" width="552" height="20" rx="10" fill="${accent}" opacity="0.2"/>
      <text x="360" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#111827">${merchant}</text>
      <text x="360" y="235" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Receipt Preview</text>
      <text x="96" y="320" font-family="monospace" font-size="24" fill="#111827">Date</text>
      <text x="624" y="320" text-anchor="end" font-family="monospace" font-size="24" fill="#111827">${date}</text>
      <line x1="96" y1="350" x2="624" y2="350" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8 8"/>
      <text x="96" y="430" font-family="Arial, sans-serif" font-size="26" fill="#374151">Items</text>
      <text x="624" y="430" text-anchor="end" font-family="Arial, sans-serif" font-size="26" fill="#374151">$${Number(amount).toFixed(2)}</text>
      <text x="96" y="500" font-family="Arial, sans-serif" font-size="22" fill="#6b7280">Seeded demo receipt for gallery preview.</text>
      <text x="96" y="570" font-family="Arial, sans-serif" font-size="22" fill="#6b7280">Linked to a seeded transaction.</text>
      <line x1="96" y1="640" x2="624" y2="640" stroke="#d1d5db" stroke-width="2"/>
      <text x="96" y="740" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">TOTAL</text>
      <text x="624" y="740" text-anchor="end" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111827">$${Number(amount).toFixed(2)}</text>
      <text x="360" y="960" text-anchor="middle" font-family="monospace" font-size="20" fill="#9ca3af">Night Ledger demo gallery</text>
    </svg>
  `);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function monthDate(monthOffset, dayOfMonth) {
  const year = TODAY.getFullYear();
  const monthIndex = TODAY.getMonth() + monthOffset;
  const safeDay = Math.min(dayOfMonth, daysInMonth(year, monthIndex));
  return formatDate(new Date(year, monthIndex, safeDay, 12, 0, 0, 0));
}

function timestampFor(date, timeOfDay = '12:00') {
  return new Date(`${date}T${timeOfDay}:00`).getTime();
}

function sameMonth(dateString, monthOffset = 0) {
  const date = new Date(dateString);
  return date.getFullYear() === TODAY.getFullYear() && date.getMonth() === TODAY.getMonth() + monthOffset;
}

function buildGoal(goal) {
  const createdAt = goal.createdAt || formatDate(addDays(TODAY, -60));
  const targetDate = goal.targetDate || formatDate(addDays(TODAY, 120));
  const targetDays = Math.max(1, Math.ceil((new Date(targetDate) - new Date(createdAt)) / DAY_MS));
  return {
    ...goal,
    createdAt,
    targetDate,
    targetDays,
    completed: Boolean(goal.completed),
  };
}

function txn(id, details) {
  const date = details.date;
  const timeOfDay = details.timeOfDay || '12:00';
  return {
    id,
    type: details.type || 'expense',
    description: details.description,
    amount: Number(details.amount || 0),
    category: details.category,
    incomeSource: details.incomeSource,
    account: details.account || 'acc-checking',
    date,
    timeOfDay,
    tags: details.tags || [],
    notes: details.notes || '',
    location: details.location || '',
    paymentMethod: details.paymentMethod || '',
    isSplit: Boolean(details.isSplit),
    splitItems: details.splitItems || [],
    attachments: details.attachments || [],
    receiptData: details.receiptData || null,
    isRecurring: Boolean(details.isRecurring),
    frequency: details.frequency,
    recurringId: details.recurringId,
    timestamp: details.timestamp || timestampFor(date, timeOfDay),
  };
}

function sumCurrentMonth(transactions, categoryId) {
  return transactions
    .filter((item) => item.type === 'expense' && item.category === categoryId && sameMonth(item.date, 0))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function buildSeedData() {
  const transactions = [
    // Current month
    txn('txn-001', {
      type: 'income',
      description: 'Primary Salary',
      amount: 5400,
      incomeSource: 'src-salary',
      account: 'acc-checking',
      date: monthDate(0, 2),
      timeOfDay: '08:00',
      tags: ['salary', 'recurring'],
      paymentMethod: 'bank-transfer',
      isRecurring: true,
      frequency: 'monthly',
      recurringId: 'rec-salary',
      notes: 'Core monthly payroll deposit.',
    }),
    txn('txn-002', {
      type: 'expense',
      description: 'Apartment Rent',
      amount: 1850,
      category: 'cat-housing',
      account: 'acc-checking',
      date: monthDate(0, 1),
      timeOfDay: '07:30',
      tags: ['housing', 'recurring'],
      paymentMethod: 'bank-transfer',
      isRecurring: true,
      frequency: 'monthly',
      recurringId: 'rec-rent',
      notes: 'Paid through ACH autopay.',
    }),
    txn('txn-003', {
      type: 'expense',
      description: 'FreshMart Weekly Groceries',
      amount: 142.67,
      category: 'cat-groceries',
      account: 'acc-checking',
      date: monthDate(0, 3),
      timeOfDay: '18:20',
      tags: ['groceries', 'essentials'],
      location: 'FreshMart - Downtown',
      paymentMethod: 'debit-card',
      receiptData: {
        merchant: 'FreshMart',
        amount: 142.67,
        date: monthDate(0, 3),
      },
      attachments: [
        { name: 'freshmart-receipt.jpg', size: 241188, type: 'image/jpeg' },
      ],
      notes: 'Stocked produce, protein, and pantry items for the week.',
    }),
    txn('txn-004', {
      type: 'expense',
      description: 'Neighbourhood Coffee',
      amount: 6.8,
      category: 'cat-coffee',
      account: 'acc-checking',
      date: monthDate(0, 3),
      timeOfDay: '09:12',
      tags: ['coffee'],
      location: 'Brew District',
      paymentMethod: 'mobile-pay',
    }),
    txn('txn-005', {
      type: 'expense',
      description: 'Monthly Transit Pass',
      amount: 58,
      category: 'cat-transport',
      account: 'acc-checking',
      date: monthDate(0, 4),
      timeOfDay: '07:05',
      tags: ['commute', 'monthly'],
      paymentMethod: 'credit-card',
    }),
    txn('txn-006', {
      type: 'expense',
      description: 'Streaming Bundle',
      amount: 24.99,
      category: 'cat-entertainment',
      account: 'acc-credit',
      date: monthDate(0, 5),
      timeOfDay: '06:00',
      tags: ['subscription', 'recurring'],
      paymentMethod: 'credit-card',
      isRecurring: true,
      frequency: 'monthly',
      recurringId: 'rec-streaming',
    }),
    txn('txn-007', {
      type: 'expense',
      description: 'Team Lunch',
      amount: 48.3,
      category: 'cat-dining',
      account: 'acc-credit',
      date: monthDate(0, 5),
      timeOfDay: '12:42',
      tags: ['lunch', 'social'],
      location: 'Miso House',
      paymentMethod: 'credit-card',
    }),
    txn('txn-008', {
      type: 'expense',
      description: 'Shell Fuel Stop',
      amount: 64.12,
      category: 'cat-gas',
      account: 'acc-checking',
      date: monthDate(0, 6),
      timeOfDay: '17:34',
      tags: ['fuel'],
      location: 'Shell Station 19',
      paymentMethod: 'debit-card',
    }),
    txn('txn-009', {
      type: 'expense',
      description: 'Pharmacy Refill',
      amount: 37.45,
      category: 'cat-healthcare',
      account: 'acc-checking',
      date: monthDate(0, 7),
      timeOfDay: '13:08',
      tags: ['health'],
      location: 'CarePlus Pharmacy',
      paymentMethod: 'debit-card',
    }),
    txn('txn-010', {
      type: 'expense',
      description: 'Cloud Storage + Tools',
      amount: 38,
      category: 'cat-software',
      account: 'acc-checking',
      date: monthDate(0, 8),
      timeOfDay: '05:30',
      tags: ['software', 'subscription'],
      paymentMethod: 'bank-transfer',
      isRecurring: true,
      frequency: 'monthly',
      recurringId: 'rec-tools',
    }),
    txn('txn-011', {
      type: 'income',
      description: 'Advisory Retainer',
      amount: 950,
      incomeSource: 'src-freelance',
      account: 'acc-checking',
      date: monthDate(0, 10),
      timeOfDay: '11:00',
      tags: ['freelance'],
      paymentMethod: 'bank-transfer',
      notes: 'Small consulting invoice paid.',
    }),
    txn('txn-012', {
      type: 'expense',
      description: 'Weekend Hotel',
      amount: 219,
      category: 'cat-travel',
      account: 'acc-credit',
      date: monthDate(0, 10),
      timeOfDay: '19:11',
      tags: ['travel'],
      location: 'Harbor Hotel',
      paymentMethod: 'credit-card',
      attachments: [
        { name: 'hotel-folio.pdf', size: 88211, type: 'application/pdf' },
      ],
    }),
    txn('txn-013', {
      type: 'expense',
      description: 'Farmers Market Run',
      amount: 86.2,
      category: 'cat-groceries',
      account: 'acc-checking',
      date: monthDate(0, 11),
      timeOfDay: '10:26',
      tags: ['groceries', 'split'],
      location: 'Saturday Market',
      paymentMethod: 'debit-card',
      isSplit: true,
      splitItems: [
        { description: 'Produce', amount: 34.2 },
        { description: 'Bakery', amount: 18 },
        { description: 'Specialty cheese', amount: 34 },
      ],
      notes: 'Good example transaction for split-item editing.',
    }),
    txn('txn-014', {
      type: 'expense',
      description: 'Electric Utility',
      amount: 112.4,
      category: 'cat-utilities',
      account: 'acc-checking',
      date: monthDate(0, 12),
      timeOfDay: '08:15',
      tags: ['utilities', 'recurring'],
      paymentMethod: 'bank-transfer',
      isRecurring: true,
      frequency: 'monthly',
      recurringId: 'rec-electric',
    }),
    txn('txn-015', {
      type: 'expense',
      description: 'Desk Lamp + Cables',
      amount: 132.55,
      category: 'cat-shopping',
      account: 'acc-credit',
      date: monthDate(0, 13),
      timeOfDay: '20:12',
      tags: ['home-office'],
      location: 'Northside Electronics',
      paymentMethod: 'credit-card',
      attachments: [
        { name: 'invoice-2187.pdf', size: 90111, type: 'application/pdf' },
      ],
    }),
    txn('txn-016', {
      type: 'expense',
      description: 'Dinner Out',
      amount: 67.9,
      category: 'cat-dining',
      account: 'acc-credit',
      date: monthDate(0, 15),
      timeOfDay: '20:40',
      tags: ['dinner'],
      location: 'Juniper Kitchen',
      paymentMethod: 'credit-card',
    }),
    txn('txn-017', {
      type: 'expense',
      description: 'SuperSaver Groceries',
      amount: 128.1,
      category: 'cat-groceries',
      account: 'acc-checking',
      date: monthDate(0, 17),
      timeOfDay: '18:05',
      tags: ['groceries'],
      location: 'SuperSaver',
      paymentMethod: 'debit-card',
    }),
    txn('txn-018', {
      type: 'expense',
      description: 'Rideshare Home',
      amount: 26.75,
      category: 'cat-transport',
      account: 'acc-checking',
      date: monthDate(0, 19),
      timeOfDay: '22:28',
      tags: ['rideshare'],
      paymentMethod: 'mobile-pay',
    }),
    txn('txn-019', {
      type: 'expense',
      description: 'Dental Copay',
      amount: 95,
      category: 'cat-healthcare',
      account: 'acc-checking',
      date: monthDate(0, 20),
      timeOfDay: '14:10',
      tags: ['health'],
      paymentMethod: 'debit-card',
      notes: 'Routine cleaning and exam.',
    }),
    txn('txn-020', {
      type: 'income',
      description: 'Savings Interest',
      amount: 27.14,
      incomeSource: 'src-investment',
      account: 'acc-savings',
      date: monthDate(0, 21),
      timeOfDay: '06:00',
      tags: ['interest'],
      paymentMethod: 'bank-transfer',
    }),
    txn('txn-021', {
      type: 'expense',
      description: 'Concert Tickets',
      amount: 144,
      category: 'cat-entertainment',
      account: 'acc-credit',
      date: monthDate(0, 22),
      timeOfDay: '21:15',
      tags: ['fun'],
      paymentMethod: 'credit-card',
    }),
    txn('txn-022', {
      type: 'expense',
      description: 'Morning Espresso',
      amount: 5.9,
      category: 'cat-coffee',
      account: 'acc-checking',
      date: monthDate(0, 23),
      timeOfDay: '08:48',
      tags: ['coffee'],
      location: 'Roast Lab',
      paymentMethod: 'mobile-pay',
    }),
    txn('txn-023', {
      type: 'expense',
      description: 'Hardware Store',
      amount: 73.88,
      category: 'cat-shopping',
      account: 'acc-checking',
      date: monthDate(0, 24),
      timeOfDay: '16:53',
      tags: ['home'],
      paymentMethod: 'debit-card',
    }),

    // Previous month
    txn('txn-024', {
      type: 'income',
      description: 'Primary Salary',
      amount: 5400,
      incomeSource: 'src-salary',
      account: 'acc-checking',
      date: monthDate(-1, 2),
      timeOfDay: '08:00',
      tags: ['salary', 'recurring'],
      paymentMethod: 'bank-transfer',
      recurringId: 'rec-salary',
    }),
    txn('txn-025', {
      type: 'expense',
      description: 'Apartment Rent',
      amount: 1850,
      category: 'cat-housing',
      account: 'acc-checking',
      date: monthDate(-1, 1),
      timeOfDay: '07:30',
      tags: ['housing', 'recurring'],
      paymentMethod: 'bank-transfer',
      recurringId: 'rec-rent',
    }),
    txn('txn-026', {
      type: 'expense',
      description: 'Neighborhood Grocer',
      amount: 136.44,
      category: 'cat-groceries',
      account: 'acc-checking',
      date: monthDate(-1, 4),
      timeOfDay: '18:10',
      tags: ['groceries'],
      paymentMethod: 'debit-card',
    }),
    txn('txn-027', {
      type: 'expense',
      description: 'Fuel Stop',
      amount: 59.22,
      category: 'cat-gas',
      account: 'acc-checking',
      date: monthDate(-1, 7),
      timeOfDay: '17:20',
      paymentMethod: 'debit-card',
    }),
    txn('txn-028', {
      type: 'expense',
      description: 'Client Dinner',
      amount: 74.15,
      category: 'cat-dining',
      account: 'acc-credit',
      date: monthDate(-1, 9),
      timeOfDay: '19:34',
      paymentMethod: 'credit-card',
    }),
    txn('txn-029', {
      type: 'income',
      description: 'Security Workshop',
      amount: 1250,
      incomeSource: 'src-freelance',
      account: 'acc-checking',
      date: monthDate(-1, 12),
      timeOfDay: '10:30',
      tags: ['freelance'],
      paymentMethod: 'bank-transfer',
    }),
    txn('txn-030', {
      type: 'expense',
      description: 'Electric Utility',
      amount: 118.9,
      category: 'cat-utilities',
      account: 'acc-checking',
      date: monthDate(-1, 13),
      timeOfDay: '08:12',
      paymentMethod: 'bank-transfer',
      recurringId: 'rec-electric',
    }),
    txn('txn-031', {
      type: 'expense',
      description: 'Streaming Bundle',
      amount: 24.99,
      category: 'cat-entertainment',
      account: 'acc-credit',
      date: monthDate(-1, 5),
      timeOfDay: '06:00',
      paymentMethod: 'credit-card',
      recurringId: 'rec-streaming',
    }),
    txn('txn-032', {
      type: 'expense',
      description: 'Weekend Getaway Train',
      amount: 98,
      category: 'cat-travel',
      account: 'acc-credit',
      date: monthDate(-1, 18),
      timeOfDay: '09:15',
      paymentMethod: 'credit-card',
    }),
    txn('txn-033', {
      type: 'expense',
      description: 'Cloud Storage + Tools',
      amount: 38,
      category: 'cat-software',
      account: 'acc-checking',
      date: monthDate(-1, 8),
      timeOfDay: '05:30',
      paymentMethod: 'bank-transfer',
      recurringId: 'rec-tools',
    }),

    // Two months ago
    txn('txn-034', {
      type: 'income',
      description: 'Primary Salary',
      amount: 5400,
      incomeSource: 'src-salary',
      account: 'acc-checking',
      date: monthDate(-2, 2),
      timeOfDay: '08:00',
      tags: ['salary', 'recurring'],
      paymentMethod: 'bank-transfer',
      recurringId: 'rec-salary',
    }),
    txn('txn-035', {
      type: 'expense',
      description: 'Apartment Rent',
      amount: 1850,
      category: 'cat-housing',
      account: 'acc-checking',
      date: monthDate(-2, 1),
      timeOfDay: '07:30',
      paymentMethod: 'bank-transfer',
      recurringId: 'rec-rent',
    }),
    txn('txn-036', {
      type: 'expense',
      description: 'Warehouse Club',
      amount: 164.33,
      category: 'cat-groceries',
      account: 'acc-checking',
      date: monthDate(-2, 6),
      timeOfDay: '18:45',
      paymentMethod: 'debit-card',
    }),
    txn('txn-037', {
      type: 'expense',
      description: 'Hardware + Supplies',
      amount: 88.4,
      category: 'cat-shopping',
      account: 'acc-credit',
      date: monthDate(-2, 8),
      timeOfDay: '16:05',
      paymentMethod: 'credit-card',
    }),
    txn('txn-038', {
      type: 'expense',
      description: 'Coffee Catch-up',
      amount: 11.4,
      category: 'cat-coffee',
      account: 'acc-checking',
      date: monthDate(-2, 11),
      timeOfDay: '09:50',
      paymentMethod: 'mobile-pay',
    }),
    txn('txn-039', {
      type: 'income',
      description: 'Incident Response Retainer',
      amount: 780,
      incomeSource: 'src-sidegig',
      account: 'acc-checking',
      date: monthDate(-2, 14),
      timeOfDay: '14:40',
      paymentMethod: 'bank-transfer',
    }),
    txn('txn-040', {
      type: 'expense',
      description: 'Electric Utility',
      amount: 109.88,
      category: 'cat-utilities',
      account: 'acc-checking',
      date: monthDate(-2, 12),
      timeOfDay: '08:10',
      paymentMethod: 'bank-transfer',
      recurringId: 'rec-electric',
    }),
    txn('txn-041', {
      type: 'expense',
      description: 'Concert Night',
      amount: 118,
      category: 'cat-entertainment',
      account: 'acc-credit',
      date: monthDate(-2, 19),
      timeOfDay: '20:10',
      paymentMethod: 'credit-card',
    }),
    txn('txn-042', {
      type: 'expense',
      description: 'Urgent Care Visit',
      amount: 82,
      category: 'cat-healthcare',
      account: 'acc-checking',
      date: monthDate(-2, 23),
      timeOfDay: '15:25',
      paymentMethod: 'debit-card',
    }),
    txn('txn-043', {
      type: 'expense',
      description: 'Regional Flight',
      amount: 286,
      category: 'cat-travel',
      account: 'acc-credit',
      date: monthDate(-2, 25),
      timeOfDay: '07:15',
      paymentMethod: 'credit-card',
    }),
  ];

  const categories = [
    { id: 'cat-groceries', name: 'Groceries', emoji: '🛒', color: '#4ade80' },
    { id: 'cat-dining', name: 'Dining', emoji: '🍽️', color: '#f97316' },
    { id: 'cat-coffee', name: 'Coffee', emoji: '☕', color: '#a16207' },
    { id: 'cat-gas', name: 'Gas', emoji: '⛽', color: '#ef4444' },
    { id: 'cat-shopping', name: 'Shopping', emoji: '🛍️', color: '#ec4899' },
    { id: 'cat-utilities', name: 'Utilities', emoji: '💡', color: '#06b6d4' },
    { id: 'cat-healthcare', name: 'Healthcare', emoji: '⚕️', color: '#8b5cf6' },
    { id: 'cat-entertainment', name: 'Entertainment', emoji: '🎬', color: '#6366f1' },
    { id: 'cat-transport', name: 'Transport', emoji: '🚕', color: '#10b981' },
    { id: 'cat-housing', name: 'Housing', emoji: '🏠', color: '#f43f5e' },
    { id: 'cat-travel', name: 'Travel', emoji: '✈️', color: '#0ea5e9' },
    { id: 'cat-software', name: 'Software', emoji: '🧰', color: '#14b8a6' },
    { id: 'cat-other', name: 'Other', emoji: '📌', color: '#6b7280' },
  ];

  const budgets = [
    { id: 'bud-housing', name: 'Housing', categoryId: 'cat-housing', emoji: '🏠', limit: 1900, spent: sumCurrentMonth(transactions, 'cat-housing'), color: '#f43f5e' },
    { id: 'bud-groceries', name: 'Groceries', categoryId: 'cat-groceries', emoji: '🛒', limit: 550, spent: sumCurrentMonth(transactions, 'cat-groceries'), color: '#4ade80' },
    { id: 'bud-dining', name: 'Dining', categoryId: 'cat-dining', emoji: '🍽️', limit: 220, spent: sumCurrentMonth(transactions, 'cat-dining'), color: '#f97316' },
    { id: 'bud-utilities', name: 'Utilities', categoryId: 'cat-utilities', emoji: '💡', limit: 190, spent: sumCurrentMonth(transactions, 'cat-utilities'), color: '#06b6d4' },
    { id: 'bud-shopping', name: 'Shopping', categoryId: 'cat-shopping', emoji: '🛍️', limit: 260, spent: sumCurrentMonth(transactions, 'cat-shopping'), color: '#ec4899' },
    { id: 'bud-entertainment', name: 'Entertainment', categoryId: 'cat-entertainment', emoji: '🎬', limit: 180, spent: sumCurrentMonth(transactions, 'cat-entertainment'), color: '#6366f1' },
    { id: 'bud-transport', name: 'Transport', categoryId: 'cat-transport', emoji: '🚕', limit: 120, spent: sumCurrentMonth(transactions, 'cat-transport'), color: '#10b981' },
    { id: 'bud-healthcare', name: 'Healthcare', categoryId: 'cat-healthcare', emoji: '⚕️', limit: 140, spent: sumCurrentMonth(transactions, 'cat-healthcare'), color: '#8b5cf6' },
    { id: 'bud-travel', name: 'Travel', categoryId: 'cat-travel', emoji: '✈️', limit: 250, spent: sumCurrentMonth(transactions, 'cat-travel'), color: '#0ea5e9' },
    { id: 'bud-software', name: 'Software', categoryId: 'cat-software', emoji: '🧰', limit: 60, spent: sumCurrentMonth(transactions, 'cat-software'), color: '#14b8a6' },
  ];

  const goals = [
    buildGoal({
      id: 'goal-emergency',
      name: 'Emergency Fund',
      emoji: '🛟',
      target: 20000,
      current: 12350,
      category: 'savings',
      monthlyContribution: 600,
      isActive: true,
      createdAt: formatDate(addDays(TODAY, -180)),
      targetDate: formatDate(addDays(TODAY, 240)),
    }),
    buildGoal({
      id: 'goal-travel',
      name: 'Autumn Travel Fund',
      emoji: '🍁',
      target: 4500,
      current: 1750,
      category: 'travel',
      monthlyContribution: 350,
      isActive: true,
      createdAt: formatDate(addDays(TODAY, -90)),
      targetDate: formatDate(addDays(TODAY, 120)),
    }),
    buildGoal({
      id: 'goal-laptop',
      name: 'Workstation Upgrade',
      emoji: '💻',
      target: 3200,
      current: 1450,
      category: 'tech',
      monthlyContribution: 250,
      isActive: true,
      createdAt: formatDate(addDays(TODAY, -75)),
      targetDate: formatDate(addDays(TODAY, 90)),
    }),
    buildGoal({
      id: 'goal-debt',
      name: 'Credit Card Paydown',
      emoji: '📉',
      target: 1800,
      current: 620,
      category: 'debt',
      monthlyContribution: 300,
      isActive: true,
      createdAt: formatDate(addDays(TODAY, -45)),
      targetDate: formatDate(addDays(TODAY, 150)),
    }),
  ];

  const recurringTransactions = [
    {
      id: 'rec-salary',
      amount: 5400,
      category: 'src-salary',
      account: 'acc-checking',
      description: 'Primary Salary',
      date: monthDate(-2, 2),
      frequency: 'monthly',
      type: 'income',
      lastGenerated: monthDate(0, 2),
      createdAt: formatDate(addDays(TODAY, -180)),
    },
    {
      id: 'rec-rent',
      amount: 1850,
      category: 'cat-housing',
      account: 'acc-checking',
      description: 'Apartment Rent',
      date: monthDate(-2, 1),
      frequency: 'monthly',
      type: 'expense',
      lastGenerated: monthDate(0, 1),
      createdAt: formatDate(addDays(TODAY, -180)),
    },
    {
      id: 'rec-electric',
      amount: 112.4,
      category: 'cat-utilities',
      account: 'acc-checking',
      description: 'Electric Utility',
      date: monthDate(-2, 12),
      frequency: 'monthly',
      type: 'expense',
      lastGenerated: monthDate(0, 12),
      createdAt: formatDate(addDays(TODAY, -150)),
    },
    {
      id: 'rec-streaming',
      amount: 24.99,
      category: 'cat-entertainment',
      account: 'acc-credit',
      description: 'Streaming Bundle',
      date: monthDate(-2, 5),
      frequency: 'monthly',
      type: 'expense',
      lastGenerated: monthDate(0, 5),
      createdAt: formatDate(addDays(TODAY, -120)),
    },
    {
      id: 'rec-tools',
      amount: 38,
      category: 'cat-software',
      account: 'acc-checking',
      description: 'Cloud Storage + Tools',
      date: monthDate(-2, 8),
      frequency: 'monthly',
      type: 'expense',
      lastGenerated: monthDate(0, 8),
      createdAt: formatDate(addDays(TODAY, -120)),
    },
    {
      id: 'rec-dividend',
      amount: 180,
      category: 'src-investment',
      account: 'acc-savings',
      description: 'Quarterly Dividend Sweep',
      date: monthDate(-3, 20),
      frequency: 'quarterly',
      type: 'income',
      lastGenerated: monthDate(0, 20),
      createdAt: formatDate(addDays(TODAY, -220)),
    },
  ];

  const bills = [
    {
      id: 'bill-water',
      description: 'Water Utility',
      amount: 49.18,
      dueDate: formatDate(addDays(TODAY, -3)),
      category: 'utilities',
      isRecurring: true,
      frequency: 'monthly',
      status: 'pending',
      lastPaid: formatDate(addDays(TODAY, -33)),
      paidHistory: [],
      notes: 'Intentionally overdue to demonstrate alerts.',
      createdAt: formatDate(addDays(TODAY, -120)),
    },
    {
      id: 'bill-internet',
      description: 'Fiber Internet',
      amount: 79.99,
      dueDate: formatDate(addDays(TODAY, 2)),
      category: 'utilities',
      isRecurring: true,
      frequency: 'monthly',
      status: 'pending',
      lastPaid: formatDate(addDays(TODAY, -28)),
      paidHistory: [],
      createdAt: formatDate(addDays(TODAY, -150)),
    },
    {
      id: 'bill-credit-card',
      description: 'Credit Card Statement',
      amount: 625,
      dueDate: formatDate(addDays(TODAY, 5)),
      category: 'debt',
      isRecurring: true,
      frequency: 'monthly',
      status: 'pending',
      lastPaid: formatDate(addDays(TODAY, -25)),
      paidHistory: [],
      createdAt: formatDate(addDays(TODAY, -150)),
    },
    {
      id: 'bill-insurance',
      description: 'Car Insurance',
      amount: 132.5,
      dueDate: formatDate(addDays(TODAY, 7)),
      category: 'insurance',
      isRecurring: true,
      frequency: 'monthly',
      status: 'pending',
      lastPaid: formatDate(addDays(TODAY, -23)),
      paidHistory: [],
      createdAt: formatDate(addDays(TODAY, -120)),
    },
    {
      id: 'bill-rent-next',
      description: 'Next Rent Draft',
      amount: 1850,
      dueDate: formatDate(addDays(TODAY, 10)),
      category: 'housing',
      isRecurring: true,
      frequency: 'monthly',
      status: 'pending',
      lastPaid: monthDate(0, 1),
      paidHistory: [],
      createdAt: formatDate(addDays(TODAY, -180)),
    },
    {
      id: 'bill-gym',
      description: 'Gym Membership',
      amount: 59,
      dueDate: formatDate(addDays(TODAY, -8)),
      category: 'health',
      isRecurring: true,
      frequency: 'monthly',
      status: 'paid',
      lastPaid: formatDate(addDays(TODAY, -8)),
      paidHistory: [{ date: formatDate(addDays(TODAY, -8)), amount: 59 }],
      createdAt: formatDate(addDays(TODAY, -200)),
    },
  ];

  return {
    transactions,
    accounts: [
      { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 6824.32, apr: 0, minPayment: 0 },
      { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 12350.55, apr: 4.5, minPayment: 0 },
      { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: -1842.13, limit: 12000, apr: 19.9, minPayment: 45 },
    ],
    categories,
    incomeSources: [
      { id: 'src-salary', name: 'Salary', emoji: '💼', isRecurring: true, frequency: 'monthly' },
      { id: 'src-freelance', name: 'Freelance', emoji: '🧠', isRecurring: false, frequency: 'ad-hoc' },
      { id: 'src-investment', name: 'Investment Returns', emoji: '📈', isRecurring: true, frequency: 'quarterly' },
      { id: 'src-sidegig', name: 'Incident Response Retainer', emoji: '🛡️', isRecurring: false, frequency: 'ad-hoc' },
      { id: 'src-other', name: 'Other', emoji: '💵', isRecurring: false, frequency: 'ad-hoc' },
    ],
    budgets,
    goals,
    bills,
    recurringTransactions,
    phase13Templates: [
      {
        id: 'tpl-coffee',
        name: 'Coffee Run',
        description: 'Morning Espresso',
        amount: 5.5,
        notes: 'Quick low-friction expense template.',
        isSplit: false,
        splitItems: [],
        createdAt: formatDate(addDays(TODAY, -20)),
      },
      {
        id: 'tpl-grocery',
        name: 'Weekly Grocery Restock',
        description: 'FreshMart Weekly Groceries',
        amount: 135,
        notes: 'Useful demo template for repeat household spend.',
        isSplit: true,
        splitItems: [
          { description: 'Produce', amount: 40 },
          { description: 'Pantry', amount: 55 },
          { description: 'Household', amount: 40 },
        ],
        createdAt: formatDate(addDays(TODAY, -18)),
      },
      {
        id: 'tpl-rideshare',
        name: 'Late-night Rideshare',
        description: 'Rideshare Home',
        amount: 24,
        notes: 'Handy for fast repeat entry.',
        isSplit: false,
        splitItems: [],
        createdAt: formatDate(addDays(TODAY, -12)),
      },
    ],
    settings: {
      incomeTarget: 7000,
    },
  };
}

const SEED_DATA = buildSeedData();

const DEMO_RECEIPTS = [
  {
    id: 'demo-receipt-freshmart',
    transactionId: 'txn-003',
    merchant: 'FreshMart',
    amount: 142.67,
    category: 'cat-groceries',
    tags: ['groceries', 'receipt'],
    ocrText: 'FreshMart weekly groceries and pantry items',
    date: SEED_DATA.transactions.find((txn) => txn.id === 'txn-003')?.date || formatDate(TODAY),
    accent: '#4ade80',
  },
  {
    id: 'demo-receipt-harbor-hotel',
    transactionId: 'txn-012',
    merchant: 'Harbor Hotel',
    amount: 219,
    category: 'cat-travel',
    tags: ['travel', 'receipt'],
    ocrText: 'Weekend hotel folio with room and taxes',
    date: SEED_DATA.transactions.find((txn) => txn.id === 'txn-012')?.date || formatDate(TODAY),
    accent: '#38bdf8',
  },
  {
    id: 'demo-receipt-pharmacy',
    transactionId: 'txn-009',
    merchant: 'CarePlus Pharmacy',
    amount: 37.45,
    category: 'cat-healthcare',
    tags: ['health', 'receipt'],
    ocrText: 'Prescription refill and checkout summary',
    date: SEED_DATA.transactions.find((txn) => txn.id === 'txn-009')?.date || formatDate(TODAY),
    accent: '#a78bfa',
  },
];

async function seedDemoReceiptGallery() {
  if (!window.StorageAPI?.saveReceiptWithResolutions) return;

  for (const receipt of DEMO_RECEIPTS) {
    const preview = buildReceiptSvg(receipt);
    await window.StorageAPI.saveReceiptWithResolutions({
      id: receipt.id,
      transactionId: receipt.transactionId,
      merchant: receipt.merchant,
      amount: receipt.amount,
      category: receipt.category,
      tags: receipt.tags,
      ocrText: receipt.ocrText,
      verified: true,
      timestamp: timestampFor(receipt.date, '12:00'),
    }, preview, preview, preview);
  }
}

async function initializeSeedData(appState) {
  appState.transactions = [...SEED_DATA.transactions];
  appState.accounts = [...SEED_DATA.accounts];
  appState.categories = [...SEED_DATA.categories];
  appState.incomeSources = [...SEED_DATA.incomeSources];
  appState.budgets = [...SEED_DATA.budgets];
  appState.goals = [...SEED_DATA.goals];
  appState.bills = [...SEED_DATA.bills];
  appState.recurringTransactions = [...SEED_DATA.recurringTransactions];
  appState.phase13Templates = [...SEED_DATA.phase13Templates];
  appState.settings = {
    ...(appState.settings || {}),
    ...SEED_DATA.settings,
  };

  if (window.StorageAPI?.clearReceiptGallery) {
    await window.StorageAPI.clearReceiptGallery();
    await seedDemoReceiptGallery();
  }
}

async function wipeDemoData(appState) {
  appState.transactions = [];
  appState.budgets = [];
  appState.goals = [];
  appState.bills = [];
  appState.recurringTransactions = [];
  appState.phase13Templates = [];

  appState.accounts = [
    { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 0, apr: 0, minPayment: 0 },
    { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 0, apr: 0, minPayment: 0 },
    { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: 0, limit: 5000, apr: 18.9, minPayment: 25 },
  ];

  appState.categories = [...SEED_DATA.categories];
  appState.incomeSources = [...SEED_DATA.incomeSources];
  appState.settings = {
    ...(appState.settings || {}),
    incomeTarget: 0,
  };

  if (window.StorageAPI?.clearReceiptGallery) {
    await window.StorageAPI.clearReceiptGallery();
  }
}

window.SeedDataUtils = {
  SEED_DATA,
  initializeSeedData,
  wipeDemoData,
};
