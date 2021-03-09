<template>
  <v-scrollable height="calc(100vh - 64px)">
    <v-container>
      <div class="d-flex">
        <v-spacer />
        <v-snackbar v-model="snackbar" top :timeout="2000">
          Order details copied to clipboard!
        </v-snackbar>
        <v-btn color="success ml-auto" @click="copyToClip">
          Copy to Clipboard
        </v-btn>

        <v-btn
          class="pull-right ml-3"
          color="primary"
          @click="$router.push('/s/order/')"
        >
          New Order
        </v-btn>
      </div>
      <div class="py-5 my-5">
        <div class="display-1 text-center" :style="`color: ${color.primary}`">
          <div>Your Order has been saved!</div>
        </div>
      </div>
      <v-row>
        <v-col cols="12" sm="5">
          <v-card dense shaped class="mb-4">
            <v-card-title :style="`color:${color.primary}`">
              Customer Details
            </v-card-title>
            <v-divider />
            <v-card-text class="text--primary">
              <v-row>
                <v-col cols="12" sm="6">
                  <div>
                    <div class="title">{{ transaction.customer_name }}</div>
                    <div>{{ transaction.customer.email }}</div>
                    <div>{{ transaction.customer_contact_number }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card dense shaped>
            <v-card-title :style="`color:${color.primary}`">
              Delivery Details
            </v-card-title>
            <v-divider />
            <v-card-text class="text--primary">
              <v-text-field
                v-model="transaction.delivery_date"
                label="Delivery Date"
                outlined
                dense
                readonly
                :color="color.primary"
              ></v-text-field>
              <template v-if="hasGeoMap">
                <static-map
                  :lat="transaction.customer_geo_location_lat"
                  :long="transaction.customer_geo_location_long"
                  :height="200"
                  :width="437"
                />
              </template>
              <v-textarea
                v-model="address"
                label="Address"
                outlined
                dense
                readonly
                :color="color.primary"
              ></v-textarea>
              <v-textarea
                v-model="transaction.notes"
                outlined
                label="Notes"
                readonly
                :color="color.primary"
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="7">
          <v-card>
            <v-card-title :style="`color:${color.primary}`">
              Order Details
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0 text--primary">
              <transaction-detail-table :details="transaction.details" />
              <div>
                <div style="width: 50%" class="ml-auto">
                  <div class="d-flex flex-row px-3 py-1">
                    <div>Sub Total</div>
                    <div class="ml-auto text-right">
                      {{ toCurrency(transaction.total_amount) }}
                    </div>
                  </div>
                  <v-divider />
                  <div class="d-flex flex-row px-3 py-1">
                    <div>Discount</div>
                    <div class="ml-auto text-right">
                      {{ toCurrency(totalDiscount) }}
                    </div>
                  </div>
                  <v-divider />
                  <div class="d-flex flex-row px-3 py-1">
                    <div class="title">Total</div>
                    <div class="ml-auto text-right text-h5">
                      <span class="green--text">{{
                        toCurrency(transaction.total_amount)
                      }}</span>
                    </div>
                  </div>
                  <v-divider />
                  <div class="d-flex flex-row px-3 py-1">
                    <div>Payment Method</div>
                    <div class="ml-auto text-right">
                      {{ transaction.payment_option.name }}
                    </div>
                  </div>
                </div>
              </div>
              <textarea
                ref="clipboard"
                style="width: 1px; height: 1px"
              ></textarea>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-scrollable>
</template>

<script>
import { mapState } from 'vuex'
export default {
  async asyncData(ctx) {
    const { $api, params, error } = ctx
    return await $api.Transaction.find(params.id)
      .then((resp) => {
        return { transaction: resp }
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(
          error({ statusCode: 404, message: 'Transaction not found' })
        )
        // redirect(404, '/error')
      })
  },
  layout: 'StoreLayout',
  meta: {
    label: 'Transaction',
    permission: 'Transaction:View',
    access_level: 2,
  },
  data() {
    return {
      transaction: {},
      snackbar: false,
    }
  },
  computed: {
    ...mapState({
      color: (state) => state.app.color,
      response: (state) => state.transaction.response,
    }),
    totalDiscount() {
      let discount = 0
      for (const detail of this.transaction.details) {
        discount += detail.discount_value * detail.quantity
      }

      return discount
    },
    hasGeoMap() {
      return (
        this.transaction.customer_geo_location_lat &&
        this.transaction.customer_geo_location_long
      )
    },
    address() {
      return (
        this.transaction.customer_delivery_address +
        ', ' +
        this.transaction.city.name
      )
    },
  },
  methods: {
    copyToClip() {
      const textarea = this.$refs.clipboard

      let details = ''
      for (const detail of this.transaction.details) {
        details += `${detail.quantity}${detail.item_unit} - ${
          detail.item_name
        } @ ${this.toCurrency(detail.item_price)} `
      }

      const text = `
NAME: ${this.transaction.customer_name}
FACEBOOK NAME: ${this.transaction.customer.fb_name}
ORDER#: ${this.transaction.txn_number}
ADDRESS: ${this.transaction.customer_delivery_address}, ${
        this.transaction.city.name
      }
DELIVERY DATE: ${this.transaction.delivery_date}
CONTACT#: ${this.transaction.customer_contact_number}
MODE OF PAYMENT : ${this.transaction.payment_option.name}
--- ORDER DETAILS ---
${details}
---------------------
TOTAL AMOUNT: ${this.toCurrency(this.transaction.total_amount)}
NOTES: ${this.transaction.notes || 'N/A'}
      `

      textarea.value = text

      textarea.select()
      textarea.setSelectionRange(0, 99999)

      document.execCommand('copy')
      // eslint-disable-next-line no-console
      console.log(textarea.value)
      this.snackbar = true
    },
  },
}
</script>
