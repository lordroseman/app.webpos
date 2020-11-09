<template>
  <v-card>
    <v-card-title>
      <span class="headline">Add Items</span>
      <v-spacer />
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        single-line
        hide-details
        label="Search"
      />
    </v-card-title>
    <v-card-text class="px-0">
      <v-data-table
        v-model="selected"
        :search="search"
        :headers="headers"
        :items="item_list"
        item-key="name"
        show-select
      />
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color=" darken-1" text @click="close"> Cancel </v-btn>
      <v-btn color="blue darken-1" text @click="save">
        Add ({{ count }}) Item(s)
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    show: Boolean,
  },
  data() {
    return {
      selected: [],
      search: '',
      headers: [
        {
          text: 'SKU',
          align: 'start',
          sortable: true,
          value: 'sku',
        },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category.title' },
        { text: 'Item Unit', value: 'item_unit.title' },
      ],
      item_list: [],
      sending: false,
    }
  },
  computed: {
    count() {
      return this.selected.length
    },
  },
  mounted() {
    this.loadItems()
  },
  methods: {
    loadItems() {
      this.$axios.get('/laravel/api/store/items/unselected').then((resp) => {
        this.item_list = resp.data
      })
    },

    save() {
      if (this.count < 1) {
        return
      }

      this.$emit('addItem', this.selected)
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>
