/**
 * TransactionTypeToggle Component
 * Reusable toggle for selecting expense/income
 */

const TransactionTypeToggle = Vue.defineComponent({
  name: 'TransactionTypeToggle',
  props: {
    modelValue: {
      type: String,
      required: true,
      validator: (v) => ['expense', 'income'].includes(v),
    },
    options: {
      type: Array,
      required: true,
      // Array of { value, label, emoji }
    },
  },
  emits: ['update:modelValue'],
  template: `
    <div class="transaction-type-toggle">
      <button
        v-for="option in options"
        :key="option.value"
        :class="['type-btn', { active: modelValue === option.value }]"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.emoji }} {{ option.label }}
      </button>
    </div>
  `,
});

window.TransactionTypeToggle = TransactionTypeToggle;
