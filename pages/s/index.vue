<template>
  <div class="pa-5 d-flex align-stretch" style="height: 100%">
    <div class="board" style="width: 100%">
      <div class="d-flex flex-row align-stretch" style="height: 100%">
        <v-card
          elevation="0"
          class="flex-grow-1 mr-4"
          outlined
          color="green accent-1"
          max-width="33%"
          scrollable
          max-height="800px"
        >
          <v-card-title>
            <div class="text-center">UPCOMING</div>
          </v-card-title>
          <v-card-text style="height: 700px">
            <v-scrollable height="700px">
              <v-skeleton-loader
                ref="skeleton"
                :loading="loading_upcoming"
                type="image,image,image"
                class="my_loader"
              >
                <div
                  v-if="upcoming.length == 0"
                  class="d-flex flex-column justify-center"
                >
                  <span class="text-h5 text-center">No upcoming Orders</span>
                  <v-img
                    :src="require('@/static/empty.png')"
                    width="300"
                    class="mx-auto"
                  />
                </div>
                <template v-for="(item, index) in upcoming">
                  <order-card :key="index" :transaction="item" />
                </template>
              </v-skeleton-loader>
            </v-scrollable>
          </v-card-text>
        </v-card>
        <v-card
          elevation="0"
          class="flex-grow-1 mr-4"
          outlined
          color="amber accent-1"
          max-width="33%"
          scrollable
          max-height="800px"
        >
          <v-card-title>OPEN</v-card-title>
          <v-card-text style="height: 700px">
            <v-scrollable height="700px">
              <v-skeleton-loader
                ref="skeleton"
                :loading="loading_open"
                type="image,image,image"
                class="my_loader"
              >
                <div
                  v-if="open.length == 0"
                  class="d-flex flex-column justify-center"
                >
                  <span class="text-h5 text-center">No open Orders</span>
                  <v-img
                    :src="require('@/static/empty.png')"
                    width="300"
                    class="mx-auto"
                  />
                </div>

                <template v-for="(item, index) in open">
                  <order-card :key="index" :transaction="item" />
                </template>
              </v-skeleton-loader>
            </v-scrollable>
          </v-card-text>
        </v-card>
        <v-card
          elevation="0"
          class="flex-grow-1 mr-4"
          outlined
          color="blue accent-1"
          max-width="33%"
          scrollable
          max-height="800px"
        >
          <v-card-title>CLOSE</v-card-title>
          <v-card-text style="height: 700px">
            <v-scrollable height="700px">
              <v-skeleton-loader
                ref="skeleton"
                :loading="loading_close"
                type="image,image,image"
                class="my_loader"
              >
                <div v-if="close.length == 0" class="d-flex flex-column">
                  <span class="text-h5 text-center mt-auto"
                    >No closed Orders</span
                  >
                  <v-img
                    :src="require('@/static/empty.png')"
                    width="300"
                    class="mx-auto mb-auto"
                  />
                </div>
                <template v-for="(item, index) in close">
                  <order-card :key="index" :transaction="item" />
                </template>
              </v-skeleton-loader>
            </v-scrollable>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import OrderCard from '~/components/display/OrderCard'

export default {
  layout: 'StoreLayout',
  meta: {
    permission: 'Dashboard:View',
    access_level: 2,
  },
  components: {
    OrderCard,
  },
  async asyncData({ $api, store }) {
    const activeStore = store.state.app.store

    const transactions = await $api.Transaction.custom('transaction/search')
      .where('store', activeStore ? activeStore.id : -1)
      // .where('today', 'today')
      .include('details', 'labels')
      .get()

    return { transactions }
  },
  data() {
    return {
      transactions: [],
      loading_open: false,
      loading_upcoming: false,
      loading_close: false,
      backdoor: 0,
    }
  },
  computed: {
    ...mapState({
      store: (state) => state.app.store,
    }),
    upcoming() {
      try {
        return this.transactions.filter((i) => i.status === 0)
      } catch (e) {
        return []
      }
    },
    open() {
      try {
        const open = this.transactions.filter((i) => i.status === 1)

        return open
      } catch (e) {
        return []
      }
    },
    close() {
      try {
        return this.transactions.filter((i) => i.status === 2)
      } catch (e) {
        return []
      }
    },
    channel() {
      if (this.store) {
        return 'store.' + this.store.id + '.transactions'
      } else {
        return null
      }
    },
  },
  watch: {
    store(val) {
      if (val) {
        this.listen()
        this.refresh()
      }
    },
  },
  beforeDestroy() {
    if (this.channel) {
      this.$echo.leave(this.channel)
    }
  },
  mounted() {
    this.listen()
  },
  methods: {
    async refresh() {
      const transactions = await this.$api.Transaction.custom(
        'transaction/search'
      )
        .where('store', this.store ? this.store.id : -1)
        // .where('today', 'today')
        .include('details', 'labels')
        .get()

      this.transactions = transactions.data
    },
    listen() {
      if (!this.store) {
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
    title: 'Dashboard',
  },
}
</script>

<style>
.my_loader .v-skeleton-loader__bone {
  margin-bottom: 10px;
}
</style>
