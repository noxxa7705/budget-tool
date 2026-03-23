/**
 * ModalFooter Component
 * Reusable footer with Cancel and primary action buttons
 */

const ModalFooter = Vue.defineComponent({
  name: 'ModalFooter',
  props: {
    primaryLabel: {
      type: String,
      required: true,
    },
    secondaryLabel: {
      type: String,
      default: 'Cancel',
    },
    primaryDisabled: {
      type: Boolean,
      default: false,
    },
    primaryVariant: {
      type: String,
      default: 'primary',
      validator: (v) => ['primary', 'secondary'].includes(v),
    },
  },
  emits: ['primary', 'secondary'],
  template: `
    <div class="sheet-footer">
      <button 
        class="btn-secondary" 
        @click="$emit('secondary')"
      >
        {{ secondaryLabel }}
      </button>
      <button 
        :class="['btn-full', \`btn-\${primaryVariant}\`]" 
        @click="$emit('primary')"
        :disabled="primaryDisabled"
      >
        {{ primaryLabel }}
      </button>
    </div>
  `,
});

window.ModalFooter = ModalFooter;
