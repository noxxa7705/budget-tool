# Budget Tool — Development Guide

## Quick Start

### Run Locally

```bash
cd ~/projects/budget-tool

# Python 3 (built-in, recommended)
python3 -m http.server 8000

# Or Node.js
npx http-server -p 8000

# Or use your nginx
```

Then open **`http://localhost:8000`**

### Test Receipt OCR Locally

Configure the app to use your local LLM:

1. Open app at `http://localhost:8000`
2. Go to **Settings** → **AI & LLM**
3. Set **LLM Endpoint** to your local server (e.g. `http://192.168.182.1:9999/v1`)
4. Set **Vision Endpoint** to Anthropic (for vision-capable model):
   - `https://api.anthropic.com/v1`
   - Add your Anthropic API key in **Vision API Key**
5. Click **Test Connections** to verify both work

Now you can:
- Take a photo of a receipt
- App sends to Anthropic via vision API
- Gets parsed JSON back
- Auto-fills transaction fields
- You review and save

### Troubleshooting

**"Mixed content: HTTPS page cannot call HTTP endpoint"**
- You're on HTTPS GitHub Pages trying to call local HTTP LLM
- Solution: Test locally at `http://localhost:8000` or use HTTPS endpoint

**"Vision endpoint not configured"**
- Receipt OCR requires vision-capable LLM
- Local LLMs (LM Studio, Ollama) rarely support vision
- Add secondary Anthropic/OpenAI endpoint in settings

**"Saved transaction but image didn't save"**
- IndexedDB quota exceeded
- Clear old data in Settings → "Clear All Data"
- Or delete old transaction receipts

---

## Architecture Deep Dive

### Vue 3 App (js/app.js)

The entire app is a single Vue 3 instance with:
- **Reactive state** — `ref()` for tabs, modals, forms
- **Computed properties** — `monthlyIncome`, `topCategories`, etc.
- **Methods** — transaction CRUD, AI calls, export/import
- **Watchers** — auto-save to localStorage on changes

### Storage Layers (js/storage.js)

1. **localStorage** — structured data (accounts, transactions, categories, budgets, goals)
   - Capacity: ~5-10 MB
   - Persists across app restarts
   - Synchronous (no promises)

2. **IndexedDB** — binary data (receipt images)
   - Capacity: ~50 MB
   - Async API (promises)
   - Efficient for large blobs

### AI Module (js/ai.js)

Handles all LLM communication:

```javascript
await window.AI.runAI(messages, {
  endpoint: 'http://192.168.182.1:9999/v1',
  apiKey: 'sk-...',
  model: 'gpt-3.5-turbo',
  onChunk: (chunk) => { /* stream in real-time */ },
  onDone: () => { /* finalize */ },
});
```

**Streaming flow:**
1. Send request with `stream: true`
2. Parse SSE lines (`data: {...}`)
3. Extract `choices[0].delta.content`
4. Call `onChunk()` for each token
5. On `[DONE]`, call `onDone()`

**Fallback (single-shot):**
1. If SSE fails, retry with `stream: false`
2. Get full response at once
3. Simulate word-by-word streaming for UX consistency

### Receipt Parser (js/receipt-parser.js)

Vision-powered expense extraction:

```javascript
const parsed = await window.ReceiptParser.parseReceipt(imageBase64, config);
// Returns: { merchant, amount, date, currency, items, tax, tip, category }
```

**Steps:**
1. Compress image client-side (OffscreenCanvas)
2. Convert to base64
3. Send to vision LLM with JSON extraction prompt
4. Parse response with `parseJsonFromText()` (robust fallback)
5. Suggest category via `merchantCategoryMap` or AI
6. Return structured object
7. Store in IndexedDB by transaction ID

---

## Common Tasks

### Adding a New Category

1. Edit `initializeCategories()` in `app.js`
2. Add to `merchantCategoryMap` in `receipt-parser.js`
3. Re-initialize app (clear localStorage or manually seed)

### Adding a New AI Feature

Example: "Suggest budget allocation based on income"

**1. Add prompt in app.js:**
```javascript
async function suggestBudgetAllocation() {
  const income = monthlyIncome.value;
  let result = '';
  
  await window.AI.runAI(
    [
      {
        role: 'system',
        content: 'You are a financial advisor. Suggest a 50/30/20 budget allocation.',
      },
      {
        role: 'user',
        content: `I have $${income}/month. Suggest budget breakdown for: groceries, dining, utilities, shopping, other.`,
      },
    ],
    {
      endpoint: settings.value.llmEndpoint,
      apiKey: settings.value.apiKey,
      model: 'gpt-3.5-turbo',
      onChunk: (chunk) => { result += chunk; },
      onDone: () => {
        const parsed = parseJsonFromText(result);
        // Use parsed result...
      },
    }
  );
}
```

**2. Add UI button in bottom sheet or settings**

**3. Handle response and populate budgets**

### Testing Offline Mode

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Service Workers** is registered
4. Go to **Network** → throttle to **Offline**
5. Reload page — should still load (cached)
6. Try adding transactions — works offline
7. Restore network — changes persist

### Debugging AI Calls

Add logs to `window.AI.runAI()`:

