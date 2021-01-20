<template>
  <v-card>
    <v-card-title>
      <span class="headline">Item Ledger :: {{ activeItem.sku }}</span>
      <v-spacer />
    </v-card-title>
    <v-card-text style="height: 800px" class="px-0">
      <div class="px-3">
        <item-card :item="activeItem" />
      </div>
      <div class="pb-2 d-flex mr-3">
        <v-btn rounded class="ml-2 mt-3" @click="showFilter = true">
          <v-icon> mdi-filter </v-icon>Filter
        </v-btn>
        <v-btn class="ml-2 mt-3" rounded @click="refresh">
          <v-icon> mdi-refresh </v-icon> Refresh
        </v-btn>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          width="200px"
        />
      </div>
      <v-divider />

      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="skelLoading"
      >
        <v-data-table
          :headers="colHeaders"
          :items="ledger"
          :search="search"
          show-expand
          single-expand
          :options.sync="options"
          :server-items-length="total"
          :loading="loading"
          @item-expanded="expandItem"
        >
          <template v-if="$vuetify.breakpoint.smAndDown" #body>
            <div></div>
          </template>
          <template #[`item.reference`]="{ item }">
            {{ item.reference_doc }} #{{ item.reference_id }}
          </template>
          <template #[`item.qty_in`]="{ item }">
            {{ toNumberFormat(item.qty_in) }}
          </template>
          <template #[`item.qty_out`]="{ item }">
            {{ toNumberFormat(item.qty_out) }}
          </template>

          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="py-1">
              <v-skeleton-loader :loading="expandLoading" type="article" flat>
                <template v-if="expandedItem">
                  <template v-if="item.reference_doc === 'Transaction'">
                    <transaction-quick-view :transaction="expandedItem" />
                  </template>
                  <template v-else>
                    <adjustment-quick-view :adjustment="expandedItem" />
                  </template>
                </template>
              </v-skeleton-loader>
            </td>
          </template>
          <template v-if="hasFilters" #top>
            <v-btn text x-small class="ml-2" @click="filters = {}">
              <v-icon x-small> mdi-close-circle </v-icon>
              Clear current search query, filters, and sort
            </v-btn>
          </template>
        </v-data-table>
      </v-skeleton-loader>
      <item-ledger-filter :show.sync="showFilter" :filters.sync="filters" />
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-spacer />
      <v-btn color="blue darken-1" text @click="close"> Close </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import { isEmpty, debounce, isArray } from 'lodash'
import ItemLedger from '~/models/ItemLedger'

export default {
  props: {
    activeItem: {
      type: Object,
      default: () => {},
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ledger: [],
      search: '',
      colHeaders: [
        {
          text: 'Date',
          align: 'start',
          sortable: true,
          value: 'posted_date',
        },
        { text: 'Reference', value: 'reference' },
        { text: 'Store', value: 'store.name' },
        { text: 'In', value: 'qty_in', align: 'end' },
        { text: 'Out', value: 'qty_out', align: 'end' },
        { text: 'Notes', value: 'data-table-expand' },
      ],
      options: {},
      skelLoading: true,
      total: 0,
      filters: {},
      loading: false,
      showFilter: false,
      expandedItem: null,
      expandLoading: false,
    }
  },
  computed: {
    ...mapState({
      store: (state) => state.app.store,
    }),
    hasFilters() {
      return !isEmpty(this.filters)
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.loadLedger(this)
      }
    },
    options: {
      handler(newVal, oldVal) {
        this.loadLedger(this)
      },
      deep: true,
    },
    search(val) {
      if (val !== '') {
        this.loadLedger(this)
      }
    },
    filters: {
      handler(newVal, oldVal) {
        this.loadLedger(this)
      },
      deep: true,
    },
  },
  mounted() {
    // this.loadLedger(this)
    this.ledger = []
    this.skelLoading = false
    this.loading = false
  },
  methods: {
    refresh() {
      this.loadLedger(this)
    },
    loadLedger: debounce((vm) => {
      vm.loading = true
      const ledger = ItemLedger.custom('item/ledger')
        .include('store')
        .where('item_id', vm.activeItem.id)

      if (!isEmpty(vm.options)) {
        ledger.paginate({
          size: vm.options.itemsPerPage,
          number: vm.options.page,
        })

        if (vm.options.sortBy.length > 0) {
          ledger.orderBy(
            (vm.options.sortDesc[0] ? '-' : '') + vm.options.sortBy[0]
          )
        }
      }

      if (vm.search !== '') {
        ledger.where('q', vm.search)
      }

      if (vm.hasFilters) {
        for (const index in vm.filters) {
          const value = vm.filters[index]
          if (isArray(value)) {
            ledger.whereIn(index, value)
          } else {
            ledger.where(index, vm.filters[index])
          }
        }
      }

      ledger
        .get()
        .then((resp) => {
          vm.ledger = resp.data
          vm.total = resp.total
        })
        .finally(() => {
          vm.loading = false
        })
    }, 500),
    close() {
      this.$emit('update:show', false)
    },
    async expandItem({ item, value }) {
      if (value) {
        this.expandLoading = true
        const refDoc = item.reference_doc
        const refId = item.reference_id

        switch (refDoc) {
          case 'Transaction': {
            const transaction = await this.$api.Transaction.custom(
              'transaction/search'
            )
              .select({
                payment_option: ['id', 'name'],
                barangay: ['id', 'name'],
                city: ['id', 'name'],
                store: ['id', 'name'],
              })
              .include('payment_option', 'city', 'barangay', 'store')
              .where('id', refId)
              .$first()
            this.expandedItem = transaction
            this.expandLoading = false
            break
          }
          case 'Inventory Adjustment': {
            const adjustment = await this.$api.InventoryAdjustment.custom(
              'inventory_adjustment/search'
            )
              .select({
                prepared_by: ['id', 'name'],
                approved_by: ['id', 'name'],
                store: ['id', 'name'],
              })
              .include('prepared_by', 'approved_by', 'store')
              .where('id', refId)
              .$first()
            this.expandedItem = adjustment
            this.expandLoading = false
            break
          }
        }
      } else {
        await false
      }
    },
    openNewTab(route) {
      const host = window.location.host
      window.location(host + route, '_blank')
    },
  },
}
</script>

<style></style>
