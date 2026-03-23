/**
 * ReceiptEntryForm Component
 * Receipt OCR capture and parsing UI
 */

const ReceiptEntryForm = Vue.defineComponent({
  name: 'ReceiptEntryForm',
  props: {
    receiptImage: {
      type: String,
      default: null,
    },
    receiptParsed: {
      type: Object,
      default: null,
    },
    receiptParsing: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: Array,
      required: true,
    },
  },
  emits: [
    'upload-click',
    'change-photo',
    'save-transaction',
    'save-repeat',
    'update:receiptParsed',
  ],
  methods: {
    handleParseUpdate(path, value) {
      if (this.receiptParsed) {
        const updated = { ...this.receiptParsed, [path]: value };
        this.$emit('update:receiptParsed', updated);
      }
    },
    getCategoryName(catId) {
      return this.categories.find(c => c.id === catId)?.name || 'Unknown';
    },
    getCategoryEmoji(catId) {
      return this.categories.find(c => c.id === catId)?.emoji || '';
    },
    formatCurrency(amount) {
      // Format currency - default to USD for now
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount || 0);
    },
  },
  template: `
    <div class="form-section">
      <!-- Upload / Preview Section -->
      <div v-if="!receiptImage" class="receipt-upload">
        <button @click="$emit('upload-click')" class="btn-large btn-primary">
          📷 Take Photo
        </button>
        <p class="text-muted">or</p>
        <button @click="$emit('upload-click')" class="btn-large btn-secondary">
          📁 Upload Image
        </button>
      </div>

      <div v-else class="receipt-preview">
        <img :src="receiptImage" alt="Receipt" class="receipt-thumbnail">
        <button @click="$emit('change-photo')" class="btn-secondary">
          Change Photo
        </button>

        <!-- Loading State -->
        <div v-if="receiptParsing" class="loading-spinner">
          <span>Parsing receipt...</span>
        </div>

        <!-- Parsed Form -->
        <div v-else-if="receiptParsed" class="receipt-form">
          <div class="form-group">
            <label>Merchant</label>
            <input
              :value="receiptParsed.merchant || ''"
              @input="handleParseUpdate('merchant', $event.target.value)"
              type="text"
              class="text-input"
            >
          </div>

          <div class="form-group">
            <label>Amount</label>
            <input
              :value="receiptParsed.amount || ''"
              @input="handleParseUpdate('amount', parseFloat($event.target.value))"
              type="number"
              step="0.01"
              class="text-input"
            >
          </div>

          <div class="form-group">
            <label>Date</label>
            <input
              :value="receiptParsed.date || ''"
              @input="handleParseUpdate('date', $event.target.value)"
              type="date"
              class="text-input"
            >
          </div>

          <div class="form-group">
            <label>Category</label>
            <select
              :value="receiptParsed.category || ''"
              @input="handleParseUpdate('category', $event.target.value)"
              class="select-input"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.emoji }} {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Receipt Items (if parsed) -->
          <div v-if="receiptParsed.items && receiptParsed.items.length > 0" class="receipt-items">
            <details>
              <summary>Items ({{ receiptParsed.items.length }})</summary>
              <div v-for="(item, i) in receiptParsed.items" :key="i" class="item-row">
                <span>{{ item.description }} x{{ item.qty }}</span>
                <span>{{ formatCurrency(item.price) }}</span>
              </div>
            </details>
          </div>

          <!-- Action Buttons -->
          <button @click="$emit('save-transaction')" class="btn-primary btn-full">
            Save Transaction
          </button>
          <button @click="$emit('save-repeat')" class="btn-secondary btn-full">
            Save & Repeat
          </button>
        </div>
      </div>
    </div>
  `,
});

// Global utility for formatting currency
window.ReceiptEntryForm = ReceiptEntryForm;
