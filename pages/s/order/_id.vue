<template>
  <div>
    <order-list
      :ordered-items.sync="orderedItems"
      :form.sync="form"
      :mode="mode"
      @removeItem="removeItem"
      @undoItem="undoItem"
      @applyChanges="applyChanges"
    />

    <category-list
      :categories="categories"
      @selectCategory="selected_category = $event"
    />

    <v-container>
      <v-skeleton-loader
        :loading="loading"
        :type="loadingType"
        class="d-flex flex-row justify-space-between flex-wrap"
      >
        <v-data-iterator
          :items="filteredItems"
          :search="search"
          :sort-by="sortBy.toLowerCase()"
          :sort-desc="sortDesc"
          hide-default-footer
          style="width: 100%"
        >
          <template v-slot:header>
            <v-toolbar class="mb-1" flat color="transparent">
              <v-text-field
                v-model="search"
                clearable
                flat
                solo-inverted
                hide-details
                hide-default-footer
                color="white"
              >
                <template #label
                  ><span class="white--text">Search</span>
                </template>
                <template #prepend-inner
                  ><v-icon color="white">mdi-magnify</v-icon>
                </template>
              </v-text-field>
              <template v-if="$vuetify.breakpoint.mdAndUp">
                <v-spacer />
                <v-btn-toggle v-model="sortDesc" mandatory>
                  <v-btn large depressed :value="false">
                    <v-icon>mdi-arrow-up</v-icon>
                  </v-btn>
                  <v-btn large depressed :value="true">
                    <v-icon>mdi-arrow-down</v-icon>
                  </v-btn>
                </v-btn-toggle>
              </template>
              <v-btn icon>
                <v-icon>mdi-clipboard-text-multiple</v-icon>
              </v-btn>
            </v-toolbar>
          </template>

          <template v-slot:default="props">
            <v-row>
              <v-col
                v-for="item in props.items"
                :key="item.name"
                cols="12"
                sm="6"
                lg="4"
                xl="3"
              >
                <v-hover
                  v-slot:default="{ hover }"
                  open-delay="100"
                  style="cursor: pointer"
                >
                  <v-card
                    :elevation="cardElevation(hover, item)"
                    height="250"
                    class="d-flex flex-column"
                    @click="addItem(item)"
                  >
                    <v-card-text
                      style="height: 180px"
                      class="d-flex align-space-between flex-column no-select"
                    >
                      <div>
                        <v-img
                          lazy-src="'/preload.jpg'"
                          :src="item.img || '/preload.jpg'"
                          height="125"
                          contain
                          class="grey darken-4"
                        />
                      </div>
                      <div class="mt-auto pt-2">
                        <h2 class="text-center font-weight-medium">
                          {{ item.name }}
                        </h2>
                      </div>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions
                      :ripple="false"
                      class="no-select"
                      @click.stop
                    >
                      <div class="d-flex" style="width: 100%">
                        <div class="mt-2">
                          <h3 class="subtitle text-center font-weight-medium">
                            {{ toCurrency(item.pivot.selling_price) }}
                          </h3>
                        </div>
                        <div class="ml-auto" style="width: 50%">
                          <v-text-field
                            :ref="`${item.id}_qty`"
                            v-model="item.quantity"
                            label="Quantity"
                            outlined
                            :value="
                              item.quantity
                                ? item.quantity
                                : (item.quantity = 1)
                            "
                            dense
                            type="number"
                            :max="item.pivot.inventory"
                            min="0"
                            :hint="`Avail qty: ${toNumberFormat(
                              item.pivot.inventory
                            )}`"
                            :persistent-hint="true"
                            :ripple="false"
                            :rules="[
                              () =>
                                item.pivot.inventory > 0 ||
                                'Item not available ',
                            ]"
                            :suffix="item.item_unit.abbrev"
                            @click.stop
                            @keypress.enter="addItem(item)"
                          />
                        </div>
                      </div>
                    </v-card-actions>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>
      </v-skeleton-loader>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { findIndex, reject, isEmpty } from 'lodash'
import EventBus from '~/components/core/event-bus.js'
import CategoryList from '~/components/order/CategoryList'
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
    CategoryList,
    OrderList,
  },
  async asyncData({ $api, params }) {
    if ('id' in params && params.id) {
      // eslint-disable-next-line no-undef
      const resp = await $api.Transaction.find(params.id)
      return {
        data: resp,
      }
    } else {
    }
  },
  data() {
    return {
      drawer: true,
      mini: false,
      search: '',
      filter: {},
      sortDesc: false,
      sortBy: 'name',
      selected_category: null,
      orderedItems: [],
      counter: 0,
      rules: {
        available(item) {
          return item.inventory < 1
        },
      },
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
      }),
      mode: 'new',
    }
  },
  computed: {
    filteredKeys() {
      return this.keys.filter((key) => key !== 'Name')
    },
    ...mapState({
      active_store: (state) => state.app.store,
    }),
    ...mapGetters({
      items: 'item/getItems',
      itemsLoadStatus: 'item/getItemsLoadStatus',
      categories: 'category/getCategories',
      categoriesLoadStatus: 'category/getCategoriesLoadStatus',
    }),
    loading() {
      return this.itemsLoadStatus() === 1
    },
    filteredItems() {
      if (this.selected_category == null) {
        return this.items
      }

      return this.items.filter((item) => {
        return item.category_id === this.selected_category.id
      })
    },
    loadingType() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return 'card@12'
      } else {
        return 'card@8'
      }
    },
  },
  watch: {
    active_store(store, old) {
      this.refresh()
    },
    orderedItems(val) {
      EventBus.$emit('updateCartCount', val.length)
    },
  },
  mounted() {
    if (this.itemsLoadStatus() !== 2) {
      this.loadItems()
    }
    if (this.categoriesLoadStatus() !== 2) {
      this.loadCategories()
    }
    // eslint-disable-next-line no-console
    console.log('mounted')
    this.setData()
  },
  methods: {
    setData() {
      if (isEmpty(this.data)) {
        EventBus.$emit('update-title', '')
        return
      }
      const data = this.data
      EventBus.$emit('update-title', 'TXN#' + data.txn_number)

      this.form.set(data)
      this.orderedItems = data.details.map((obj) => ({
        ...obj,
        _state: '',
        _original: obj,
      }))
      this.mode = 'edit'
    },
    refresh() {
      this.loadItems()
    },
    loadItems() {
      if (this.active_store) {
        this.$store.dispatch('item/loadStoreItems', this.active_store.id)
      }
    },
    loadCategories() {
      this.$store.dispatch('category/loadCategories')
    },
    addItem(item) {
      if (item.pivot.inventory < 1) {
        this.$refs[`${item.id}_qty`][0].focus()
        this.$refs[`${item.id}_qty`][0].blur()
        return
      }

      // check if item exists
      const ind = findIndex(this.orderedItems, (i) => {
        return item.id === i.item_id
      })

      const detail = {}

      detail.item_id = item.id
      detail.item_unit_id = item.item_unit_id
      detail.item_name = item.name
      detail.item_desc = item.description
      detail.item_cost = item.pivot.cost
      detail.item_price = item.pivot.selling_price
      detail.item_unit = item.item_unit.title
      detail.quantity = Number(item.quantity || 1)

      if (detail.quantity > item.pivot.inventory) {
        detail.quantity = item.pivot.inventory
      }

      let inv = item.pivot.inventory - item.quantity

      if (inv < 0) {
        inv = 0
      }

      this.$store.dispatch('item/updateItem', {
        id: item.id,
        pivot: { inventory: inv },
      })

      if (ind > -1) {
        this.orderedItems[ind].quantity += parseFloat(detail.quantity)
        this.orderedItems[ind].line_total =
          Number(this.orderedItems[ind].quantity) * Number(detail.item_price)
        if (['', undefined].includes(this.orderedItems[ind]._state)) {
          this.orderedItems[ind]._state = 'edited'
        }
      } else {
        detail.line_total = Number(detail.quantity) * Number(detail.item_price)
        detail._state = 'new'
        this.orderedItems.push(detail)
      }
    },
    removeItem(item) {
      // check if item exists
      const ind = findIndex(this.orderedItems, (i) => {
        return item.item_id === i.item_id
      })

      if (ind > -1) {
        const detail = this.orderedItems[ind]

        if (detail._state === 'new') {
          this.orderedItems = reject(this.orderedItems, (i) => {
            return i.item_id === item.item_id
          })
        } else {
          this.orderedItems[ind]._state = 'deleted'
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
      if (item.pivot.inventory < 1) {
        return 1
      }

      return hover ? 16 : 2
    },
    applyChanges() {
      this.form.confirmChanges()

      this.orderedItems = reject(this.orderedItems, (i) => {
        return i._state === 'deleted'
      })

      for (const row of this.orderedItems) {
        row._state = ''
        const copy = Object.assign({}, row)
        delete copy._original

        row._original = copy
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
</style>
