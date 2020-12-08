<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        Items
        <v-divider class="mx-4" inset vertical />
        <v-dialog v-model="dialog" max-width="800px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2 ml-2" rounded @click="save">
              <v-icon>mdi-content-save</v-icon>Save
            </v-btn>

            <v-btn
              v-if="$can('Item:Add')"
              color="success"
              dark
              class="mb-2 ml-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>Add Items
            </v-btn>
          </template>
          <add-items
            :data.sync="selected_item"
            :show="dialog"
            @close="closeForm"
            @addItem="addItem"
          />
        </v-dialog>
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          single-line
          hide-details
          label="Search"
        />
      </v-card-title>
      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="loading"
      >
        <v-data-table
          :headers="headers"
          :items="item_list"
          :search="search"
          multi-sort
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr
                v-for="(item, key) in items"
                :key="key"
                :class="rowClass(item)"
              >
                <td>{{ item.sku }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.category.title }}</td>
                <td class="text-right">
                  <template v-if="!allowEdit(item)">
                    {{ toCurrency(item.pivot.cost) }}
                  </template>
                  <v-currency-field
                    v-else
                    v-model="item.pivot.selling_price"
                    label="Selling"
                    solo
                    flat
                    required
                    hide-details
                    single-line
                    :rules="[rules.required]"
                    dense
                    @keypress="changeInput(item)"
                  />
                </td>
                <td class="text-right">
                  <template v-if="!allowEdit(item)">
                    {{ toCurrency(item.pivot.cost) }}
                  </template>
                  <v-currency-field
                    v-else
                    v-model="item.pivot.cost"
                    label="Cost"
                    solo
                    flat
                    required
                    hide-details
                    single-line
                    dense
                    @keypress="changeInput(item)"
                  />
                </td>
                <td class="text-right">
                  <span :class="item.pivot.inventory < 1 ? 'red--text' : ''">{{
                    toNumberFormat(item.pivot.inventory)
                  }}</span>
                </td>
                <td>
                  <v-speed-dial
                    v-model="item.fab"
                    direction="left"
                    :open-on-hover="true"
                    transition="scale-transition"
                  >
                    <template v-slot:activator>
                      <v-btn
                        v-model="item.fab"
                        color="secondary"
                        dark
                        fab
                        x-small
                        tabindex="-1"
                      >
                        <v-icon v-if="item.fab"> mdi-close </v-icon>
                        <v-icon v-else> mdi-cog </v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:default class="p-0">
                      <v-btn
                        v-if="
                          ['new', 'edited', 'deleted'].includes(item._state)
                        "
                        fab
                        dark
                        x-small
                        color="gray"
                        @click="undo(item)"
                      >
                        <v-icon>mdi-undo</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="['', undefined].includes(item._state)"
                        fab
                        dark
                        x-small
                        color="black"
                        @click="ledger(item)"
                      >
                        <v-icon>mdi-clipboard-flow</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="
                          ['', undefined].includes(item._state) &&
                          $can('Item:Delete')
                        "
                        fab
                        dark
                        x-small
                        color="red"
                        @click="remove(item)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-speed-dial>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-skeleton-loader>
    </v-card>

    <v-dialog v-model="showLedger" max-width="800px" scrollable>
      <item-ledger :active-item="item_ledger" :show.sync="showLedger" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { findIndex, reject } from 'lodash'

