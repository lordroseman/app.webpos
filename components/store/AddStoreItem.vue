<template>
  <v-card min-height="500">
    <v-card-title>
      Add items to store

      <v-spacer />
      <v-text-field
        v-model="search"
        single-line
        hide-details
        append-icon="mdi-magnify"
        label="Search"
      />
    </v-card-title>
    <v-card-text>
      <v-data-table
        v-model="selected"
        :headers="colHeaders"
        :items="items"
        show-select
        :search="search"
      >
        <template #[`item.category`]="{ item }">
          {{ item.category.title }}
        </template>
        <template #[`item.subcategory`]="{ item }">
          {{ item.subcategory ? item.subcategory.title : '' }}
        </template>
        <template #no-data>
          You already added all available items to this store
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="addItem">
        Add ( {{ selected.length }} ) items
      </v-btn>
    </v-card-actions>
    <v-snackbar v-model="snackbar" top centered :timeout="2000">
      Selected items added to store

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      colHeaders: [
        {
          text: 'SKU',
          align: 'start',
          sortable: true,
          value: 'sku',
        },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' },
        { text: 'Sub-Category', value: 'subcategory' },
      ],
      selected: [],
      snackbar: false,
      search: null,
    }
  },
  methods: {
    addItem() {
      if (this.selected.length > 0) {
        this.snackbar = true
        this.$emit('addSelectedItems', this.selected)
        this.selected = []
      }
    },
  },
}
</script>