```javascript
console.log('Sending to endpoint:', normalized);
console.log('Model:', model);
console.log('Message count:', messages.length);
// ... after streaming ...
console.log('Full response:', fullText);
console.log('Parsed:', parseJsonFromText(fullText));
```

Then open DevTools **Console** and watch requests.

---

## Browser DevTools Tips

### localStorage Inspector

**Console:**
```javascript
// View all data
JSON.parse(localStorage.getItem('transactions')).forEach(t => console.log(t));

// Clear everything
localStorage.clear();

// Export as file
copy(JSON.stringify({
  accounts: JSON.parse(localStorage.getItem('accounts')),
  transactions: JSON.parse(localStorage.getItem('transactions')),
  // ...
}));
```

### IndexedDB Inspector

**Application → IndexedDB → BudgetApp → receipts**
- Can browse receipt images stored there
- Right-click → Delete to remove specific receipts

### Service Worker Debugging

**Application → Service Workers**
- See if SW is registered & active
- Manually **Unregister** if stuck in old version
- Check **Update on reload** during dev

### Network Tab Tips

Filter by `XHR` to see API calls:
- LLM endpoint calls to `/v1/chat/completions`
- Vision endpoint calls
- Watch response streaming in real-time

---

## Performance Notes

### Optimization Ideas

1. **Lazy-load components** — Only render visible tabs
2. **Paginate transactions** — Show 50 at a time, load more on scroll
3. **Compress old images** — Every 6 months, re-compress receipt images
4. **Archive old transactions** — Move 2+ year old transactions to JSON export
5. **Debounce saves** — Don't save to localStorage on every keystroke

### Current Bottlenecks

- Loading 1000+ transactions causes slight lag in grouping
- Receipt image base64 can be large (100-300 KB uncompressed)
- IndexedDB has no built-in archival (manual cleanup needed)

---

## Deployment

### GitHub Pages

```bash
# Create repo (one-time)
gh repo create budget-tool --public --source=.

# Push updates
git add .
git commit -m "Feature: add budget analytics"
git push origin master

# Site lives at: github.com/YOUR_USER/budget-tool
# PWA at: https://your-user.github.io/budget-tool/
```

### Self-Hosted (nginx)

```nginx
server {
  listen 80;
  server_name budget.yoursite.com;

  root /var/www/budget-tool;
  index index.html;

  # Cache static assets (CSS, JS, images)
  location ~* \.(js|css|svg|json)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Always serve index.html for SPA routing
  location / {
    try_files $uri /index.html;
  }

  # Service worker — cache only for short time
  location = /sw.js {
    expires 1d;
    add_header Service-Worker-Allowed "/";
  }
}
```

---

## Testing Checklist

### Core Features

- [ ] Add transaction (manual entry)
- [ ] Add transaction (receipt OCR)
- [ ] Add transaction (natural language)
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Duplicate transaction
- [ ] Filter transactions by date/category
- [ ] Export data as JSON
- [ ] Import data from JSON

### Budgets

- [ ] Budget spend tracking updates correctly
- [ ] Overspend indicator shows when limit exceeded
- [ ] Budget cards update in real-time

### Goals

- [ ] Progress ring animates to correct percentage
- [ ] Monthly contribution calculation works
- [ ] Goal completion shows 100%

### AI Features (if endpoint configured)

- [ ] Test LLM connection
- [ ] Test Vision connection
- [ ] Parse receipt with vision
- [ ] Auto-categorize by merchant
- [ ] Parse natural language transaction
- [ ] Fallback works if endpoint down

### Offline / PWA

- [ ] App loads offline (after first load)
- [ ] Transactions persist offline
- [ ] Data syncs when online
- [ ] "Add to home screen" works on mobile
- [ ] PWA app icon appears in home screen
- [ ] PWA fullscreen mode (no browser chrome)

### Mobile Responsiveness

- [ ] Bottom nav visible on all screens
- [ ] FAB (+) button accessible
- [ ] No horizontal scrolling
- [ ] Bottom sheets work (slide up)
- [ ] Touch targets ≥44px
- [ ] Forms work on landscape mode
- [ ] Images scale down on slow 3G

### Settings

- [ ] Currency changes format
- [ ] Theme toggle (dark/light)
- [ ] LLM endpoint saves
- [ ] API key masked in UI (password field)
- [ ] Export button works
- [ ] Import button accepts valid JSON
- [ ] Clear data warning shows

---

## Known Limitations

- localStorage ~5-10 MB limit (OK for 5+ years of transactions)
- IndexedDB quota varies by browser (~50 MB to unlimited)
- No sync between devices (manual export/import)
- No cloud backup (intentional for privacy)
- Recurring transactions not yet implemented

---

## Next Steps (v2 Roadmap)

- [ ] Recurring transactions & bill calendar
- [ ] Budget rules (auto-categorize by merchant)
- [ ] Recurring bills (rent, subscriptions)
- [ ] CSV bank import wizard
- [ ] Anomaly detection (unusual spending alerts)
- [ ] Expense forecasting
- [ ] Multi-currency support
- [ ] WebDAV sync (self-hosted)
- [ ] Dark/light theme toggle (persistence)
