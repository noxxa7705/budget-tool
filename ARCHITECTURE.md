# Budget Tool — Architecture & Internals

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      BUDGET TOOL v1.0                           │
│                 100% Offline Budget Manager                      │
└─────────────────────────────────────────────────────────────────┘

                          User Interface
                    (Vue 3 Single Page App)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
      ┌──▼──┐           ┌─────▼─────┐        ┌────▼────┐
      │ UI  │           │  Components│       │  Modals  │
      │Tabs │           │  - Cards   │       │ - Receipt│
      │ &   │           │  - Charts  │       │ - Forms  │
      │Nav  │           │  - Lists   │       │ - Sheets │
      └─────┘           └────────────┘       └──────────┘
         │
         └──► Vue 3 Reactive State (ref, reactive, computed)
             ├─ activeTab
             ├─ accounts []
             ├─ transactions []
             ├─ categories []
             ├─ budgets []
             ├─ goals []
             ├─ settings {}
             └─ UI state (showModals, etc)


                      Data Layer
         ┌────────────────────────────────┐
         │     (Persistent Storage)       │
         ├────────────────────────────────┤
         │                                │
    ┌────▼──────┐            ┌────────────▼──┐
    │localStorage │            │  IndexedDB   │
    │  (5-10 MB) │            │  (50+ MB)    │
    ├────────────┤            ├──────────────┤
    │ accounts   │            │ receipts     │
    │ txns       │            │ - images     │
    │ categories │            │ - binary     │
    │ budgets    │            │   data       │
    │ goals      │            └──────────────┘
    │ settings   │
    └────────────┘


                    AI/LLM Integration
          ┌──────────────────────────────┐
          │   window.AI (ai.js)          │
          ├──────────────────────────────┤
          │ Configuration Management     │
          │ - saveConfig()               │
          │ - getConfig()                │
          │ - normalizeEndpoint()        │
          │                              │
          │ Connection Testing           │
          │ - testConnection()           │
          │ - getModels()                │
          │                              │
          │ Core Runner                  │
          │ - runAI() [SSE + fallback]   │
          │ - parseNaturalLanguage()     │
          └──────────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          │                            │
       ┌──▼──────────────┐  ┌─────────▼──────┐
       │ LLM Endpoint    │  │ Vision Endpoint│
       │ (Optional)      │  │ (Optional)     │
       │                 │  │                │
       │ Local:          │  │ Anthropic:     │
       │ 192.168.182.1:  │  │ api.anthropic  │
       │ 9999/v1         │  │ .com/v1        │
       │                 │  │                │
       │ Or cloud:       │  │ Or OpenAI:     │
       │ openai.com/v1   │  │ api.openai.com │
       │ api.anthropic   │  │ /v1            │
       │ .com/v1         │  │                │
       └─────────────────┘  └────────────────┘
             │                      │
             │ /chat/completions    │ /chat/completions
             │ (JSON + streaming)   │ (multimodal)
             └──────────────────────┘


                  Receipt OCR Pipeline
            ┌─────────────────────────────┐
            │  window.ReceiptParser       │
            │      (receipt-parser.js)    │
            ├─────────────────────────────┤
            │                             │
        ┌───▼─────┐         ┌──────────┐ │
        │ Capture │         │ Category │ │
        │ Image   │────────▶│ Suggest  │ │
        └─────────┘         └──────────┘ │
            │                      │      │
            │ Phone camera         │ Merchant     
            │ or upload            │ map        
            │                      └──────────┐
            └───────────┬────────────────────┐
                        │                    │
                  Compress               Enhance
                (OffscreenCanvas)       (Optional AI)
                        │                    │
                        └──────┬─────────────┘
                               │
                        Encode base64
                               │
                        ┌──────▼──────┐
                        │ Vision API   │
                        │   Request    │
                        └──────┬───────┘
                               │
                        ┌──────▼──────┐
                        │   Parse     │
                        │ JSON        │
                        │ Response    │
                        └──────┬───────┘
                               │
                        ┌──────▼──────────────┐
                        │ Structured Result:  │
                        │ - merchant          │
                        │ - amount            │
                        │ - date              │
                        │ - category          │
                        │ - items []          │
                        │ - tax / tip         │
                        └──────┬──────────────┘
                               │
                        ┌──────▼──────────┐
                        │ Store receipt   │
                        │ image in        │
                        │ IndexedDB       │
                        │ by txn ID       │
                        └─────────────────┘


                      File Organization

    index.html
    ├─ Single mount point (#app)
    ├─ Links Vue 3 CDN
    ├─ Loads js/storage.js (order matters!)
    ├─ Loads js/ai.js
    ├─ Loads js/receipt-parser.js
    └─ Loads js/app.js (last, uses above)

    js/storage.js
    ├─ getStorage(key) / setStorage(key, value)
    ├─ getReceiptImage() / saveReceiptImage()
    ├─ Helper: compressImage()
    ├─ Helper: fileToBase64()
    ├─ Helper: parseJsonFromText()
    └─ Helper: extractText()

    js/ai.js
    ├─ window.AI namespace
    ├─ getConfig() / saveConfig()
    ├─ normalizeEndpoint()
    ├─ testConnection()
    ├─ getModels()
    ├─ runAI() [core SSE+fallback engine]
    └─ parseNaturalLanguage()

    js/receipt-parser.js
    ├─ window.ReceiptParser namespace
    ├─ parseReceipt() [main entry]
    ├─ parseReceiptWithAICategory()
    ├─ suggestCategory()
    ├─ merchantCategoryMap {}
    └─ Helper: parseJsonFromText()

    js/app.js
    ├─ Vue.createApp() [main app]
    ├─ setup() function
    ├─ State (ref, reactive)
    ├─ Data loading
    ├─ Computed properties
    ├─ Methods (CRUD, AI, export/import)
    ├─ Watchers (auto-save)
    ├─ Lifecycle (onMounted, etc)
    └─ Return object (exports to template)

    css/style.css
    ├─ :root CSS variables (theming)
    ├─ Base styles
    ├─ Layout (grid, flexbox)
    ├─ Components (cards, buttons, forms)
    ├─ Modals & overlays
    └─ Desktop optimizations

    css/mobile.css
    ├─ @media overrides (320px+)
    ├─ Touch targets (44px)
    ├─ Font sizing (16px prevents zoom)
    ├─ Safe area insets
    ├─ Bottom sheet positioning
    └─ Landscape mode adjustments

    manifest.json
    ├─ PWA metadata
    ├─ Display mode: "standalone"
    ├─ Theme colors
    ├─ Icons (SVG inline)
    ├─ Screenshots
    └─ Share target (for receipts)

    sw.js
    ├─ Cache strategy (cache-first + network fallback)
    ├─ Skip API calls (always network)
    ├─ Offline fallback page
    └─ Message handling


                Data Flow: Add Transaction

    User → UI button → activeTab = 'transactions'
              │
              └─▶ showQuickAddMenu = true
                  │
                  └─▶ render bottom sheet
                      │
                  ┌───┴────────────────┬────────────┬──────────────┐
                  │                    │            │              │
             Manual Entry         Receipt OCR   Natural Language
                  │                    │            │
         ┌────────▼──────────┐  ┌──────▼────┐  ┌──▼─────────┐
         │ Form inputs       │  │ Camera    │  │ Text input │
         │ - amount          │  │ snap      │  │ "spent..." │
         │ - category        │  │           │  │            │
         │ - description     │  └──────┬────┘  └──┬──────────┘
         │ - date            │         │          │
         └────────┬──────────┘         │          │
                  │          ┌─────────▼──────────▼──┐
                  │          │ AI Processing         │
                  │          │ (optional)            │
                  │          ├───────────────────────┤
                  │          │ Compress image        │
                  │          │ Parse receipt/text    │
                  │          │ Auto-fill fields      │
                  │          └─────────┬─────────────┘
                  │                    │
                  └─────────┬──────────┘
                            │
                    ┌───────▼──────────┐
                    │ User review      │
                    │ (edit modal)     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ addTransaction() │
                    │ or              │
                    │ addReceiptTxn()  │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
      ┌─────▼──────┐  ┌──────▼─────┐  ┌──────▼────────┐
      │ Update     │  │ Save image │  │ Update account│
      │ transactions│  │ to IndexDB │  │ balance       │
      │ array      │  │            │  │               │
      └─────┬──────┘  └──────┬─────┘  └──────┬────────┘
            │                │               │
            └────────────────┼───────────────┘
                             │
                      ┌──────▼──────────┐
                      │ saveAllData()   │
                      │ (auto-watcher)  │
                      └──────┬──────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
          ┌─────▼────┐  ┌────▼─────┐  ┌──▼────────┐
          │localStorage│ │ IndexedDB│  │ UI update │
          │ (sync)    │ │ (async) │  │ (computed)│
          └───────────┘ └──────────┘  └───────────┘


                  Streaming Response Flow

    Model API Response:
    ─────────────────

    data: {"choices":[{"delta":{"content":"Hello"}}]}
    data: {"choices":[{"delta":{"content":" world"}}]}
    data: [DONE]

                    ↓

    Service Worker (sw.js):
    ──────────────────────
    Handles stream in fetch event
    
                    ↓

    ai.js (runAI):
    ──────────────
    1. resp.body.getReader()
    2. Maintain buffer of incomplete lines
    3. Parse each "data: {...}" line
    4. Extract choices[0].delta.content
    5. Call onChunk(content)
    6. Accumulate into fullText
    7. On [DONE], call onDone()

                    ↓

    app.js (caller):
    ────────────────
    result += chunk  (accumulate in closure)
    
    onDone() → parseJsonFromText(result)
              → populate UI
              → save to state

    Fallback: If SSE fails, single-shot completion
    with simulated word-by-word streaming for UX


               Error Handling Strategy

    User Triggering AI Call:
           │
           └─▶ Validate input
               ├─ No config? Show settings prompt
               ├─ Network unreachable? Show toast
               ├─ Invalid JSON response? Retry 1x
               └─ Timeout (5s)? Fallback
                       │
                       └─ Single-shot request
                           ├─ Success? Parse & use
                           └─ Fail? Show error, allow manual entry


                Service Worker Cache Flow

    App load:
    ────────
    1. Check Cache (index.html, style.css, vue.js)
    2. If found → use cached
    3. If not found → fetch from network
    4. On success → cache for next load
    5. On failure (offline) → return cached version

    API calls (LLM):
    ──────────────
    1. Detect URL contains '/v1/' or 'api.openai.com'
    2. SKIP cache → always fetch network
    3. Timeout 5s
    4. Never cache API responses (data changes)

    CSS/JS assets:
    ──────────────
    1. Cache on first load
    2. Reuse for 1 year (immutable header)
    3. SW updates on next deploy
    4. Browser clears old caches


              Performance Characteristics

    First Load (Cold):
    ──────────────────
    ~200 KB (assets) downloaded
    SW installs & caches
    ~3-5 seconds

    Subsequent Loads (Warm):
    ────────────────────────
    Assets from cache (instant)
    Only API calls hit network
    <1 second

    Storage:
    ────────
    Typical: 500 KB - 2 MB
    Max: ~5-10 MB (localStorage limit)
    Receipt images: IndexedDB (separate quota)

    Memory:
    -------
    ~30-50 MB app + Vue
    ~100-500 MB IndexedDB cache (browser dependent)


                  Theme & Customization

    CSS Variables (Dark Mode Default):
    ───────────────────────────────────
    :root {
      --primary: #ffd700;        (Gold)
      --bg-primary: #0a0e27;     (Near-black)
      --bg-secondary: #1a1f3a;   (Dark navy)
      --text-primary: #ffffff;   (White)
    }

    Light Mode (@media prefers-color-scheme: light):
    ──────────────────────────────────────────────
    --primary: #ffc107;         (Amber)
    --bg-primary: #ffffff;      (White)
    --bg-secondary: #f5f5f5;    (Light gray)
    --text-primary: #1a1a1a;    (Black)


                 Security & Privacy

    Local:
    ──────
    ✅ All data localStorage + IndexedDB (device only)
    ✅ No server communication for personal data
    ✅ API keys stored locally (same as password manager)
    ✅ Export/import completely user-controlled

    Network:
    ────────
    ⚠️ AI requests send transaction description (text only)
    ⚠️ Receipt images sent ONLY to vision API (if enabled)
    ⚠️ LLM endpoint URL typed by user (not hardcoded)
    ✅ HTTPS required for GitHub Pages deployment
    ✅ Mixed-content warning if HTTPS→HTTP on receipts

    Threat Model (Out of Scope):
    ─────────────────────────────
    ❌ Account takeover (single-user browser tool)
    ❌ XSS injection (static HTML, no innerHTML)
    ❌ CSP violations (no external CDN except fonts)
    ❌ Third-party trackers (no analytics)

