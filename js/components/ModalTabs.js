/**
 * ModalTabs Component
 * Reusable tab selector for modal modes
 */

const ModalTabs = Vue.defineComponent({
  name: 'ModalTabs',
  props: {
    modes: {
      type: Array,
      required: true,
      // Array of { id, name, icon, description }
    },
    activeMode: {
      type: String,
      required: true,
    },
  },
  emits: ['select'],
  template: `
    <div class="sheet-tabs">
      <button
        v-for="mode in modes"
        :key="mode.id"
        :class="['sheet-tab', { active: activeMode === mode.id }]"
        @click="$emit('select', mode.id)"
      >
        {{ mode.icon }} {{ mode.name }}
      </button>
    </div>
  `,
});

window.ModalTabs = ModalTabs;
