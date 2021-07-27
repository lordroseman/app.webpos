<template>
  <v-container fluid>
    <div class="d-flex">
      <div>
        <v-autocomplete
          v-model="activeStore"
          hide-details
          solo
          flat
          :items="store"
          item-text="name"
          item-value="id"
        >
        </v-autocomplete>
      </div>
      <div class="ml-4">
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="computedDateFormatted"
              label="Select Month"
              prepend-inner-icon="mdi-calendar"
              readonly
              solo
              flat
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title scrollable type="month">
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn text color="primary" @click="setDate"> OK </v-btn>
          </v-date-picker>
        </v-menu>
      </div>
    </div>
    <v-row>
      <v-col cols="12" lg="8">
        <v-row>
          <v-col cols="12" sm="12" md="4">
            <v-card
              flat
              class="d-flex overflow-none"
              height="140"
              color="#C8CCF0"
            >
              <div class="flex-grow-1 pa-4 d-flex flex-column">
                <div class="font-weight-bold indigo--text text--darken-4">
                  TOTAL SALES
                </div>
                <div
                  class="my-auto text-h4 font-weight-light no-wrap indigo--text"
                >
                  {{ toCurrency(transaction.total_sales) }}
                </div>
                <div
                  v-if="transaction.sales_change > -1"
                  class="caption no-wrap"
                >
                  <v-icon color="green">mdi-trending-up</v-icon>
                  {{ transaction.sales_change }}% Dmore than last month
                </div>
                <div v-else class="caption no-wrap">
                  <v-icon color="red">mdi-trending-down</v-icon>
                  {{ Math.abs(transaction.sales_change) }}% less than last month
                </div>
              </div>
              <div class="d-flex mt-10">
                <v-icon class="mt-auto text-h1" color="indigo accent-1">
                  mdi-currency-php
                </v-icon>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card
              flat
              class="d-flex overflow-none"
              height="140"
              color="#EECBF3"
            >
              <div class="flex-grow-1 pa-4 d-flex flex-column">
                <div class="font-weight-bold pink--text text--darken-4">
                  TRANSACTIONS
                </div>
                <div
                  class="my-auto text-h4 font-weight-light pink--text no-wrap"
                >
                  {{ toNumberFormat(transaction.total_count) }}
                </div>
                <div class="caption no-wrap">
                  <div
                    v-if="transaction.count_change > -1"
                    class="caption no-wrap"
                  >
                    <v-icon color="green">mdi-trending-up</v-icon>
                    {{ transaction.count_change }}% more than last month
                  </div>
                  <div v-else class="caption no-wrap">
                    <v-icon color="red">mdi-trending-down</v-icon>
                    {{ Math.abs(transaction.count_change) }}% less than last
                    month
                  </div>
                </div>
              </div>
              <div class="d-flex mt-10">
                <v-icon class="mt-auto text-h1" color="#F092FD"
                  >mdi-cart-check</v-icon
                >
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card
              flat
              class="d-flex overflow-none"
              height="140"
              color="#D2F7F0"
            >
              <div class="flex-grow-1 pa-4 d-flex flex-column">
                <div class="font-weight-bold teal--text text--darken-4">
                  NEW CUSTOMERS
                </div>
                <div
                  class="my-auto text-h4 font-weight-light teal--text no-wrap"
                >
                  {{ customer.count }}
                </div>
                <div class="caption no-wrap">
                  <div
                    v-if="customer.count_change > -1"
                    class="caption no-wrap"
                  >
                    <v-icon color="green">mdi-trending-up</v-icon>
                    {{ customer.count_change }}% more than last month
                  </div>
                  <div v-else class="caption no-wrap">
                    <v-icon color="red">mdi-trending-down</v-icon>
                    {{ Math.abs(customer.count_change) }}% less than last month
                  </div>
                </div>
              </div>
              <div class="d-flex mt-10">
                <v-icon class="mt-auto text-h1 mr-2" color="#80E7D4">
                  mdi-account-multiple-plus
                </v-icon>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <v-card flat>
          <v-card-title v-if="activeStore === -1">
            Sales by Store
          </v-card-title>
          <v-card-title v-else> Daily Sales </v-card-title>
          <v-card-text>
            <store-sales-chart v-show="activeStore === -1" />
            <daily-sales-chart
              v-show="activeStore !== -1"
              :store="activeStore"
              :month="month"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card flat height="100%" :loading="transLoading">
          <v-card-title>Recent Transactions </v-card-title>
          <v-card-text>
            <recent-transactions
              @loading="(loading) => (transLoading = loading)"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import EventBus from '@/components/core/event-bus'
import RecentTransactions from '~/components/transaction/RecentTransactions.vue'

export default {
  components: { RecentTransactions },
  async asyncData({ $axios }) {
    const transaction = await $axios.$get(
      '/laravel/api/dashboard/transaction/summary'
    )

    const customer = await $axios.$get(
      '/laravel/api/dashboard/customer/summary'
    )

    return { transaction, customer }
  },
  data() {
    return {
      transLoading: true,
      store: [{ name: '-All Stores-', id: -1 }],
      activeStore: -1,
      date: new Date().toISOString().substr(0, 10),
      menu: false,
    }
  },
  computed: {
    computedDateFormatted() {
      return this.formatDate(this.date, 'MMMM yyyy')
    },
  },
  watch: {
    activeStore() {
      this.reloadDashboard()
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Dashboard')
  },
  mounted() {
    this.getStores()
  },
  methods: {
    reloadDashboard() {
      EventBus.$emit('reloadDashboard', {
        store: this.activeStore,
        month: this.formatDate(this.date, 'M'),
      })
      this.getSummaryData()
    },
    async getStores() {
      const store = await this.$api.Store.$get()

      this.store = [...this.store, ...store]
    },
    getSummaryData() {
      let filter = ''

      if (this.activeStore !== -1) {
        filter += 'store=' + this.activeStore
      }

      filter += '&month=' + this.formatDate(this.date, 'M')

      this.$axios
        .get('/laravel/api/dashboard/transaction/summary?' + filter)
        .then((resp) => (this.transaction = resp.data))

      this.$axios
        .get('/laravel/api/dashboard/customer/summary?' + filter)
        .then((resp) => (this.customer = resp.data))
    },
    async setDate() {
      await this.$refs.menu.save(this.date)
      this.reloadDashboard()
    },
  },
  head: {
    title: 'Dashboard',
  },
}
</script>
