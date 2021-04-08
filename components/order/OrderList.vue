<template>
  <v-navigation-drawer v-model="drawer" app clipped right width="400">
    <div class="d-flex flex-column">
      <div class="px-3 py-3">
        <v-btn-toggle
          style="width: 400px"
          dark
          active-class=""
          color="white"
          background-color="transparent"
        >
          <template v-if="!walkin">
            <v-tooltip left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  width="50"
                  color="orange"
                  v-bind="attrs"
                  dark
                  v-on="on"
                  @click="toggleWalkin"
                >
                  <v-icon>mdi-walk</v-icon>
                </v-btn>
              </template>
              <span>Walk In Customer</span>
            </v-tooltip>

            <v-btn width="325" color="blue" dark @click="dialog = true">
              {{ form.customer_name || 'SELECT CUSTOMER' }}
            </v-btn>
          </template>
          <template v-else>
            <v-tooltip left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  width="50"
                  color="blue"
                  v-bind="attrs"
                  dark
                  v-on="on"
                  @click="toggleWalkin"
                >
                  <v-icon>mdi-account-switch</v-icon>
                </v-btn>
              </template>
              <span>Select Customer</span>
            </v-tooltip>
            <v-btn width="325" color="orange" dark> WALK-IN CUSTOMER </v-btn>
          </template>
        </v-btn-toggle>
        <v-dialog
          v-model="dialog"
          max-width="80%"
          :fullscreen="$vuetify.breakpoint.mobile"
          block
          persistent
          scrollable
        >
          <order-form :show="dialog" :form.sync="form" @close="closeForm" />
        </v-dialog>
      </div>

      <v-divider />

      <v-list class="mb-auto" two-line>
        <v-list-item
          v-for="item in cart"
          :key="`${item.item_id}_${item._state}`"
          link
          :class="rowClass(item || '')"
          @click="updateCart(item)"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ item.item_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <span v-if="item.discount_amount === 0">
                {{ toCurrency(item.item_price) }}
              </span>
              <template v-else>
                <span class="text-decoration-line-through mr-2">
                  {{ toCurrency(item.item_price) }}
                </span>
                <span
                  >{{ toCurrency(item.item_price - item.discount_amount) }}
                </span>
              </template>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class="cart-action">
            <v-menu
              :close-on-content-click="false"
              style="box-shadow: none !important"
              left
              class="menu-cart"
              flat
            >
              <template #activator="{ on, attrs }">
                <div class="py-1">
                  <v-btn
                    :color="color.primary"
                    fab
                    outlined
                    x-small
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ item.quantity }}
                  </v-btn>
                </div>
              </template>
              <v-card width="150" flat style="box-shadow: none !important">
                <div class="pl-2 py-1">
                  <v-btn
                    fab
                    dark
                    x-small
                    :color="color.pink"
                    @click="lessCart(item)"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <v-btn
                    fab
                    dark
                    x-small
                    color="green"
                    @click="addToCart(item)"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <v-btn
                    fab
                    dark
                    x-small
                    color="red"
                    @click.once="removeCart(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-btn :color="color.primary" fab outlined x-small>
                    {{ item.quantity }}
                  </v-btn>
                </div>
              </v-card>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
    <template #append>
      <v-divider />
      <div class="pa-2">
        <h2 class="text-center">TOTAL: {{ toCurrency(total) }}</h2>
        <div class="px-3 py-3">
          <v-btn color="green" dark block large @click="settle">
            {{ mode === 'new' ? 'PLACE ORDER' : 'UPDATE ORDER' }}
          </v-btn>
        </div>
      </div>
    </template>
    <v-dialog v-model="saving" persistent width="400">
      <v-card color="primary" dark>
        <v-card-text class="pt-4">
          Saving transaction, please stand by
          <v-progress-linear
            indeterminatee
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="updateCartDialog"
      max-width="50%"
      :fullscreen="$vuetify.breakpoint.mobile"
    >
      <update-cart-dialog-agent
        :item="updateItem"
        :mode="mode"
        @close="updateCartDialog = false"
      ></update-cart-dialog-agent>
    </v-dialog>
    <v-dialog
      v-model="showPaymentDialog"
      max-width="500"
      :fullscreen="$vuetify.breakpoint.mobile"
    >
      <walkin-payment
        :payments="payments"
        :total-amount="form.total_amount"
        :show-payment-dialog.sync="showPaymentDialog"
        @savePayment="savePayment"
      ></walkin-payment>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { isEmpty } from 'lodash'
import EventBus from '~/components/core/event-bus.js'

