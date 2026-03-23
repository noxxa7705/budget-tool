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

  // ==================== Phase 11: Receipt Gallery Features ====================
  
  // Initialize IndexedDB with receipt stores
  async initReceiptDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('BudgetApp', 2);
      req.onerror = reject;
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('receipts')) {
          db.createObjectStore('receipts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('receiptGallery')) {
          const gallery = db.createObjectStore('receiptGallery', { keyPath: 'id' });
          gallery.createIndex('transactionId', 'transactionId', { unique: false });
          gallery.createIndex('timestamp', 'timestamp', { unique: false });
          gallery.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        if (!db.objectStoreNames.contains('receiptThumbnails')) {
          db.createObjectStore('receiptThumbnails', { keyPath: 'receiptId' });
        }
        if (!db.objectStoreNames.contains('receiptMetadata')) {
          db.createObjectStore('receiptMetadata', { keyPath: 'receiptId' });
        }
      };
    });
  },

  // Save receipt with multiple resolutions
  async saveReceiptWithResolutions(receipt, highResBase64, lowResBase64, thumbnail) {
    const db = await this.initReceiptDB();
    const id = receipt.id || 'receipt-' + Date.now();
    
    // Save high-res version
    const highResTxn = db.transaction('receiptGallery', 'readwrite');
    const highResStore = highResTxn.objectStore('receiptGallery');
    await new Promise((resolve, reject) => {
      const req = highResStore.put({
        id,
        transactionId: receipt.transactionId,
        highRes: highResBase64,
        timestamp: receipt.timestamp || Date.now(),
        merchant: receipt.merchant,
        amount: receipt.amount,
        category: receipt.category,
        tags: receipt.tags || [],
        ocrText: receipt.ocrText || '',
        verified: receipt.verified || false,
      });
      req.onsuccess = resolve;
      req.onerror = reject;
    });

    // Save low-res version separately
    if (lowResBase64) {
      const lowResTxn = db.transaction('receiptGallery', 'readwrite');
      const lowResStore = lowResTxn.objectStore('receiptGallery');
      await new Promise((resolve, reject) => {
        const req = lowResStore.put({
          id: id + '-lowres',
          receiptId: id,
          lowRes: lowResBase64,
          timestamp: Date.now(),
        });
        req.onsuccess = resolve;
        req.onerror = reject;
      });
    }

    // Save thumbnail
    if (thumbnail) {
      const thumbTxn = db.transaction('receiptThumbnails', 'readwrite');
      const thumbStore = thumbTxn.objectStore('receiptThumbnails');
      await new Promise((resolve, reject) => {
        const req = thumbStore.put({
          receiptId: id,
          thumbnail,
          timestamp: Date.now(),
        });
        req.onsuccess = resolve;
        req.onerror = reject;
      });
    }

    return id;
  },

  // Get receipt by ID with specified resolution
  async getReceipt(receiptId, resolution = 'high') {
    const db = await this.initReceiptDB();
    return new Promise((resolve, reject) => {
      const txn = db.transaction('receiptGallery', 'readonly');
      const store = txn.objectStore('receiptGallery');
      const req = store.get(receiptId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = reject;
    });
  },

  // Get thumbnail
  async getReceiptThumbnail(receiptId) {
    const db = await this.initReceiptDB();
    return new Promise((resolve, reject) => {
      const txn = db.transaction('receiptThumbnails', 'readonly');
      const store = txn.objectStore('receiptThumbnails');
      const req = store.get(receiptId);
      req.onsuccess = () => resolve(req.result?.thumbnail || null);
      req.onerror = reject;
    });
  },

  // Get all receipts for a transaction
  async getReceiptsByTransactionId(txnId) {
    const db = await this.initReceiptDB();
    return new Promise((resolve, reject) => {
      const txn = db.transaction('receiptGallery', 'readonly');
      const store = txn.objectStore('receiptGallery');
      const index = store.index('transactionId');
      const req = index.getAll(txnId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = reject;
    });
  },

  // Get all receipts in gallery (paginated)
  async getAllReceipts(limit = 50, offset = 0) {
    const db = await this.initReceiptDB();
    return new Promise((resolve, reject) => {
      const txn = db.transaction('receiptGallery', 'readonly');
      const store = txn.objectStore('receiptGallery');
      const index = store.index('timestamp');
      const range = IDBKeyRange.lowerBound(0);
      const req = index.getAll(range);
      req.onsuccess = () => {
        const results = req.result || [];
        const sorted = results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(sorted.slice(offset, offset + limit));
      };
      req.onerror = reject;
    });
  },

  // Search receipts by merchant, amount, or OCR text
  async searchReceipts(query) {
    const db = await this.initReceiptDB();
    return new Promise((resolve, reject) => {
      const txn = db.transaction('receiptGallery', 'readonly');
      const store = txn.objectStore('receiptGallery');
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        const queryLower = query.toLowerCase();
        const filtered = results.filter(r => 
          (r.merchant && r.merchant.toLowerCase().includes(queryLower)) ||
          (r.ocrText && r.ocrText.toLowerCase().includes(queryLower)) ||
          (r.category && r.category.toLowerCase().includes(queryLower))
        );
        resolve(filtered.sort((a, b) => b.timestamp - a.timestamp));
      };
      req.onerror = reject;
    });
  },

  // Update receipt metadata (for OCR corrections)
  async updateReceiptMetadata(receiptId, updates) {
    const db = await this.initReceiptDB();
    return new Promise((resolve, reject) => {
      const txn = db.transaction('receiptGallery', 'readwrite');
      const store = txn.objectStore('receiptGallery');
      const getReq = store.get(receiptId);
      getReq.onsuccess = () => {
        const receipt = getReq.result;
        if (receipt) {
          Object.assign(receipt, updates);
          const putReq = store.put(receipt);
          putReq.onsuccess = () => resolve(receipt);
          putReq.onerror = reject;
        } else {
          reject(new Error('Receipt not found'));
        }
      };
      getReq.onerror = reject;
    });
  },

  // Delete receipt and related data
  async deleteReceipt(receiptId) {
    const db = await this.initReceiptDB();
    
    // Delete high-res
    await new Promise((resolve, reject) => {
      const txn = db.transaction('receiptGallery', 'readwrite');
      const store = txn.objectStore('receiptGallery');
      const req = store.delete(receiptId);
      req.onsuccess = resolve;
      req.onerror = reject;
    });

    // Delete low-res
    await new Promise((resolve, reject) => {
      const txn = db.transaction('receiptGallery', 'readwrite');
      const store = txn.objectStore('receiptGallery');
      const req = store.delete(receiptId + '-lowres');
      req.onsuccess = resolve;
      req.onerror = reject;
    });

    // Delete thumbnail
    await new Promise((resolve, reject) => {
      const txn = db.transaction('receiptThumbnails', 'readwrite');
      const store = txn.objectStore('receiptThumbnails');
      const req = store.delete(receiptId);
      req.onsuccess = resolve;
      req.onerror = reject;
    });

    return true;
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

// Image compression utility (high-res for archive)
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

// Phase 11: Generate low-res version for quick loading
async function generateLowResImage(base64Data, maxDim = 400, quality = 0.6) {
  return new Promise((resolve, reject) => {
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

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = base64Data;
  });
}

// Phase 11: Generate thumbnail for gallery
async function generateThumbnail(base64Data, size = 150) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (size - w) / 2;
      const y = (size - h) / 2;

      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, x, y, w, h);

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = base64Data;
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
