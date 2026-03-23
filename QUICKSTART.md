# Budget Tool — Quick Start

## 🚀 Start Developing Right Now

```bash
cd ~/projects/budget-tool
python3 -m http.server 8000
# Open http://localhost:8000
```

That's it. App is fully functional offline.

---

## 📸 Test Receipt OCR

1. Go to **Settings** (bottom nav, rightmost button)
2. Set **LLM Endpoint** to one of:
   - Local: `http://192.168.182.1:9999/v1` (your proxy)
   - Or leave blank if you just want the app to work

3. For **Receipt OCR with vision**, add:
   - **Vision Endpoint:** `https://api.anthropic.com/v1`
   - **Vision API Key:** Your Anthropic key (`sk-ant-...`)

4. Click **Test Connections** ✅

5. Tap **"+"** button → **"Receipt"** → Take photo
   - App parses receipt automatically
   - Review fields, save transaction

---

## 🎯 Core Screens

| Screen | What It Does | Access |
|--------|-------------|--------|
| **Dashboard** | Net worth, accounts, spending breakdown | Home tab |
| **Transactions** | Full transaction log, search, filter | 💳 tab |
| **Budget** | Per-category spending envelopes | 📈 tab |
| **Goals** | Savings targets with progress | 🎯 tab |
| **Settings** | LLM config, export, import, theme | ⚙️ tab |

---

## ➕ Add a Transaction — 3 Ways

### 1. Manual (traditional form)
- Tap **+** → **Manual**
- Enter amount, category, account, description, date
- Save

### 2. Receipt OCR (photo parsing)
- Tap **+** → **Receipt** → Take photo
- AI parses merchant, amount, date, items
- Confirm & save

### 3. Natural Language
- Tap **+** → **Natural** 
- Type: *"spent $45 on groceries at whole foods yesterday"*
- AI extracts: amount, category, description, date
- Save

---

## 🤖 AI Features (Optional)

All optional — app is 100% functional without any AI.

| Feature | What It Does | Requires |
|---------|-------------|----------|
| **Receipt OCR** | Parse receipt photo → transaction | Vision API (Anthropic) |
| **Auto-Categorize** | Suggest category from merchant name | LLM endpoint |
| **Natural Language** | Parse "spent $X on Y" → fields | LLM endpoint |
| **Budget Roast** | AI analyzes your spending | LLM endpoint |
| **Goal Advisor** | AI suggests monthly savings plan | LLM endpoint |
| **CSV Import** | AI batch-categorizes bank statements | LLM endpoint |

---

## 💾 Data Storage

- **All data stays on your device**
- localStorage (accounts, transactions, settings) — ~5-10 MB limit
- IndexedDB (receipt images) — ~50 MB limit
- Export as JSON anytime in Settings

---

## 📱 Mobile Optimizations

✅ **100% mobile-friendly** — Bottom nav, big buttons, full-screen PWA mode
✅ **Add to home screen** — Looks like a native app
✅ **Offline ready** — Works without internet after first load
✅ **Touch-optimized** — 44px min tap targets, no hover-only features

---

## 🔐 Privacy

- 🔐 No servers, no cloud sync
- 🔐 All transactions stay in your browser
- 🔐 AI requests only send structured text (no receipts unless you use vision)
- 🔐 API keys stored locally (same security as password manager)

---

## 🐛 Debugging

**Check localStorage:**
```javascript
// Console:
JSON.parse(localStorage.getItem('transactions')).length  // How many transactions
localStorage.clear()  // Nuclear option: clear all
```

**Check Service Worker:**
- DevTools → Application → Service Workers
- Should show: "Service Worker (active)"

**Check IndexedDB:**
- DevTools → Application → IndexedDB → BudgetApp → receipts
- Browse stored receipt images

---

## 🎨 Customization Ideas

### Add New Category
Edit `initializeCategories()` in `js/app.js`:
```javascript
{ id: 'cat-coffee', name: 'Coffee', emoji: '☕', color: '#a16207' },
```

### Change Color Scheme
Edit CSS variables in `css/style.css`:
```css
:root {
  --primary: #ffd700;          /* Gold (yellow) */
  --danger: #ef4444;           /* Red */
  --success: #4ade80;          /* Green */
}
```

### Add New Tab
1. Add to `tabIcons` & `tabLabels` in `app.js`
2. Add `<div v-show="activeTab === 'newtab'>` in `index.html`
3. Add computed props & methods

---

## 📊 Architecture at a Glance

```
index.html                  ← Single Vue 3 app
  ├─ js/app.js              ← State, logic, all 5 tabs
  ├─ js/storage.js          ← localStorage + IndexedDB
  ├─ js/ai.js               ← LLM streaming + fallback
  ├─ js/receipt-parser.js   ← Vision API + OCR
  ├─ css/style.css          ← Main theme
  ├─ css/mobile.css         ← Responsive overrides
  ├─ manifest.json          ← PWA config
  └─ sw.js                  ← Service worker (offline)
```

**Tech Stack:**
- Vue 3 (CDN, no build)
- localStorage + IndexedDB
- Service Worker
- OpenAI-compatible LLM endpoints

---

## ⚡ Performance Tips

1. **Use local LLM** for most calls (fast, free, private)
   - Route to Anthropic only for vision (receipts)

2. **Batch import CSV** instead of entering one-by-one
   - AI categorizes 100 rows at once

3. **Archive old transactions**
   - Export 2+ year old data, clear from app
   - Keeps localStorage under 5 MB

4. **Compress receipt images**
   - App auto-compresses at 85% JPEG quality
   - ~100-200 KB per receipt, manageable

---

## 🚢 Deploy to GitHub Pages

```bash
# One-time setup
gh repo create budget-tool --public

# Every update
git add .
git commit -m "Update: new feature"
git push

# Live at: github.com/YOUR_USER/budget-tool
# PWA at: https://your-user.github.io/budget-tool/
```

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| **"Mixed content" error** | You're on HTTPS GitHub Pages calling HTTP local LLM. Test locally instead. |
| **Receipt OCR doesn't work** | Did you add a Vision Endpoint in Settings? Local LLMs need Anthropic. |
| **Data disappeared** | localStorage might be cleared. Check browser privacy settings. |
| **Service Worker stuck** | DevTools → Application → Service Workers → Unregister, reload. |
| **Slow transaction list** | Too many transactions (1000+)? Export old ones, clear app, reimport recent. |

---

## 📚 Documentation

- **README.md** — Full feature overview, architecture, deployment
- **DEV_GUIDE.md** — Deep dive, development workflow, testing checklist
- **QUICKSTART.md** — This file! Quick reference

---

## 🎯 Next (Recommended v2 Features)

1. **Recurring transactions** — Rent, subscriptions auto-applied
2. **CSV bank import** — Upload statements, auto-categorize
3. **Bill calendar** — See upcoming expenses
4. **Spending alerts** — Warn when over budget
5. **Forecasting** — Predict monthly spending

---

## 💬 Questions?

- Check DEV_GUIDE.md for detailed architecture
- Check README.md for full feature list
- Browse js/*.js for code examples
- Test in DevTools Console

**Start coding now:**
```bash
cd ~/projects/budget-tool && python3 -m http.server 8000
```
