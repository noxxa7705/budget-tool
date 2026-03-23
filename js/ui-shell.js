(function () {
  const NAV_TABS = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dash', icon: '◫', title: 'Dashboard' },
    { id: 'transactions', label: 'Transactions', shortLabel: 'Txn', icon: '≣', title: 'Transactions' },
    { id: 'budget', label: 'Budget', shortLabel: 'Budget', icon: '▦', title: 'Budget' },
    { id: 'goals', label: 'Goals', shortLabel: 'Goals', icon: '◎', title: 'Goals' },
    { id: 'bills', label: 'Bills', shortLabel: 'Bills', icon: '◪', title: 'Bills' },
    { id: 'reports', label: 'Reports', shortLabel: 'Reports', icon: '▤', title: 'Reports' },
    { id: 'analytics', label: 'Intel', shortLabel: 'Intel', icon: '◈', title: 'Intelligence' },
    { id: 'accounts', label: 'Accounts', shortLabel: 'Accounts', icon: '⛁', title: 'Accounts' },
    { id: 'gallery', label: 'Gallery', shortLabel: 'Gallery', icon: '◩', title: 'Receipt Gallery' },
    { id: 'settings', label: 'Config', shortLabel: 'Config', icon: '⚙', title: 'Settings' },
  ];

  const QUICK_ADD_MODES = [
    { id: 'manual', label: 'Manual', icon: '✦' },
    { id: 'receipt', label: 'Receipt', icon: '◧' },
    { id: 'natural', label: 'Natural', icon: '≈' },
  ];

  const NavTabs = {
    name: 'NavTabs',
    props: {
      tabs: { type: Array, required: true },
      activeTab: { type: String, required: true },
      badgeMap: { type: Object, default: () => ({}) },
      variant: { type: String, default: 'desktop' },
    },
    emits: ['select'],
    template: `
      <nav :class="['app-tabbar', variant === 'mobile' ? 'app-tabbar-mobile' : 'app-tabbar-desktop']" :aria-label="variant === 'mobile' ? 'Bottom navigation' : 'Primary navigation'">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :title="tab.title || tab.label"
          :class="['app-tabbar-btn', { active: activeTab === tab.id, 'has-badge': !!badgeMap[tab.id] }]"
          @click="$emit('select', tab.id)"
        >
          <span class="app-tabbar-icon">{{ tab.icon }}</span>
          <span class="app-tabbar-label">{{ variant === 'mobile' ? (tab.shortLabel || tab.label) : tab.label }}</span>
          <span v-if="badgeMap[tab.id]" class="app-tabbar-badge">{{ badgeMap[tab.id] }}</span>
        </button>
      </nav>
    `,
  };

  const ModeTabs = {
    name: 'ModeTabs',
    props: {
      modes: { type: Array, required: true },
      activeMode: { type: String, required: true },
    },
    emits: ['select'],
    template: `
      <div class="sheet-tabs mode-tabs" role="tablist" aria-label="Transaction input modes">
        <button
          v-for="mode in modes"
          :key="mode.id"
          type="button"
          :class="['sheet-tab', { active: activeMode === mode.id }]"
          @click="$emit('select', mode.id)"
        >
          <span class="sheet-tab-icon">{{ mode.icon }}</span>
          <span>{{ mode.label }}</span>
        </button>
      </div>
    `,
  };

  window.NightLedgerUI = {
    NAV_TABS,
    QUICK_ADD_MODES,
    components: {
      NavTabs,
      ModeTabs,
    },
  };
})();
