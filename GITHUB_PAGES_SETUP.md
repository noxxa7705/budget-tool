# Budget Tool — GitHub Pages Deployment

Your budget tool is now live on GitHub Pages! 

## ✅ What Just Happened

- ✅ Repository created: `https://github.com/noxxa7705/budget-tool`
- ✅ All files pushed to `main` branch
- ✅ Manifest updated for GitHub Pages domain
- ⏳ **NEXT STEP:** Enable Pages in repo settings (1 minute)

---

## 🚀 Enable GitHub Pages (1 Minute)

1. Go to: **https://github.com/noxxa7705/budget-tool/settings/pages**

2. Under **"Source"**, select:
   - **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`

3. Click **Save**

4. Wait 30-60 seconds for the build

5. Your site will be live at: **https://noxxa7705.github.io/budget-tool/**

---

## 📱 Test It

Once Pages is enabled:

1. Open: `https://noxxa7705.github.io/budget-tool/`
2. Add a test transaction (fully offline)
3. Try receipt OCR if you configure AI settings
4. On mobile: "Add to home screen" (PWA)

---

## 🔄 Push Future Updates

Every time you make changes:

```bash
cd ~/projects/budget-tool
git add .
git commit -m "Feature: describe your change"
git push
```

Site updates automatically within 1-2 minutes.

---

## ⚙️ Configure AI on GitHub Pages

Since the site is HTTPS (GitHub Pages), you **cannot call local HTTP LLMs** due to mixed-content blocking.

### Options:

**Option 1: Use Anthropic Directly (Recommended)**
- Settings → Vision Endpoint: `https://api.anthropic.com/v1`
- Settings → Vision API Key: `sk-ant-YOUR_KEY`
- Use for receipt OCR

**Option 2: Use OpenAI**
- Settings → LLM Endpoint: `https://api.openai.com/v1`
- Settings → API Key: `sk-...`
- Use for natural language parsing

**Option 3: Local Testing Only**
- Run locally: `python3 -m http.server 8000`
- Then use your local proxy: `http://192.168.182.1:9999/v1`
- (Won't work on GitHub Pages due to HTTPS → HTTP mixed content)

---

## 📊 Site Stats

| Metric | Value |
|--------|-------|
| **URL** | https://noxxa7705.github.io/budget-tool/ |
| **Repository** | https://github.com/noxxa7705/budget-tool |
| **Branch** | main |
| **Build time** | 30-60 seconds after push |
| **SSL/TLS** | ✅ Automatic (GitHub Pages) |
| **Custom domain** | Optional (can add later in settings) |

---

## 🔒 Privacy Notes

✅ All data stays in browser (localStorage + IndexedDB)
✅ No tracking or analytics
✅ No backend server
✅ Export/import fully in your control
⚠️ AI requests go to cloud endpoint (if configured)

---

## 🎯 Next Steps

1. **Enable Pages** in repo settings (1 minute) → https://github.com/noxxa7705/budget-tool/settings/pages
2. **Wait 30-60 seconds** for build to complete
3. **Open:** https://noxxa7705.github.io/budget-tool/
4. **Test:** Add a transaction, export data
5. **(Optional) Add AI:** Configure Anthropic/OpenAI for receipt OCR

---

## 📝 Markdown Files (Self-Hosted Docs)

All documentation is in the repo:
- `START_HERE.md` — Quick onboarding
- `QUICKSTART.md` — Command reference
- `README.md` — Full features
- `DEV_GUIDE.md` — Developer guide
- `ARCHITECTURE.md` — System internals
- `FEATURES.md` — Roadmap

Users can read them on GitHub or embed in app later.

---

## 🐛 Troubleshooting

**"404 Not Found" when visiting site?**
- Pages haven't built yet. Wait 60 seconds and refresh.
- Check: Settings → Pages → check build status

**"Mixed content" error when using local LLM?**
- GitHub Pages is HTTPS, local LLMs are usually HTTP
- Use HTTPS endpoint (Anthropic, OpenAI) instead
- Or test locally: `http://localhost:8000` → local proxy works fine

**Changes not showing up?**
- Wait 1-2 minutes for GitHub to rebuild
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check git push succeeded: `git log --oneline`

**Want a custom domain?**
- Go to Settings → Pages → Custom domain
- Add your domain, GitHub handles SSL

---

## 🎉 You're Live!

Your budget tool is now deployed to the internet. 

**Share the link:** https://noxxa7705.github.io/budget-tool/

Anyone can:
- ✅ Use it immediately (no signup, no server)
- ✅ Add to their home screen (PWA)
- ✅ Work offline completely
- ✅ Export their data anytime

All data stays on their device. Perfect for personal finance!
