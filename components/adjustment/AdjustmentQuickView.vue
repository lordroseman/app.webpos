<template>
  <div>
    <div class="d-flex my-2">
      <div>
        <span class="text-h6">
          Inventory Adjustment # {{ adjustment.id }}
        </span>
        <a target="_blank" style="text-decoration: none" @click="openInNew">
          <v-icon small class="blue--text"> mdi-open-in-new </v-icon>
        </a>
      </div>
      <v-chip
        :color="status[adjustment.status].color"
        text-color="white"
        x-small
        class="ml-auto my-auto"
      >
        {{ status[adjustment.status].text }}
      </v-chip>
    </div>
    <v-divider />
    <div class="d-flex py-2">
      <div class="mr-auto">
        <div>Type : {{ type[adjustment.type].text }}</div>
        <div>Prepared by : {{ adjustment.prepared_by.name }}</div>
        <div>Approved by : {{ adjustment.approved_by.name }}</div>
      </div>
      <div>
        <div>Date : {{ adjustment.date }}</div>
        <div>Store: {{ adjustment.store.name }}</div>
      </div>
    </div>
    <v-dialog v-model="showAdjustment" max-width="800px" persistent scrollable>
      <inventory-adjustment-detail
        :data.sync="adjustment"
        :show="dialog"
        @close="closeForm"
      />
    </v-dialog>
  </div>
</template>

<script>
import InventoryAdjustmentDetail from './InventoryAdjustmentDetail.vue'
export default {
  components: { InventoryAdjustmentDetail },
  props: {
    adjustment: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      status: [
        null,
        { text: 'Pending', color: 'green' },
        { text: 'Approved', color: 'blue' },
      ],
      type: [
        null,
        { text: 'IN', color: 'green' },
        { text: 'OUT', color: 'red' },
      ],
      showAdjustment: false,
    }
  },
  methods: {
    openInNew() {
      this.showAdjustment = true
    },
    closeForm() {
      this.showAdjustment = false
    },
  },
}
</script>

<style></style>
