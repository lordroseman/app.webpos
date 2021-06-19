<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="800px" persistent scrollable>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Item:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New Item
            </v-btn>
          </template>
          <item-form
            :data.sync="selected_item"
            :show="dialog"
            @close="closeForm"
            @updateItem="updateItem"
            @addItem="addItem"
          />
        </v-dialog>
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="skelLoading"
      >
        <v-data-table
          :headers="colHeaders"
          :items="items"
          :search="search"
          :options.sync="options"
          :server-items-length="total"
          :loading="loading"
          show-expand
          single-expand
        >
          <template #[`item.category`]="{ item }">
            {{ item.category.title }}
          </template>
          <template #[`item.subcategory`]="{ item }">
            {{ item.subcategory ? item.subcategory.title : '' }}
          </template>

          <template #[`item.actions`]="{ item }">
            <v-hover v-slot:default="{ hover }">
              <v-speed-dial
                direction="left"
                :open-on-hover="true"
                transition="scale-transition"
              >
                <template v-slot:activator>
                  <v-btn color="secondary" dark fab x-small>
                    <v-icon v-if="hover"> mdi-close </v-icon>
                    <v-icon v-else> mdi-cog </v-icon>
                  </v-btn>
                </template>
                <template v-slot:default class="p-0">
                  <v-btn fab dark x-small color="blue" @click="edit(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn fab dark x-small color="black" @click="ledger(item)">
                    <v-icon>mdi-clipboard-flow</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="$can('Item:Delete')"
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
            </v-hover>
          </template>
          <template #expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <div class="d-flex py-3">
                <v-card v-if="item.img" outlined width="125">
                  <v-img
                    width="125"
                    height="125"
                    :src="item.img.thumb"
                    :lazy-src="item.img.tiny"
                    eager
                  >
                  </v-img>
                </v-card>
                <div class="ml-2">
                  <h3>{{ item.sku }} - {{ item.name }}</h3>
                  <div>
                    <span>Description :</span>
                    {{ item.description }}
                  </div>
                  <div>
                    <span>Item Unit :</span>
                    {{ item.item_unit.title }}({{ item.item_unit.abbrev }})
                  </div>
                </div>
              </div>
            </td>
          </template>
        </v-data-table>
      </v-skeleton-loader>
    </v-card>

    <v-dialog
      v-model="showLedger"
      max-width="800px"
      :fullscreen="$vuetify.breakpoint.smAndDown"
      scrollable
    >
      <item-ledger :active-item="item_ledger" :show.sync="showLedger" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce, isEmpty, isArray } from 'lodash'

export default {
  meta: {
    label: 'Item',
    permission: 'Item:View',
    access_level: 1,
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
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      options: {},
      dialog: false,
      search: '',
      selected_item: {},
      showLedger: false,
      item_ledger: null,
      showFilter: false,
      filters: {},
      items: [],
      loading: false,
      transactions: [],
      total: 0,
      skelLoading: true,
    }
  },
  computed: {
    ...mapGetters({
      itemDeletingStatus: 'item/getItemDeletingStatus',
    }),
  },
  watch: {
    options: {
      handler(newVal, oldVal) {
        if (!isEmpty(oldVal)) {
          this.loadItems(this)
        }
      },
      deep: true,
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Item')
  },
  mounted() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.loadItems(this)
    },
    loadItems: debounce((vm) => {
      if (vm.loading) {
        return
      }
      vm.loading = true

      let items = null
      items = vm.$api.Item.custom('/item/search').include(
        'category',
        'subcategory',
        'media'
      )

      if (!isEmpty(vm.options)) {
        items.paginate({
          size: vm.options.itemsPerPage,
          number: vm.options.page,
        })

        if (vm.options.sortBy.length > 0) {
          items.orderBy(
            (vm.options.sortDesc[0] ? '-' : '') + vm.options.sortBy[0]
          )
        }
      } else {
        items.paginate({ size: 10, number: 1 })
      }

      if (vm.search !== '') {
        items.where('q', vm.search)
      }

      if (!isEmpty(vm.filters)) {
        for (const index in vm.filters) {
          const value = vm.filters[index]
          if (isArray(value)) {
            items.whereIn(index, value)
          } else {
            items.where(index, vm.filters[index])
          }
        }
      }

      items
        .get()
        .then((resp) => {
          vm.items = resp.data
          vm.total = resp.meta.total
        })
        .finally(() => {
          vm.loading = false
          vm.skelLoading = false
        })
    }, 500).bind(this),
    edit(item) {
      this.selected_item = item
      this.dialog = true
    },
    remove(item) {
      this.$swal
        .fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          showLoaderOnConfirm: true,
          preConfirm: (e) => {
            return new Promise((resolve, reject) => {
              const deleteItem = new this.$api.Item({ id: item.id })
              deleteItem
                .delete()
                .then((response) => {
                  resolve(true)
                })
                .catch((errors) => {
                  reject(this.errors)
                  this.$swal.showValidationMessage(
                    `Request failed: ${this.errors.message}`
                  )
                })
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire('Deleted!', 'Item  has been deleted.', 'success')
            this.removeItem(item)
          }
        })
    },
    updateItem(item) {
      // find ind
      const ind = this.items.findIndex((i) => i.id === item.id)

      if (ind > -1) {
        for (const prop in item) {
          this.items[ind][prop] = item[prop]
        }
      }
    },
    addItem(item) {
      this.items.push(item)
    },
    closeForm() {
      this.dialog = false
      this.selected_item = {}
    },
    ledger(item) {
      this.showLedger = true
      this.item_ledger = item
    },
    removeItem(item) {
      const ind = this.items.findIndex((i) => i.id === item.id)

      if (ind > -1) {
        this.items.splice(ind, 1)
      }
    },
  },
  head: {
    title: 'Item',
  },
}
</script>
