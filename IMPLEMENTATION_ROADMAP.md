# Night Ledger Implementation Roadmap

> **Execution mode:** Continuous implementation roadmap for Night Ledger. Update this file as phases ship. Push each completed phase to GitHub Pages. **NO STOPPING UNTIL DONE.**

**Goal:** Turn Night Ledger into a polished, mobile-friendly, analyst-grade finance tool with strong offline support, AI assistance, reporting, proactive financial intelligence, and every feature category fully fleshed out.

**Architecture:** Static Vue 3 via CDN, no build step, GitHub Pages deployment, localStorage + IndexedDB persistence, optional OpenAI-compatible AI endpoint, dark Sigma-inspired visual language with bubbly motion and mobile-first interactions.

**Tech Stack:** Vue 3 CDN, vanilla JS, SVG/Canvas, localStorage, IndexedDB, GitHub Pages, optional PDF export library.

---

## Shipped Phases (6)

### Phase 1 — Dashboard + AI categorization ✅
- Month-over-month deltas
- SVG sparklines
- AI insight banner
- Real-time category prediction

### Phase 2 — Recurring + smart budgets ✅
- Recurring transactions
- Auto-generation of recurring items
- 3-month budget suggestions
- Suggested vs current comparison UI

### Phase 3 — Search + filters ✅
- Date range filters
- Type/account/category filters
- Filter badges
- Persistent filter state

### Phase 4 — Quick wins ✅
- CSV export
- Undo/redo
- Tags
- Merchant autocomplete
- Theme toggle

### Phase 5 — Medium wins ✅
- Analytics tab
- Smart goals
- Account statements
- Receipt itemization

### Phase 6 — Big wins ✅
- Anomaly detection
- Forecasting
- Multi-currency support
- Device sync token flow

---

## Active Roadmap (14+ Phases Remaining)

### Phase 7 — Mobile-first polish ✅
**Goal:** Make Night Ledger feel like a native mobile tool while preserving desktop usability.

**Features:**
- [x] Bottom-sheet animations (done in earlier phases)
- [x] Swipe gestures (left to delete, right to quick actions)
- [x] Pull-to-refresh on transactions
- [x] Haptic feedback on success/delete actions
- [x] Safe-area insets for notched phones
- [x] First-run gesture hints
- [x] Improved form UX with number pad focus
- [x] Sticky action buttons on modals
- [x] Touch-optimized tap targets (44px minimum)
- [x] Momentum scrolling on iOS

**Status:** SHIPPED

---

### Phase 8 — Financial intelligence layer ⏳
**Goal:** Add proactive analysis that turns the app into a finance copilot.

**Features:**
- [ ] Spending velocity alerts ("On pace to spend $X this month")
- [ ] Savings-rate calculations and trends
- [ ] Net-worth tracker chart (assets - liabilities over time)
- [ ] Category insight badges ("Dining +25% vs last month")
- [ ] Debt payoff simulator (avalanche vs snowball strategies)
- [ ] Income growth tracking
- [ ] Budget burn-down view (days remaining vs pace)
- [ ] Comparison views (this month vs last, YoY trends)
- [ ] Recurring expense projection
- [ ] Cash flow forecasting

**Status:** PENDING

---

### Phase 9 — Income + bill management ⏳
**Goal:** Improve planning by modeling income streams and upcoming obligations.

**Features:**
- [ ] Income transaction type (separate from expenses)
- [ ] Multiple income sources (salary, side gig, refunds, etc)
- [ ] Recurring income setup (bi-weekly paycheck, etc)
- [ ] Income projection for the month
- [ ] Bill tracker with paid/unpaid states
- [ ] Due-date alerts and reminders
- [ ] Bill history and payment tracking
- [ ] Income vs expenses side-by-side on dashboard
- [ ] Monthly income targets
- [ ] Bonus/variable income tracking

**Status:** PENDING

---

### Phase 10 — Advanced reports & export ⏳
**Goal:** Make Night Ledger useful for reviews, audits, taxes, and structured decision-making.

**Features:**
- [ ] Monthly PDF summary report
- [ ] Print-ready view for all data
- [ ] Tax category tagging system
- [ ] Tax report generation
- [ ] Custom date range selection for reports
- [ ] Budget variance reports
- [ ] Comparison reports (month-to-month, YoY)
- [ ] Executive summary export
- [ ] JSON export with full history
- [ ] Category breakdown PDFs

