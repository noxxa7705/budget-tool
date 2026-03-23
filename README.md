# Budget Tool — Personal Finance

A **100% offline**, mobile-first personal budget manager built with Vue 3, localStorage, and optional LLM integration for smart features.

## Features

### Core Budget Features
- 💰 **Multi-Account Support** — Checking, savings, credit cards, cash
- 📊 **Dashboard** — Net worth, monthly income/expenses, spending breakdown
- 💳 **Transaction Management** — Full CRUD, date grouping, search & filter
- 📈 **Envelope Budgeting** — Per-category monthly budgets with overspend alerts
- 🎯 **Savings Goals** — Target amounts, dates, auto-calculated monthly contributions
- 📈 **Charts & Analytics** — Spending by category, monthly trends, progress rings

### Smart AI Features (optional LLM endpoint)
- 🧾 **Receipt OCR** — Take a photo of a receipt → auto-parse amount, merchant, items, date, category
- 🤖 **Natural Language Parsing** — "spent $45 on groceries" → structured transaction
- 🎨 **Smart Categorization** — AI suggests category based on merchant name & amount
- 📊 **Budget Analysis** — "Roast my budget" feature for spending insights
- 💡 **Goal Advisor** — AI suggests monthly contribution targets
- 📋 **CSV Batch Import** — Upload bank statement CSVs, auto-categorize rows

### Offline & PWA
- ✅ **100% Offline** — All data in browser (localStorage + IndexedDB)
- 📱 **Add to Home Screen** — Looks and feels like a native app
- 🔄 **Service Worker** — Works without internet after first load
- 💾 **Automatic Backup** — Export/import as JSON

## Architecture

```
budget-tool/
├── index.html              # Vue 3 SPA, single mount point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline + caching
├── css/
│   ├── style.css           # Main styles (dark/light theme)
│   └── mobile.css          # Mobile responsive overrides
└── js/
    ├── app.js              # Vue 3 app, main logic
    ├── storage.js          # localStorage + IndexedDB wrapper
    ├── ai.js               # LLM endpoint abstraction (streaming + fallback)
    └── receipt-parser.js   # Vision API receipt OCR
```

### Tech Stack
- **Vue 3** via CDN (no build step, no webpack)
- **localStorage** for structured data (accounts, transactions, budgets, goals, settings)
- **IndexedDB** for large binary data (receipt images)
- **Service Worker** for offline & caching
- **OpenAI-compatible endpoints** for LLM (local or cloud)
- **Google Fonts** (Inter, JetBrains Mono)

## Getting Started

### Local Development

1. Clone the repo (or copy files to your server)
   ```bash
   cd ~/projects/budget-tool
   ```

2. Serve locally (Python 3)
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000`

3. Or use any static server:
   ```bash
   # Node.js http-server
   npx http-server

   # Or nginx
   # (see deployment section)
   ```

### GitHub Pages Deployment

1. Create a repo (or use existing): `github.com/YOUR_USER/budget-tool`

2. Push to `main` branch
   ```bash
   cd ~/projects/budget-tool
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USER/budget-tool
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Repo settings → Pages → Deploy from `main` (or `/docs` folder)
   - Site will be live at `https://YOUR_USER.github.io/budget-tool/`

4. Update `manifest.json`:
   ```json
   {
     "start_url": "/budget-tool/",
     "scope": "/budget-tool/"
   }
   ```

## Configuration

### LLM Endpoint Setup

All AI features are **optional**. The app works 100% without any AI configured.

#### Local LLM (LM Studio, Ollama)

1. Start your local LLM server on `localhost:8000` (or your port)
   ```bash
   # LM Studio default
   # Server runs at http://localhost:1234/v1

   # Or Ollama
   OLLAMA_HOST=0.0.0.0:8000 ollama serve
   ```

2. In app Settings:
   - **LLM Endpoint:** `http://localhost:8000/v1`
   - **API Key:** (leave blank for local)
   - Leave Vision Endpoint empty (local LLMs rarely support vision)

3. Click "Test Connection" to verify

#### Cloud LLM (OpenAI, Anthropic)

For receipt OCR with vision, you need a vision-capable endpoint:

1. **Settings:**
   - **LLM Endpoint:** `https://api.openai.com/v1`
   - **API Key:** `sk-...`
   - **Vision Endpoint:** (same or different)
   - **Vision API Key:** (same or different)

2. **Or use Anthropic directly for vision:**
   - **Vision Endpoint:** `https://api.anthropic.com/v1`
   - **Vision API Key:** `sk-ant-...`

3. Test both connections separately in Settings

#### Mixed Setup (Recommended for Noxxa)

Use your **local proxy at 192.168.182.1:9999** + Anthropic for vision:

1. **Settings:**
   - **LLM Endpoint:** `http://192.168.182.1:9999/v1`
   - **API Key:** (your routing key)
   - **Vision Endpoint:** `https://api.anthropic.com/v1`
   - **Vision API Key:** `sk-ant-...`

