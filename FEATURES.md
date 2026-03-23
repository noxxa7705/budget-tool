# Budget Tool — Feature Matrix

## ✅ Implemented (MVP v1.0)

### Core Budget Features
- [x] Multi-account support (checking, savings, credit card)
- [x] Transaction CRUD (create, read, update, delete)
- [x] Date-grouped transaction log
- [x] Search & filter transactions
- [x] 10 pre-built budget categories (groceries, dining, gas, etc)
- [x] Envelope budgeting (per-category monthly limits)
- [x] Budget overspend warnings
- [x] Savings goals with progress tracking
- [x] Monthly dashboard with summary cards
- [x] Category spending breakdown
- [x] Net worth calculation (all accounts)

### Transaction Entry
- [x] Manual entry form
- [x] Quick-add modal with 3 input methods
- [x] Duplicate transaction
- [x] Context menu (edit, delete, duplicate)

### Data Management
- [x] localStorage persistence (accounts, transactions, categories, budgets, goals, settings)
- [x] IndexedDB for receipt images
- [x] Export all data as JSON
- [x] Import data from JSON
- [x] Clear all data with confirmation
- [x] Auto-save on changes

### AI Integration (Optional)
- [x] LLM endpoint configuration
- [x] Vision endpoint configuration (separate API key)
- [x] Connection testing (both endpoints)
- [x] Streaming support (SSE) with single-shot fallback
- [x] Error handling & retries

### Receipt OCR
- [x] Camera capture (mobile native)
- [x] Image compression (client-side, OffscreenCanvas)
- [x] Vision API parsing (JSON extraction)
- [x] Merchant name extraction
- [x] Amount, date, currency parsing
- [x] Item list extraction (if on receipt)
- [x] Tax & tip breakdown
- [x] Smart category suggestion (merchant name map)
- [x] Receipt preview modal
- [x] Transaction auto-population
- [x] Save & repeat flow
- [x] Receipt image storage (IndexedDB)

### Natural Language Input
- [x] Parse natural language transaction descriptions
- [x] Extract: amount, category, description, date
- [x] Fallback to manual edit if parse fails

### UI/UX
- [x] Bottom navigation (5 tabs)
- [x] Floating action button (+)
- [x] Modal bottom sheets (slide-up)
- [x] Category chips (grid layout)
- [x] Budget cards with progress bars
- [x] Goal cards with SVG progress rings
- [x] Transaction history with date grouping
- [x] Empty states
- [x] Toast notifications
- [x] Loading spinners

### Settings & Configuration
- [x] Currency selection (USD, EUR, GBP, JPY)
- [x] Theme toggle (dark/light)
- [x] LLM endpoint URL input
- [x] API key input (password field)
- [x] Vision endpoint (optional, separate)
- [x] Vision API key (optional)
- [x] Connection test buttons
- [x] About section (version info)

### Mobile & PWA
- [x] Responsive design (320px to 1200px+)
- [x] Safe area insets (notch support)
- [x] Touch-optimized (44px tap targets)
- [x] Service worker (offline caching)
- [x] manifest.json (PWA install)
- [x] Add to home screen support
- [x] Fullscreen mode (app-like experience)
- [x] Bottom nav sticky on all screens
- [x] Safe area padding (iPhone notch)

### Performance
- [x] Vue 3 CDN (no build step)
- [x] Lazy evaluation (computed properties)
- [x] Debounced auto-save
- [x] Service worker caching
- [x] Image compression before upload
- [x] Pagination-ready (but not yet implemented)

### Accessibility
- [x] Semantic HTML structure
- [x] Keyboard navigation (tab, enter, escape)
- [x] Color contrast (AA standard)
- [x] Form labels
- [x] Error messages
- [x] Loading states

---

## 🔄 In Progress / Partially Implemented

- [ ] CSV bank statement import (UI exists, AI parsing ready)
- [ ] Budget roasting AI feature (prompt ready, UI not built)
- [ ] Goal advisor AI feature (prompt ready, UI not built)
- [ ] Anomaly detection (spending outliers)
- [ ] Month navigation (partially done, needs more testing)

---

## 📋 Planned (v1.1 - v2.0)

### Transactions & Recurring
- [ ] Recurring transactions (rent, subscriptions)
- [ ] Recurring transaction skip/edit per instance
- [ ] Bill calendar (upcoming expenses)
- [ ] Auto-apply recurring on month boundary
- [ ] Recurring confirmation prompts

### Budgeting & Analysis
- [ ] Budget rules (auto-categorize by merchant pattern)
- [ ] Budget rollover (unspent to next month)
- [ ] Spending forecasting (trend analysis)
- [ ] Budget alerts (push notifications)
- [ ] Monthly budget comparison (vs last month)
- [ ] Year-over-year spending analysis
- [ ] Tax category tagging
- [ ] Tax report generation

### Import & Export
- [ ] CSV bank statement import wizard
- [ ] Multi-account statement merge
- [ ] Smart column mapping
- [ ] AI batch categorization
- [ ] Scheduled auto-import (via WebDAV)
- [ ] Backup schedule (auto-export)

### Multi-Currency
- [ ] Currency conversion rates (daily API)
- [ ] Multi-currency accounts
- [ ] Transaction currency field
- [ ] FX rate override per transaction

### Advanced AI Features
- [ ] Spending anomaly detection
- [ ] Goal advisor (AI monthly plan)
- [ ] Budget optimizer (save more on X)
- [ ] Merchant alias/merging
- [ ] Suggested budget allocation (50/30/20)
- [ ] Tax optimization suggestions

### Visualization
- [ ] Line chart (spending over time)
- [ ] Pie chart (spending by category)
- [ ] Heatmap (spending by day of week)
- [ ] Export charts as images

---

## 📊 Metrics

| Metric | Status |
|--------|--------|
| Code size | ~3,700 lines (HTML, CSS, JS) |
| Bundle size | ~150 KB (before gzip) |
| Dependencies | 1 external (Vue 3 CDN) |
| Browsers supported | Chrome, Firefox, Safari, Edge 88+ |
| Mobile support | iOS 14+, Android 5+ |
| localStorage usage | ~500 KB - 2 MB (typical) |
| IndexedDB usage | ~10-50 MB (optional, receipt images) |
| Offline-first | Yes (Service Worker) |
| PWA capable | Yes (manifest + SW) |

---

## 🎯 Version Roadmap

### v1.0 (MVP) - DONE
- Core budget tracking
- Receipt OCR
- 3 transaction input methods
- Envelope budgeting
- PWA offline support

### v1.1 (Analytics & Export)
- CSV bank import
- Monthly trends
- Budget comparison
- AI roasting
- Better charts

### v1.2 (Recurring & Automation)
- Recurring transactions
- Bill calendar
- Budget rules
- Spending forecasts

### v2.0 (Sync & Advanced)
- WebDAV sync
- Multi-device
- Advanced AI features
- Investment tracking
- Custom categories

---

## 🏁 Launch Checklist

Before deploying to GitHub Pages or production:

- [ ] Test all 3 transaction input methods
- [ ] Verify offline mode works
- [ ] Check PWA install on iOS & Android
- [ ] Test receipt OCR (with real receipts)
- [ ] Verify data export integrity
- [ ] Check mobile responsiveness (5 screen sizes)
- [ ] Confirm no console errors in production
- [ ] Test with no LLM configured
- [ ] Backup current working version
- [ ] Update manifest start_url if deploying to non-root
- [ ] Test on slow 3G network
- [ ] Verify safe area insets on notched phones

Last updated: 2024-03-23