export default {
  layout: 'StoreLayout',
  meta: {
    permission: 'Item:View',
    access_level: 2,
  },
  data() {
    return {
      headers: [
        {
          text: 'SKU',
          align: 'start',
          sortable: true,
          value: 'sku',
        },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category.title', width: '150' },
        { text: 'Selling Price', value: 'selling_price', width: '150' },
        { text: 'Cost', value: 'cost', width: '150' },
        {
          text: 'Inventory',
          value: 'inventory',
          align: 'end',
          width: '150',
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      rules: {
        required: (value) => !!value,
      },
      options: {},
      dialog: false,
      search: '',
      selected_item: {},
      showLedger: false,
      item_ledger: null,
      new_items: [],
      backdoor: 0,
    }
  },
  computed: {
    ...mapState({
      active_store: (state) => state.app.store,
    }),
    ...mapGetters({
      items: 'item/getItems',
      itemsLoadStatus: 'item/getItemsLoadStatus',
      itemDeletingStatus: 'item/getItemDeletingStatus',
    }),
    loading() {
      return this.itemsLoadStatus() !== 2
    },
    item_list() {
      const items = []
      // eslint-disable-next-line no-unused-expressions
      this.backdoor

      for (const row of this.items) {
        const _row = JSON.parse(JSON.stringify(row))

        items.push(_row)
      }

      return [...items, ...this.new_items]
    },
    changedData() {
      return this.item_list.filter((i) => i._state && i._state !== '')
    },
    pivotData() {
      const data = {}

      for (const row of this.item_list) {
        if (row._state !== 'deleted') {
          data[`${row.id}`] = {
            cost: row.pivot.cost,
            selling_price: row.pivot.selling_price,
          }
        }
      }

      return data
    },
  },
  watch: {
    active_store(newVal, old) {
      if (newVal.id && old) {
        if (newVal.id !== old.id) {
          this.refresh()
        }
      }
    },
  },
  mounted() {
    setTimeout(() => {
      this.loadItems()
    }, 300)
  },
  methods: {
    refresh() {
      this.loadItems()
    },
    loadItems() {
      if (this.active_store) {
        this.$store.dispatch('item/loadStoreItems', this.active_store.id)
      }
    },
    edit(item) {
      this.selected_item = item
      this.dialog = true
    },
    remove(item) {
      if (item.pivot.inventory > 0) {
        this.$swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Can not delete item with remaining inventory',
          footer: '<a href>Why do I have this issue?</a>',
        })
      } else {
        item._state = 'deleted'
      }
    },
    closeForm() {
      this.dialog = false
      this.selected_item = {}
    },
    ledger(item) {
      this.showLedger = true
      this.item_ledger = item
    },
    addItem(items) {
      for (const item of items) {
        const ind = findIndex(this.item_list, (i) => i.id === item.id)

        if (ind === -1) {
          item._state = 'new'
          item.pivot = {
            selling_price: 0,
            cost: 0,
            inventory: 0,
          }

          this.new_items.push(item)
        }
      }
    },
    undo(item) {
      if (item._state === 'new') {
        this.new_items = reject(this.new_items, (i) => i.id === item.id)
      } else {
        this.$store.dispatch('item/updateItem', {
          id: item.id,
          pivot: item._original.pivot,
        })
        this.backdoor++
        item._state = ''
      }
    },
    save() {
      if (this.sending) {
        return
      }

      if (this.changedData.length === 0) {
        return
      }

      this.sending = true
      this.$axios
        .post('/laravel/api/store/items', { items: this.pivotData })
        .then((resp) => {
          if (resp.data) {
            this.$swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Changes has been saved',
              showConfirmButton: false,
              timer: 1500,
            })
            this.applyChanges()
            this.sending = false
          }
        })
        .catch((e) => {
          this.sending = false
        })
    },
    applyChanges() {
      for (const row of this.changedData) {
        if (row._state === 'new') {
          this.$store.dispatch('item/pushItem', row)
        } else if (row._state === 'edited') {
          this.$store.dispatch('item/updateItem', row)
        } else if (row._state === 'deleted') {
          this.$store.dispatch('item/removeItem', row.id)
        }
        row._state = ''
      }
      this.backdoor++
      this.new_items = []
    },
    changeInput(item) {
      if (['', undefined].includes(item._state)) {
        item._state = 'edited'
      }
    },
    allowEdit(item) {
      if (item._state === 'new') {
        return this.$can('Item:Add')
      } else {
        return this.$can('Item:Edit')
      }
    },
  },
  head: {
    title: 'Item',
  },
}
</script>

<style>
.v-speed-dial__list {
  padding: 0 0 !important;
}
</style>
