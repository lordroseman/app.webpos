<template>
  <div>
    <order-list
      :form.sync="form"
      :mode="mode"
      :products="items"
      @applyChanges="applyChanges"
      @toggleWalkin="toggleWalkin"
    />

    <v-tabs
      v-model="current_tab"
      light
      grow
      background-color="white"
      hide-slider
      :color="color.primary"
      class="fixed-tabs-bar"
      :show-arrows="false"
    >
      <v-tab
        v-for="category in categories"
        :key="category.id"
        :href="`#${category.id}`"
        @click="
          $vuetify.goTo(`#cat_${category.id}`, {
            container: '#scrolling',
          })
        "
      >
        {{ category.title }}
      </v-tab>
    </v-tabs>
    <v-divider />

    <v-container fluid>
      <v-scrollable id="scrolling" :height="`calc(100vh - 128px)`">
        <v-card v-if="loading" flat tile>
          <v-card-text>
            <v-skeleton-loader type="heading"></v-skeleton-loader>
            <v-row>
              <v-col v-for="n in 3" :key="n" cols="12" lg="4" md="6">
                <v-row>
                  <v-col cols="12" sm="8">
                    <v-skeleton-loader type="article"></v-skeleton-loader>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-skeleton-loader
                      type="image"
                      height="100"
                    ></v-skeleton-loader>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-sheet
          v-else
          v-scroll:#scrolling="onScroll"
          :color="$vuetify.theme.isDark ? 'grey darken-3' : 'grey lighten-3'"
          class="pb-1"
        >
          <template v-if="categories.length > 0">
            <template v-for="category in categories">
              <v-card
                :key="`cat_${category.id}`"
                :ref="`cat_${category.id}`"
                flat
                tile
                class="mb-3"
              >
                <v-card-title
                  :id="`cat_${category.id}`"
                  v-intersect="onIntersect"
                  :data-cat-id="category.id"
                >
                  {{ category.title }}
                </v-card-title>
                <v-card-text class="px-0">
                  <v-row>
                    <v-col
                      v-for="item in category.items"
                      :key="`item_${item.id}`"
                      cols="12"
                      xl="4"
                      lg="6"
                    >
                      <v-card
                        class="no-select"
                        :disabled="item.pivot.inventory - getCartQty(item) <= 0"
                        :flat="item.pivot.inventory - getCartQty(item) <= 0"
                        outlined
                        @click="addToCart(item)"
                      >
                        <v-card-text>
                          <div class="d-flex">
                            <div>
                              <div class="title">{{ item.name }}</div>
                              <div class="subtitle">{{ item.description }}</div>
                              <div
                                class="text-h6"
                                :style="`color:${color.primary}`"
                              >
                                {{ toCurrency(item.pivot.selling_price) }}
                              </div>
                              <div :style="`color:${color.dark}`">
                                Avail Qty:
                                {{
                                  toNumberFormat(
                                    item.pivot.inventory - getCartQty(item)
                                  )
                                }}
                              </div>
                            </div>
                            <div class="ml-auto">
                              <v-badge
                                :content="getCartQty(item)"
                                :value="getCartQty(item)"
                                color="red"
                                overlap
                              >
                                <v-img
                                  v-if="item.img"
                                  contain
                                  :lazy-src="item.img.tiny"
                                  height="100"
                                  width="100"
                                  :src="item.img.thumb"
                                ></v-img>
                              </v-badge>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </template>
          </template>
          <template v-else>
            <div class="text-h6 px-5 text-center">Store has no items.</div>
          </template>
        </v-sheet>
      </v-scrollable>
    </v-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { findIndex, reject, isEmpty } from 'lodash'
import EventBus from '~/components/core/event-bus.js'
import OrderList from '~/components/order/OrderList'
import Form from '~/components/core/Form.js'

const apiKey = process.env.GOOGLE_MAPS_JS_API_KEY

