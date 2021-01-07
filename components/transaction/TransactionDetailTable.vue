<template>
  <div>
    <v-divider />
    <div v-for="(detail, i) in details" :key="i">
      <template v-if="i < limit">
        <v-card
          flat
          class="d-flex flex-row pl-0 pr-3 py-3 border-bottom-1s"
          tile
        >
          <div
            style="height: 100px; width: 130px"
            class="mr-1 ml-3 br-1 d-none d-md-block"
          >
            <v-img
              :height="100"
              :width="130"
              contain
              lazy-src="/preload.png"
              :src="getImg(detail.item) || '/preload.png'"
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
      </template>
    </div>
    <div class="py-3 ml-6 d-flex">
      <span class="text--disabled caption" style="width: 100px">
        {{ details.length }} items
      </span>
      <div class="mx-auto">
        <v-btn
          v-if="details.length > limit"
          text
          x-small
          block
          @click="$router.push('/transaction/' + details[0].transaction_id)"
        >
          View more items
        </v-btn>
      </div>
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
    limit: {
      type: Number,
      default: 1000,
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
  methods: {
    getImg(item) {
      if (!item.img) {
        return null
      }

      const img = `data:${item.image_mime};base64,${item.image_base64}`
      return img
    },
  },
}
</script>

<style></style>