**Status:** PENDING

---

### Phase 11 — Receipt image gallery ⏳
**Goal:** Store and manage receipt photos with transactions.

**Features:**
- [ ] IndexedDB storage for receipt images
- [ ] Thumbnail gallery view in transaction details
- [ ] Full-screen receipt viewer
- [ ] Zoom/rotate receipt images
- [ ] Delete receipt option
- [ ] Multi-receipt support per transaction
- [ ] Auto-compress images on upload
- [ ] Low-res thumbnail + high-res full image
- [ ] Receipt search by date/amount
- [ ] Receipt OCR correction (edit extracted text)

**Status:** PENDING

---

### Phase 12 — Category customization ⏳
**Goal:** Let users personalize category hierarchy and appearance.

**Features:**
- [ ] Category color picker
- [ ] Category icon/emoji customization
- [ ] Category sorting / drag-to-reorder
- [ ] Create custom categories
- [ ] Delete/merge categories
- [ ] Category presets (save/load common setups)
- [ ] Sub-categories (Dining → Restaurants, Delivery, Coffee)
- [ ] Category icons from library or emoji
- [ ] Category aliases (auto-categorize variations)
- [ ] Hide unused categories toggle

**Status:** PENDING

---

### Phase 13 — Transaction enhancements ⏳
**Goal:** Make transaction entry and management richer and more flexible.

**Features:**
- [ ] Multi-line transaction notes
- [ ] Attachment support (docs, images)
- [ ] Transaction templates for recurring types
- [ ] Bulk edit transactions
- [ ] Split transactions (one purchase, multiple categories)
- [ ] Location tagging on transactions
- [ ] Payment method tracking (cash, card, ACH)
- [ ] Receipt OCR correction workflow
- [ ] Transaction time-of-day tracking
- [ ] Duplicate detection (same amount, same day)

**Status:** PENDING

---

### Phase 14 — Calendar & timeline views ⏳
**Goal:** Visualize spending patterns over time with intuitive interfaces.

**Features:**
- [ ] Month-at-a-glance calendar view
- [ ] Day bubbles sized by spending
- [ ] Color-coded by category
- [ ] Click day to see transactions
- [ ] Week view with daily breakdown
- [ ] Timeline scroller (year/month/day)
- [ ] Spending heatmap (day-of-week vs amount)
- [ ] Streak tracking (days under budget)
- [ ] Milestone badges on calendar
- [ ] Holiday/special day markers

**Status:** PENDING

---

### Phase 15 — Net worth & asset tracking ⏳
**Goal:** Track overall financial health beyond just cash flow.

**Features:**
- [ ] Asset categories (Savings, Checking, Investments, Real Estate, etc)
- [ ] Asset value input
- [ ] Liability tracking (Credit card, Loans)
- [ ] Net worth calculation and chart
- [ ] Net worth trend over time
- [ ] Asset allocation pie chart
- [ ] Investment account support (crypto, stocks, mutual funds)
- [ ] Manual value updates
- [ ] Historical net worth snapshots
- [ ] Asset growth projections

**Status:** PENDING

---

### Phase 16 — Debt payoff planner ⏳
**Goal:** Help users model and accelerate debt repayment.

**Features:**
- [ ] Debt entry (principal, interest rate, monthly payment)
- [ ] Payoff calculators (avalanche, snowball, custom)
- [ ] Timeline to debt-free
- [ ] Interest savings comparison
- [ ] Monthly payment projections
- [ ] Extra payment simulator
- [ ] Payoff strategy recommendations
- [ ] Loan tracker with payment history
- [ ] Interest paid tracking
- [ ] Milestone celebrations (debt paid off!)

**Status:** PENDING

---

### Phase 17 — Scheduled transactions & reminders ⏳
**Goal:** Reduce data-entry friction with automation and alerts.