export default {
  layout: 'StoreLayout',
  meta: {
    label: 'Order',
    permission: 'Transaction:View',
    access_level: 2,
  },
  components: {
    OrderList,
  },
  async asyncData({ $api, params }) {
    if (params.id) {
      // eslint-disable-next-line no-undef
      const resp = await $api.Transaction.find(params.id)
      return {
        data: resp,
      }
    } else {
      return {
        data: null,
      }
    }
  },
  data() {
    return {
      drawer: true,
      mini: false,
      search: '',
      counter: 0,
      form: new Form({
        id: null,
        customer: null,
        customer_id: null,
        payment_option_id: null,
        city_id: null,
        barangay_id: null,
        txn_date: null,
        delivery_date: null,
        customer_name: '',
        customer_delivery_address: '',
        customer_contact_number: null,
        customer_geo_location_lat: null,
        customer_geo_location_long: null,
        total_amount: 0.0,
        status: null,
        notes: '',
        walkin: '',
        store_id: null,
      }),
      mode: 'new',
      current_tab: null,
      backdoor: 0,
      currentSection: [],
      currentScrollPos: 0,
      scrollDirection: -1,
      items: [],
      loading: true,
    }
  },
  computed: {
    ...mapState({
      active_store: (state) => state.app.store,
      color: (state) => state.app.color,
      cart: (state) => state.cart.cart,
    }),
    categories() {
      const categories = []
      if (this.items) {
        for (const item of this.items) {
          const category = JSON.parse(JSON.stringify(item.category))
          // check index
          const ind = findIndex(categories, (i) => i.id === category.id)

          if (ind === -1) {
            category.items = [item]
            categories.push(category)
          } else {
            categories[ind].items.push(item)
          }
        }
      }
      // eslint-disable-next-line no-unused-expressions
      this.backdoor
      return categories
    },
  },
  watch: {
    active_store(store, old) {
      this.refresh()
      if (store) {
        this.form.store_id = store.id
      }
    },
    currentSection(sections) {
      this.current_tab = sections[0]
    },
  },
  mounted() {
    this.loadItems()
    this.setData()
  },
  methods: {
    setData() {
      if (isEmpty(this.data)) {
        EventBus.$emit('update-title', '')
        if (this.active_store) {
          this.form.store_id = this.active_store.id
        }

        return
      }
      const data = this.data
      EventBus.$emit('update-title', 'TXN#' + data.txn_number)

      this.form.set(data)
      const details = data.details.map((obj) => ({
        ...obj,
        _state: '',
        _original: obj,
      }))

      setTimeout(() => {
        console.log('setdata from async')
        this.$store.dispatch('cart/setCart', details)
      }, 300)

      this.mode = 'edit'
    },
    refresh() {
      this.loadItems()
    },
    async loadItems() {
      if (this.active_store) {
        const _store = new this.$api.Store({ id: this.active_store.id })

        const _items = _store.items()
        let items = []
        this.loading = true
        await _items.get().then((response) => {
          items = response
        })

        this.items = await items
        this.loading = false
      }
    },
    addToCart(item, qty = 1) {
      if (!item) {
        return
      }

      if (qty > item.pivot.inventory) {
        qty = item.pivot.inventory
      }

      const detail = {}

      detail.item_id = item.id
      detail.item_unit_id = item.item_unit_id
      detail.item_name = item.name
      detail.item_desc = item.description
      detail.item_cost = item.pivot.cost
      detail.item_price = item.pivot.selling_price
      detail.discount_type = null
      detail.discount_value = null
      detail.discount_amount = 0
      detail.item_unit = item.item_unit.abbrev
      detail.quantity = qty
      detail.action = 1
      detail.instructions = ''

      detail.line_total = Number(detail.quantity) * Number(detail.item_price)
      detail._state = 'new'

      this.$store.dispatch('cart/addToCart', detail)

      let inv = item.pivot.inventory - qty
      // find item

      if (qty > inv) {
        item.quantity = inv
      }
      if (inv < 0) {
        inv = 0
      }
      // const itemPayload = {
      //   id: item.id,
      //   pivot: { inventory: inv },
      // }

      // this.updateItem(itemPayload)
    },
    updateItem(data) {
      const ind = findIndex(this.items, (r) => {
        return r.id === data.id
      })

      const item = this.items[ind]

      for (const prop in data) {
        if (prop === 'pivot') {
          for (const pivotProp in data[prop]) {
            item[prop][pivotProp] = data[prop][pivotProp]
          }
        } else {
          item[prop] = data[prop]
        }
      }
      this.backdoor++
    },
    removeItem(item) {
      // check if item exists
      const ind = findIndex(this.cart, (i) => {
        return item.item_id === i.item_id
      })

      if (ind > -1) {
        const detail = this.cart[ind]

        if (detail._state === 'new') {
          this.cart = reject(this.cart, (i) => {
            return i.item_id === item.item_id
          })
        } else {
          this.cart[ind]._state = 'deleted'
        }
      }
    },
    undoItem(item) {
      if (item._state === 'deleted') {
        item._state = ''
        item.quantity = item._original.quantity
      } else if (item._state === 'new') {
        this.removeItem(item)
      } else if (item._state === 'edited') {
        item._state = ''
        item.quantity = item._original.quantity
      }
    },
    cardElevation(hover, item) {
      if (item.pivot) {
        if (item.pivot.inventory < 1) {
          return 1
        }
      }
      return hover ? 16 : 2
    },
    applyChanges() {
      this.form.confirmChanges()

      this.cart = reject(this.cart, (i) => {
        return i._state === 'deleted'
      })

      for (const row of this.cart) {
        row._state = ''
        const copy = Object.assign({}, row)
        delete copy._original

        row._original = copy
      }
    },
    async onIntersect(entries, observer) {
      const id = entries[0].target.dataset.catId
      if (entries[0].isIntersecting) {
        if (this.scrollDirection === -1) {
          await this.currentSection.push(id)
        } else {
          await this.currentSection.unshift(id)
        }
      } else {
        this.currentSection = await this.currentSection.filter((i) => i !== id)
      }
    },
    onScroll(e) {
      if (e.target.scrollTop > this.currentScrollPos) {
        this.scrollDirection = -1
      } else {
        this.scrollDirection = 1
      }
      this.currentScrollPos = e.target.scrollTop
    },
    getCartQty(item) {
      const ind = this.cart.findIndex((i) => i.item_id === item.id)

      if (ind > -1) {
        return this.cart[ind]._state !== 'deleted'
          ? this.cart[ind].quantity
          : null
      } else {
        return null
      }
    },
    toggleWalkin(walkin) {
      if (walkin) {
        this.form.walkin = 1
        this.form.payment_option_id = 1
        this.form.delivery_date = this.formatDate(new Date(), 'yyyy-MM-dd')
        this.form.customer_name = 'WALK-IN CUSTOMER'
      } else {
        this.form.walkin = 0
        this.form.payment_option_id = null
        this.form.delivery_date = null
        this.form.notes = ''
      }
    },
  },
  head() {
    return {
      script: [
        {
          src: `https://maps.googleapis.com/maps/api/js?key=${apiKey}`,
          hid: 'googlemaps',
          defer: true,
          skip: true,
        },
      ],
      title: 'Order',
    }
  },

  beforeRouteLeave(to, from, next) {
    EventBus.$emit('update-title', '')
    next()
  },
}
</script>

<style>
.no-select {
  user-select: none;
}

.d-flex .v-skeleton-loader__card {
  width: 200px !important;
}

.fixed-tabs-bar .v-tabs__bar {
  position: -webkit-sticky;
  position: sticky;
  top: 4rem;
  z-index: 2;
}
</style>
