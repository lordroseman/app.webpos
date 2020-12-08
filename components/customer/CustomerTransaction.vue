<template>
  <div class="mx-5">
    <v-data-iterator
      :items="transactions"
      :options.sync="options"
      :server-items-length="total"
      :loading="loading"
    >
      <template #no-data>
        <div class="red--text">Oops!</div>
        <div>It looks like you dont have any transactions.</div>
      </template>
      <template v-slot:default="{ items }">
        <v-card
          v-for="(transaction, index) in items"
          :key="index"
          class="mb-3"
          outlined
          color="grey lighten-3"
        >
          <div class="d-flex">
            <v-list-item
              two-line
              @click="$router.push('/transaction/' + transaction.id)"
            >
              <v-list-item-content>
                <v-list-item-title class="d-flex">
                  <b class="mr-auto"> Trans # {{ transaction.txn_number }} </b>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ transaction.txn_date }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <div class="border-left ml-3 pl-3 my-auto">
              <v-chip
                v-if="transaction.status === 1"
                class="ma-2"
                color="green"
                text-color="white"
                small
              >
                OPEN
              </v-chip>
              <v-chip v-else class="ma-2" color="red" text-color="white" small>
                CLOSE
              </v-chip>
            </div>
          </div>
          <transaction-detail-table
            :details="transaction.details"
            :limit="2"
          ></transaction-detail-table>
          <v-divider />
          <div class="pa-3 d-flex">
            <span class="ml-auto text-subtitle-1 my-auto">TOTAL</span>
            <span class="ml-5 green--text text-h5">
              {{ toCurrency(transaction.total_amount) }}
            </span>
          </div>
        </v-card>
      </template>
    </v-data-iterator>
  </div>
</template>

<script>
import { isEmpty } from 'lodash'

export default {
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      transactions: [],
      options: {},
      total: 0,
      loading: false,
    }
  },
  watch: {
    options: {
      handler(newVal, oldVal) {
        this.loadTransaction(this)
      },
      deep: true,
    },
  },
  mounted() {
    this.loadTransaction()
  },
  methods: {
    loadTransaction() {
      if (this.loading) {
        return
      }
      this.loading = true

      const trans = this.customer.transactions()

      trans.include('details.item').where('customer_id', this.customer.id)

      if (!isEmpty(this.options)) {
        trans.paginate({
          size: this.options.itemsPerPage,
          number: this.options.page,
        })

        if (this.options.sortBy.length > 0) {
          trans.orderBy(
            (this.options.sortDesc[0] ? '-' : '') + this.options.sortBy[0]
          )
        }
      } else {
        trans.paginate({ size: 10, number: 1 })
      }

      trans
        .get()
        .then((resp) => {
          this.transactions = resp.data
          this.total = resp.total
        })
        .finally(() => {
          this.loading = false
          this.skelLoading = false
        })
    },
  },
}
</script>

<style></style>
