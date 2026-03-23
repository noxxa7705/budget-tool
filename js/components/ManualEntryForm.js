/**
 * ManualEntryForm Component
 * Manual transaction entry form with validation, category prediction, tags, etc.
 */

const ManualEntryForm = Vue.defineComponent({
  name: 'ManualEntryForm',
  props: {
    form: {
      type: Object,
      required: true,
      // { amount, category, account, description, date, type, incomeSource, isRecurring, frequency, tags, tagsInput }
    },
    categories: {
      type: Array,
      required: true,
    },
    accounts: {
      type: Array,
      required: true,
    },
    incomeSources: {
      type: Array,
      required: true,
    },
    merchantSuggestions: {
      type: Array,
      default: () => [],
    },
    showMerchantSuggestions: {
      type: Boolean,
      default: false,
    },
    predictedCategories: {
      type: Array,
      default: () => [],
    },
    categoryPredictionLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:form',
    'merchant-input',
    'merchant-focus',
    'merchant-blur',
    'merchant-select',
    'category-predicted',
    'tags-change',
  ],
  computed: {
    isExpense() {
      return this.form.type === 'expense';
    },
  },
  methods: {
    updateForm(path, value) {
      const updated = { ...this.form };
      this.$emit('update:form', { ...updated, [path]: value });
    },
    handleDescriptionInput(value) {
      this.updateForm('description', value);
      this.$emit('merchant-input', value);
    },
    handleDescriptionFocus() {
      this.$emit('merchant-focus');
    },
    handleDescriptionBlur() {
      setTimeout(() => this.$emit('merchant-blur'), 200);
    },
    selectMerchant(merchant) {
      this.updateForm('description', merchant);
      this.$emit('merchant-select', merchant);
    },
    selectPredictedCategory(catId) {
      this.updateForm('category', catId);
    },
    handleTagsInput(value) {
      const newTags = value.split(',').map(t => t.trim()).filter(t => t);
      const updated = { ...this.form, tags: newTags, tagsInput: value };
      this.$emit('update:form', updated);
    },
    removeTag(index) {
      const newTags = this.form.tags.filter((_, i) => i !== index);
      const newTagsInput = newTags.join(', ');
      const updated = { ...this.form, tags: newTags, tagsInput: newTagsInput };
      this.$emit('update:form', updated);
    },
  },
  template: `
    <div class="form-section">
      <!-- Transaction Type Toggle -->
      <div class="form-group">
        <label>Type</label>
        <div class="transaction-type-toggle">
          <button
            :class="['type-btn', { active: form.type === 'expense' }]"
            @click="updateForm('type', 'expense')"
          >
            💸 Expense
          </button>
          <button
            :class="['type-btn', { active: form.type === 'income' }]"
            @click="updateForm('type', 'income')"
          >
            💰 Income
          </button>
        </div>
      </div>

      <!-- Amount Input -->
      <div class="form-group">
        <label>Amount</label>
        <div class="numpad-container">
          <input
            :value="form.amount"
            @input="updateForm('amount', $event.target.value)"
            type="number"
            inputmode="decimal"
            placeholder="0.00"
            class="amount-input"
          >
        </div>
      </div>

      <!-- Income Source Selector (shown only for income) -->
      <div v-if="form.type === 'income'" class="form-group">
        <label>Income Source</label>
        <select
          :value="form.incomeSource"
          @input="updateForm('incomeSource', $event.target.value)"
          class="select-input"
        >
          <option v-for="src in incomeSources" :key="src.id" :value="src.id">
            {{ src.emoji }} {{ src.name }}
          </option>
        </select>
      </div>

      <!-- Category Selector (hidden for income, shown for expense) -->
      <div v-if="form.type === 'expense'" class="form-group">
        <label>Category</label>
        <div class="category-chips">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['chip', { active: form.category === cat.id }]"
            @click="updateForm('category', cat.id)"
          >
            {{ cat.emoji }} {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Account Selector -->
      <div class="form-group">
        <label>Account</label>
        <select
          :value="form.account"
          @input="updateForm('account', $event.target.value)"
          class="select-input"
        >
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
      </div>

      <!-- Description with Autocomplete -->
      <div class="form-group">
        <label>Description</label>
        <div class="merchant-autocomplete">
          <input
            :value="form.description"
            @input="handleDescriptionInput($event.target.value)"
            @focus="handleDescriptionFocus"
            @blur="handleDescriptionBlur"
            type="text"
            placeholder="What was this for?"
            class="text-input"
          >
          <!-- Merchant Suggestions -->
          <div v-if="showMerchantSuggestions && merchantSuggestions.length > 0" class="autocomplete-dropdown">
            <div
              v-for="merchant in merchantSuggestions"
              :key="merchant"
              @click="selectMerchant(merchant)"
              class="autocomplete-item"
            >
              {{ merchant }}
            </div>
          </div>
        </div>

        <!-- AI Category Predictions -->
        <div v-if="predictedCategories.length > 0 || categoryPredictionLoading" class="category-predictions">
          <div v-if="categoryPredictionLoading" class="prediction-loading">
            <span class="spinner">⟳</span> Analyzing...
          </div>
          <div v-else class="predicted-options">
            <div class="prediction-label">Suggested categories:</div>
            <div class="prediction-chips">
              <button
                v-for="(catId, idx) in predictedCategories"
                :key="catId"
                @click="selectPredictedCategory(catId)"
                class="prediction-chip"
                :title="categories.find(c => c.id === catId)?.name"
              >
                {{ categories.find(c => c.id === catId)?.emoji }}
                <span class="confidence">{{ idx === 0 ? 'High' : idx === 1 ? 'Med' : 'Low' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Picker -->
      <div class="form-group">
        <label>Date</label>
        <input
          :value="form.date"
          @input="updateForm('date', $event.target.value)"
          type="date"
          class="text-input"
        >
      </div>

      <!-- Tags Input -->
      <div class="form-group">
        <label>Tags (optional)</label>
        <input
          :value="form.tagsInput"
          @change="handleTagsInput($event.target.value)"
          type="text"
          placeholder="Add tags separated by commas"
          class="text-input"
        >
        <div v-if="form.tags && form.tags.length > 0" class="tag-chips">
          <span v-for="(tag, idx) in form.tags" :key="idx" class="tag-chip">
            {{ tag }}
            <button @click="removeTag(idx)" class="tag-remove">×</button>
          </span>
        </div>
      </div>

      <!-- Recurring Transaction Options -->
      <div class="form-group">
        <label>
          <input
            :checked="form.isRecurring"
            @change="updateForm('isRecurring', $event.target.checked)"
            type="checkbox"
            class="checkbox-input"
          >
          Make this recurring
        </label>
      </div>

      <!-- Frequency Selector (shown only if recurring) -->
      <div v-if="form.isRecurring" class="form-group">
        <label>Frequency</label>
        <select
          :value="form.frequency"
          @input="updateForm('frequency', $event.target.value)"
          class="select-input"
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>
    </div>
  `,
});

window.ManualEntryForm = ManualEntryForm;