This way:
- Most LLM calls go through your local proxy (fast, free, private)
- Receipt OCR routes to Anthropic (reliably supports vision)
- No mixed-content warning (you're on localhost)

## Data Model

### Accounts
```json
{
  "id": "acc-checking",
  "name": "Checking",
  "type": "checking|savings|credit",
  "balance": 2500,
  "limit": 5000
}
```

### Transactions
```json
{
  "id": "txn-1234567890",
  "amount": 45.50,
  "category": "cat-groceries",
  "account": "acc-checking",
  "description": "Whole Foods",
  "date": "2024-03-23",
  "type": "expense|income",
  "receiptImage": "data:image/jpeg;base64,...",
  "receiptData": { "merchant": "...", "items": [...] },
  "timestamp": 1711273800000
}
```

### Categories
```json
{
  "id": "cat-groceries",
  "name": "Groceries",
  "emoji": "🛒",
  "color": "#4ade80"
}
```

### Budgets
```json
{
  "id": "bud-groceries",
  "name": "Groceries",
  "categoryId": "cat-groceries",
  "limit": 500,
  "spent": 320,
  "month": "2024-03"
}
```

### Goals
```json
{
  "id": "goal-emergency",
  "name": "Emergency Fund",
  "target": 5000,
  "current": 1200,
  "targetDate": "2025-06-01",
  "monthlyContribution": 300
}
```

## Storage Limits

- **localStorage:** ~5-10 MB per origin (structured data: accounts, transactions, categories, budgets, goals, settings)
- **IndexedDB:** ~50 MB per origin (receipt images stored separately)

For most users with 2-3 years of transaction history, localStorage usage is ~500 KB - 2 MB.

## Receipt OCR Flow

1. User taps **"📷 Receipt"** → **"Take Photo"**
2. Camera opens (phone's native camera)
3. Image is compressed (~300 KB max)
4. Sent to LLM with vision prompt (JSON extraction)
5. LLM returns parsed receipt:
   - Merchant name
   - Amount, date, currency
   - Item list (optional)
   - Tax, tip breakdown
   - Category suggestion

6. User reviews and edits fields in modal
7. Save → transaction added, balance updated

## Mobile Optimizations

- ✅ **Touch-friendly** — 44px minimum tap targets (Apple HIG)
- ✅ **Responsive** — Works on 320px wide phones to tablets
- ✅ **Notch-safe** — `viewport-fit=cover` + safe-area insets
- ✅ **iOS** — `<meta name="apple-mobile-web-app-capable">` for fullscreen
- ✅ **Dark mode** — Default dark theme, light mode toggle in Settings
- ✅ **Large inputs** — 16px font prevents iOS auto-zoom
- ✅ **Bottom sheets** — Modals slide up from bottom (natural for mobile)
- ✅ **Numpad** — Amount input with visual numpad on small screens

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ iOS 14+ (PWA via home screen)
- ✅ Android 5+ (Chrome PWA)
- ✅ Works on older browsers with localStorage support (degrades gracefully for missing APIs)

## Privacy & Security

- 🔐 **All data stays on your device** — No server, no cloud sync
- 🔐 **Transactions never leave your browser** — AI requests only contain structured text
- 🔐 **Receipt images** — Stored in IndexedDB (not sent to server unless you use vision)
- 🔐 **API keys** — Stored in browser localStorage (same as passwords—keep them secure)

## Future Features

- [ ] Recurring transactions & bill calendar
- [ ] Expense forecasting (AI trend analysis)
- [ ] Tax report generation
- [ ] Sync between devices (WebDAV, self-hosted)
- [ ] Budget rules automation
- [ ] Currency conversion
- [ ] Investment tracking
- [ ] Subscription management

## Development Notes

### Adding a New Tab

1. Add to `tabIcons` and `tabLabels` in `app.js`
2. Add `<div v-show="activeTab === 'newtab'">` section in `index.html`
3. Add computed properties and methods as needed

### Adding AI Features

All AI calls go through `window.AI.runAI()` which handles:
- Streaming (SSE) + fallback (single-shot)
- Automatic retries
- Error handling
- Model-agnostic (works with any OpenAI-compatible endpoint)

Example:
```javascript
let result = '';
await window.AI.runAI(
  [{ role: 'system', content: '...' }, { role: 'user', content: '...' }],
  {
    endpoint: settings.value.llmEndpoint,
    apiKey: settings.value.apiKey,
    model: 'gpt-3.5-turbo',
    onChunk: (chunk) => { result += chunk; },
    onDone: () => { /* parse result */ },
  }
);
```

### Vision API Requests

Receipt OCR uses the same `AI.runAI()` but with multimodal messages:

```javascript
{
  role: 'user',
  content: [
    { type: 'text', text: '...' },
    { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: '...' } }
  ]
}
```

## License

MIT — Use freely, modify as needed.

## Support

For issues or suggestions, open a GitHub issue or contact the maintainer.
