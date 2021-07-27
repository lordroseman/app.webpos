<template>
  <v-data-iterator
    :items="transactions"
    :options.sync="options"
    :server-items-length="total"
    disable-filtering
    disable-sort
    :items-per-page="itemsPerPage"
  >
    <template v-slot:default="{ items }">
      <v-card
        v-for="trans in items"
        :key="trans.id"
        flat
        :hover="true"
        class="no-select"
        @click="$router.push('/transaction/' + trans.id)"
      >
        <div class="d-flex flex-column pa-4">
          <div class="d-flex">
            <div class="text-overline">{{ trans.store.name }}</div>
            <v-chip
              class="white--text ml-auto"
              :color="getLabel(trans.labels[0].label_id, 'color')"
              label
              x-small
            >
              {{ getLabel(trans.labels[0].label_id, 'title') }}
            </v-chip>
          </div>
          <div class="d-flex">
            <div>
              <div class="text-caption mt-auto text--secondary">
                {{ trans.txn_number }}
              </div>
              <div class="text-h6 mb-auto">{{ trans.customer_name }}</div>
            </div>
            <div class="ml-auto text-h6 my-auto">
              {{ toCurrency(trans.total_amount) }}
            </div>
          </div>
        </div>
        <v-divider />
      </v-card>
    </template>
  </v-data-iterator>
</template>

<script>
import { isEmpty } from 'lodash'
import { mapState } from 'vuex'
import EventBus from '@/components/core/event-bus'

export default {
  data() {
    return {
      transactions: [],
      options: {},
      total: 0,
      loading: true,
      itemsPerPage: 5,
    }
  },
  computed: {
    ...mapState({
      labels: (state) => state.app.labels,
    }),
  },
  watch: {
    options: {
      handler(newVal, oldVal) {
        if (!isEmpty(oldVal)) {
          this.getTransactions()
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.getTransactions()
    EventBus.$on('reloadDashboard', this.getTransactions)
  },
  methods: {
    async getTransactions(param) {
      // eslint-disable-next-line prettier/prettier
      const trans =
        this.$api.Transaction.custom('transaction/search').include('store')

      if (param) {
        if ('store' in param && param.store !== -1) {
          trans.where('store_id', param.store)
        }

        if ('month' in param) {
          trans.where('month', param.month)
        }
      }

      if (!isEmpty(this.options)) {
        trans.paginate({
          size: this.options.itemsPerPage,
          number: this.options.page,
        })
      } else {
        trans.paginate({ size: 10, number: 1 })
      }

      this.$emit('loading', true)
      await trans
        .get()
        .then((resp) => {
          this.transactions = resp.data
          this.total = resp.meta.total
        })
        .finally(() => {
          this.loading = false
          this.$emit('loading', this.loading)
        })
    },
    getLabel(id, prop) {
      if (!id) {
        return null
      }

      const lbl = this.labels.find((i) => i.id === id)

      if (prop) {
        return lbl[prop]
      }

      return lbl
    },
  },
}
</script>
