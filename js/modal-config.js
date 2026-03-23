/**
 * QuickAddModal Configuration
 * Centralized metadata for all text/field configurations
 */

const MODAL_CONFIG = {
  // Modal titles and descriptions
  titles: {
    main: 'Add Transaction',
    kicker: 'Transaction Intake',
  },

  // Mode definitions
  modes: [
    {
      id: 'manual',
      name: 'Manual',
      icon: '✏️',
      description: 'Enter transaction details manually',
    },
    {
      id: 'receipt',
      name: 'Receipt',
      icon: '📷',
      description: 'Capture receipt and auto-parse',
    },
    {
      id: 'natural',
      name: 'Natural',
      icon: '💬',
      description: 'Describe in plain text',
    },
  ],

  // Form field labels and placeholders
  fields: {
    type: {
      label: 'Type',
      options: [
        { value: 'expense', label: 'Expense', emoji: '💸' },
        { value: 'income', label: 'Income', emoji: '💰' },
      ],
    },
    amount: {
      label: 'Amount',
      placeholder: '0.00',
    },
    incomeSource: {
      label: 'Income Source',
    },
    category: {
      label: 'Category',
    },
    account: {
      label: 'Account',
    },
    description: {
      label: 'Description',
      placeholder: 'What was this for?',
    },
    date: {
      label: 'Date',
    },
    tags: {
      label: 'Tags (optional)',
      placeholder: 'Add tags separated by commas',
    },
    recurring: {
      label: 'Make this recurring',
      frequencyLabel: 'Frequency',
      frequencyOptions: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Bi-weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
      ],
    },
  },

  // Receipt form fields
  receiptFields: {
    merchant: {
      label: 'Merchant',
    },
    amount: {
      label: 'Amount',
    },
    date: {
      label: 'Date',
    },
    category: {
      label: 'Category',
    },
  },

  // Receipt UI text
  receipt: {
    uploadTitle: 'Upload Receipt',
    takePhoto: '📷 Take Photo',
    uploadImage: '📁 Upload Image',
    or: 'or',
    changePhoto: 'Change Photo',
    parsingText: 'Parsing receipt...',
    itemsLabel: 'Items',
    saveTransaction: 'Save Transaction',
    saveRepeat: 'Save & Repeat',
  },

  // Natural language form
  naturalLanguage: {
    label: 'Describe your transaction',
    placeholder: "e.g., 'spent $45 on groceries at whole foods this morning'",
    parseButton: 'Parse',
  },

  // Button text
  buttons: {
    cancel: 'Cancel',
    addExpense: 'Add Expense',
    addIncome: 'Add Income',
    addRecurring: 'Add Recurring',
    parse: 'Parse',
  },

  // Validation messages
  validation: {
    missingAmount: 'Please enter an amount',
    missingCategory: 'Please select a category',
    missingAccount: 'Please select an account',
    allRequired: 'Please fill in all required fields',
  },

  // Notification messages
  notifications: {
    transactionAdded: 'Transaction added!',
    incomeAdded: 'Income added!',
    recurringAdded: (freq, type) => `Recurring ${freq} ${type} added!`,
    receiptAdded: 'Receipt added!',
    receiptReady: 'Saved! Ready for next receipt.',
    parsedSuccessfully: 'Parsed successfully!',
    parseFailed: 'Parse failed:',
  },

  // CSS classes (for consistency)
  classes: {
    container: 'transaction-shell',
    overlay: 'modal-overlay modal-overlay-transaction',
    header: 'sheet-header modal-shell-header',
    content: 'sheet-content',
    footer: 'sheet-footer',
    formSection: 'form-section',
    formGroup: 'form-group',
    typeBtnGroup: 'transaction-type-toggle',
    typeBtn: 'type-btn',
    categoryChips: 'category-chips',
    chip: 'chip',
    selectInput: 'select-input',
    textInput: 'text-input',
    numberInput: 'amount-input',
    textareaInput: 'textarea-input',
    tabsContainer: 'sheet-tabs',
    tab: 'sheet-tab',
    btnPrimary: 'btn-primary',
    btnSecondary: 'btn-secondary',
    btnFull: 'btn-full',
    merchantAutocomplete: 'merchant-autocomplete',
    autocompleteDropdown: 'autocomplete-dropdown',
    autocompleteItem: 'autocomplete-item',
    categoryPredictions: 'category-predictions',
    predictionLoading: 'prediction-loading',
    predictionChips: 'prediction-chips',
    predictionChip: 'prediction-chip',
    tagChips: 'tag-chips',
    tagChip: 'tag-chip',
    tagRemove: 'tag-remove',
    receiptUpload: 'receipt-upload',
    receiptPreview: 'receipt-preview',
    receiptThumbnail: 'receipt-thumbnail',
    receiptForm: 'receipt-form',
    receiptItems: 'receipt-items',
    itemRow: 'item-row',
    checkboxInput: 'checkbox-input',
  },
};

// Export for use in components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MODAL_CONFIG;
}
