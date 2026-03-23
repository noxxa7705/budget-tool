/**
 * QuickAddModal Component
 * Main container for quick add transaction modal
 * Manages state, validation, and form submission
 */

const QuickAddModal = Vue.defineComponent({
  name: 'QuickAddModal',
  components: {
    ModalTabs: window.ModalTabs,
    TransactionTypeToggle: window.TransactionTypeToggle,
    ModalFooter: window.ModalFooter,
    ManualEntryForm: window.ManualEntryForm,
    ReceiptEntryForm: window.ReceiptEntryForm,
    NaturalEntryForm: window.NaturalEntryForm,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    modes: {
      type: Array,
      required: true,
    },
    activeMode: {
      type: String,
      required: true,
    },
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
    naturalLanguageInput: {
      type: String,
      default: '',
    },
    naturalLanguageParsing: {
      type: Boolean,
      default: false,
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
    'close',
    'update:activeMode',
    'update:form',
    'update:receiptImage',
    'update:receiptParsed',
    'update:naturalLanguageInput',
    'merchant-input',
    'merchant-focus',
    'merchant-blur',
    'merchant-select',
    'add-transaction',
    'add-receipt-transaction',
    'parse-natural-language',
    'upload-receipt',
  ],
  computed: {
    modalConfig() {
      return MODAL_CONFIG || {};
    },
    typeOptions() {
      return this.modalConfig.fields?.type?.options || [
        { value: 'expense', label: 'Expense', emoji: '💸' },
        { value: 'income', label: 'Income', emoji: '💰' },
      ];
    },
    primaryButtonLabel() {
      if (this.activeMode === 'manual') {
        if (this.form.isRecurring) return 'Add Recurring';
        if (this.form.type === 'income') return 'Add Income';
        return 'Add Expense';
      }
      return 'Continue';
    },
    isFormValid() {
      if (this.activeMode === 'manual') {
        if (!this.form.amount || parseFloat(this.form.amount) <= 0) return false;
        if (this.form.type === 'expense' && !this.form.category) return false;
        if (!this.form.account) return false;
        return true;
      }
      return true;
    },
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleModeSelect(modeId) {
      this.$emit('update:activeMode', modeId);
    },
    handleFormUpdate(updates) {
      this.$emit('update:form', { ...this.form, ...updates });
    },
    handleMerchantInput(value) {
      this.$emit('merchant-input', value);
    },
    handleMerchantFocus() {
      this.$emit('merchant-focus');
    },
    handleMerchantBlur() {
      this.$emit('merchant-blur');
    },
    handleMerchantSelect(merchant) {
      this.$emit('merchant-select', merchant);
    },
    handleUploadClick() {
      this.$emit('upload-receipt');
    },
    handleChangePhoto() {
      this.$emit('update:receiptImage', null);
      this.$emit('update:receiptParsed', null);
    },
    handleSaveTransaction() {
      this.$emit('add-receipt-transaction', false);
    },
    handleSaveRepeat() {
      this.$emit('add-receipt-transaction', true);
    },
    handleParseNaturalLanguage() {
      this.$emit('parse-natural-language');
    },
    handlePrimaryAction() {
      if (this.activeMode === 'manual') {
        this.$emit('add-transaction');
      } else if (this.activeMode === 'receipt') {
        // Receipt handling is via save buttons
      } else if (this.activeMode === 'natural') {
        this.handleParseNaturalLanguage();
      }
    },
  },
  template: `
    <div v-if="isOpen" class="modal-overlay modal-overlay-transaction" @click.self="handleClose">
      <div class="transaction-shell bottom-sheet">
        <!-- Header -->
        <div class="sheet-header modal-shell-header">
          <div>
            <div class="modal-shell-kicker">Transaction Intake</div>
            <h2>Add Transaction</h2>
          </div>
          <button class="btn-close" @click="handleClose">×</button>
        </div>

        <!-- Mode Tabs -->
        <modal-tabs
          :modes="modes"
          :active-mode="activeMode"
          @select="handleModeSelect"
        ></modal-tabs>

        <!-- Mode Content -->
        <div class="sheet-content">
          <!-- Manual Entry Form -->
          <manual-entry-form
            v-show="activeMode === 'manual'"
            :form="form"
            :categories="categories"
            :accounts="accounts"
            :income-sources="incomeSources"
            :merchant-suggestions="merchantSuggestions"
            :show-merchant-suggestions="showMerchantSuggestions"
            :predicted-categories="predictedCategories"
            :category-prediction-loading="categoryPredictionLoading"
            @update:form="handleFormUpdate"
            @merchant-input="handleMerchantInput"
            @merchant-focus="handleMerchantFocus"
            @merchant-blur="handleMerchantBlur"
            @merchant-select="handleMerchantSelect"
          ></manual-entry-form>

          <!-- Receipt Entry Form -->
          <receipt-entry-form
            v-show="activeMode === 'receipt'"
            :receipt-image="receiptImage"
            :receipt-parsed="receiptParsed"
            :receipt-parsing="receiptParsing"
            :categories="categories"
            @upload-click="handleUploadClick"
            @change-photo="handleChangePhoto"
            @save-transaction="handleSaveTransaction"
            @save-repeat="handleSaveRepeat"
            @update:receiptParsed="$emit('update:receiptParsed', $event)"
          ></receipt-entry-form>

          <!-- Natural Language Entry Form -->
          <natural-entry-form
            v-show="activeMode === 'natural'"
            :input="naturalLanguageInput"
            :is-parsing="naturalLanguageParsing"
            @update:input="$emit('update:naturalLanguageInput', $event)"
            @parse="handleParseNaturalLanguage"
          ></natural-entry-form>
        </div>

        <!-- Footer with Action Buttons -->
        <div v-if="activeMode === 'manual'" class="sheet-footer">
          <button @click="handleClose" class="btn-secondary">Cancel</button>
          <button
            @click="handlePrimaryAction"
            :class="['btn-full', 'btn-primary']"
            :disabled="!isFormValid"
          >
            {{ primaryButtonLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
});

// Make globally available
window.QuickAddModal = QuickAddModal;
