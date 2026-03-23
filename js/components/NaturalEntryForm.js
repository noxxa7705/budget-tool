/**
 * NaturalEntryForm Component
 * Natural language input for transaction parsing (Phase 4)
 */

const NaturalEntryForm = Vue.defineComponent({
  name: 'NaturalEntryForm',
  props: {
    input: {
      type: String,
      default: '',
    },
    isParsing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:input', 'parse'],
  computed: {
    canParse() {
      return this.input.trim().length > 0 && !this.isParsing;
    },
  },
  template: `
    <div class="form-section">
      <div class="form-group">
        <label>Describe your transaction</label>
        <textarea
          :value="input"
          @input="$emit('update:input', $event.target.value)"
          placeholder="e.g., 'spent $45 on groceries at whole foods this morning'"
          class="textarea-input"
        ></textarea>
      </div>

      <div class="sheet-footer">
        <button
          @click="$emit('parse')"
          :disabled="!canParse"
          class="btn-primary btn-full"
        >
          {{ isParsing ? 'Parsing...' : 'Parse' }}
        </button>
      </div>
    </div>
  `,
});

window.NaturalEntryForm = NaturalEntryForm;
