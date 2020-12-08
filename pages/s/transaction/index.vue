<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        Transactions
        <v-divider class="mx-4" inset vertical />
        <v-btn rounded @click="showFilter = true">
          <v-icon> mdi-filter </v-icon>Filter
        </v-btn>
        <v-btn v-if="hasFilters" class="ml-2" rounded @click="filters = {}">
          <v-icon> mdi-filter </v-icon>Clear Filter
        </v-btn>
        <v-btn class="ml-2" rounded @click="refresh">
          <v-icon> mdi-refresh </v-icon>Refresh
        </v-btn>
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          width="200px"
        />
      </v-card-title>
      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="skelLoading"
      >
        <v-data-table
          :headers="headerColumn"
          :items="transactions"
          :search.sync="search"
          show-expand
          single-expand
          :options.sync="options"
          :server-items-length="total"
          :loading="loading"
        >
          <template #[`item.total_amount`]="{ item }">
            {{ toCurrency(item.total_amount) }}
          </template>
          <template #[`item.status`]="{ item }">
            <v-chip :color="status[item.status].color" small text-color="white">
              {{ status[item.status].label }}
            </v-chip>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-hover v-slot:default="{ hover }">
              <v-speed-dial
                direction="left"
                transition="scale-transition"
                open-on-hover
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
                  <v-btn
                    v-if="item.status != 2"
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
              <v-row>
                <v-col cols="12" sm="8">
                  <span>Customer Name : {{ item.customer_name }}</span>
                </v-col>
                <v-col cols="12" sm="4">
                  <span>Date: {{ item.txn_date }}</span>
                </v-col>
              </v-row>
            </td>
          </template>
          <template #top>
            <div
              v-if="hasFilters"
              class="ml-4 text--secondary text-caption font-italic"
            >
              Filters: {{ filtersAsText }}
            </div>
          </template>
        </v-data-table>
      </v-skeleton-loader>
      <div v-if="showFilter">
        <transaction-filter :show.sync="showFilter" :filters.sync="filters" />
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { isEmpty, debounce, isArray, startCase } from 'lodash'
import Transaction from '~/models/Transaction'

export default {
  layout: 'StoreLayout',
  data() {
    return {
      search: '',
      headerColumn: [
        {
          text: 'TXN #',
          align: 'start',
          sortable: true,
          value: 'id',
        },
        { text: 'Customer', value: 'customer_name' },
        { text: 'TXN Date', value: 'txn_date' },
        { text: 'Delivery Date', value: 'delivery_date' },
        { text: 'Total', value: 'total_amount', align: 'end' },
        { text: 'Status', value: 'status', align: 'center' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      options: {},
      transactions: [],
      total: 0,
      loading: false,
      skelLoading: true,
      showFilter: false,
      filters: {},
    }
  },
  computed: {
    ...mapState({
      active_store: (state) => state.app.store,
    }),
    ...mapGetters({
      status: 'transaction/getStatus',
      transactionDeletingStatus: 'transaction/getTransactionDeletingStatus',
    }),
    hasFilters() {
      return !isEmpty(this.filters)
    },
    filtersAsText() {
      let txt = ''

      for (const prop in this.filters) {
        txt += `${startCase(prop)} = ${this.filters[prop]}; `
      }

      return txt
    },
    channel() {
      if (this.active_store) {
        return 'store.' + this.active_store.id + '.transactions'
      } else {
        return null
      }
    },
  },
  watch: {
    active_store(store, old) {
      this.refresh()
    },
    options: {
      handler(newVal, oldVal) {
        this.refresh()
      },
      deep: true,
    },
    search(val) {
      if (val !== '') {
        this.refresh()
      }
    },
    filters: {
      handler(newVal, oldVal) {
        this.refresh()
      },
      deep: true,
    },
  },
  mounted() {
    this.refresh()
    this.skelLoading = false
    this.listen()
  },
  beforeDestroy() {
    if (this.channel) {
      this.$echo.leave(this.channel)
    }
  },
  methods: {
    refresh() {
      if (this.active_store) {
        this.loadTransaction(this)
      } else {
        this.loading = false
      }
    },
    loadTransaction: debounce((vm) => {
      if (vm.loading) {
        return
      }
      vm.loading = true
      const trans = Transaction.custom('transaction/search').where(
        'store',
        vm.active_store.id
      )
      if (!isEmpty(vm.options)) {
        trans.paginate({
          size: vm.options.itemsPerPage,
          number: vm.options.page,
        })

        if (vm.options.sortBy.length > 0) {
          trans.orderBy(
            (vm.options.sortDesc[0] ? '-' : '') + vm.options.sortBy[0]
          )
        }
      }

      if (vm.search !== '') {
        trans.where('q', vm.search)
      }

      if (!isEmpty(vm.filters)) {
        for (const index in vm.filters) {
          const value = vm.filters[index]
          if (isArray(value)) {
            trans.whereIn(index, value)
          } else {
            trans.where(index, vm.filters[index])
          }
        }
      }

      trans
        .get()
        .then((resp) => {
          vm.transactions = resp.data
          vm.total = resp.total
        })
        .finally(() => {
          vm.loading = false
        })
    }, 500),
    closeForm() {
      this.dialog = false
      this.selected_transaction = {}
    },
    edit(transaction) {
      const path = this.$route.fullPath
      this.$router.push(`${path}/` + transaction.id)
    },
    remove(transaction) {
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
              this.$store.dispatch(
                'transaction/deleteTransaction',
                transaction.id
              )
              const vue = this
              this.$store.watch(
                this.$store.getters['transaction/getTransactionDeletingStatus'],
                function () {
                  if (vue.transactionDeletingStatus() === 2) {
                    resolve(true)
                  } else {
                    reject(this.errors)
                    this.$swal.showValidationMessage(
                      `Request failed: ${this.errors.message}`
                    )
                  }
                }
              )
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire('Deleted!', 'Item  has been deleted.', 'success')
          }
        })
    },
    listen() {
      if (!this.active_store) {
        return
      }

      this.$echo
        .private(this.channel)
        .on('NewTransaction', (data) => {
          this.transactions.push(data)
        })
        .on('UpdateTransaction', (data) => {
          const ind = this.transactions.findIndex((i) => i.id === data.id)
          // eslint-disable-next-line no-console
          for (const prop in data) {
            this.transactions[ind][prop] = data[prop]
          }
        })
        .on('DeleteTransaction', (data) => {
          const ind = this.transactions.findIndex((i) => i.id === data.id)

          this.transactions.splice(ind, 1)
        })
    },
  },
  head: {
    title: 'Transaction',
  },
}
</script>
