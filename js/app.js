const { createApp, ref, reactive, computed, watch, onMounted, onBeforeUnmount } = Vue;

const app = createApp({
  components: window.NightLedgerUI?.components || {},
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
    const llmModelStatus = ref('idle');
    const visionModelStatus = ref('idle');
    const llmModelOptions = ref([]);
    const visionModelOptions = ref([]);
    const llmModelError = ref('');
    const visionModelError = ref('');

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
      incomeSource: 'src-salary', // Phase 9: Selected income source
      isRecurring: false,
      frequency: 'monthly',
      tags: [],
      tagsInput: '',
    });

    const navTabs = window.NightLedgerUI?.NAV_TABS || [];
    const quickAddModes = window.NightLedgerUI?.QUICK_ADD_MODES || [];
    const canQuickAdd = computed(() => ['dashboard', 'transactions'].includes(activeTab.value));
    const navBadgeMap = computed(() => ({
      transactions: activeTab.value === 'transactions' && Number(activeFilterCount?.value || 0) > 0 ? String(activeFilterCount.value) : '',
      bills: Number(dueAlerts?.value?.overdue?.length || 0) > 0 ? String(dueAlerts.value.overdue.length) : '',
      gallery: Number(receiptCount?.value || 0) > 0 ? String(receiptCount.value) : '',
    }));

    function setActiveTab(tabId) {
      activeTab.value = tabId;
    }

    function setQuickAddMode(modeId) {
      quickAddMode.value = modeId;
    }

    function openQuickAdd(modeId = 'manual') {
      quickAddMode.value = modeId;
      showQuickAddMenu.value = true;
    }

    function closeQuickAdd() {
      showQuickAddMenu.value = false;
    }

    // ==================== Phase 4: Undo/Redo State ====================
    const actionHistory = ref([]);
    const historyIndex = ref(-1);
    const undoStack = ref([]);
    const redoStack = ref([]);

    // ==================== Phase 4: Merchant Autocomplete ====================
    const merchantSuggestions = ref([]);
    const showMerchantSuggestions = ref(false);

    // ==================== Phase 5 & 6: Analytics & Advanced Features ====================
    // Analytics state
    const analyticsData = reactive({
      selectedPeriod: 'month', // 'week', 'month', 'quarter', 'year'
      heatmapData: {},
      merchantFrequency: [],
      categoryTrends: [],
      anomalies: [],
    });

    // Multi-currency support
    const currencyExchangeRates = ref({
      'USD': 1,
      'EUR': 0.92,
      'GBP': 0.79,
      'JPY': 149.50,
      'CAD': 1.36,
      'AUD': 1.53,
      'CHF': 0.88,
      'CNY': 7.24,
      'INR': 83.12,
      'MXN': 17.05,
    });

    // Device sync state
    const syncModalVisible = ref(false);
    const syncToken = ref('');
    const syncExportData = ref('');

    // Forecast state
    const forecastData = reactive({
      predictedEndBalance: 0,
      daysInMonth: 0,
      daysElapsed: 0,
      averageDailySpend: 0,
      averageDailyIncome: 0,
      projectedMonthIncome: 0,
      projectedMonthExpenses: 0,
      projectedNetCashFlow: 0,
    });

    // Phase 8: Financial intelligence controls
    const debtSimulator = reactive({
      strategy: 'avalanche',
      extraPayment: 200,
    });

    // ==================== Phase 7: Mobile-First Polish ====================
    // Gesture and touch state
    const touchState = reactive({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      swipingTransactionId: null,
      swipeOffset: 0,
      pullToRefreshActive: false,
      pullDistance: 0,
    });

    // Gesture hints state
    const gestureHints = reactive({
      showSwipeHint: !localStorage.getItem('gesture-hints-dismissed'),
      showPullHint: !localStorage.getItem('pull-refresh-hint-dismissed'),
      tapCount: 0,
      lastTapTime: 0,
    });

    // Pull-to-refresh state
    const pullToRefresh = reactive({
      isRefreshing: false,
      lastRefreshTime: 0,
      threshold: 80,
    });

    // ==================== Phase 1: UX Improvements State ====================
    // AI Insights
    const aiInsight = ref(null);
    const aiInsightLoading = ref(false);
    
    // Category prediction
    const predictedCategories = ref([]);
    const categoryPredictionLoading = ref(false);
    let categoryPredictionAbortController = null;

    // ==================== Data from Storage ====================
    let accounts = ref([]);
    let transactions = ref([]);
    let categories = ref([]);
    let budgets = ref([]);
    let goals = ref([]);
    let recurringTransactions = ref([]);
    let settings = ref({
      currency: 'USD',
      theme: 'dark',
      llmEndpoint: '',
      llmModel: window.AI?.defaults?.model || 'gpt-4.1-mini',
      apiKey: '',
      visionEndpoint: '',
      visionModel: window.AI?.defaults?.visionModel || 'gpt-4.1-mini',
      visionApiKey: '',
      incomeTarget: 0, // Phase 9: Monthly income target
    });

    const selectableVisionModels = computed(() => {
      const explicitVision = visionModelOptions.value.filter((model) => model.capabilities.includes('vision'));
      return explicitVision.length ? explicitVision : visionModelOptions.value;
    });

    const selectedLlmModel = computed(() =>
      llmModelOptions.value.find((model) => model.id === settings.value.llmModel) || null
    );

    const selectedVisionModel = computed(() =>
      selectableVisionModels.value.find((model) => model.id === settings.value.visionModel) ||
      visionModelOptions.value.find((model) => model.id === settings.value.visionModel) ||
      null
    );

    function getCapabilityBadges(model) {
      if (!model || !Array.isArray(model.capabilities) || !model.capabilities.length) return ['text'];
      return model.capabilities;
    }

    function formatCompactNumber(value) {
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0) return '';
      return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
    }

    function formatModelStat(value, suffix) {
      const compact = formatCompactNumber(value);
      return compact ? `${compact} ${suffix}` : '';
    }

    function getModelStatLine(model) {
      if (!model) return '';
      const parts = [
        formatModelStat(model.contextWindow, 'ctx'),
        formatModelStat(model.promptRateLimit, 'tpm'),
        formatModelStat(model.requestRateLimit, 'rpm'),
      ].filter(Boolean);
      return parts.join(' • ');
    }

    function syncModelSelection(kind, models) {
      const key = kind === 'vision' ? 'visionModel' : 'llmModel';
      const current = settings.value[key];
      const candidateModels = kind === 'vision'
        ? (models.filter((model) => model.capabilities.includes('vision')).length
            ? models.filter((model) => model.capabilities.includes('vision'))
            : models)
        : models;

      if (candidateModels.some((model) => model.id === current)) return;
      if (candidateModels.length) {
        settings.value[key] = candidateModels[0].id;
        return;
      }
      if (!settings.value[key]) {
        settings.value[key] = kind === 'vision'
          ? (settings.value.llmModel || window.AI.defaults.visionModel)
          : window.AI.defaults.model;
      }
    }

    async function refreshModelOptions(kind, { silent = true } = {}) {
      const endpoint = kind === 'vision' ? settings.value.visionEndpoint : settings.value.llmEndpoint;
      const apiKey = kind === 'vision' ? settings.value.visionApiKey : settings.value.apiKey;
      const optionsRef = kind === 'vision' ? visionModelOptions : llmModelOptions;
      const statusRef = kind === 'vision' ? visionModelStatus : llmModelStatus;
      const errorRef = kind === 'vision' ? visionModelError : llmModelError;

      if (!endpoint) {
        optionsRef.value = [];
        statusRef.value = 'idle';
        errorRef.value = '';
        return { ok: true, models: [] };
      }

      statusRef.value = 'testing';
      errorRef.value = '';
      const result = await window.AI.testConnection(endpoint, apiKey);

      if (result.ok) {
        optionsRef.value = result.models || [];
        statusRef.value = 'ok';
        syncModelSelection(kind, optionsRef.value);
      } else {
        optionsRef.value = [];
        statusRef.value = 'error';
        errorRef.value = result.message || 'Unable to load models.';
      }

      if (!silent && result.message) {
        showNotification(result.message);
      }

      return result;
    }

    let llmModelRefreshTimer = null;
    let visionModelRefreshTimer = null;

    // ==================== Phase 9: Income & Bill Management ====================
    const incomeSources = ref([
      { id: 'src-salary', name: 'Salary', emoji: '💼' },
      { id: 'src-freelance', name: 'Freelance', emoji: '💻' },
      { id: 'src-bonus', name: 'Bonus', emoji: '🎁' },
      { id: 'src-interest', name: 'Interest', emoji: '💰' },
      { id: 'src-refund', name: 'Refund', emoji: '↩️' },
      { id: 'src-investment', name: 'Investment Return', emoji: '📈' },
      { id: 'src-gift', name: 'Gift', emoji: '🎉' },
      { id: 'src-other-income', name: 'Other Income', emoji: '🔄' },
    ]);

    let bills = ref([]);
    let showBillsModal = ref(false);
    let billEditingId = ref(null);
    let newBill = reactive({
      description: '',
      amount: '',
      dueDate: '',
      status: 'unpaid',
      notes: '',
    });

    // ==================== Phase 12: Category Customization ====================
    const showCategoryCustomizer = ref(false);
    const categoryCustomizerTab = ref('manage');
    const categorySearchQuery = ref('');
    const showAddCategoryForm = ref(false);
    const showEmojiPicker = ref(false);
    const showColorPicker = ref(false);
    const showEditColorPicker = ref(false);
    const showEditCategoryModal = ref(false);
    const showMergeCategoriesModal = ref(false);
    const categoryImportInput = ref(null);

    const categoryCustomizerSettings = reactive({
      hideUnused: false,
      showSubcategories: true,
      showStats: true,
    });

    const newCategoryForm = reactive({
      name: '',
      emoji: '📌',
      color: '#6b7280',
      parentId: '',
      aliasesInput: '',
    });

    const editingCategory = reactive({
      id: '',
      name: '',
      emoji: '',
      color: '',
      aliasesEdit: '',
    });

    const mergeState = reactive({
      sourceId: '',
      targetId: '',
      deleteSource: true,
    });

    let draggedCategoryIndex = null;

        // ==================== Phase 13: Transaction Enhancements ====================
    const phase13 = reactive({
      showEditModal: false,
      showTemplatesModal: false,
      showBulkEditModal: false,
      showDuplicateModal: false,
      editingTxn: null,
      templates: [],
      selectedForBulkEdit: [],
      potentialDuplicates: [],
      editForm: {
        description: '',
        notes: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        timeOfDay: '12:00',
        location: '',
        paymentMethod: '',
        isSplit: false,
        splitItems: [],
        attachments: [],
        receiptData: null,
        saveAsTemplate: false,
        templateName: '',
      },
      bulkEditOptions: {
        updateCategory: false,
        newCategory: '',
        updateLocation: false,
        newLocation: '',
        updatePaymentMethod: false,
        newPaymentMethod: '',
        updateTags: false,
        tagsToAdd: '',
      },
    });

    // ==================== Initialization ====================
    onMounted(async () => {
      await loadAllData();
      await initializeIndexedDB();
      setupServiceWorker();
      loadTheme();
      applyTheme();
      // Phase 3: Load filter state from localStorage
      loadFilterState();
      // Phase 4: Set up keyboard shortcuts
      window.addEventListener('keydown', handleKeyboardShortcuts);
      // Phase 13: Load templates
      loadPhase13Templates();
      await refreshModelOptions('llm');
      await refreshModelOptions('vision');
      // Fetch AI insight on mount
      await fetchAIInsight();
    });

    // Clean up keyboard shortcuts on unmount
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
      clearTimeout(llmModelRefreshTimer);
      clearTimeout(visionModelRefreshTimer);
    });

    async function loadAllData() {
      accounts.value = (await getStorage('accounts')) || initializeAccounts();
      normalizeAccountMetadata();
      transactions.value = (await getStorage('transactions')) || [];
      categories.value = (await getStorage('categories')) || initializeCategories();
      budgets.value = (await getStorage('budgets')) || initializeBudgets();
      goals.value = (await getStorage('goals')) || [];
      recurringTransactions.value = (await getStorage('recurringTransactions')) || [];
      // Phase 9: Load bills
      bills.value = (await getStorage('bills')) || [];
      // Phase 13: Load transaction templates and enhancements
      phase13.templates = (await getStorage('phase13_templates')) || [];
      const storedSettings = (await getStorage('settings')) || {};
      settings.value = { ...settings.value, ...storedSettings };

      // Generate recurring transactions for this month if needed
      generateRecurringTransactions();
      
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
        { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 2500, apr: 0, minPayment: 0 },
        { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 5000, apr: 0, minPayment: 0 },
        { id: 'acc-credit', name: 'Credit Card', type: 'credit', balance: -150, limit: 5000, apr: 18.9, minPayment: 35 },
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
      if (!('serviceWorker' in navigator)) {
        return;
      }

      let hasRefreshedForNewWorker = false;

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hasRefreshedForNewWorker) return;
        hasRefreshedForNewWorker = true;
        window.location.reload();
      });

      navigator.serviceWorker.register('sw.js').then((registration) => {
        registration.update().catch(() => {});

        function wireWorker(worker) {
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }

        wireWorker(registration.installing);
        wireWorker(registration.waiting);

        registration.addEventListener('updatefound', () => {
          wireWorker(registration.installing);
        });
      }).catch(() => {});
    }

    function applyTheme() {
      const theme = settings.value.theme || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      // Persist theme to localStorage
      try {
        localStorage.setItem('nightledger-theme', theme);
      } catch (err) {
        console.warn('Failed to save theme:', err);
      }
    }

    // Load theme from localStorage on startup
    function loadTheme() {
      try {
        const savedTheme = localStorage.getItem('nightledger-theme');
        if (savedTheme) {
          settings.value.theme = savedTheme;
        }
      } catch (err) {
        console.warn('Failed to load theme:', err);
      }
    }

    // ==================== Computed Properties ====================
    const currentMonth = computed(() => {
      const now = new Date();
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    });

    function normalizeAccountMetadata() {
      accounts.value = accounts.value.map(account => {
        const isDebt = account.type === 'credit' || Number(account.balance || 0) < 0;
        return {
          ...account,
          apr: typeof account.apr === 'number' ? account.apr : (isDebt ? 18.9 : 0),
          minPayment: typeof account.minPayment === 'number' ? account.minPayment : (isDebt ? Math.max(25, Math.round(Math.abs(Number(account.balance || 0)) * 0.02)) : 0),
        };
      });
    }

    function getMonthDate(offset = 0) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + offset, 1);
    }

    function getMonthBounds(baseDate) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      return {
        start: date,
        end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      };
    }

    function isTransactionInMonth(txn, baseDate) {
      const { start, end } = getMonthBounds(baseDate);
      const txnDate = new Date(txn.date);
      return txnDate >= start && txnDate < end;
    }

    function getTransactionsForMonth(baseDate, type = null) {
      return transactions.value.filter(txn => {
        if (type && txn.type !== type) return false;
        return isTransactionInMonth(txn, baseDate);
      });
    }

    function getTransactionBalanceImpact(txn) {
      return txn.type === 'income' ? Number(txn.amount || 0) : -Number(txn.amount || 0);
    }

    function getPercentChange(current, previous) {
      if (!previous && !current) return 0;
      if (!previous) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    }

    function getFrequencyMonthlyFactor(frequency) {
      const factors = {
        daily: 30,
        weekly: 52 / 12,
        biweekly: 26 / 12,
        monthly: 1,
        quarterly: 1 / 3,
        yearly: 1 / 12,
      };
      return factors[frequency] || 1;
    }

    function getNextRecurringDate(recurring) {
      const base = recurring.lastGenerated || recurring.date || new Date().toISOString().split('T')[0];
      const date = new Date(base);
      const next = new Date(date);
      const frequency = recurring.frequency || 'monthly';

      if (Number.isNaN(next.getTime())) return new Date();

      while (next <= new Date()) {
        if (frequency === 'daily') next.setDate(next.getDate() + 1);
        else if (frequency === 'weekly') next.setDate(next.getDate() + 7);
        else if (frequency === 'biweekly') next.setDate(next.getDate() + 14);
        else if (frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
        else if (frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
        else next.setMonth(next.getMonth() + 1);
      }

      return next;
    }

    const totalBudget = computed(() => budgets.value.reduce((sum, budget) => sum + Number(budget.limit || 0), 0));

    const monthlySeries = computed(() => {
      const now = new Date();
      const series = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const income = getTransactionsForMonth(date, 'income').reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
        const expenses = getTransactionsForMonth(date, 'expense').reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
        const net = income - expenses;
        series.push({
          key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          labelShort: date.toLocaleDateString('en-US', { month: 'short' }),
          labelLong: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          month: date.getMonth(),
          year: date.getFullYear(),
          date,
          income,
          expenses,
          net,
          savingsRate: income > 0 ? (net / income) * 100 : 0,
        });
      }
      return series;
    });

    const currentMonthSummary = computed(() => monthlySeries.value[monthlySeries.value.length - 1] || { income: 0, expenses: 0, net: 0, savingsRate: 0, labelLong: currentMonth.value });
    const previousMonthSummary = computed(() => monthlySeries.value[monthlySeries.value.length - 2] || { income: 0, expenses: 0, net: 0, savingsRate: 0, labelLong: 'Last month' });
    const sameMonthLastYearSummary = computed(() => monthlySeries.value.find(item => item.month === currentMonthSummary.value.month && item.year === currentMonthSummary.value.year - 1) || null);

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

    // ==================== Phase 1: Month-over-Month Deltas ====================
    const monthlyDelta = computed(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Get previous month
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
      }

      // Current month expenses
      const currentExpenses = transactions.value
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Previous month expenses
      const prevExpenses = transactions.value
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear && t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Current month income
      const currentIncome = transactions.value
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Previous month income
      const prevIncome = transactions.value
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear && t.type === 'income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const expenseDelta = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;
      const incomeDelta = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;

      return {
        expenses: {
          current: currentExpenses,
          previous: prevExpenses,
          delta: expenseDelta,
          direction: expenseDelta > 0 ? 'up' : expenseDelta < 0 ? 'down' : 'flat',
        },
        income: {
          current: currentIncome,
          previous: prevIncome,
          delta: incomeDelta,
          direction: incomeDelta > 0 ? 'up' : incomeDelta < 0 ? 'down' : 'flat',
        },
      };
    });

    // ==================== Phase 1: Sparkline Data ====================
    const sparklineData = computed(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Get last 6 months of data
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        months.push({ month: d.getMonth(), year: d.getFullYear() });
      }

      const expenseSparkline = months.map(m => {
        return transactions.value
          .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year && t.type === 'expense';
          })
          .reduce((sum, t) => sum + t.amount, 0);
      });

      const incomeSparkline = months.map(m => {
        return transactions.value
          .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year && t.type === 'income';
          })
          .reduce((sum, t) => sum + t.amount, 0);
      });

      return {
        expenses: expenseSparkline,
        income: incomeSparkline,
      };
    });

    // Helper function to generate SVG sparkline
    function generateSparklineSVG(data, color = '#4ade80', height = 40) {
      if (!data || data.length === 0) return '';
      
      const maxVal = Math.max(...data, 1);
      const width = 100;
      const pointWidth = width / (data.length - 1 || 1);
      
      let points = data.map((val, i) => {
        const x = i * pointWidth;
        const y = height - (val / maxVal) * (height - 4);
        return `${x},${y}`;
      }).join(' ');

      return `<svg viewBox="0 0 ${width} ${height}" class="sparkline-chart" xmlns="http://www.w3.org/2000/svg">
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="${points} ${width},${height} 0,${height}" fill="url(#gradient)" opacity="0.2"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
          </linearGradient>
        </defs>
      </svg>`;
    }

    function generateTrendChartSVG(data, color = '#60a5fa', height = 120) {
      if (!data || data.length === 0) return '';
      const values = data.map(item => Number(item.value ?? item));
      const width = 320;
      const padding = 10;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      const pointWidth = (width - (padding * 2)) / Math.max(values.length - 1, 1);
      const points = values.map((value, index) => {
        const x = padding + (index * pointWidth);
        const y = height - padding - (((value - min) / range) * (height - (padding * 2)));
        return `${x},${y}`;
      }).join(' ');
      const area = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;
      const last = points.split(' ').pop().split(',');
      return `<svg viewBox="0 0 ${width} ${height}" class="trend-chart" xmlns="http://www.w3.org/2000/svg">
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <polyline points="${area}" fill="${color}" opacity="0.12" stroke="none" />
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="${color}" />
      </svg>`;
    }

    // ==================== Phase 3: Advanced Search & Filter ====================
    // ==================== Phase 4: Tags Filter ====================
    // Filter state for all filter parameters
    const filterState = reactive({
      text: '',
      dateFrom: '',
      dateTo: '',
      type: '', // 'income', 'expense', or '' for all
      account: '', // account ID or '' for all
      category: '', // category ID or '' for all
      tags: [], // Phase 4: Array of tag filters
    });

    // Get all unique tags from transactions
    const allTags = computed(() => {
      const tags = new Set();
      transactions.value.forEach(txn => {
        (txn.tags || []).forEach(tag => tags.add(tag));
      });
      return Array.from(tags).sort();
    });

    // Load filter state from localStorage on mount
    function loadFilterState() {
      try {
        const stored = localStorage.getItem('nightledger-filterstate');
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.assign(filterState, parsed);
        }
      } catch (err) {
        console.warn('Failed to load filter state:', err);
      }
    }

    // Save filter state to localStorage whenever it changes
    function saveFilterState() {
      try {
        localStorage.setItem('nightledger-filterstate', JSON.stringify(filterState));
      } catch (err) {
        console.warn('Failed to save filter state:', err);
      }
    }

    // Watch for changes to filterState and save to localStorage
    watch(() => filterState, saveFilterState, { deep: true });

    // Watch for theme changes and apply immediately
    watch(() => settings.value.theme, () => {
      applyTheme();
    });

    // Sync filterText (legacy) with filterState.text for backward compatibility
    watch(() => filterText.value, (val) => {
      if (filterState.text !== val) {
        filterState.text = val;
      }
    });

    watch(() => filterState.text, (val) => {
      if (filterText.value !== val) {
        filterText.value = val;
      }
    });

    // Computed: count of active filters
    const activeFilterCount = computed(() => {
      let count = 0;
      if (filterState.text) count++;
      if (filterState.dateFrom) count++;
      if (filterState.dateTo) count++;
      if (filterState.type) count++;
      if (filterState.account) count++;
      if (filterState.category) count++;
      if (filterState.tags.length > 0) count++;
      return count;
    });

    // Clear all filters
    function clearAllFilters() {
      filterState.text = '';
      filterState.dateFrom = '';
      filterState.dateTo = '';
      filterState.type = '';
      filterState.account = '';
      filterState.category = '';
      filterState.tags = [];
      showFilterModal.value = false;
    }

    // Helper to highlight matching text (escape HTML, wrap matches)
    function highlightText(text, query) {
      if (!query || !text) return text;
      const escaped = String(text).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return escaped.replace(regex, '<mark>$1</mark>');
    }

    // ==================== Phase 2: Smart Budget Suggestions ====================
    const suggestedBudgets = computed(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Get last 3 months data
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        months.push({ month: d.getMonth(), year: d.getFullYear() });
      }

      const categoryMonthlyData = {};
      
      // Aggregate spending by category for each month
      months.forEach(m => {
        transactions.value
          .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year && t.type === 'expense';
          })
          .forEach(t => {
            if (!categoryMonthlyData[t.category]) {
              categoryMonthlyData[t.category] = [];
            }
            categoryMonthlyData[t.category].push(t.amount);
          });
      });

      // Calculate suggestions: average + 20% buffer
      const suggestions = {};
      Object.entries(categoryMonthlyData).forEach(([catId, amounts]) => {
        const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        suggestions[catId] = Math.round(average * 1.2 * 100) / 100;
      });

      return suggestions;
    });

    const topCategories = computed(() => {
      const categoryMap = Object.fromEntries(categories.value.map(category => [category.id, category]));
      const currentMonthDate = getMonthDate(0);
      const previousMonthDate = getMonthDate(-1);
      const categoryTotals = {};
      const previousTotals = {};
      const budgetMap = Object.fromEntries(budgets.value.map(budget => [budget.categoryId, budget]));

      getTransactionsForMonth(currentMonthDate, 'expense').forEach(txn => {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + Number(txn.amount || 0);
      });

      getTransactionsForMonth(previousMonthDate, 'expense').forEach(txn => {
        previousTotals[txn.category] = (previousTotals[txn.category] || 0) + Number(txn.amount || 0);
      });

      const totals = Object.entries(categoryTotals)
        .map(([catId, total]) => {
          const previous = previousTotals[catId] || 0;
          const delta = getPercentChange(total, previous);
          const budget = budgetMap[catId];
          const budgetUsage = budget ? (total / Math.max(Number(budget.limit || 1), 1)) * 100 : 0;
          let insightBadge = '';
          let insightState = 'flat';

          if (previous === 0 && total > 0) {
            insightBadge = 'New this month';
            insightState = 'new';
          } else if (Math.abs(delta) >= 8) {
            insightBadge = `${delta >= 0 ? '+' : ''}${Math.round(delta)}% vs last month`;
            insightState = delta > 0 ? 'up' : 'down';
          } else if (budget && budgetUsage >= 100) {
            insightBadge = `${Math.round(budgetUsage)}% of budget`;
            insightState = 'warn';
          }

          return {
            id: catId,
            ...(categoryMap[catId] || { name: 'Unknown', emoji: '📌', color: '#6b7280' }),
            total,
            previous,
            delta,
            budgetUsage,
            budgetLimit: budget ? Number(budget.limit || 0) : 0,
            insightBadge,
            insightState,
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const maxTotal = Math.max(...totals.map(item => item.total), 1);
      return totals.map(item => ({
        ...item,
        percentage: (item.total / maxTotal) * 100,
      }));
    });

    const savingsRateTrend = computed(() => {
      const trend = monthlySeries.value.slice(-6);
      const current = trend[trend.length - 1] || currentMonthSummary.value;
      const previous = trend[trend.length - 2] || previousMonthSummary.value;
      const delta = current.savingsRate - (previous?.savingsRate || 0);
      return {
        currentRate: current.savingsRate || 0,
        currentSavings: current.net || 0,
        averageRate: trend.length ? trend.reduce((sum, month) => sum + month.savingsRate, 0) / trend.length : 0,
        delta,
        direction: delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat',
        trend: trend.map(month => Number(month.savingsRate || 0)),
        labels: trend.map(month => month.labelShort),
      };
    });

    const spendingVelocity = computed(() => {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysElapsed = now.getDate();
      const projectedSpend = daysElapsed > 0 ? (monthlyExpenses.value / daysElapsed) * daysInMonth : monthlyExpenses.value;
      const variance = projectedSpend - totalBudget.value;
      const state = totalBudget.value
        ? variance > totalBudget.value * 0.03 ? 'over' : variance < -totalBudget.value * 0.03 ? 'under' : 'even'
        : 'neutral';
      return {
        daysInMonth,
        daysElapsed,
        projectedSpend,
        variance,
        budgetTotal: totalBudget.value,
        daysElapsedPct: daysInMonth ? (daysElapsed / daysInMonth) * 100 : 0,
        budgetConsumedPct: totalBudget.value ? (monthlyExpenses.value / totalBudget.value) * 100 : 0,
        state,
      };
    });

    const budgetBurnDown = computed(() => {
      const variancePct = spendingVelocity.value.budgetConsumedPct - spendingVelocity.value.daysElapsedPct;
      return {
        ...spendingVelocity.value,
        variancePct,
        state: variancePct > 6 ? 'over' : variancePct < -6 ? 'under' : 'even',
      };
    });

    const recurringExpenseProjection = computed(() => {
      const recurringExpenses = recurringTransactions.value
        .filter(item => (item.type || 'expense') === 'expense')
        .map(item => ({
          ...item,
          monthlyEquivalent: Number(item.amount || 0) * getFrequencyMonthlyFactor(item.frequency),
          nextDueDate: getNextRecurringDate(item),
        }))
        .sort((a, b) => a.nextDueDate - b.nextDueDate);

      return {
        monthlyProjected: recurringExpenses.reduce((sum, item) => sum + item.monthlyEquivalent, 0),
        next30DaysProjected: recurringExpenses
          .filter(item => (item.nextDueDate - new Date()) / (1000 * 60 * 60 * 24) <= 30)
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        items: recurringExpenses.slice(0, 4),
        count: recurringExpenses.length,
      };
    });

    // ==================== Phase 9: Income & Bill Projections ====================
    const recurringIncomeProjection = computed(() => {
      const recurringIncome = recurringTransactions.value
        .filter(item => (item.type || 'expense') === 'income')
        .map(item => ({
          ...item,
          monthlyEquivalent: Number(item.amount || 0) * getFrequencyMonthlyFactor(item.frequency),
          nextDueDate: getNextRecurringDate(item),
        }))
        .sort((a, b) => a.nextDueDate - b.nextDueDate);

      return {
        monthlyProjected: recurringIncome.reduce((sum, item) => sum + item.monthlyEquivalent, 0),
        next30DaysProjected: recurringIncome
          .filter(item => (item.nextDueDate - new Date()) / (1000 * 60 * 60 * 24) <= 30)
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        items: recurringIncome.slice(0, 4),
        count: recurringIncome.length,
      };
    });

    const incomeProjection = computed(() => {
      const now = new Date();
      const thisMonthIncome = monthlyIncome.value;
      const recurringIncome = recurringIncomeProjection.value.monthlyProjected;
      const totalProjectedIncome = thisMonthIncome + recurringIncome;
      const incomeTarget = settings.value.incomeTarget || 0;
      const percentToTarget = incomeTarget > 0 ? (totalProjectedIncome / incomeTarget) * 100 : 0;
      const remainingToTarget = Math.max(0, incomeTarget - totalProjectedIncome);

      return {
        actualThisMonth: thisMonthIncome,
        recurringMonthly: recurringIncome,
        total: totalProjectedIncome,
        target: incomeTarget,
        percentToTarget,
        remainingToTarget,
        onTrack: totalProjectedIncome >= incomeTarget,
      };
    });

    const dueAlerts = computed(() => {
      const now = new Date();
      const dueSoon = bills.value
        .filter(bill => {
          if (bill.status === 'paid') return false;
          const dueDate = new Date(bill.dueDate);
          const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
          return daysUntilDue >= 0 && daysUntilDue <= 7;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      const overdue = bills.value
        .filter(bill => {
          if (bill.status === 'paid') return false;
          const dueDate = new Date(bill.dueDate);
          const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
          return daysUntilDue < 0;
        });

      return {
        dueSoon,
        overdue,
        totalDueSoon: dueSoon.reduce((sum, b) => sum + Number(b.amount || 0), 0),
        totalOverdue: overdue.reduce((sum, b) => sum + Number(b.amount || 0), 0),
        hasAlerts: dueSoon.length > 0 || overdue.length > 0,
      };
    });

    const incomeTrend = computed(() => {
      const trend = monthlySeries.value.slice(-6);
      const current = trend[trend.length - 1] || currentMonthSummary.value;
      const previous = trend[trend.length - 2] || previousMonthSummary.value;
      const change = getPercentChange(current.income || 0, previous?.income || 0);
      return {
        currentIncome: current.income || 0,
        previousIncome: previous?.income || 0,
        change,
        direction: change > 1 ? 'up' : change < -1 ? 'down' : 'flat',
        trend: trend.map(month => month.income || 0),
        labels: trend.map(month => month.labelShort),
      };
    });

    const comparisonSummary = computed(() => {
      const current = currentMonthSummary.value;
      const previous = previousMonthSummary.value;
      const yoy = sameMonthLastYearSummary.value;
      const fallbackReference = yoy || previous;
      return {
        monthLabel: current.labelLong,
        comparisonLabel: previous?.labelLong || 'Last month',
        yoyLabel: yoy ? yoy.labelLong : `${previous?.labelLong || 'last month'} (YoY fallback)`,
        rows: [
          { label: 'Income', current: current.income, previous: previous.income, yoy: fallbackReference.income, change: getPercentChange(current.income, previous.income) },
          { label: 'Expenses', current: current.expenses, previous: previous.expenses, yoy: fallbackReference.expenses, change: getPercentChange(current.expenses, previous.expenses) },
          { label: 'Net Cash', current: current.net, previous: previous.net, yoy: fallbackReference.net, change: getPercentChange(current.net, previous.net) },
        ],
      };
    });

    const netWorthHistory = computed(() => {
      const history = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const balances = accounts.value.map(account => {
          const futureImpact = transactions.value
            .filter(txn => txn.account === account.id && new Date(txn.date) > monthEnd)
            .reduce((sum, txn) => sum + getTransactionBalanceImpact(txn), 0);
          return Number(account.balance || 0) - futureImpact;
        });
        const assets = balances.filter(balance => balance >= 0).reduce((sum, balance) => sum + balance, 0);
        const debt = Math.abs(balances.filter(balance => balance < 0).reduce((sum, balance) => sum + balance, 0));
        history.push({
          label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          labelLong: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          assets,
          debt,
          value: assets - debt,
        });
      }
      return history;
    });

    const cashFlowForecast = computed(() => {
      const forecast = calculateForecast();
      return {
        projectedIncome: forecast.projectedMonthIncome || 0,
        projectedExpenses: forecast.projectedMonthExpenses || 0,
        projectedNet: forecast.projectedNetCashFlow || 0,
        predictedEndBalance: forecast.predictedEndBalance || 0,
        state: (forecast.projectedNetCashFlow || 0) >= 0 ? 'positive' : 'negative',
      };
    });

    const debtAccounts = computed(() => {
      return accounts.value
        .filter(account => account.type === 'credit' || Number(account.balance || 0) < 0)
        .map(account => ({
          ...account,
          balanceAbs: Math.abs(Math.min(Number(account.balance || 0), 0)),
          apr: Number(account.apr || 18.9),
          minPayment: Number(account.minPayment || Math.max(25, Math.round(Math.abs(Number(account.balance || 0)) * 0.02))),
        }))
        .filter(account => account.balanceAbs > 0);
    });

    function calculateDebtPayoffPlan(strategy = 'avalanche') {
      const extraPayment = Math.max(0, Number(debtSimulator.extraPayment || 0));
      const debts = debtAccounts.value.map(account => ({
        id: account.id,
        name: account.name,
        apr: Number(account.apr || 18.9),
        balance: Number(account.balanceAbs || 0),
        minPayment: Number(account.minPayment || 25),
      }));

      if (!debts.length) {
        return { strategy, months: 0, totalInterest: 0, totalPaid: 0, monthlyPayment: 0, payoffOrder: [], timeline: [] };
      }

      const rankDebts = () => debts
        .filter(debt => debt.balance > 0.01)
        .sort((a, b) => {
          if (strategy === 'snowball') {
            return a.balance - b.balance || b.apr - a.apr;
          }
          return b.apr - a.apr || a.balance - b.balance;
        });

      let month = 0;
      let totalInterest = 0;
      const payoffOrder = [];
      const timeline = [];

      while (debts.some(debt => debt.balance > 0.01) && month < 600) {
        month += 1;

        debts.forEach(debt => {
          if (debt.balance <= 0.01) return;
          const interest = debt.balance * (debt.apr / 100 / 12);
          debt.balance += interest;
          totalInterest += interest;
        });

        const payments = {};
        debts.forEach(debt => {
          if (debt.balance <= 0.01) return;
          const minimum = Math.min(debt.minPayment, debt.balance);
          debt.balance -= minimum;
          payments[debt.id] = minimum;
        });

        let extraPool = extraPayment;
        while (extraPool > 0.01) {
          const activeDebts = rankDebts();
          if (!activeDebts.length) break;
          const target = activeDebts[0];
          const extra = Math.min(extraPool, target.balance);
          target.balance -= extra;
          payments[target.id] = (payments[target.id] || 0) + extra;
          extraPool -= extra;
        }

        debts.forEach(debt => {
          if (debt.balance <= 0.01 && !payoffOrder.includes(debt.name)) {
            debt.balance = 0;
            payoffOrder.push(debt.name);
          }
        });

        if (month <= 6 || month % 6 === 0 || debts.every(debt => debt.balance <= 0.01)) {
          timeline.push({
            month,
            remainingBalance: debts.reduce((sum, debt) => sum + debt.balance, 0),
            activeCount: debts.filter(debt => debt.balance > 0.01).length,
          });
        }
      }

      const principal = debtAccounts.value.reduce((sum, debt) => sum + debt.balanceAbs, 0);
      const monthlyPayment = debtAccounts.value.reduce((sum, debt) => sum + debt.minPayment, 0) + extraPayment;
      return {
        strategy,
        months: month,
        totalInterest,
        totalPaid: principal + totalInterest,
        monthlyPayment,
        payoffOrder,
        timeline,
      };
    }

    const debtPayoffPlans = computed(() => ({
      snowball: calculateDebtPayoffPlan('snowball'),
      avalanche: calculateDebtPayoffPlan('avalanche'),
    }));

    const selectedDebtPayoffPlan = computed(() => debtPayoffPlans.value[debtSimulator.strategy] || debtPayoffPlans.value.avalanche);

    const recentTransactions = computed(() => {
      return [...transactions.value].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    // Enhanced filteredTransactions with Phase 3 multi-filter support
    const filteredTransactions = computed(() => {
      return transactions.value.filter(t => {
        // Text search (search in description, category name, account name)
        if (filterState.text) {
          const searchText = filterState.text.toLowerCase();
          const categoryName = categories.value.find(c => c.id === t.category)?.name.toLowerCase() || '';
          const accountName = accounts.value.find(a => a.id === t.account)?.name.toLowerCase() || '';
          const matches = t.description.toLowerCase().includes(searchText) ||
                         categoryName.includes(searchText) ||
                         accountName.includes(searchText);
          if (!matches) return false;
        }

        // Date range filter
        if (filterState.dateFrom) {
          const txnDate = new Date(t.date);
          const fromDate = new Date(filterState.dateFrom);
          if (txnDate < fromDate) return false;
        }
        if (filterState.dateTo) {
          const txnDate = new Date(t.date);
          const toDate = new Date(filterState.dateTo);
          toDate.setDate(toDate.getDate() + 1); // Include the end date
          if (txnDate >= toDate) return false;
        }

        // Transaction type filter
        if (filterState.type && t.type !== filterState.type) {
          return false;
        }

        // Account filter
        if (filterState.account && t.account !== filterState.account) {
          return false;
        }

        // Category filter
        if (filterState.category && t.category !== filterState.category) {
          return false;
        }

        // Phase 4: Tags filter - match any selected tag
        if (filterState.tags.length > 0) {
          const txnTags = t.tags || [];
          const hasMatchingTag = filterState.tags.some(tag => txnTags.includes(tag));
          if (!hasMatchingTag) return false;
        }

        return true;
      });
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
      }).format(Number(amount || 0));
    }

    function formatPercent(value, digits = 0) {
      return `${Number(value || 0).toFixed(digits)}%`;
    }

    function formatSignedPercent(value, digits = 0) {
      const numeric = Number(value || 0);
      return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(digits)}%`;
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

    // ==================== Phase 1: AI Insights ====================
    async function fetchAIInsight() {
      if (!settings.value.llmEndpoint) return;
      
      aiInsightLoading.value = true;
      try {
        const topCats = topCategories.value;
        const totalExpenses = monthlyExpenses.value;
        const expenseDelta = monthlyDelta.value.expenses.delta;

        const prompt = `Based on this month's spending data, provide a brief 1-sentence AI insight about spending patterns:
- Total expenses: ${formatCurrency(totalExpenses)}
- Top categories: ${topCats.map(c => `${c.emoji} ${c.name}: ${formatCurrency(c.total)}`).join(', ')}
- Month-over-month change: ${expenseDelta > 0 ? '+' : ''}${expenseDelta.toFixed(1)}%

Keep it concise and actionable.`;

        const result = await window.AI.runAI(
          [{ role: 'user', content: prompt }],
          {
            endpoint: settings.value.llmEndpoint,
            apiKey: settings.value.apiKey,
            model: settings.value.llmModel || window.AI.defaults.model,
            temperature: 0.7,
            onDone: () => {},
          }
        );

        if (result) {
          aiInsight.value = result.trim();
        }
      } catch (err) {
        console.error('Failed to fetch AI insight:', err);
      } finally {
        aiInsightLoading.value = false;
      }
    }

    // ==================== Phase 1: Real-time Category Prediction ====================
    async function predictCategories() {
      if (!quickAdd.description.trim() || !settings.value.llmEndpoint) {
        predictedCategories.value = [];
        return;
      }

      categoryPredictionLoading.value = true;
      
      // Cancel previous request if still running
      if (categoryPredictionAbortController) {
        categoryPredictionAbortController.abort();
      }
      categoryPredictionAbortController = new AbortController();

      try {
        const categoryList = categories.value.map(c => `${c.id}: ${c.emoji} ${c.name}`).join('\n');
        const prompt = `Given this transaction description: "${quickAdd.description}"

Categorize it by selecting the TOP 3 most likely categories from this list:
${categoryList}

Return ONLY a JSON array of 3 category IDs (in order of likelihood), like: ["cat-groceries", "cat-shopping", "cat-dining"]`;

        const result = await window.AI.runAI(
          [{ role: 'user', content: prompt }],
          {
            endpoint: settings.value.llmEndpoint,
            apiKey: settings.value.apiKey,
            model: settings.value.llmModel || window.AI.defaults.model,
            temperature: 0.3,
            signal: categoryPredictionAbortController.signal,
            onDone: () => {},
          }
        );

        if (result) {
          try {
            // Extract JSON array from response
            const jsonMatch = result.match(/\[.*?\]/s);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
            predictedCategories.value = parsed.slice(0, 3);
          } catch (e) {
            console.error('Failed to parse category predictions:', e);
            predictedCategories.value = [];
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to predict categories:', err);
        }
      } finally {
        categoryPredictionLoading.value = false;
      }
    }

    // Debounce category prediction on description change
    let categoryPredictionTimer = null;
    watch(() => quickAdd.description, () => {
      clearTimeout(categoryPredictionTimer);
      categoryPredictionTimer = setTimeout(() => {
        predictCategories();
      }, 500);
    });

    // ==================== Phase 2: Recurring Transaction Management ====================
    function generateRecurringTransactions() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      recurringTransactions.value.forEach(recurring => {
        // Check if transaction already exists for this month
        const exists = transactions.value.some(t => {
          const d = new Date(t.date);
          return t.recurringId === recurring.id && 
                 d.getMonth() === currentMonth && 
                 d.getFullYear() === currentYear;
        });

        if (!exists) {
          // Determine if we should generate based on frequency
          const lastDate = new Date(recurring.lastGenerated || recurring.date);
          let shouldGenerate = false;
          
          if (recurring.frequency === 'weekly') {
            shouldGenerate = (now - lastDate) >= 7 * 24 * 60 * 60 * 1000;
          } else if (recurring.frequency === 'biweekly') {
            shouldGenerate = (now - lastDate) >= 14 * 24 * 60 * 60 * 1000;
          } else if (recurring.frequency === 'monthly') {
            shouldGenerate = lastDate.getMonth() !== currentMonth;
          } else if (recurring.frequency === 'quarterly') {
            shouldGenerate = Math.floor(lastDate.getMonth() / 3) !== Math.floor(currentMonth / 3);
          }

          if (shouldGenerate) {
            const txn = {
              id: 'txn-' + Date.now(),
              amount: recurring.amount,
              category: recurring.category,
              account: recurring.account,
              description: recurring.description,
              date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
              type: 'expense',
              isRecurringGenerated: true,
              recurringId: recurring.id,
              timestamp: Date.now(),
            };
            
            transactions.value.push(txn);
            updateAccountBalance(recurring.account, recurring.amount, true);
            recurring.lastGenerated = new Date().toISOString();
          }
        }
      });
      
      saveAllData();
    }

    // ==================== Transaction Management ====================
    function addTransaction() {
      if (!quickAdd.amount || (!quickAdd.category && quickAdd.type === 'expense') || !quickAdd.account) {
        showNotification('Please fill in all required fields');
        return;
      }

      // If recurring, add to recurring transactions array
      if (quickAdd.isRecurring) {
        const recurring = {
          id: 'rec-' + Date.now(),
          amount: parseFloat(quickAdd.amount),
          category: quickAdd.type === 'income' ? quickAdd.incomeSource : quickAdd.category,
          account: quickAdd.account,
          description: quickAdd.description || (quickAdd.type === 'income' ? 'Income' : 'Recurring Transaction'),
          date: quickAdd.date,
          frequency: quickAdd.frequency,
          type: quickAdd.type, // Phase 9: Support income type
          lastGenerated: quickAdd.date,
          createdAt: new Date().toISOString(),
        };
        
        recurringTransactions.value.push(recurring);
        showNotification(`Recurring ${quickAdd.frequency} ${quickAdd.type} added!`);
      } else {
        // Add single transaction
        const txn = {
          id: 'txn-' + Date.now(),
          amount: parseFloat(quickAdd.amount),
          category: quickAdd.type === 'income' ? quickAdd.incomeSource : quickAdd.category,
          account: quickAdd.account,
          description: quickAdd.description || (quickAdd.type === 'income' ? 'Income' : 'Transaction'),
          date: quickAdd.date,
          type: quickAdd.type, // Phase 9: Store income/expense type
          tags: quickAdd.tags || [],
          timestamp: Date.now(),
        };

        transactions.value.push(txn);
        updateAccountBalance(quickAdd.account, parseFloat(quickAdd.amount), quickAdd.type === 'expense');
        recordAction('add_transaction', { txn });
        // Phase 7: Haptic feedback on transaction add
        triggerHaptic([50, 30, 100]);
        showNotification(`${quickAdd.type === 'income' ? 'Income' : 'Transaction'} added!`);
      }
      
      saveAllData();
      
      // Reset form
      quickAdd.amount = '';
      quickAdd.description = '';
      quickAdd.date = new Date().toISOString().split('T')[0];
      quickAdd.isRecurring = false;
      quickAdd.frequency = 'monthly';
      quickAdd.tags = [];
      quickAdd.tagsInput = '';
      predictedCategories.value = [];
      showQuickAddMenu.value = false;
      
      // Refresh AI insight
      fetchAIInsight();
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
        tags: [],
        receiptImage: receiptImage.value,
        receiptData: receiptParsed.value,
        timestamp: Date.now(),
      };

      transactions.value.push(txn);
      recordAction('add_transaction', { txn });
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
      
      // Refresh AI insight
      fetchAIInsight();
    }

    function deleteTransaction(id) {
      const txn = transactions.value.find(t => t.id === id);
      if (!txn) return;

      updateAccountBalance(txn.account, txn.amount, txn.type === 'expense', true);
      recordAction('delete_transaction', { txn: JSON.parse(JSON.stringify(txn)) });
      transactions.value = transactions.value.filter(t => t.id !== id);
      saveAllData();
      contextMenu.visible = false;
      // Phase 7: Haptic feedback on delete
      triggerHaptic([100, 50, 100, 50, 150]);
      showNotification('Transaction deleted');
      
      // Refresh AI insight
      fetchAIInsight();
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
        tags: txn.tags ? [...txn.tags] : [],
      };
      transactions.value.push(dup);
      recordAction('add_transaction', { txn: dup });
      saveAllData();
      contextMenu.visible = false;
      showNotification('Transaction duplicated');
      
      // Refresh AI insight
      fetchAIInsight();
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

        // ==================== Phase 13: Transaction Enhancements ====================

    /**
     * Feature 1: Multi-line Notes
     * Feature 2: Attachment Support
     * Feature 5: Split Transactions
     * Feature 6: Location Tagging
     * Feature 7: Payment Method Tracking
     * Feature 8: OCR Correction
     * Feature 9: Time-of-Day Tracking
     * Feature 3: Transaction Templates (save/load)
     */
    function editTransactionPhase13(txn) {
      if (txn) {
        phase13.editingTxn = txn;
        phase13.editForm.description = txn.description || '';
        phase13.editForm.notes = txn.notes || '';
        phase13.editForm.amount = txn.amount || 0;
        phase13.editForm.date = txn.date || new Date().toISOString().split('T')[0];
        phase13.editForm.timeOfDay = txn.timeOfDay || '12:00';
        phase13.editForm.location = txn.location || '';
        phase13.editForm.paymentMethod = txn.paymentMethod || '';
        phase13.editForm.isSplit = txn.isSplit || false;
        phase13.editForm.splitItems = txn.splitItems ? JSON.parse(JSON.stringify(txn.splitItems)) : [];
        phase13.editForm.attachments = txn.attachments ? JSON.parse(JSON.stringify(txn.attachments)) : [];
        phase13.editForm.receiptData = txn.receiptData ? JSON.parse(JSON.stringify(txn.receiptData)) : null;
        phase13.editForm.saveAsTemplate = false;
        phase13.editForm.templateName = '';
      } else {
        // New transaction form
        resetPhase13EditForm();
        phase13.editingTxn = null;
      }
      phase13.showEditModal = true;
      contextMenu.visible = false;
    }

    function resetPhase13EditForm() {
      phase13.editForm = {
        description: '',
        notes: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        timeOfDay: '12:00',
        location: '',
        paymentMethod: '',
        isSplit: false,
        splitItems: [],
        attachments: [],
        receiptData: null,
        saveAsTemplate: false,
        templateName: '',
      };
    }

    function addSplitItem() {
      phase13.editForm.splitItems.push({
        description: '',
        amount: 0,
      });
    }

    function handleAttachmentUpload(event) {
      const files = event.target.files;
      if (!files) return;

      Array.from(files).forEach(file => {
        // Store file name and size; in production, store base64 data
        if (!phase13.editForm.attachments) {
          phase13.editForm.attachments = [];
        }
        phase13.editForm.attachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          // In production: use FileReader to get base64 data
          // data: base64Data
        });
      });
      showNotification(`Added ${files.length} attachment(s)`);
    }

    function saveTransactionEdit() {
      if (!phase13.editForm.description || !phase13.editForm.amount) {
        showNotification('Please fill in description and amount');
        return;
      }

      if (phase13.editingTxn) {
        // Update existing transaction
        const idx = transactions.value.findIndex(t => t.id === phase13.editingTxn.id);
        if (idx >= 0) {
          const txn = transactions.value[idx];
          
          // Update all enhanced fields
          txn.description = phase13.editForm.description;
          txn.notes = phase13.editForm.notes; // Feature 1: Multi-line notes
          txn.location = phase13.editForm.location; // Feature 6: Location tagging
          txn.paymentMethod = phase13.editForm.paymentMethod; // Feature 7: Payment method
          txn.timeOfDay = phase13.editForm.timeOfDay; // Feature 9: Time-of-day
          txn.date = phase13.editForm.date;
          
          // Handle amount change
          const amountDiff = phase13.editForm.amount - txn.amount;
          txn.amount = phase13.editForm.amount;
          
          // Update split if applicable
          if (phase13.editForm.isSplit) {
            txn.isSplit = true;
            txn.splitItems = phase13.editForm.splitItems;
          } else {
            txn.isSplit = false;
            txn.splitItems = [];
          }

          // Update attachments
          if (phase13.editForm.attachments && phase13.editForm.attachments.length > 0) {
            txn.attachments = phase13.editForm.attachments;
          }

          // Update receipt data if corrected
          if (phase13.editForm.receiptData) {
            txn.receiptData = phase13.editForm.receiptData;
          }

          recordAction('edit_transaction', { txn: JSON.parse(JSON.stringify(txn)) });
          
          if (amountDiff !== 0) {
            updateAccountBalance(txn.account, Math.abs(amountDiff), amountDiff < 0, amountDiff > 0);
          }
        }
        showNotification('Transaction updated');
      } else {
        // Create new transaction
        const txn = {
          id: 'txn-' + Date.now(),
          description: phase13.editForm.description,
          amount: phase13.editForm.amount,
          date: phase13.editForm.date,
          type: 'expense',
          category: quickAdd.category,
          account: quickAdd.account,
          notes: phase13.editForm.notes,
          location: phase13.editForm.location,
          paymentMethod: phase13.editForm.paymentMethod,
          timeOfDay: phase13.editForm.timeOfDay,
          isSplit: phase13.editForm.isSplit,
          splitItems: phase13.editForm.splitItems,
          attachments: phase13.editForm.attachments,
          timestamp: Date.now(),
        };

        transactions.value.push(txn);
        updateAccountBalance(quickAdd.account, phase13.editForm.amount, true);
        recordAction('add_transaction', { txn });
        showNotification('Transaction added');
      }

      // Save as template if requested
      if (phase13.editForm.saveAsTemplate && phase13.editForm.templateName) {
        saveAsTemplate();
      }

      saveAllData();
      phase13.showEditModal = false;
      resetPhase13EditForm();
      fetchAIInsight();
    }

    function loadPhase13Templates() {
      // Templates are loaded in loadAllData()
      // This function can be used to refresh or reload templates
    }

    /**
     * Feature 3: Transaction Templates
     * Save current transaction as a reusable template
     */
    function saveAsTemplate() {
      const template = {
        id: 'tpl-' + Date.now(),
        name: phase13.editForm.templateName,
        description: phase13.editForm.description,
        amount: phase13.editForm.amount,
        category: quickAdd.category,
        location: phase13.editForm.location,
        paymentMethod: phase13.editForm.paymentMethod,
        notes: phase13.editForm.notes,
        isSplit: phase13.editForm.isSplit,
        splitItems: JSON.parse(JSON.stringify(phase13.editForm.splitItems)),
        createdAt: new Date().toISOString(),
      };
      phase13.templates.push(template);
      saveStorage('phase13_templates', phase13.templates);
      showNotification(`Template "${phase13.editForm.templateName}" saved`);
    }

    function applyTemplate(template) {
      phase13.editForm.description = template.description;
      phase13.editForm.amount = template.amount;
      phase13.editForm.location = template.location;
      phase13.editForm.paymentMethod = template.paymentMethod;
      phase13.editForm.notes = template.notes;
      phase13.editForm.isSplit = template.isSplit;
      phase13.editForm.splitItems = JSON.parse(JSON.stringify(template.splitItems));
      quickAdd.category = template.category;
      phase13.showTemplatesModal = false;
      phase13.showEditModal = true;
      showNotification(`Applied template: ${template.name}`);
    }

    function deleteTemplate(id) {
      phase13.templates = phase13.templates.filter(t => t.id !== id);
      saveStorage('phase13_templates', phase13.templates);
      showNotification('Template deleted');
    }

    /**
     * Feature 10: Duplicate Detection
     * Detects potential duplicate transactions based on:
     * - Similar description
     * - Similar amount
     * - Same date or nearby dates
     */
    function detectDuplicates() {
      const duplicateGroups = [];
      const threshold = 0.7; // 70% similarity required

      for (let i = 0; i < transactions.value.length; i++) {
        for (let j = i + 1; j < transactions.value.length; j++) {
          const txn1 = transactions.value[i];
          const txn2 = transactions.value[j];

          // Calculate similarity
          const descriptionSimilarity = calculateStringSimilarity(
            txn1.description.toLowerCase(),
            txn2.description.toLowerCase()
          );

          const amountDiff = Math.abs(txn1.amount - txn2.amount);
          const maxAmount = Math.max(txn1.amount, txn2.amount);
          const amountSimilarity = 1 - (amountDiff / maxAmount);

          // Check if dates are close (same day or within 1 day)
          const date1 = new Date(txn1.date);
          const date2 = new Date(txn2.date);
          const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
          const dateSimilarity = daysDiff <= 1 ? 1 : 0.5;

          // Weighted similarity
          const similarity = (descriptionSimilarity * 0.5 + amountSimilarity * 0.4 + dateSimilarity * 0.1);

          if (similarity >= threshold && txn1.id !== txn2.id) {
            // Check if this pair is already in a group
            const existingGroup = duplicateGroups.find(
              g => g.id === txn1.id || g.id === txn2.id
            );

            if (!existingGroup) {
              duplicateGroups.push({
                id: txn1.id,
                description: txn1.description,
                similarity: similarity,
                matches: [txn2],
              });
            } else {
              if (!existingGroup.matches.find(m => m.id === txn2.id)) {
                existingGroup.matches.push(txn2);
              }
            }
          }
        }
      }

      phase13.potentialDuplicates = duplicateGroups;
      if (duplicateGroups.length > 0) {
        phase13.showDuplicateModal = true;
        showNotification(`Found ${duplicateGroups.length} possible duplicates`);
      } else {
        showNotification('No duplicates detected');
      }
    }

    /**
     * Helper: Calculate string similarity using Levenshtein distance
     */
    function calculateStringSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;

      if (longer.length === 0) return 1;

      const editDistance = levenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    }

    /**
     * Helper: Levenshtein distance calculation
     */
    function levenshteinDistance(str1, str2) {
      const matrix = [];

      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }

      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      return matrix[str2.length][str1.length];
    }

    function markAsDuplicate(txn) {
      deleteTransaction(txn.id);
      phase13.potentialDuplicates = phase13.potentialDuplicates.filter(
        group => group.matches.some(m => m.id !== txn.id)
      );
      showNotification('Duplicate transaction deleted');
    }

    /**
     * Feature 4: Bulk Edit
     * Apply changes to multiple selected transactions
     */
    function applyBulkEdit() {
      if (phase13.selectedForBulkEdit.length === 0) {
        showNotification('No transactions selected');
        return;
      }

      phase13.selectedForBulkEdit.forEach(txnId => {
        const txn = transactions.value.find(t => t.id === txnId);
        if (!txn) return;

        if (phase13.bulkEditOptions.updateCategory) {
          txn.category = phase13.bulkEditOptions.newCategory;
        }
        if (phase13.bulkEditOptions.updateLocation) {
          txn.location = phase13.bulkEditOptions.newLocation;
        }
        if (phase13.bulkEditOptions.updatePaymentMethod) {
          txn.paymentMethod = phase13.bulkEditOptions.newPaymentMethod;
        }
        if (phase13.bulkEditOptions.updateTags) {
          const newTags = phase13.bulkEditOptions.tagsToAdd.split(',').map(t => t.trim());
          txn.tags = txn.tags ? [...new Set([...txn.tags, ...newTags])] : newTags;
        }
      });

      saveAllData();
      phase13.showBulkEditModal = false;
      phase13.selectedForBulkEdit = [];
      showNotification(`Updated ${phase13.selectedForBulkEdit.length} transactions`);
    }

    // ==================== Phase 9: Bill Management ====================
    function addBill() {
      if (!newBill.description || !newBill.amount || !newBill.dueDate) {
        showNotification('Please fill in all required fields');
        return;
      }

      const bill = {
        id: 'bill-' + Date.now(),
        description: newBill.description,
        amount: parseFloat(newBill.amount),
        dueDate: newBill.dueDate,
        status: newBill.status || 'unpaid',
        notes: newBill.notes || '',
        paidHistory: [],
        createdAt: new Date().toISOString(),
      };

      bills.value.push(bill);
      recordAction('add_bill', { bill });
      saveAllData();
      showNotification('Bill added!');

      // Reset form
      newBill.description = '';
      newBill.amount = '';
      newBill.dueDate = '';
      newBill.status = 'unpaid';
      newBill.notes = '';
    }

    function markBillPaid(bill) {
      const b = bills.value.find(x => x.id === bill.id);
      if (b) {
        b.status = 'paid';
        b.paidHistory = b.paidHistory || [];
        b.paidHistory.push({
          date: new Date().toISOString(),
          amount: b.amount,
        });
        saveAllData();
        showNotification('Bill marked as paid!');
        triggerHaptic([100, 50, 150]);
      }
    }

    function unmarkBillPaid(bill) {
      const b = bills.value.find(x => x.id === bill.id);
      if (b) {
        b.status = 'unpaid';
        b.paidHistory = b.paidHistory || [];
        b.paidHistory = b.paidHistory.slice(0, -1);
        saveAllData();
        showNotification('Bill marked as unpaid');
      }
    }

    function deleteBill(bill) {
      bills.value = bills.value.filter(b => b.id !== bill.id);
      recordAction('delete_bill', { bill });
      saveAllData();
      showNotification('Bill deleted');
      triggerHaptic([100, 50, 100, 50, 150]);
    }

    function editBill(bill) {
      billEditingId.value = bill.id;
      newBill.description = bill.description;
      newBill.amount = bill.amount.toString();
      newBill.dueDate = bill.dueDate;
      newBill.status = bill.status;
      newBill.notes = bill.notes || '';
    }

    function saveBillEdit() {
      if (!newBill.description || !newBill.amount || !newBill.dueDate) {
        showNotification('Please fill in all required fields');
        return;
      }

      const bill = bills.value.find(b => b.id === billEditingId.value);
      if (bill) {
        bill.description = newBill.description;
        bill.amount = parseFloat(newBill.amount);
        bill.dueDate = newBill.dueDate;
        bill.status = newBill.status;
        bill.notes = newBill.notes;
        saveAllData();
        showNotification('Bill updated!');
        
        // Reset
        billEditingId.value = null;
        newBill.description = '';
        newBill.amount = '';
        newBill.dueDate = '';
        newBill.status = 'unpaid';
        newBill.notes = '';
      }
    }

    function cancelBillEdit() {
      billEditingId.value = null;
      newBill.description = '';
      newBill.amount = '';
      newBill.dueDate = '';
      newBill.status = 'unpaid';
      newBill.notes = '';
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
        const mainResult = await refreshModelOptions('llm');
        const visionResult = await refreshModelOptions('vision');
        const mainOk = settings.value.llmEndpoint ? mainResult.ok : true;
        const visionOk = settings.value.visionEndpoint ? visionResult.ok : true;

        if (mainOk && visionOk) {
          aiEndpointStatus.value = 'ok';
          const modelCount = (llmModelOptions.value.length || 0) + (visionModelOptions.value.length || 0);
          showNotification(modelCount ? `Connections successful • ${modelCount} model${modelCount === 1 ? '' : 's'} discovered` : 'Connections successful!');
          await fetchAIInsight();
        } else {
          aiEndpointStatus.value = 'error';
          const messages = [
            !mainOk && settings.value.llmEndpoint ? (mainResult.message || 'LLM connection failed') : '',
            !visionOk && settings.value.visionEndpoint ? (visionResult.message || 'Vision connection failed') : '',
          ].filter(Boolean);
          showNotification(messages.join(' • ') || 'Connection failed');
        }
      } catch (err) {
        aiEndpointStatus.value = 'error';
        showNotification('Error: ' + err.message);
      }
    }

    // ==================== Phase 4: CSV Export ====================
    function exportAsCSV() {
      // Prepare CSV headers
      const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account', 'Tags'];
      
      // Prepare CSV rows
      const rows = transactions.value.map(txn => {
        const category = categories.value.find(c => c.id === txn.category);
        const account = accounts.value.find(a => a.id === txn.account);
        const tagString = (txn.tags || []).join(', ');
        return [
          txn.date,
          txn.description || '',
          txn.amount,
          txn.type,
          category ? category.name : 'Unknown',
          account ? account.name : 'Unknown',
          tagString,
        ];
      });

      // Convert to CSV format
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `night-ledger-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('CSV exported successfully!');
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
      URL.revokeObjectURL(url);
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
        aiInsight.value = null;
        showNotification('All data cleared');
      }
    }

    function loadDemoData() {
      if (confirm('🚀 Load demo data? This will replace existing data with 3 months of realistic transactions, budgets, goals, and bills.')) {
        if (window.SeedDataUtils) {
          // Create a proxy state object that includes all reactive refs
          const proxyState = {
            transactions,
            accounts,
            categories,
            incomeSources,
            budgets,
            goals,
            bills,
            // Add setters for each
            set transactions(val) { transactions.value = val; },
            set accounts(val) { accounts.value = val; },
            set categories(val) { categories.value = val; },
            set incomeSources(val) { incomeSources.value = val; },
            set budgets(val) { budgets.value = val; },
            set goals(val) { goals.value = val; },
            set bills(val) { bills.value = val; },
            get transactions() { return transactions.value; },
            get accounts() { return accounts.value; },
            get categories() { return categories.value; },
            get incomeSources() { return incomeSources.value; },
            get budgets() { return budgets.value; },
            get goals() { return goals.value; },
            get bills() { return bills.value; },
          };
          
          window.SeedDataUtils.initializeSeedData(proxyState);
          saveAllData();
          showNotification('✅ Demo data loaded! Explore the dashboard, reports, budgets, and goals.');
        } else {
          showNotification('❌ Seed data utility not loaded');
        }
      }
    }

    function wipeDemoData() {
      if (confirm('🗑️ Wipe all demo data? This will delete transactions, budgets, goals, and bills. Accounts and categories will be reset.')) {
        if (window.SeedDataUtils) {
          const proxyState = {
            transactions,
            accounts,
            categories,
            incomeSources,
            budgets,
            goals,
            bills,
            set transactions(val) { transactions.value = val; },
            set accounts(val) { accounts.value = val; },
            set categories(val) { categories.value = val; },
            set incomeSources(val) { incomeSources.value = val; },
            set budgets(val) { budgets.value = val; },
            set goals(val) { goals.value = val; },
            set bills(val) { bills.value = val; },
            get transactions() { return transactions.value; },
            get accounts() { return accounts.value; },
            get categories() { return categories.value; },
            get incomeSources() { return incomeSources.value; },
            get budgets() { return budgets.value; },
            get goals() { return goals.value; },
            get bills() { return bills.value; },
          };
          
          window.SeedDataUtils.wipeDemoData(proxyState);
          saveAllData();
          showNotification('✅ Demo data wiped. Ready for your own data.');
        }
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

    // ==================== Phase 4: Undo/Redo System ====================
    function recordAction(actionType, data) {
      const action = {
        id: 'action-' + Date.now(),
        type: actionType,
        timestamp: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(data)), // Deep clone to avoid reference issues
      };

      // Add to history and trim to last 5 actions
      actionHistory.value.push(action);
      if (actionHistory.value.length > 5) {
        actionHistory.value.shift();
      }
      historyIndex.value = actionHistory.value.length - 1;
      redoStack.value = []; // Clear redo stack when new action is performed
    }

    function undo() {
      if (historyIndex.value > 0) {
        historyIndex.value--;
        const action = actionHistory.value[historyIndex.value];
        
        // Apply undo based on action type
        if (action.type === 'add_transaction') {
          transactions.value = transactions.value.filter(t => t.id !== action.data.txn.id);
          updateAccountBalance(action.data.txn.account, action.data.txn.amount, action.data.txn.type === 'expense', true);
        } else if (action.type === 'delete_transaction') {
          transactions.value.push(action.data.txn);
          updateAccountBalance(action.data.txn.account, action.data.txn.amount, action.data.txn.type === 'expense', false);
        } else if (action.type === 'edit_transaction') {
          const idx = transactions.value.findIndex(t => t.id === action.data.oldTxn.id);
          if (idx >= 0) {
            transactions.value[idx] = action.data.oldTxn;
          }
        }
        
        saveAllData();
        showNotification('Undo successful');
      }
    }

    function redo() {
      if (historyIndex.value < actionHistory.value.length - 1) {
        historyIndex.value++;
        const action = actionHistory.value[historyIndex.value];
        
        // Apply redo based on action type
        if (action.type === 'add_transaction') {
          transactions.value.push(action.data.txn);
          updateAccountBalance(action.data.txn.account, action.data.txn.amount, action.data.txn.type === 'expense', false);
        } else if (action.type === 'delete_transaction') {
          transactions.value = transactions.value.filter(t => t.id !== action.data.txn.id);
          updateAccountBalance(action.data.txn.account, action.data.txn.amount, action.data.txn.type === 'expense', true);
        } else if (action.type === 'edit_transaction') {
          const idx = transactions.value.findIndex(t => t.id === action.data.newTxn.id);
          if (idx >= 0) {
            transactions.value[idx] = action.data.newTxn;
          }
        }
        
        saveAllData();
        showNotification('Redo successful');
      }
    }

    // Setup keyboard shortcuts for undo/redo
    function handleKeyboardShortcuts(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    }

    // ==================== Phase 4: Merchant Autocomplete ====================
    function getMerchantSuggestions(input) {
      if (!input || input.length < 2) {
        merchantSuggestions.value = [];
        return;
      }

      const merchants = new Set();
      transactions.value.forEach(txn => {
        if (txn.description && txn.description.toLowerCase().includes(input.toLowerCase())) {
          merchants.add(txn.description);
        }
      });

      merchantSuggestions.value = Array.from(merchants)
        .filter(m => m !== input)
        .slice(0, 5);
    }

    function selectMerchantSuggestion(merchant) {
      quickAdd.description = merchant;
      merchantSuggestions.value = [];
      showMerchantSuggestions.value = false;
    }

    // ==================== Goals ====================
    function getProgressOffset(goal) {
      const progress = goal.current / goal.target;
      const circumference = 2 * Math.PI * 45;
      return circumference * (1 - Math.min(1, progress));
    }

    // ==================== Phase 5 & 6: Analytics Functions ====================

    // Generate spending heatmap by day of week
    function generateSpendingHeatmap() {
      const heatmap = {
        'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0,
        'Thu': 0, 'Fri': 0, 'Sat': 0,
        counts: { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 }
      };
      
      transactions.value.forEach(txn => {
        if (txn.type === 'expense') {
          const d = new Date(txn.date);
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = days[d.getDay()];
          heatmap[dayName] += txn.amount;
          heatmap.counts[dayName]++;
        }
      });
      
      return heatmap;
    }

    // Get top 10 merchants by frequency
    function getTopMerchants(limit = 10) {
      const merchants = {};
      transactions.value.forEach(txn => {
        if (txn.description && txn.type === 'expense') {
          merchants[txn.description] = (merchants[txn.description] || 0) + 1;
        }
      });
      
      return Object.entries(merchants)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, freq]) => ({ name, frequency: freq }));
    }

    // Calculate category spending trends (month-over-month)
    function getCategoryTrends() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const trends = {};
      categories.value.forEach(cat => {
        trends[cat.id] = { name: cat.name, emoji: cat.emoji, current: 0, previous: 0 };
      });
      
      transactions.value.forEach(txn => {
        if (txn.type === 'expense') {
          const d = new Date(txn.date);
          const isCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          const isPreviousMonth = d.getMonth() === (currentMonth - 1 + 12) % 12 && 
                                  d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
          
          if (trends[txn.category]) {
            if (isCurrentMonth) trends[txn.category].current += txn.amount;
            if (isPreviousMonth) trends[txn.category].previous += txn.amount;
          }
        }
      });
      
      return Object.values(trends)
        .map(t => ({
          ...t,
          percentChange: t.previous > 0 ? ((t.current - t.previous) / t.previous * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.current - a.current);
    }

    // Detect spending anomalies (> 2 std dev from mean)
    function detectAnomalies() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthExpenses = transactions.value
        .filter(t => t.type === 'expense' && 
                     new Date(t.date).getMonth() === currentMonth &&
                     new Date(t.date).getFullYear() === currentYear)
        .map(t => t.amount);
      
      if (monthExpenses.length < 3) return [];
      
      const mean = monthExpenses.reduce((a, b) => a + b) / monthExpenses.length;
      const variance = monthExpenses.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / monthExpenses.length;
      const stdDev = Math.sqrt(variance);
      const threshold = mean + (2 * stdDev);
      
      return transactions.value
        .filter(t => t.type === 'expense' && 
                     new Date(t.date).getMonth() === currentMonth &&
                     new Date(t.date).getFullYear() === currentYear &&
                     t.amount > threshold)
        .sort((a, b) => b.amount - a.amount);
    }

    // Calculate spending forecast for month-end
    function calculateForecast() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dayOfMonth = now.getDate();
      const remainingDays = daysInMonth - dayOfMonth;
      const monthDate = new Date(currentYear, currentMonth, 1);

      const monthIncome = getTransactionsForMonth(monthDate, 'income').reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
      const monthExpenses = getTransactionsForMonth(monthDate, 'expense').reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
      const averageDailySpend = dayOfMonth > 0 ? monthExpenses / dayOfMonth : monthExpenses;
      const averageDailyIncome = dayOfMonth > 0 ? monthIncome / dayOfMonth : monthIncome;

      const trailingIncomeAverage = monthlySeries.value.slice(-3).reduce((sum, item) => sum + Number(item.income || 0), 0) / Math.max(Math.min(monthlySeries.value.length, 3), 1);
      const projectedMonthExpenses = monthExpenses + (averageDailySpend * remainingDays);
      const projectedMonthIncome = Math.max(monthIncome + (averageDailyIncome * remainingDays), trailingIncomeAverage || monthIncome);
      const projectedNetCashFlow = projectedMonthIncome - projectedMonthExpenses;

      forecastData.daysInMonth = daysInMonth;
      forecastData.daysElapsed = dayOfMonth;
      forecastData.averageDailySpend = averageDailySpend;
      forecastData.averageDailyIncome = averageDailyIncome;
      forecastData.projectedMonthIncome = projectedMonthIncome;
      forecastData.projectedMonthExpenses = projectedMonthExpenses;
      forecastData.projectedNetCashFlow = projectedNetCashFlow;

      const primaryAccount = accounts.value[0];
      if (primaryAccount) {
        const estimatedStartBalance = Number(primaryAccount.balance || 0) + monthExpenses - monthIncome;
        forecastData.predictedEndBalance = estimatedStartBalance + projectedMonthIncome - projectedMonthExpenses;
      } else {
        forecastData.predictedEndBalance = projectedNetCashFlow;
      }

      return forecastData;
    }

    // Get account transaction history (mini ledger)
    function getAccountTransactions(accountId) {
      return transactions.value
        .filter(t => t.account === accountId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50); // Last 50 transactions
    }

    // Get account summary
    function getAccountSummary(accountId) {
      const txns = transactions.value.filter(t => t.account === accountId);
      const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      return { expenses, income, count: txns.length };
    }

    // ==================== Phase 7: Mobile-First Gesture Functions ====================
    
    // Haptic feedback utility
    function triggerHaptic(duration = 20, pattern = null) {
      if (navigator.vibrate) {
        if (pattern) {
          navigator.vibrate(pattern);
        } else {
          navigator.vibrate(duration);
        }
      }
    }

    // Swipe gesture handler
    function handleTransactionSwipe(txnId, event) {
      const touch = event.touches[0];
      
      if (event.type === 'touchstart') {
        touchState.startX = touch.clientX;
        touchState.startY = touch.clientY;
        touchState.swipingTransactionId = txnId;
        touchState.swipeOffset = 0;
      } else if (event.type === 'touchmove' && touchState.swipingTransactionId === txnId) {
        touchState.currentX = touch.clientX;
        const deltaX = touch.clientX - touchState.startX;
        const deltaY = Math.abs(touch.clientY - touchState.startY);
        
        // Only consider horizontal swipe if deltaX > deltaY (more horizontal than vertical)
        if (Math.abs(deltaX) > deltaY) {
          event.preventDefault();
          touchState.swipeOffset = deltaX;
        }
      } else if (event.type === 'touchend') {
        handleSwipeEnd(txnId);
      }
    }

    // Handle swipe completion
    function handleSwipeEnd(txnId) {
      const swipeThreshold = 50;
      
      if (touchState.swipeOffset < -swipeThreshold) {
        // Swipe left: delete
        triggerHaptic([50, 30, 50]); // Pattern: vibrate, pause, vibrate
        if (confirm('Delete this transaction?')) {
          deleteTransaction(txnId);
          triggerHaptic(100);
        }
      } else if (touchState.swipeOffset > swipeThreshold) {
        // Swipe right: quick action menu
        triggerHaptic(30);
        const txn = transactions.value.find(t => t.id === txnId);
        if (txn) showTxnMenu(txn);
      }
      
      // Reset touch state
      touchState.swipingTransactionId = null;
      touchState.swipeOffset = 0;
    }

    // Pull-to-refresh handler
    function handlePullToRefresh(event) {
      const touch = event.touches[0];
      const scrollElement = event.currentTarget;
      
      if (event.type === 'touchstart' && scrollElement.scrollTop === 0) {
        touchState.startY = touch.clientY;
        pullToRefresh.isRefreshing = false;
      } else if (event.type === 'touchmove' && scrollElement.scrollTop === 0) {
        const pullDistance = touch.clientY - touchState.startY;
        
        if (pullDistance > 0) {
          touchState.pullDistance = pullDistance;
          pullToRefresh.isRefreshing = pullDistance >= pullToRefresh.threshold;
          
          // Show hint on first pull
          if (pullDistance > 10 && gestureHints.showPullHint && pullDistance < 20) {
            // Hint is being shown in UI
          }
        }
      } else if (event.type === 'touchend') {
        if (pullToRefresh.isRefreshing) {
          triggerHaptic(50);
          performRefresh();
        }
        touchState.pullDistance = 0;
      }
    }

    // Perform refresh action
    function performRefresh() {
      pullToRefresh.isRefreshing = true;
      
      // Simulate API call or reload UI data
      setTimeout(() => {
        pullToRefresh.isRefreshing = false;
        pullToRefresh.lastRefreshTime = Date.now();
        triggerHaptic([50, 30, 50, 30, 100]); // Success pattern
        showNotification('Data refreshed! ✨');
        
        // Reload transactions from storage
        loadAllData();
      }, 800);
    }

    // Dismiss gesture hints with tap counting
    function dismissGestureHint(hintType) {
      const now = Date.now();
      
      // Count taps for analytics
      if (now - gestureHints.lastTapTime < 300) {
        gestureHints.tapCount++;
      } else {
        gestureHints.tapCount = 1;
      }
      gestureHints.lastTapTime = now;
      
      if (hintType === 'swipe') {
        gestureHints.showSwipeHint = false;
        localStorage.setItem('gesture-hints-dismissed', 'true');
        triggerHaptic(30);
      } else if (hintType === 'pull') {
        gestureHints.showPullHint = false;
        localStorage.setItem('pull-refresh-hint-dismissed', 'true');
        triggerHaptic(30);
      }
    }

    // Focus number pad for amount inputs (mobile UX)
    function focusAmountInput(ref) {
      if (ref && typeof ref.focus === 'function') {
        ref.focus();
        // Trigger virtual keyboard on mobile
        setTimeout(() => {
          if (document.activeElement === ref) {
            ref.setSelectionRange(ref.value.length, ref.value.length);
          }
        }, 100);
      }
    }

    // ==================== PHASE 10: ADVANCED REPORTS & EXPORT ====================

    // Phase 10: Reports State
    const activeReportTab = ref('summary');
    const comparisonType = ref('monthly');
    const reportDateRange = reactive({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    });
    const taxFilters = reactive({
      showOnlyTagged: false,
    });
    const exportPreviewContent = ref('');

    // ==================== PHASE 11: RECEIPT IMAGE GALLERY ====================

    // Phase 11: Receipt Gallery State
    const receiptGallery = ref([]);
    const currentReceiptId = ref(null);
    const showReceiptViewer = ref(false);
    const receiptViewerZoom = ref(1);
    const receiptViewerRotation = ref(0);
    const receiptSearchQuery = ref('');
    const receiptGalleryPage = ref(1);
    const receiptsPerPage = 12;
    const showOCRCorrectionModal = ref(false);
    const ocrCorrectionData = reactive({
      receiptId: null,
      originalText: '',
      correctedText: '',
      merchant: '',
      amount: '',
      category: '',
    });
    const receiptUploadProgress = ref(0);
    const receiptCount = computed(() => receiptGallery.value.length);

    async function loadReceiptGallery() {
      try {
        const receipts = await window.StorageAPI.getAllReceipts(500, 0);
        receiptGallery.value = Array.isArray(receipts) ? receipts.filter(r => !r.receiptId) : [];
      } catch (err) {
        console.error('Failed to load receipt gallery:', err);
        receiptGallery.value = [];
      }
    }

    async function saveReceiptToGallery(receipt, highResBase64, lowResBase64, thumbnail) {
      const id = await window.StorageAPI.saveReceiptWithResolutions(receipt, highResBase64, lowResBase64, thumbnail);
      await loadReceiptGallery();
      return id;
    }

    function openReceiptViewer(receiptId) {
      currentReceiptId.value = receiptId;
      receiptViewerZoom.value = 1;
      receiptViewerRotation.value = 0;
      showReceiptViewer.value = true;
    }

    function closeReceiptViewer() {
      showReceiptViewer.value = false;
      currentReceiptId.value = null;
    }

    function zoomReceipt(direction) {
      const delta = direction === 'out' ? -0.25 : 0.25;
      receiptViewerZoom.value = Math.max(0.5, Math.min(3, receiptViewerZoom.value + delta));
    }

    function rotateReceipt() {
      receiptViewerRotation.value = (receiptViewerRotation.value + 90) % 360;
    }

    function resetReceiptTransforms() {
      receiptViewerZoom.value = 1;
      receiptViewerRotation.value = 0;
    }

    async function deleteReceipt(receiptId) {
      try {
        await window.StorageAPI.deleteReceipt(receiptId);
        if (currentReceiptId.value === receiptId) closeReceiptViewer();
        await loadReceiptGallery();
        showNotification('Receipt deleted');
      } catch (err) {
        console.error('Failed to delete receipt:', err);
        showNotification('Failed to delete receipt');
      }
    }

    async function searchReceiptsInGallery() {
      try {
        if (!receiptSearchQuery.value.trim()) {
          await loadReceiptGallery();
          return;
        }
        const results = await window.StorageAPI.searchReceipts(receiptSearchQuery.value.trim());
        receiptGallery.value = Array.isArray(results) ? results.filter(r => !r.receiptId) : [];
      } catch (err) {
        console.error('Failed to search receipts:', err);
        showNotification('Failed to search receipts');
      }
    }

    async function openOCRCorrectionModal(receiptId) {
      try {
        const receipt = await window.StorageAPI.getReceipt(receiptId);
        if (!receipt) return;
        ocrCorrectionData.receiptId = receiptId;
        ocrCorrectionData.originalText = receipt.ocrText || '';
        ocrCorrectionData.correctedText = receipt.ocrText || '';
        ocrCorrectionData.merchant = receipt.merchant || '';
        ocrCorrectionData.amount = receipt.amount || '';
        ocrCorrectionData.category = receipt.category || '';
        showOCRCorrectionModal.value = true;
      } catch (err) {
        console.error('Failed to open OCR correction modal:', err);
        showNotification('Failed to load receipt details');
      }
    }

    async function saveOCRCorrection() {
      try {
        if (!ocrCorrectionData.receiptId) return;
        await window.StorageAPI.updateReceiptMetadata(ocrCorrectionData.receiptId, {
          ocrText: ocrCorrectionData.correctedText,
          merchant: ocrCorrectionData.merchant,
          amount: ocrCorrectionData.amount,
          category: ocrCorrectionData.category,
          verified: true,
        });
        showOCRCorrectionModal.value = false;
        await loadReceiptGallery();
        showNotification('Receipt OCR updated');
      } catch (err) {
        console.error('Failed to save OCR correction:', err);
        showNotification('Failed to save OCR correction');
      }
    }

    async function getTransactionReceipts(transactionId) {
      try {
        return await window.StorageAPI.getReceiptsByTransactionId(transactionId);
      } catch (err) {
        console.error('Failed to load transaction receipts:', err);
        return [];
      }
    }

    // Phase 10: Helper to format signed currency
    function formatSignedCurrency(amount) {
      if (amount >= 0) return `+${formatCurrency(amount)}`;
      return formatCurrency(amount);
    }

    // Phase 10: Set report date range
    function setReportDateRange(preset) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      if (preset === 'thisMonth') {
        reportDateRange.from = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        reportDateRange.to = new Date().toISOString().split('T')[0];
      } else if (preset === 'lastMonth') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
        reportDateRange.from = new Date(lastMonthYear, lastMonth, 1).toISOString().split('T')[0];
        reportDateRange.to = new Date(lastMonthYear, lastMonth, daysInLastMonth).toISOString().split('T')[0];
      } else if (preset === 'thisYear') {
        reportDateRange.from = new Date(currentYear, 0, 1).toISOString().split('T')[0];
        reportDateRange.to = new Date().toISOString().split('T')[0];
      }
    }

    // Phase 10: Filtered transactions for tax tagging
    const filteredTransactionsForTax = computed(() => {
      return transactions.value
        .filter(txn => {
          const txnDate = new Date(txn.date);
          const fromDate = new Date(reportDateRange.from);
          const toDate = new Date(reportDateRange.to);
          return txnDate >= fromDate && txnDate <= toDate;
        })
        .filter(txn => !taxFilters.showOnlyTagged || txn.isTaxRelevant)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    // Phase 10: Report metrics computed property
    const reportMetrics = computed(() => {
      const fromDate = new Date(reportDateRange.from);
      const toDate = new Date(reportDateRange.to);

      // Filter transactions in date range
      const rangeTransactions = transactions.value.filter(txn => {
        const txnDate = new Date(txn.date);
        return txnDate >= fromDate && txnDate <= toDate;
      });

      // Summary metrics
      const totalIncome = rangeTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const totalExpenses = rangeTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const netCashFlow = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

      // Category breakdown
      const categoryBreakdown = categories.value.map(cat => {
        const catTotal = rangeTransactions
          .filter(t => t.category === cat.id && t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        return {
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
          total: catTotal,
          percentage: totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0,
        };
      }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

      // Tax metrics
      const taxDeductibleExpenses = rangeTransactions
        .filter(t => t.type === 'expense' && t.isTaxRelevant)
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const taxableIncome = rangeTransactions
        .filter(t => t.type === 'income' && t.isTaxRelevant)
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const taxTaggedCount = rangeTransactions.filter(t => t.isTaxRelevant).length;

      const taxCategoryBreakdown = categories.value.map(cat => {
        const catDeductible = rangeTransactions
          .filter(t => t.category === cat.id && t.type === 'expense' && t.isTaxRelevant)
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const catCount = rangeTransactions.filter(t => t.category === cat.id && t.isTaxRelevant).length;
        return {
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
          deductible: catDeductible,
          count: catCount,
        };
      }).filter(c => c.deductible > 0 || c.count > 0).sort((a, b) => b.deductible - a.deductible);

      // Budget variance metrics
      const currentMonth = new Date();
      const varianceBreakdown = categories.value.map(cat => {
        const budget = budgets.value.find(b => b.category === cat.id);
        const budgetAmount = budget ? parseFloat(budget.limit || 0) : 0;
        const actual = rangeTransactions
          .filter(t => t.category === cat.id && t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const variance = actual - budgetAmount;
        const variancePercent = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;
        return {
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
          budgeted: budgetAmount,
          actual: actual,
          variance: variance,
          variancePercent: variancePercent,
        };
      }).filter(c => c.budgeted > 0 || c.actual > 0).sort((a, b) => b.actual - a.actual);

      const totalBudgeted = varianceBreakdown.reduce((sum, c) => sum + c.budgeted, 0);
      const totalActualExpenses = varianceBreakdown.reduce((sum, c) => sum + c.actual, 0);
      const totalRemaining = totalBudgeted - totalActualExpenses;
      const budgetEfficiency = totalBudgeted > 0 ? (totalRemaining / totalBudgeted) * 100 : 0;

      // Comparison metrics
      let comparisonBreakdown = [];
      let comparisonCurrentIncome = 0;
      let comparisonPreviousIncome = 0;
      let comparisonCurrentExpenses = 0;
      let comparisonPreviousExpenses = 0;

      if (comparisonType.value === 'monthly') {
        const thisMonthStart = fromDate;
        const thisMonthEnd = toDate;
        const lastMonthStart = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - 1, 1);
        const lastMonthEnd = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth(), 0);

        const thisMonthTxns = rangeTransactions;
        const lastMonthTxns = transactions.value.filter(txn => {
          const txnDate = new Date(txn.date);
          return txnDate >= lastMonthStart && txnDate <= lastMonthEnd;
        });

        comparisonCurrentIncome = thisMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        comparisonPreviousIncome = lastMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        comparisonCurrentExpenses = thisMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        comparisonPreviousExpenses = lastMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        comparisonBreakdown = categories.value.map(cat => {
          const currentAmount = thisMonthTxns.filter(t => t.category === cat.id && t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
          const previousAmount = lastMonthTxns.filter(t => t.category === cat.id && t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
          const change = currentAmount - previousAmount;
          const changePercent = previousAmount > 0 ? (change / previousAmount) * 100 : (currentAmount > 0 ? 100 : 0);
          return {
            id: cat.id,
            name: cat.name,
            emoji: cat.emoji,
            current: currentAmount,
            previous: previousAmount,
            change: change,
            changePercent: changePercent,
          };
        }).filter(c => c.current > 0 || c.previous > 0).sort((a, b) => b.current - a.current);
      } else {
        const thisYearStart = new Date(fromDate.getFullYear(), 0, 1);
        const thisYearEnd = new Date(fromDate.getFullYear(), 11, 31);
        const lastYearStart = new Date(fromDate.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(fromDate.getFullYear() - 1, 11, 31);

        const thisYearTxns = transactions.value.filter(txn => {
          const txnDate = new Date(txn.date);
          return txnDate >= thisYearStart && txnDate <= thisYearEnd;
        });
        const lastYearTxns = transactions.value.filter(txn => {
          const txnDate = new Date(txn.date);
          return txnDate >= lastYearStart && txnDate <= lastYearEnd;
        });

        comparisonCurrentIncome = thisYearTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        comparisonPreviousIncome = lastYearTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        comparisonCurrentExpenses = thisYearTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        comparisonPreviousExpenses = lastYearTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        comparisonBreakdown = categories.value.map(cat => {
          const currentAmount = thisYearTxns.filter(t => t.category === cat.id && t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
          const previousAmount = lastYearTxns.filter(t => t.category === cat.id && t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
          const change = currentAmount - previousAmount;
          const changePercent = previousAmount > 0 ? (change / previousAmount) * 100 : (currentAmount > 0 ? 100 : 0);
          return {
            id: cat.id,
            name: cat.name,
            emoji: cat.emoji,
            current: currentAmount,
            previous: previousAmount,
            change: change,
            changePercent: changePercent,
          };
        }).filter(c => c.current > 0 || c.previous > 0).sort((a, b) => b.current - a.current);
      }

      return {
        totalIncome,
        totalExpenses,
        netCashFlow,
        savingsRate,
        categoryBreakdown,
        taxDeductibleExpenses,
        taxableIncome,
        taxTaggedCount,
        taxCategoryBreakdown,
        varianceBreakdown,
        totalBudgeted,
        totalActualExpenses,
        totalRemaining,
        budgetEfficiency,
        comparisonBreakdown,
        comparisonCurrentIncome,
        comparisonPreviousIncome,
        comparisonCurrentExpenses,
        comparisonPreviousExpenses,
      };
    });

    // Phase 10: Print report
    function printReport(type) {
      const element = document.getElementById(`report${type.charAt(0).toUpperCase() + type.slice(1)}`);
      if (element) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Report</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(getComputedStyle(document.documentElement).cssText);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
      }
    }

    // Phase 10: Download report as PDF (using print-to-PDF)
    function downloadReportPDF(type) {
      const element = document.getElementById(`report${type.charAt(0).toUpperCase() + type.slice(1)}`);
      if (element) {
        const style = document.createElement('style');
        style.textContent = `
          @media print {
            body { background: white; color: black; margin: 0; padding: 1rem; }
            .report-content { page-break-inside: avoid; }
            .metric-box { border: 1px solid #000; page-break-inside: avoid; }
            .table-row, .table-header { page-break-inside: avoid; }
          }
        `;
        document.head.appendChild(style);
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<!DOCTYPE html><html><head><title>Report</title>');
        printWindow.document.write('<meta charset="UTF-8">');
        printWindow.document.write(style.outerHTML);
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
        document.head.removeChild(style);
      }
    }

    // Phase 10: Download executive summary
    function downloadExecutiveSummary() {
      const summary = {
        generated: new Date().toISOString(),
        period: `${reportDateRange.from} to ${reportDateRange.to}`,
        metrics: reportMetrics.value,
        accounts: accounts.value.map(a => ({ name: a.name, balance: a.balance })),
      };
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `executive-summary-${new Date().toISOString().split('T')[0]}.json`);
      showNotification('Executive summary downloaded!');
    }

    // Phase 10: Download full data export JSON
    function downloadFullDataJSON() {
      const data = {
        version: '1.0',
        generated: new Date().toISOString(),
        accounts: accounts.value,
        transactions: transactions.value,
        categories: categories.value,
        budgets: budgets.value,
        goals: goals.value,
        bills: bills.value,
        settings: {
          currency: settings.value.currency,
          theme: settings.value.theme,
        },
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `night-ledger-export-${new Date().toISOString().split('T')[0]}.json`);
      showNotification('Full data export downloaded!');
    }

    // Phase 10: Export transactions as CSV
    function exportTransactionsCSV() {
      const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount', 'Tax Tagged'];
      const rows = transactions.value.map(t => {
        const cat = categories.value.find(c => c.id === t.category);
        const acc = accounts.value.find(a => a.id === t.account);
        return [
          formatDate(t.date),
          t.description,
          cat ? cat.name : '',
          acc ? acc.name : '',
          t.type,
          t.amount,
          t.isTaxRelevant ? 'Yes' : 'No',
        ];
      });
      
      let csv = headers.join(',') + '\n';
      rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
      showNotification('Transactions exported as CSV!');
    }

    // Phase 10: Helper function to download blob
    function downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    // Update export preview when tab changes
    watch(() => activeReportTab.value, (newTab) => {
      if (newTab === 'export') {
        exportPreviewContent.value = JSON.stringify({
          generated: new Date().toISOString(),
          accounts: accounts.value.length,
          transactions: transactions.value.length,
          totalAmount: transactions.value.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        }, null, 2);
      }
    });

    // Export data for device sync
    function generateSyncToken() {
      const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        accounts: accounts.value,
        transactions: transactions.value,
        categories: categories.value,
        budgets: budgets.value,
        goals: goals.value,
        recurringTransactions: recurringTransactions.value,
        settings: {
          currency: settings.value.currency,
          theme: settings.value.theme,
        }
      };
      return btoa(JSON.stringify(data));
    }

    // Import data from sync token
    function importSyncToken(token) {
      try {
        const data = JSON.parse(atob(token));
        accounts.value = data.accounts;
        transactions.value = data.transactions;
        categories.value = data.categories;
        budgets.value = data.budgets;
        goals.value = data.goals;
        recurringTransactions.value = data.recurringTransactions;
        settings.value.currency = data.settings.currency;
        settings.value.theme = data.settings.theme;
        saveAllData();
        showNotification('Data imported successfully!');
        return true;
      } catch (err) {
        showNotification('Failed to import data: ' + err.message);
        return false;
      }
    }

    // Computed: Get peer benchmarks (seeded sample data)
    const peerBenchmarks = computed(() => {
      const monthlyExpense = monthlyExpenses.value;
      return {
        'groceries': { avg: 400, percentile: monthlyExpense > 400 ? 75 : 25 },
        'dining': { avg: 250, percentile: monthlyExpense > 250 ? 65 : 35 },
        'entertainment': { avg: 150, percentile: monthlyExpense > 150 ? 60 : 40 },
        'transport': { avg: 300, percentile: monthlyExpense > 300 ? 70 : 30 },
        'utilities': { avg: 180, percentile: monthlyExpense > 180 ? 55 : 45 },
      };
    });

    // Computed: Smart goals with progress and milestones
    const enhancedGoals = computed(() => {
      return goals.value.map(goal => {
        const progress = (goal.current / goal.target) * 100;
        const daysElapsed = Math.floor((new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24));
        const daysRemaining = goal.targetDays - daysElapsed;
        const progressPerDay = goal.current / Math.max(daysElapsed, 1);
        const projectedDaysToGoal = daysRemaining > 0 ? goal.target / Math.max(progressPerDay, 0.01) : 0;
        
        return {
          ...goal,
          progress: Math.min(100, progress),
          projectedDaysToGoal: Math.max(0, projectedDaysToGoal),
          isOnTrack: projectedDaysToGoal <= daysRemaining,
          milestones: [
            { percent: 25, reached: progress >= 25 },
            { percent: 50, reached: progress >= 50 },
            { percent: 75, reached: progress >= 75 },
            { percent: 100, reached: progress >= 100 },
          ],
          streak: Math.floor(daysElapsed / 7), // Weekly streak
        };
      });
    });

    // Watch for goal updates to trigger notifications on milestones
    watch(() => goals.value, () => {
      enhancedGoals.value.forEach(goal => {
        if (goal.progress >= 100 && !goal.completed) {
          showNotification(`🎯 Goal "${goal.name}" completed!`);
        }
      });
    }, { deep: true });

    watch(
      () => [settings.value.llmEndpoint, settings.value.apiKey],
      () => {
        clearTimeout(llmModelRefreshTimer);
        llmModelRefreshTimer = setTimeout(() => {
          refreshModelOptions('llm');
        }, 600);
      }
    );

    watch(
      () => [settings.value.visionEndpoint, settings.value.visionApiKey],
      () => {
        clearTimeout(visionModelRefreshTimer);
        visionModelRefreshTimer = setTimeout(() => {
          refreshModelOptions('vision');
        }, 600);
      }
    );

    // ==================== Storage ====================
    async function saveAllData() {
      await Promise.all([
        setStorage('accounts', accounts.value),
        setStorage('transactions', transactions.value),
        setStorage('categories', categories.value),
        setStorage('budgets', budgets.value),
        setStorage('goals', goals.value),
        setStorage('recurringTransactions', recurringTransactions.value),
        setStorage('bills', bills.value), // Phase 9: Save bills
        setStorage('settings', settings.value),
      ]);
    }

    // Auto-save when any data changes
    watch([accounts, transactions, budgets, goals, recurringTransactions, bills, settings], saveAllData, { deep: true });


    // ==================== Phase 12: Category Customization Methods ====================
    const filteredCategoriesForCustomizer = computed(() => {
      let filtered = categories.value;
      
      if (categorySearchQuery.value) {
        const q = categorySearchQuery.value.toLowerCase();
        filtered = filtered.filter(cat =>
          cat.name.toLowerCase().includes(q) ||
          (cat.aliases && cat.aliases.some(alias => alias.toLowerCase().includes(q)))
        );
      }
      
      if (categoryCustomizerSettings.hideUnused) {
        filtered = filtered.filter(cat => {
          const count = transactions.value.filter(t => t.category === cat.id).length;
          return count > 0;
        });
      }
      
      return filtered;
    });

    function getCategoryStats(category, trans) {
      const categoryTxns = trans.filter(t => t.category === category.id);
      const expenses = categoryTxns.filter(t => t.type === 'expense');
      const income = categoryTxns.filter(t => t.type === 'income');
      
      return {
        totalTransactions: categoryTxns.length,
        totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
        totalIncome: income.reduce((sum, t) => sum + t.amount, 0),
        averageTransaction: categoryTxns.length > 0 
          ? categoryTxns.reduce((sum, t) => sum + t.amount, 0) / categoryTxns.length 
          : 0,
        lastUsed: categoryTxns.length > 0
          ? new Date(Math.max(...categoryTxns.map(t => new Date(t.date))))
          : null,
      };
    }

    function addNewCategory() {
      const validation = CategoryCustomizer.validateCategory(
        newCategoryForm.name,
        newCategoryForm.emoji,
        categories.value
      );
      
      if (!validation.valid) {
        showNotification(`Error: ${validation.errors.join(', ')}`);
        return;
      }
      
      const newCat = CategoryCustomizer.createCategory(
        newCategoryForm.name,
        newCategoryForm.emoji,
        newCategoryForm.color,
        newCategoryForm.parentId || null
      );
      
      if (newCategoryForm.aliasesInput) {
        const aliases = newCategoryForm.aliasesInput
          .split(',')
          .map(a => a.trim().toLowerCase())
          .filter(a => a);
        newCat.aliases = aliases;
      }
      
      categories.value.push(newCat);
      saveAllData();
      showNotification(`Category "${newCategoryForm.name}" created`);
      
      newCategoryForm.name = '';
      newCategoryForm.emoji = '📌';
      newCategoryForm.color = '#6b7280';
      newCategoryForm.parentId = '';
      newCategoryForm.aliasesInput = '';
      showAddCategoryForm.value = false;
    }

    function editCategoryModal(cat) {
      editingCategory.id = cat.id;
      editingCategory.name = cat.name;
      editingCategory.emoji = cat.emoji;
      editingCategory.color = cat.color;
      editingCategory.aliasesEdit = (cat.aliases || []).join(', ');
      showEditCategoryModal.value = true;
    }

    function saveEditCategory() {
      const cat = categories.value.find(c => c.id === editingCategory.id);
      if (!cat) return;
      
      cat.name = editingCategory.name;
      cat.emoji = editingCategory.emoji;
      cat.color = editingCategory.color;
      
      if (editingCategory.aliasesEdit) {
        cat.aliases = editingCategory.aliasesEdit
          .split(',')
          .map(a => a.trim().toLowerCase())
          .filter(a => a);
      } else {
        cat.aliases = [];
      }
      
      categories.value = [...categories.value];
      saveAllData();
      showNotification(`Category "${cat.name}" updated`);
      showEditCategoryModal.value = false;
    }

    function showDeleteCategoryConfirm(cat) {
      if (confirm(`Delete category "${cat.name}"? Transactions will be removed.`)) {
        categories.value = categories.value.filter(c => c.id !== cat.id);
        transactions.value = transactions.value.filter(t => t.category !== cat.id);
        saveAllData();
        showNotification(`Category "${cat.name}" deleted`);
      }
    }

    function handleCategoryDragStart(e, index) {
      draggedCategoryIndex = index;
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleCategoryDragEnd() {
      draggedCategoryIndex = null;
    }

    function handleCategoryDrop(e) {
      e.preventDefault();
      if (draggedCategoryIndex === null) return;
      
      const filtered = filteredCategoriesForCustomizer.value;
      if (draggedCategoryIndex < filtered.length) {
        const draggedCat = filtered[draggedCategoryIndex];
        const draggedIdx = categories.value.findIndex(c => c.id === draggedCat.id);
        
        const allItems = document.querySelectorAll('.category-item-customizer');
        let targetIdx = draggedIdx;
        
        allItems.forEach((item, idx) => {
          const rect = item.getBoundingClientRect();
          if (e.clientY > rect.top) {
            targetIdx = categories.value.findIndex(c => c.id === filtered[idx]?.id);
          }
        });
        
        if (targetIdx !== draggedIdx && targetIdx >= 0 && draggedIdx >= 0) {
          const reordered = CategoryCustomizer.reorderCategories(
            categories.value,
            draggedIdx,
            Math.max(0, targetIdx)
          );
          categories.value = reordered;
          saveAllData();
        }
      }
    }

    function applyPreset(presetName) {
      if (confirm(`Replace all categories with ${presetName} preset?`)) {
        const presetCategories = CategoryCustomizer.applyPreset(presetName);
        categories.value = presetCategories;
        budgets.value = []; // Clear budgets when resetting categories
        saveAllData();
        showNotification(`${presetName} preset applied`);
      }
    }

    function selectIconForNewCategory(icon) {
      newCategoryForm.emoji = icon.emoji;
      newCategoryForm.name = icon.name;
      showNotification(`Selected ${icon.emoji} ${icon.name}`);
    }

    function mergeCategories() {
      if (!mergeState.sourceId || !mergeState.targetId) {
        showNotification('Please select both source and target categories');
        return;
      }
      
      const sourceCat = categories.value.find(c => c.id === mergeState.sourceId);
      const targetCat = categories.value.find(c => c.id === mergeState.targetId);
      
      if (!sourceCat || !targetCat) {
        showNotification('Categories not found');
        return;
      }
      
      transactions.value = transactions.value.map(txn =>
        txn.category === mergeState.sourceId
          ? { ...txn, category: mergeState.targetId }
          : txn
      );
      
      if (mergeState.deleteSource) {
        categories.value = categories.value.filter(c => c.id !== mergeState.sourceId);
      }
      
      saveAllData();
      showNotification(`Merged ${sourceCat.name} into ${targetCat.name}`);
      showMergeCategoriesModal.value = false;
      mergeState.sourceId = '';
      mergeState.targetId = '';
    }

    function exportCategoriesToJSON() {
      const json = CategoryCustomizer.exportCategories(categories.value);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Categories exported');
    }

    function importCategoriesFromFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = CategoryCustomizer.importCategories(event.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            if (confirm('Replace current categories with imported ones?')) {
              categories.value = imported;
              saveAllData();
              showNotification(`${imported.length} categories imported`);
            }
          } else {
            showNotification('Invalid category format');
          }
        } catch (err) {
          showNotification('Error importing categories');
          console.error(err);
        }
      };
      reader.readAsText(file);
    }

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
      llmModelStatus,
      visionModelStatus,
      llmModelOptions,
      visionModelOptions,
      llmModelError,
      visionModelError,
      selectableVisionModels,
      selectedLlmModel,
      selectedVisionModel,

      // Phase 1: State
      aiInsight,
      aiInsightLoading,
      predictedCategories,
      categoryPredictionLoading,

      // Phase 3: Filter state
      filterState,
      activeFilterCount,

      // Data
      accounts,
      transactions,
      categories,
      budgets,
      goals,
      recurringTransactions,
      bills, // Phase 9
      incomeSources, // Phase 9
      settings,
      
      // Phase 9: Bill management state
      showBillsModal,
      billEditingId,
      newBill,

      // Computed
      currentMonth,
      monthlyIncome,
      monthlyExpenses,
      netWorth,
      monthlyDelta,
      sparklineData,
      suggestedBudgets,
      topCategories,
      savingsRateTrend,
      spendingVelocity,
      budgetBurnDown,
      recurringExpenseProjection,
      recurringIncomeProjection, // Phase 9
      incomeProjection, // Phase 9
      dueAlerts, // Phase 9
      incomeTrend,
      comparisonSummary,
      netWorthHistory,
      cashFlowForecast,
      debtAccounts,
      debtPayoffPlans,
      selectedDebtPayoffPlan,
      currentMonthSummary,
      previousMonthSummary,
      sameMonthLastYearSummary,
      recentTransactions,
      filteredTransactions,
      groupedTransactions,
      tabIcons,
      tabLabels,
      navTabs,
      navBadgeMap,
      quickAddModes,
      canQuickAdd,

      // Functions
      formatCurrency,
      formatPercent,
      formatSignedPercent,
      formatDate,
      showNotification,
      hideModals,
      setActiveTab,
      setQuickAddMode,
      openQuickAdd,
      closeQuickAdd,
      generateSparklineSVG,
      generateTrendChartSVG,
      generateRecurringTransactions,
      addTransaction,
      addReceiptTransaction,
      deleteTransaction,
      editTransaction,
      duplicateTransaction,
      showTxnMenu,
      
      // Phase 9: Bill management
      addBill,
      markBillPaid,
      unmarkBillPaid,
      deleteBill,
      editBill,
      saveBillEdit,
      cancelBillEdit,
      handleReceiptCapture,
      parseReceiptWithAI,
      parseNaturalLanguage,
      testConnections,
      exportData,
      clearAllData,
      loadDemoData,
      wipeDemoData,
      previousMonth,
      nextMonth,
      getProgressOffset,
      fetchAIInsight,

      // Phase 3: Filter functions
      clearAllFilters,
      highlightText,

      // Phase 4: Undo/Redo
      undo,
      redo,
      recordAction,
      actionHistory,
      historyIndex,

      // Phase 4: CSV Export
      exportAsCSV,

      // Phase 4: Merchant Autocomplete
      getMerchantSuggestions,
      selectMerchantSuggestion,
      merchantSuggestions,
      showMerchantSuggestions,

      // Phase 4: Tags
      allTags,
      loadTheme,

      // Phase 5 & 6: Analytics and Advanced Features
      analyticsData,
      generateSpendingHeatmap,
      getTopMerchants,
      getCategoryTrends,
      detectAnomalies,
      calculateForecast,
      getAccountTransactions,
      getAccountSummary,
      generateSyncToken,
      importSyncToken,
      peerBenchmarks,
      enhancedGoals,
      forecastData,
      debtSimulator,
      currencyExchangeRates,
      syncModalVisible,
      syncToken,
      syncExportData,

      // Phase 7: Mobile-First Polish
      touchState,
      gestureHints,
      pullToRefresh,
      handleTransactionSwipe,
      handlePullToRefresh,
      dismissGestureHint,
      performRefresh,
      triggerHaptic,
      focusAmountInput,

      // Phase 10: Advanced Reports & Export
      activeReportTab,
      comparisonType,
      reportDateRange,
      reportMetrics,
      taxFilters,
      filteredTransactionsForTax,
      exportPreviewContent,
      setReportDateRange,
      printReport,
      downloadReportPDF,
      downloadExecutiveSummary,
      downloadFullDataJSON,
      exportTransactionsCSV,
      formatSignedCurrency,

      // Phase 11: Receipt Gallery
      receiptGallery,
      currentReceiptId,
      showReceiptViewer,
      receiptViewerZoom,
      receiptViewerRotation,
      receiptSearchQuery,
      receiptGalleryPage,
      receiptsPerPage,
      showOCRCorrectionModal,
      ocrCorrectionData,
      receiptUploadProgress,
      receiptCount,
      loadReceiptGallery,
      saveReceiptToGallery,
      openReceiptViewer,
      closeReceiptViewer,
      zoomReceipt,
      rotateReceipt,
      resetReceiptTransforms,
      deleteReceipt,
      searchReceiptsInGallery,
      openOCRCorrectionModal,
      saveOCRCorrection,
      getTransactionReceipts,

      // Phase 13: Transaction Enhancements
      phase13,
      editTransaction: editTransactionPhase13,
      saveTransactionEdit,
      addSplitItem,
      handleAttachmentUpload,
      loadPhase13Templates,
      applyTemplate,
      deleteTemplate,
      detectDuplicates,
      markAsDuplicate,
      applyBulkEdit,
      // Phase 12: Category Customization
      showCategoryCustomizer,
      categoryCustomizerTab,
      categorySearchQuery,
      showAddCategoryForm,
      showEmojiPicker,
      showColorPicker,
      showEditColorPicker,
      showEditCategoryModal,
      showMergeCategoriesModal,
      categoryCustomizerSettings,
      newCategoryForm,
      editingCategory,
      mergeState,
      CategoryCustomizer,
      filteredCategoriesForCustomizer,
      getCategoryStats,
      addNewCategory,
      editCategoryModal,
      saveEditCategory,
      showDeleteCategoryConfirm,
      handleCategoryDragStart,
      handleCategoryDragEnd,
      handleCategoryDrop,
      applyPreset,
      selectIconForNewCategory,
      mergeCategories,
      exportCategoriesToJSON,
      importCategoriesFromFile,
    };
  },
});

// Register QuickAddModal components
if (window.ModalTabs) app.component('ModalTabs', window.ModalTabs);
if (window.TransactionTypeToggle) app.component('TransactionTypeToggle', window.TransactionTypeToggle);
if (window.ModalFooter) app.component('ModalFooter', window.ModalFooter);
if (window.ManualEntryForm) app.component('ManualEntryForm', window.ManualEntryForm);
if (window.ReceiptEntryForm) app.component('ReceiptEntryForm', window.ReceiptEntryForm);
if (window.NaturalEntryForm) app.component('NaturalEntryForm', window.NaturalEntryForm);
if (window.QuickAddModal) app.component('QuickAddModal', window.QuickAddModal);

app.mount('#app');
