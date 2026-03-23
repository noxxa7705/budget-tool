const { createApp, ref, reactive, computed, watch, onMounted, onBeforeUnmount } = Vue;

const app = createApp({
  setup() {
    // ==================== State ====================
    const activeTab = ref('dashboard');
    const notification = ref('');
    const showQuickAddMenu = ref(false);
    const showFilterModal = ref(false);
    const showImportModal = ref(false);
    const quickAddMode = ref('manual');
    const filterText = ref('');
    const naturalLanguageInput = ref('');
    
    const aiEndpointStatus = ref('idle');

    // Receipt OCR state
    const receiptImage = ref(null);
    const receiptParsed = ref(null);
    const receiptParsing = ref(false);
    const receiptFileInput = ref(null);

    // Context menu
    const contextMenu = reactive({
      visible: false,
      x: 0,
      y: 0,
      txn: null,
    });

    // Quick add form
    const quickAdd = reactive({
      amount: '',
      category: '',
      account: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
    });

    // ==================== Data from Storage ====================
    let accounts = ref([]);
    let transactions = ref([]);
    let categories = ref([]);
    let budgets = ref([]);
    let goals = ref([]);
    let settings = ref({
      currency: 'USD',
      theme: 'dark',
      llmEndpoint: '',
      apiKey: '',
      visionEndpoint: '',
      visionApiKey: '',
    });

    // ==================== Initialization ====================
    onMounted(async () => {
      await loadAllData();
      await initializeIndexedDB();
      setupServiceWorker();
      applyTheme();
    });

    async function loadAllData() {
      accounts.value = (await getStorage('accounts')) || initializeAccounts();
      transactions.value = (await getStorage('transactions')) || [];
      categories.value = (await getStorage('categories')) || initializeCategories();
      budgets.value = (await getStorage('budgets')) || initializeBudgets();
      goals.value = (await getStorage('goals')) || [];
      const storedSettings = (await getStorage('settings')) || {};
      settings.value = { ...settings.value, ...storedSettings };

      
      // Initialize quickAdd with first account
      if (accounts.value.length > 0 && !quickAdd.account) {
        quickAdd.account = accounts.value[0].id;
      }
      if (categories.value.length > 0 && !quickAdd.category) {
        quickAdd.category = categories.value[0].id;
      }
    }

    function initializeAccounts() {
      return [
        { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 2500 },
        { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 5000 },
        { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: -150, limit: 5000 },
      ];
    }

    function initializeCategories() {
      return [
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
      ];
    }

    function initializeBudgets() {
      return [
        { id: 'bud-groceries', name: 'Groceries', categoryId: 'cat-groceries', emoji: '🛒', limit: 500, spent: 320, color: '#4ade80' },
        { id: 'bud-dining', name: 'Dining', categoryId: 'cat-dining', emoji: '🍔', limit: 300, spent: 150, color: '#f97316' },
        { id: 'bud-utilities', name: 'Utilities', categoryId: 'cat-utilities', emoji: '💡', limit: 200, spent: 120, color: '#06b6d4' },
        { id: 'bud-shopping', name: 'Shopping', categoryId: 'cat-shopping', emoji: '🛍️', limit: 400, spent: 580, color: '#ec4899' },
      ];
    }

    async function initializeIndexedDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('BudgetApp', 1);
        req.onerror = reject;
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('receipts')) {
            db.createObjectStore('receipts', { keyPath: 'id' });
          }
        };
      });
    }

    function setupServiceWorker() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }
    }

    function applyTheme() {
      document.documentElement.setAttribute('data-theme', settings.value.theme);
    }

    // ==================== Computed Properties ====================
    const currentMonth = computed(() => {
      const now = new Date();
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    });

    const monthlyIncome = computed(() => {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      return transactions.value
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year && t.type === 'income';
        })
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const monthlyExpenses = computed(() => {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      return transactions.value
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year && t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const netWorth = computed(() => {
      return accounts.value.reduce((sum, acc) => sum + acc.balance, 0);
    });

    const topCategories = computed(() => {
      const categoryTotals = {};
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      transactions.value
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year && t.type === 'expense';
        })
        .forEach(t => {
          if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
          }
          categoryTotals[t.category] += t.amount;
        });

      const categoryMap = {};
      categories.value.forEach(c => {
        categoryMap[c.id] = c;
      });

      const totals = Object.entries(categoryTotals)
        .map(([catId, total]) => ({
          id: catId,
          ...categoryMap[catId],
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const maxTotal = Math.max(...totals.map(t => t.total), 1);
      return totals.map(t => ({
        ...t,
        percentage: (t.total / maxTotal) * 100,
      }));
    });

    const recentTransactions = computed(() => {
      return [...transactions.value].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    const filteredTransactions = computed(() => {
      const text = filterText.value.toLowerCase();
      return transactions.value.filter(t =>
        t.description.toLowerCase().includes(text) ||
        t.category.toLowerCase().includes(text)
      );
    });

    const groupedTransactions = computed(() => {
      const groups = {};
      filteredTransactions.value
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(t => {
          const key = t.date;
          if (!groups[key]) groups[key] = [];
          groups[key].push(t);
        });

      return Object.entries(groups).map(([date, txns]) => ({
        date,
        txns,
      }));
    });

    const tabIcons = {
      dashboard: '📊',
      transactions: '💳',
      budget: '📈',
      goals: '🎯',
      settings: '⚙️',
    };

    const tabLabels = {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      budget: 'Budget',
      goals: 'Goals',
      settings: 'Settings',
    };

    // ==================== Utility Functions ====================
    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.value.currency,
      }).format(amount);
    }

    function formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    function showNotification(msg) {
      notification.value = msg;
      setTimeout(() => {
        notification.value = '';
      }, 3000);
    }

    function hideModals() {
      showQuickAddMenu.value = false;
      contextMenu.visible = false;
    }

    // ==================== Transaction Management ====================
    function addTransaction() {
      if (!quickAdd.amount || !quickAdd.category || !quickAdd.account) {
        showNotification('Please fill in all required fields');
        return;
      }

      const txn = {
        id: 'txn-' + Date.now(),
        amount: parseFloat(quickAdd.amount),
        category: quickAdd.category,
        account: quickAdd.account,
        description: quickAdd.description || 'Transaction',
        date: quickAdd.date,
        type: quickAdd.type,
        timestamp: Date.now(),
      };

      transactions.value.push(txn);
      updateAccountBalance(quickAdd.account, parseFloat(quickAdd.amount), quickAdd.type === 'expense');
      saveAllData();
      
      // Reset form
      quickAdd.amount = '';
      quickAdd.description = '';
      quickAdd.date = new Date().toISOString().split('T')[0];
      showQuickAddMenu.value = false;
      showNotification('Transaction added!');
    }

    function addReceiptTransaction(repeat = false) {
      if (!receiptParsed.value) return;

      const txn = {
        id: 'txn-' + Date.now(),
        amount: receiptParsed.value.amount,
        category: receiptParsed.value.category || 'cat-other',
        account: quickAdd.account,
        description: receiptParsed.value.merchant || 'Receipt',
        date: receiptParsed.value.date,
        type: 'expense',
        receiptImage: receiptImage.value,
        receiptData: receiptParsed.value,
        timestamp: Date.now(),
      };

      transactions.value.push(txn);
      updateAccountBalance(quickAdd.account, receiptParsed.value.amount, true);
      saveAllData();

      if (repeat) {
        receiptParsed.value = null;
        receiptImage.value = null;
        showNotification('Saved! Ready for next receipt.');
      } else {
        receiptImage.value = null;
        receiptParsed.value = null;
        showQuickAddMenu.value = false;
        showNotification('Receipt added!');
      }
    }

    function deleteTransaction(id) {
      const txn = transactions.value.find(t => t.id === id);
      if (!txn) return;

      updateAccountBalance(txn.account, txn.amount, txn.type === 'expense', true);
      transactions.value = transactions.value.filter(t => t.id !== id);
      saveAllData();
      contextMenu.visible = false;
      showNotification('Transaction deleted');
    }

    function editTransaction(txn) {
      // TODO: Implement edit modal
      contextMenu.visible = false;
    }

    function duplicateTransaction(txn) {
      const dup = {
        ...txn,
        id: 'txn-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
      };
      transactions.value.push(dup);
      saveAllData();
      contextMenu.visible = false;
      showNotification('Transaction duplicated');
    }

    function updateAccountBalance(accountId, amount, isExpense, isReverse = false) {
      const acc = accounts.value.find(a => a.id === accountId);
      if (!acc) return;

      const change = isExpense ? -amount : amount;
      const direction = isReverse ? -change : change;
      acc.balance += direction;
    }

    function showTxnMenu(txn) {
      contextMenu.txn = txn;
      contextMenu.visible = true;
    }

    // ==================== Receipt Parsing ====================
    async function handleReceiptCapture(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      receiptParsing.value = true;
      try {
        const compressed = await compressImage(file);
        const base64 = await fileToBase64(compressed);
        receiptImage.value = base64;

        // Auto-parse if AI is configured
        if (settings.value.llmEndpoint || settings.value.visionEndpoint) {
          await parseReceiptWithAI();
        }
      } catch (err) {
        showNotification('Failed to load image: ' + err.message);
      }
      receiptParsing.value = false;
    }

    async function parseReceiptWithAI() {
      if (!receiptImage.value) return;

      receiptParsing.value = true;
      try {
        const result = await window.ReceiptParser.parseReceipt(
          receiptImage.value,
          settings.value
        );
        receiptParsed.value = result;
        showNotification('Receipt parsed!');
      } catch (err) {
        showNotification('Failed to parse receipt: ' + err.message);
      }
      receiptParsing.value = false;
    }

    async function parseNaturalLanguage() {
      if (!naturalLanguageInput.value.trim()) return;

      try {
        const result = await window.AI.parseNaturalLanguage(
          naturalLanguageInput.value,
          settings.value
        );
        
        if (result) {
          Object.assign(quickAdd, {
            amount: result.amount || '',
            category: result.category || quickAdd.category,
            description: result.description || '',
            date: result.date || new Date().toISOString().split('T')[0],
          });
          quickAddMode.value = 'manual';
          showNotification('Parsed successfully!');
        }
      } catch (err) {
        showNotification('Parse failed: ' + err.message);
      }
    }

    // ==================== Settings ====================
    async function testConnections() {
      aiEndpointStatus.value = 'testing';
      try {
        const mainOk = settings.value.llmEndpoint 
          ? await window.AI.testConnection(settings.value.llmEndpoint, settings.value.apiKey)
          : true;
        const visionOk = settings.value.visionEndpoint
          ? await window.AI.testConnection(settings.value.visionEndpoint, settings.value.visionApiKey)
          : true;

        if (mainOk && visionOk) {
          aiEndpointStatus.value = 'ok';
          showNotification('Connections successful!');
        } else {
          aiEndpointStatus.value = 'error';
          showNotification('Connection failed');
        }
      } catch (err) {
        aiEndpointStatus.value = 'error';
        showNotification('Error: ' + err.message);
      }
    }

    function exportData() {
      const data = {
        accounts: accounts.value,
        transactions: transactions.value,
        categories: categories.value,
        budgets: budgets.value,
        goals: goals.value,
        settings: {
          currency: settings.value.currency,
          theme: settings.value.theme,
        },
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `night-ledger-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      showNotification('Exported successfully!');
    }

    function clearAllData() {
      if (confirm('⚠️ This will delete ALL data. Are you sure?')) {
        accounts.value = initializeAccounts();
        transactions.value = [];
        categories.value = initializeCategories();
        budgets.value = initializeBudgets();
        goals.value = [];
        saveAllData();
        showNotification('All data cleared');
      }
    }

    // ==================== Month Navigation ====================
    let displayMonth = reactive({ month: new Date().getMonth(), year: new Date().getFullYear() });

    function previousMonth() {
      if (displayMonth.month === 0) {
        displayMonth.month = 11;
        displayMonth.year--;
      } else {
        displayMonth.month--;
      }
    }

    function nextMonth() {
      const now = new Date();
      if (displayMonth.month === 11) {
        displayMonth.month = 0;
        displayMonth.year++;
      } else {
        displayMonth.month++;
      }
      // Don't allow future months
      if (displayMonth.year === now.getFullYear() && displayMonth.month > now.getMonth()) {
        previousMonth();
      }
    }

    // ==================== Goals ====================
    function getProgressOffset(goal) {
      const progress = goal.current / goal.target;
      const circumference = 2 * Math.PI * 45;
      return circumference * (1 - Math.min(1, progress));
    }

    // ==================== Storage ====================
    async function saveAllData() {
      await Promise.all([
        setStorage('accounts', accounts.value),
        setStorage('transactions', transactions.value),
        setStorage('categories', categories.value),
        setStorage('budgets', budgets.value),
        setStorage('goals', goals.value),
        setStorage('settings', settings.value),
      ]);
    }

    // Auto-save when any data changes
    watch([accounts, transactions, budgets, goals, settings], saveAllData, { deep: true });

    return {
      // State
      activeTab,
      notification,
      showQuickAddMenu,
      showFilterModal,
      showImportModal,
      quickAddMode,
      filterText,
      naturalLanguageInput,
      receiptImage,
      receiptParsed,
      receiptParsing,
      receiptFileInput,
      contextMenu,
      quickAdd,
      aiEndpointStatus,

      // Data
      accounts,
      transactions,
      categories,
      budgets,
      goals,
      settings,

      // Computed
      currentMonth,
      monthlyIncome,
      monthlyExpenses,
      netWorth,
      topCategories,
      recentTransactions,
      filteredTransactions,
      groupedTransactions,
      tabIcons,
      tabLabels,

      // Functions
      formatCurrency,
      formatDate,
      showNotification,
      hideModals,
      addTransaction,
      addReceiptTransaction,
      deleteTransaction,
      editTransaction,
      duplicateTransaction,
      showTxnMenu,
      handleReceiptCapture,
      parseReceiptWithAI,
      parseNaturalLanguage,
      testConnections,
      exportData,
      clearAllData,
      previousMonth,
      nextMonth,
      getProgressOffset,
    };
  },
});

app.mount('#app');