**Features:**
- [ ] Scheduled transactions (set up now, auto-create on date)
- [ ] Due-date alerts for bills
- [ ] Notification badges on nav
- [ ] Snooze alerts
- [ ] Recurring reminders (did you log your coffee?)
- [ ] Pending transaction status
- [ ] Auto-reconcile with account balance
- [ ] Scheduled transaction history
- [ ] Calendar view of upcoming transactions
- [ ] Email/SMS alerts (if backend enabled)

**Status:** PENDING

---

### Phase 18 — CSV & data import ⏳
**Goal:** Let users migrate from other apps and platforms.

**Features:**
- [ ] Import from CSV (Mint, YNAB, generic format)
- [ ] CSV format detection (guess columns)
- [ ] Data mapping UI (which column is amount?)
- [ ] Duplicate detection before import
- [ ] Import preview before commit
- [ ] Bank statement import (PDF -> CSV parsing)
- [ ] Plaid-style bank connect simulator (manual CSV upload)
- [ ] Import history and rollback
- [ ] Batch categorization after import
- [ ] Field validation and error reporting

**Status:** PENDING

---

### Phase 19 — Rules engine & auto-categorization ⏳
**Goal:** Learn user patterns and auto-categorize future transactions.

**Features:**
- [ ] Rule creation UI ("If description contains X, categorize as Y")
- [ ] Merchant rules (Whole Foods → Groceries)
- [ ] Amount range rules (tips > 15% → auto-tag as tip)
- [ ] Payment method rules (cash → certain category)
- [ ] Smart learning from corrections
- [ ] Rule priority/order management
- [ ] Bulk apply rules to history
- [ ] Rule templates (common patterns)
- [ ] Rule stats (how many times applied)
- [ ] Disable/enable rules toggle

**Status:** PENDING

---

### Phase 20 — Collaborative budgets (token-based) ⏳
**Goal:** Support shared budgets for couples and families.

**Features:**
- [ ] Shared budget creation
- [ ] Token-based sharing (no server needed)
- [ ] QR code share link
- [ ] Passcode optional protection
- [ ] Read-only vs edit permissions
- [ ] Merge transactions from multiple users
- [ ] Sync detection (who edited what)
- [ ] Conflict resolution UI
- [ ] Shared goal tracking
- [ ] Activity log (who added what when)

**Status:** PENDING

---

### Phase 21 — Peer benchmarking & anonymized insights ⏳
**Goal:** Show users how their spending compares to similar people (privacy-first).

**Features:**
- [ ] Seeded benchmark dataset (typical spending by category)
- [ ] Percentile comparison ("Your dining is 60th percentile")
- [ ] Category comparison cards
- [ ] Income-adjusted benchmarks
- [ ] Region/country-specific benchmarks (if available)
- [ ] Benchmark opt-in/out
- [ ] Comparison vs last year
- [ ] "People like you spend..." insights
- [ ] Anomaly detection using benchmarks
- [ ] Spending goal recommendations based on peers

**Status:** PENDING

---

### Phase 22 — AI financial advisor chatbot ⏳
**Goal:** Let users chat with AI about their finances.

**Features:**
- [ ] Sidebar chat with LLM
- [ ] Context awareness (knows current transactions, goals)
- [ ] Question answering ("Should I cut dining?")
- [ ] Recommendation generation
- [ ] Explanation of spending patterns
- [ ] Goal-setting advice
- [ ] Budget optimization suggestions
- [ ] Debt payoff strategy discussion
- [ ] Savings tips personalized to user
- [ ] Chat history storage

**Status:** PENDING

---

### Phase 23 — Integrations & webhooks ⏳
**Goal:** Connect Night Ledger to other tools and services.

**Features:**
- [ ] Webhook triggers (budget exceeded, goal hit)
- [ ] Discord alerts
- [ ] Slack notifications
- [ ] Email digests (weekly summary)
- [ ] SMS alerts (if backend enabled)
- [ ] IFTTT integration
- [ ] Zapier support
- [ ] Telegram bot
- [ ] Google Sheets export (synced)
- [ ] Calendar events for due dates

**Status:** PENDING

---

### Phase 24 — Expense trends & anomaly deep-dive ⏳
**Goal:** Advanced analytics for understanding spending behavior.

