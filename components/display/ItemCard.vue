<template>
  <v-row>
    <v-col cols="12" sm="3">
      <v-img :src="image" height="125" contain class="grey darken-4" />
    </v-col>

    <v-col cols="12" sm="9">
      <div class="title black--text">
        {{ item.name || 'Item Name' }}
      </div>
      <div class="subtitle">
        {{ item.description || 'Descripyion' }}
      </div>
      <v-row>
        <v-col cols="12" sm="6">
          <div>
            <span class="text--medium">Category:</span>
            {{ item.category.title || 'n/a' }}
          </div>
          <div>
            <span class="text--medium">Item Unit:</span>
            {{ item.item_unit.title || 'n/a' }}
          </div>
        </v-col>
        <v-col v-if="item.pivot" cols="12" sm="6">
          <div>
            <span class="text--medium">Selling Price:</span>
            {{ item.pivot ? toCurrency(item.pivot.selling_price) : 'n/a' }}
          </div>
          <div>
            <span class="text--medium">Cost:</span>
            {{ item.pivot ? toCurrency(item.pivot.cost) : 'n/a' }}
          </div>
          <div>
            <span class="text--black">Inventory:</span>
            {{ item.pivot ? toNumberFormat(item.pivot.inventory) : 'n/a' }}
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    image() {
      const item = this.item
      return `data:${item.image_mime};base64,${item.image_base64}`
    },
  },
}
</script>

<style></style>
