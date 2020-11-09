<template>
  <v-card>
    <v-card-title>
      <span class="headline">Item Ledger :: {{ activeItem.sku }}</span>
      <v-spacer />
    </v-card-title>
    <v-card-text style="height: 800px" class="px-0 overflow-y-hidden">
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
      <v-scrollable :height="'515px'">
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
          >
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
              <td :colspan="headers.length">
                <span class="text--title">Notes :</span>
                {{ item.notes || 'n/a' }}
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
      </v-scrollable>
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
  },
}
</script>

<style></style>
