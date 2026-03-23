// Storage wrapper — localStorage + IndexedDB abstraction
window.StorageAPI = {
  async getStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Storage get failed:', err);
      return null;
    }
  },

  async setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Storage set failed:', err);
      return false;
    }
  },

  async getReceiptImage(txnId) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('BudgetApp', 1);
      req.onerror = reject;
      req.onsuccess = () => {
        const db = req.result;
        const store = db.transaction('receipts', 'readonly').objectStore('receipts');
        const get = store.get(txnId);
        get.onsuccess = () => resolve(get.result?.image || null);
        get.onerror = reject;
      };
    });
  },

  async saveReceiptImage(txnId, imageBase64) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('BudgetApp', 1);
      req.onerror = reject;
      req.onsuccess = () => {
        const db = req.result;
        const store = db.transaction('receipts', 'readwrite').objectStore('receipts');
        const put = store.put({ id: txnId, image: imageBase64, timestamp: Date.now() });
        put.onsuccess = () => resolve(true);
        put.onerror = reject;
      };
    });
  },
};

// Make globally available
async function getStorage(key) {
  return window.StorageAPI.getStorage(key);
}

async function setStorage(key, value) {
  return window.StorageAPI.setStorage(key, value);
}

// SHA256 for receipt hashing (simple implementation via Web Crypto API)
async function sha256(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Image compression utility
async function compressImage(file, maxDim = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        const w = img.width * scale;
        const h = img.height * scale;

        canvas.width = Math.round(w);
        canvas.height = Math.round(h);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert file to base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Parse JSON from text with multiple fallback strategies
function parseJsonFromText(text) {
  if (!text) return null;

  const cleaned = String(text || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const arrIdx = cleaned.indexOf('[');
  const objIdx = cleaned.indexOf('{');
  let start = -1;

  if (arrIdx !== -1 && (objIdx === -1 || arrIdx < objIdx)) start = arrIdx;
  else if (objIdx !== -1) start = objIdx;

  if (start !== -1) {
    try {
      return JSON.parse(cleaned.slice(start));
    } catch (_) {}

    const opener = cleaned[start];
    const closer = opener === '[' ? ']' : '}';
    const end = cleaned.lastIndexOf(closer);
    if (end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (_) {}
    }
  }

  return null;
}

// Extract text from various content shapes (for streaming responses)
function extractText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(extractText).join('');
  if (value && typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    if (typeof value.content === 'string') return value.content;
    if (Array.isArray(value.content)) return value.content.map(extractText).join('');
    if (typeof value.output_text === 'string') return value.output_text;
    if (Array.isArray(value.parts)) return value.parts.map(extractText).join('');
    if (Array.isArray(value.items)) return value.items.map(extractText).join('');
  }
  return '';
}