**Features:**
- [ ] Spending trend line charts
- [ ] Seasonality detection
- [ ] Outlier transaction highlights
- [ ] Expense correlation (does weather affect dining?)
- [ ] Day-of-week breakdown
- [ ] Time-of-day spending patterns
- [ ] Category volatility analysis
- [ ] Predictive spending (ML-style forecast)
- [ ] Anomaly explanation ("unusual for a Tuesday")
- [ ] Trend export and sharing

**Status:** PENDING

---

### Phase 25 — Savings goal visualizations ⏳
**Goal:** Make goals more motivating and achievable.

**Features:**
- [ ] Visual progress tracker (thermometer gauge)
- [ ] Contribution rate calculator
- [ ] Time-to-goal countdown
- [ ] Milestone badges and celebrations
- [ ] Goal templates (emergency fund, vacation, etc)
- [ ] Goal comparison (side-by-side progress)
- [ ] Sub-goals / micro-milestones
- [ ] Contribution streak tracking
- [ ] Celebration animations on milestone hit
- [ ] Goal sharing and inspiration

**Status:** PENDING

---

### Phase 26 — Tax & accounting features ⏳
**Goal:** Make year-end tax prep easier.

**Features:**
- [ ] Tax category tagging
- [ ] Deduction tracking
- [ ] Tax report generation
- [ ] Quarterly estimated tax calculator
- [ ] Expense categorization for taxes
- [ ] Receipt storage for deductions
- [ ] Tax bracket estimation
- [ ] Capital gains/loss tracking
- [ ] Quarterly tax payment reminders
- [ ] Tax-optimized spending suggestions

**Status:** PENDING

---

### Phase 27 — Multi-user accounts & profiles ⏳
**Goal:** Support multiple users on same device (family setup).

**Features:**
- [ ] User profile creation
- [ ] Password-protected profiles
- [ ] Quick-switch between users
- [ ] Shared accounts (parents see all) vs private accounts
- [ ] Parental controls & allowance tracking
- [ ] Per-user settings
- [ ] Merged reporting (family-wide view)
- [ ] Activity audit per user
- [ ] Separate budgets per user
- [ ] Profile backup/restore

**Status:** PENDING

---

### Phase 28 — Mobile app wrapper (PWA+) ⏳
**Goal:** Deliver Night Ledger as a native-feeling mobile app.

**Features:**
- [ ] PWA app manifest (already done, polish)
- [ ] Install prompt customization
- [ ] Splash screen design
- [ ] App icon variants (light/dark)
- [ ] Share sheet integration
- [ ] App drawer shortcuts
- [ ] Background sync capability
- [ ] Offline indicator
- [ ] App update notifications
- [ ] Native status bar theming

**Status:** PENDING

---

### Phase 29 — Backend integrations (optional) ⏳
**Goal:** Support cloud backup and cross-device sync for users who want it.

**Features:**
- [ ] Firebase auth integration (optional)
- [ ] Cloud backup to Firebase
- [ ] Cross-device sync
- [ ] Cloud-to-cloud sync (Dropbox, Google Drive)
- [ ] Server-side encryption
- [ ] Backup scheduling
- [ ] Backup versioning
- [ ] Restore UI
- [ ] Encryption key management
- [ ] Optional auto-sync toggle

**Status:** PENDING

---

### Phase 30 — Investment tracking ⏳
**Goal:** Extend beyond cash to stocks, crypto, real estate.

**Features:**
- [ ] Stock portfolio tracking
- [ ] Crypto holdings
- [ ] Real estate valuation
- [ ] Investment account integration
- [ ] Price tracking (API-free: manual entry or CSV import)
- [ ] Gain/loss calculation
- [ ] Dividend tracking
- [ ] Asset allocation view
- [ ] Investment performance chart
- [ ] Rebalancing recommendations

**Status:** PENDING

---

### Phase 31 — Dark patterns prevention & wellness ⏳
**Goal:** Use psychology to encourage healthy financial habits.

**Features:**
- [ ] Spending freeze challenges (can you not spend for X days?)
- [ ] Category challenges (cut dining by 20% this month)
- [ ] Positive reinforcement badges
- [ ] Streak tracking (days under budget)
- [ ] Celebration animations
- [ ] Reflection prompts (why did you spend more?)
- [ ] Habit tracking (logging daily wins)
- [ ] Weekly check-ins
- [ ] Spending journals
- [ ] Community challenges (if shared)

