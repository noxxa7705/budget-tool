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
      isRecurring: false,
      frequency: 'monthly',
      tags: [],
      tagsInput: '',
    });

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
      apiKey: '',
      visionEndpoint: '',
      visionApiKey: '',
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
      // Fetch AI insight on mount
      await fetchAIInsight();
    });

    // Clean up keyboard shortcuts on unmount
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    });

    async function loadAllData() {
      accounts.value = (await getStorage('accounts')) || initializeAccounts();
      transactions.value = (await getStorage('transactions')) || [];
      categories.value = (await getStorage('categories')) || initializeCategories();
      budgets.value = (await getStorage('budgets')) || initializeBudgets();
      goals.value = (await getStorage('goals')) || [];
      recurringTransactions.value = (await getStorage('recurringTransactions')) || [];
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
            model: 'gpt-4-mini',
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
            model: 'gpt-4-mini',
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
      if (!quickAdd.amount || !quickAdd.category || !quickAdd.account) {
        showNotification('Please fill in all required fields');
        return;
      }

      // If recurring, add to recurring transactions array
      if (quickAdd.isRecurring) {
        const recurring = {
          id: 'rec-' + Date.now(),
          amount: parseFloat(quickAdd.amount),
          category: quickAdd.category,
          account: quickAdd.account,
          description: quickAdd.description || 'Recurring Transaction',
          date: quickAdd.date,
          frequency: quickAdd.frequency,
          type: 'expense',
          lastGenerated: quickAdd.date,
          createdAt: new Date().toISOString(),
        };
        
        recurringTransactions.value.push(recurring);
        showNotification(`Recurring ${quickAdd.frequency} transaction added!`);
      } else {
        // Add single transaction
        const txn = {
          id: 'txn-' + Date.now(),
          amount: parseFloat(quickAdd.amount),
          category: quickAdd.category,
          account: quickAdd.account,
          description: quickAdd.description || 'Transaction',
          date: quickAdd.date,
          type: quickAdd.type,
          tags: quickAdd.tags || [],
          timestamp: Date.now(),
        };

        transactions.value.push(txn);
        updateAccountBalance(quickAdd.account, parseFloat(quickAdd.amount), quickAdd.type === 'expense');
        recordAction('add_transaction', { txn });
        showNotification('Transaction added!');
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
          // Refresh AI insight if connection now works
          await fetchAIInsight();
        } else {
          aiEndpointStatus.value = 'error';
          showNotification('Connection failed');
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
      
      const monthExpenses = transactions.value
        .filter(t => t.type === 'expense' &&
                     new Date(t.date).getMonth() === currentMonth &&
                     new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const averageDailySpend = monthExpenses / dayOfMonth;
      const remainingDays = daysInMonth - dayOfMonth;
      const projectedRemainingSpend = averageDailySpend * remainingDays;
      const projectedMonthTotal = monthExpenses + projectedRemainingSpend;
      
      forecastData.daysInMonth = daysInMonth;
      forecastData.daysElapsed = dayOfMonth;
      forecastData.averageDailySpend = averageDailySpend;
      
      // Get current month's starting balance from account
      const primaryAccount = accounts.value[0];
      if (primaryAccount) {
        // Estimate starting balance (current - month expenses + month income)
        const monthIncome = transactions.value
          .filter(t => t.type === 'income' &&
                       new Date(t.date).getMonth() === currentMonth &&
                       new Date(t.date).getFullYear() === currentYear)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const estimatedStartBalance = primaryAccount.balance + monthExpenses - monthIncome;
        forecastData.predictedEndBalance = estimatedStartBalance - projectedMonthTotal;
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

    // ==================== Storage ====================
    async function saveAllData() {
      await Promise.all([
        setStorage('accounts', accounts.value),
        setStorage('transactions', transactions.value),
        setStorage('categories', categories.value),
        setStorage('budgets', budgets.value),
        setStorage('goals', goals.value),
        setStorage('recurringTransactions', recurringTransactions.value),
        setStorage('settings', settings.value),
      ]);
    }

    // Auto-save when any data changes
    watch([accounts, transactions, budgets, goals, recurringTransactions, settings], saveAllData, { deep: true });

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
      settings,

      // Computed
      currentMonth,
      monthlyIncome,
      monthlyExpenses,
      netWorth,
      monthlyDelta,
      sparklineData,
      suggestedBudgets,
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
      generateSparklineSVG,
      generateRecurringTransactions,
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
      currencyExchangeRates,
      syncModalVisible,
      syncToken,
      syncExportData,
    };
  },
});

app.mount('#app');