export default {
  props: {
    form: {
      type: Object,
      default: () => {},
    },
    mode: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      drawer: true,
      dialog: false,
      saving: false,
      updateCartDialog: false,
      updateItem: null,
      walkin: false,
      payments: [],
      showPaymentDialog: false,
    }
  },
  computed: {
    params() {
      const params = {}

      if (Object.entries(this.form.changedData()).length !== 0) {
        params.transaction = this.form.changedData()
      }

      if (this.cart.length > 0) {
        params.details = this.cart.filter((i) => {
          return i._state && i._state !== ''
        })
      }

      if (this.payments.length > 0) {
        params.payments = this.payments
      }

      return params
    },
    ...mapGetters({
      transactionSendingStatus: 'transaction/getTransactionSendingStatus',
    }),
    ...mapState({
      response: (state) => state.transaction.response,
      response_message: (state) => state.transaction.message,
      response_errors: (state) => state.transaction.errors,
      active_store: (state) => state.app.store,
      color: (state) => state.app.color,
      cart: (state) => state.cart.cart,
      total: (state) => state.cart.cartTotal,
    }),
    hasCustomer() {
      if (this.walkin) {
        return true
      }
      return this.form && !isEmpty(this.form.customer)
    },
    hasPayments() {
      return this.payments.length > 0
    },
  },
  watch: {
    total(val) {
      this.form.total_amount = val
    },
    hasCustomer(val) {
      if (!val) {
        this.form.customer_name = ''
      }
    },
    active_store(store, old) {
      if (store.id && old) {
        if (store.id !== old.id) {
          this.refresh()
        }
      }
    },
    params(val) {
      this.form.printed = 0
    },
  },
  created() {
    const vue = this
    this.$store.watch(
      this.$store.getters['transaction/getTransactionSendingStatus'],
      function () {
        const val = vue.transactionSendingStatus()

        if (val === 3) {
          // vue.errors.record(vue.response_errors)
          vue.$swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: vue.response_errors.message,
            footer: '<a href>Why do I have this issue?</a>',
          })
          vue.saving = false
        } else if (val === 2) {
          if (vue.mode === 'new') {
            vue.clear()
            vue.$router.push('/s/order/success/' + vue.response.transaction.id)
          } else {
            vue.clear()
            vue.$router.push('/s/order/success/' + vue.response.id)
          }
          vue.saving = false
        } else if (val === 1) {
          vue.saving = true
        }
      }
    )

    EventBus.$on('toggle-cart', () => {
      this.drawer = !this.drawer
    })
  },
  mounted() {
    this.walkin = parseInt(localStorage.getItem('walkin')) === 1
    this.$emit('toggleWalkin', this.walkin)
  },
  methods: {
    ...mapActions({
      lessCart: 'cart/lessCart',
      addToCart: 'cart/addToCart',
      removeCart: 'cart/removeCart',
    }),
    refresh() {
      this.clear()
    },
    closeForm() {
      this.dialog = false
    },
    settle() {
      if (Object.entries(this.params).length === 0) {
        this.$swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please select items',
          footer: '<a href>Why do I have this issue?</a>',
        })
        return
      }

      if (this.transactionSendingStatus === 1) {
        return
      }

      if (this.walkin) {
        // if walkin check if has payment
        // include payment in request
        if (!this.hasPayments) {
          // show payment dialog
          this.showPaymentDialog = true
          return
        }
      }

      if (!this.hasCustomer) {
        this.$swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please input Order Details',
          footer: '<a href>Why do I have this issue?</a>',
        })
        return
      }

      if (this.mode === 'new') {
        this.$store.dispatch('transaction/addTransaction', this.params)
      } else {
        this.$store.dispatch('transaction/editTransaction', {
          id: this.form.id,
          data: this.params,
        })
      }
    },
    clear() {
      this.form.clear()
      this.form.store_id = this.active_store.id
      this.form.walkin = this.walkin ? 1 : 0
      this.$store.dispatch('cart/clearCart')
      // eslint-disable-next-line no-console
      console.log('clear cart')
    },
    updateCart(item) {
      // eslint-disable-next-line no-console

      this.updateCartDialog = true
      this.updateItem = item
    },
    toggleWalkin() {
      this.walkin = !this.walkin
      localStorage.setItem('walkin', this.walkin ? 1 : 0)
      this.$emit('toggleWalkin', this.walkin)
    },
    savePayment(payment) {
      this.payments = [payment]
      this.settle()
      this.showPaymentDialog = false
    },
  },
}
</script>