**Status:** PENDING

---

### Phase 32 — Accessibility & internationalization ⏳
**Goal:** Make Night Ledger usable by everyone.

**Features:**
- [ ] i18n framework setup
- [ ] Spanish translation
- [ ] French translation
- [ ] German translation
- [ ] Japanese translation
- [ ] RTL support (Arabic, Hebrew)
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader testing
- [ ] Keyboard navigation
- [ ] Color-blind friendly mode
- [ ] High-contrast mode
- [ ] Dyslexia-friendly font option
- [ ] Voice input for transactions

**Status:** PENDING

---

### Phase 33 — Performance & optimization ⏳
**Goal:** Make Night Ledger blazing fast on all devices.

**Features:**
- [ ] Bundle size optimization
- [ ] Lazy-load heavy components
- [ ] Virtual scrolling for long lists
- [ ] IndexedDB index optimization
- [ ] Service worker caching strategy
- [ ] Image compression
- [ ] CSS minification
- [ ] JS minification
- [ ] Load time monitoring
- [ ] Performance badges in UI

**Status:** PENDING

---

### Phase 34 — Security hardening ⏳
**Goal:** Protect user data and prevent attacks.

**Features:**
- [ ] XSS prevention (input sanitization)
- [ ] CSRF tokens (if backend added)
- [ ] Content Security Policy headers
- [ ] Rate limiting (local)
- [ ] Encryption at rest (IndexedDB)
- [ ] Secure localStorage (no sensitive data)
- [ ] API key storage best practices
- [ ] Logout on browser close option
- [ ] Session timeout
- [ ] Audit logging
- [ ] Vulnerability disclosure policy

**Status:** PENDING

---

### Phase 35 — Documentation & onboarding ⏳
**Goal:** Help new users get value immediately.

**Features:**
- [ ] Interactive first-run wizard
- [ ] Video tutorials
- [ ] Feature walkthroughs
- [ ] FAQ section
- [ ] Keyboard shortcuts guide
- [ ] Tips & tricks email series
- [ ] Blog (finance tips, usage guides)
- [ ] Roadmap transparency
- [ ] Contributing guide
- [ ] Community guidelines

**Status:** PENDING

---

## Status Tracker

- [x] Phase 1 shipped
- [x] Phase 2 shipped
- [x] Phase 3 shipped
- [x] Phase 4 shipped
- [x] Phase 5 shipped
- [x] Phase 6 shipped
- [ ] Phase 7 mobile-first polish
- [ ] Phase 8 financial intelligence
- [ ] Phase 9 income + bills
- [ ] Phase 10 advanced reports
- [ ] Phase 11 receipt gallery
- [ ] Phase 12 category customization
- [ ] Phase 13 transaction enhancements
- [ ] Phase 14 calendar & timeline
- [ ] Phase 15 net worth & assets
- [ ] Phase 16 debt payoff planner
- [ ] Phase 17 scheduled transactions
- [ ] Phase 18 CSV & import
- [ ] Phase 19 rules engine
- [ ] Phase 20 collaborative budgets
- [ ] Phase 21 peer benchmarking
- [ ] Phase 22 AI advisor chatbot
- [ ] Phase 23 integrations & webhooks
- [ ] Phase 24 expense trends
- [ ] Phase 25 savings goal viz
- [ ] Phase 26 tax features
- [ ] Phase 27 multi-user profiles
- [ ] Phase 28 PWA+ wrapper
- [ ] Phase 29 backend integrations
- [ ] Phase 30 investment tracking
- [ ] Phase 31 wellness features
- [ ] Phase 32 accessibility & i18n
- [ ] Phase 33 performance
- [ ] Phase 34 security
- [ ] Phase 35 docs & onboarding

**Total Phases:** 35  
**Completed:** 6  
**Remaining:** 29

---

## Notes

- Keep GitHub Pages as the only deployment target.
- Do not embed sensitive endpoint or credential info in public assets.
- Preserve dark Sigma styling + bubbly motion language.
- Prefer client-side only implementations unless a feature absolutely requires remote services.
- **Commit after every phase shipped.**
- **Update this roadmap after each phase.**
- **NO STOPPING until all 35 phases are complete.**
