<template>
  <div>
    <v-divider />
    <div v-for="(detail, i) in details" :key="i">
      <v-card flat class="d-flex flex-row px-8 py-3 border-bottom-1s" tile>
        <div style="height: 100px; width: 130px" class="mr-1 br-1">
          <v-img
            :height="100"
            :width="130"
            :src="require('@/static/preload.jpg')"
          />
        </div>
        <div class="mr-auto ml-3">
          <div class="title">
            {{ detail.item_name }}
          </div>
          <div class="subtitle">
            {{ detail.item_desc }}
          </div>
          <div>
            <span class="text--disabled">Qty:</span>
            x{{ detail.quantity }} {{ detail.item_unit }} @
            <span class="text--disabled">Price:</span>
            {{ toCurrency(detail.item_price) }}
          </div>
        </div>
        <div class="my-auto">
          {{ toCurrency(detail.line_total) }}
        </div>
      </v-card>
      <v-divider />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    details: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      headers: [
        { text: 'Item', align: 'start', value: 'item_name' },
        { text: 'Description', value: 'item_desc' },
        { text: 'Unit', value: 'item_unit' },
        { text: 'Cost', value: 'item_cost', align: 'end' },
        { text: 'Price', value: 'item_price', align: 'end' },
        { text: 'Quantity', value: 'quantity', align: 'end' },
        { text: 'Total', value: 'line_total', align: 'end' },
      ],
      search: null,
    }
  },
}
</script>

<style></style>
