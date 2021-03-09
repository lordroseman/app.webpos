<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-btn rounded @click="showFilter = true">
          <v-icon> mdi-filter </v-icon>Filter
        </v-btn>
        <v-btn class="ml-2" rounded @click="refresh">
          <v-icon> mdi-refresh </v-icon>Refresh
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
      </v-card-title>
      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="skelLoading"
      >
        <v-data-table
          :headers="colHeaders"
          :items="transactions"
          :search="search"
          :options.sync="options"
          :server-items-length="total"
          :loading="loading"
        >
          <template #[`item.printed`]="{ item }">
            <v-tooltip v-if="item.printed === 1" right>
              <template v-slot:activator="{ on }">
                <v-chip small color="teal" text-color="white" v-on="on">
                  Printed
                </v-chip>
              </template>
              <span>{{ formatDate(item.date_printed) }}</span>
            </v-tooltip>
            <v-chip v-else small> Unprinted </v-chip>
          </template>
          <template #[`item.total_amount`]="{ item }">
            {{ toCurrency(item.total_amount) }}
          </template>
          <template #[`item.status`]="{ item }">
            <v-chip :color="status[item.status].color" small text-color="white">
              {{ status[item.status].label }}
            </v-chip>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-speed-dial
              v-model="item.fab"
              direction="left"
              :open-on-hover="true"
              transition="scale-transition"
            >
              <template v-slot:activator>
                <v-btn v-model="item.fab" color="secondary" dark fab x-small>
                  <v-icon v-if="item.fab"> mdi-close </v-icon>
                  <v-icon v-else> mdi-cog </v-icon>
                </v-btn>
              </template>
              <template v-slot:default class="p-0">
                <v-btn fab dark x-small color="blue" @click="edit(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  v-if="item.status != 2 && $can('Transaction:Delete')"
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
          <template v-if="hasFilters" #top>
            <v-btn text x-small class="ml-2" @click="filters = {}">
              <v-icon x-small> mdi-close-circle </v-icon>
              Clear current search query, filters, and sort
            </v-btn>
          </template>
        </v-data-table>
      </v-skeleton-loader>
    </v-card>
    <transaction-filter :show.sync="showFilter" :filters.sync="filters" />
    <v-snackbar v-model="snackbar" timeout="2000" top>
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce, isEmpty, isArray, findIndex } from 'lodash'

export default {
  data() {
    return {
      search: '',
      colHeaders: [
        {
          text: 'TXN #',
          align: 'start',
          sortable: true,
          value: 'id',
        },
        { text: 'Customer', value: 'customer_name' },
        { text: 'Store', value: 'store.name' },
        { text: 'TXN Date', value: 'txn_date' },
        { text: 'Delivery Date', value: 'delivery_date' },
        { text: 'Total', value: 'total_amount', align: 'end' },
        { text: 'Printed', value: 'printed' },
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
      snackbar: false,
      snackbarText: '',
    }
  },
  meta: {
    label: 'Transaction',
    permission: 'Transaction:View',
    access_level: 1,
  },
  computed: {
    ...mapGetters({
      status: 'transaction/getStatus',
      transactionDeletingStatus: 'transaction/getTransactionDeletingStatus',
      errors: 'transaction/getErrors',
    }),
    hasFilters() {
      return !isEmpty(this.filters)
    },
    channel() {
      return 'transactions'
    },
  },
  watch: {
    options: {
      handler(newVal, oldVal) {
        if (!isEmpty(oldVal)) {
          this.loadTransaction(this)
        }
      },
      deep: true,
    },
    search(val) {
      if (val !== '') {
        this.loadTransaction(this)
      }
    },
    filters: {
      handler(newVal, oldVal) {
        this.loadTransaction(this)
      },
      deep: true,
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Transaction')
  },
  beforeDestroy() {
    this.$echo.leave(this.channel)
  },
  mounted() {
    this.refresh()
    this.listen()
  },
  methods: {
    refresh() {
      this.loadTransaction(this)
    },
    loadTransaction: debounce((vm) => {
      if (vm.loading) {
        return
      }
      vm.loading = true

      const trans = vm.$api.Transaction.custom('transaction/search').include(
        'store'
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
      } else {
        trans.paginate({ size: 10, number: 1 })
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
          vm.skelLoading = false
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
                    this.removeTransaction(transaction.id)
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
    removeTransaction(id) {
      const ind = findIndex(this.transactions, (r) => {
        return r.id === id
      })

      this.transactions.splice(ind, 1)
    },
    listen() {
      this.$echo
        .private(this.channel)
        .on('NewTransaction', (data) => {
          this.transactions.unshift(data.transaction)
          this.snackbarText = 'New Transaction has been added!'
          this.snackbar = true
        })
        .on('UpdateTransaction', (resp) => {
          const data = resp.transaction
          const ind = this.transactions.findIndex((i) => i.id === data.id)

          if (ind > -1) {
            for (const prop in data) {
              this.transactions[ind][prop] = data[prop]
            }
          }
        })
        .on('DeleteTransaction', (resp) => {
          // eslint-disable-next-line eqeqeq
          const data = resp.transaction
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
