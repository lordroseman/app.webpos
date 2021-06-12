<template>
  <v-scrollable :height="`calc(100vh - 64px)`">
    <v-container class="px-0 px-md-5">
      <div
        class="d-flex flex-wrap px-4 px-lg-0 align-items-center justify-center"
      >
        <h2 class="text-h5 font-weight-medium">TXN# {{ txn_number }}</h2>

        <v-chip
          v-if="form.status == 1"
          class="ml-2 mt-1 px-3"
          small
          color="green"
          text-color="white"
        >
          Open
        </v-chip>
        <v-chip
          v-if="form.status == 2"
          small
          class="ml-2 mt-1"
          color="red"
          text-color="white"
        >
          CLOSE
        </v-chip>
        <v-spacer />
        <div>
          <v-btn
            v-if="editable"
            color="cyan"
            class="white--text ml-2"
            text
            :to="`/s/order/${form.id}`"
            :icon="$vuetify.breakpoint.mobile"
          >
            <v-icon left dark> mdi-circle-edit-outline </v-icon>
            <span class="d-none d-lg-block"> EDIT </span>
          </v-btn>

          <v-btn
            v-if="form.walkin !== 1"
            color="blue lighten-1"
            dark
            text
            :icon="$vuetify.breakpoint.mobile"
            @click="copyToClip"
          >
            <v-icon left>mdi-clipboard</v-icon>
            <span class="d-none d-lg-block"> Copy </span>
          </v-btn>

          <v-btn
            v-if="form.printed !== 1"
            :icon="$vuetify.breakpoint.mobile"
            text
            @click="print"
          >
            <v-icon>mdi-printer</v-icon>
            <span class="d-none d-lg-block">Print</span>
          </v-btn>

          <v-btn
            v-else
            rounded
            color="teal"
            title="Reprint Transaction?"
            dark
            @click="print"
          >
            <v-icon>mdi-printer</v-icon>
            Printed
          </v-btn>
        </div>
      </div>

      <v-snackbar :timeout="-1" :value="hasBeenDeleted" color="red" top>
        <div class="d-flex">
          <v-icon class="mr-4">mdi-alert</v-icon>

          <div>
            This Transaction has been <strong>deleted</strong> by another user.
            Editing has been disabled. <br />
            Please go back to
            <nuxt-link to="/transaction" class="white--text font-weight-medium">
              Transaction Lists
            </nuxt-link>
          </div>
        </div>
      </v-snackbar>

      <div class="d-flex flex-wrap">
        <div class="order-lg-last order-md-first ml-6" style="width: 24rem">
          <transaction-label
            :paid="balance <= 0"
            :transaction="form.originalData"
            :transaction-labels="labels"
            :editable="editable"
            :styles="{ position: 'sticky', top: '0px' }"
            @closeTransaction="form.status = 2"
            @setDriver="setDriver"
          />
        </div>
        <div class="flex-grow-1">
          <v-card class="mt-3">
            <v-card-title>Customer Information</v-card-title>
            <v-card-text class="text--primary">
              <v-row
                v-for="(row, n) in customer_info"
                :key="n"
                :class="n % 2 === 0 ? 'grey lighten-4' : ''"
              >
                <v-col cols="12" sm="4">
                  <span class="grey--text text--darken-1 font-weight-medium">
                    {{ row.title }}
                  </span>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex">
                  <span class="grey--text text--darken-4">
                    {{ row.value || 'n/a' }}
                  </span>

                  <v-btn
                    v-if="row.title === 'Address' && hasMapDetails"
                    class="ml-auto"
                    x-small
                    text
                    color="primary"
                    @click="showMap = true"
                  >
                    Show Map
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mt-5">
            <v-card-title>Delivery Details</v-card-title>
            <v-card-text class="text--primary">
              <v-row
                v-for="(row, n) in delivery_info"
                :key="n"
                :class="n % 2 === 0 ? 'grey lighten-4' : ''"
              >
                <v-col cols="12" sm="4">
                  <span class="grey--text text--darken-1 font-weight-medium">
                    {{ row.title }}
                  </span>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex">
                  <span class="grey--text text--darken-4">
                    {{ row.value || 'n/a' }}
                  </span>

                  <v-btn
                    v-if="row.title === 'Address'"
                    class="ml-auto"
                    x-small
                    text
                    color="primary"
                  >
                    Show Map
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mt-5">
            <v-tabs fixed-tabs>
              <v-tab href="#details"> Transaction Details </v-tab>
              <v-tab href="#payments"> Payment History </v-tab>
              <v-tab href="#history"> Transaction History </v-tab>
              <v-tab-item value="details">
                <transaction-detail-table :details="details" />
              </v-tab-item>
              <v-tab-item value="payments">
                <v-divider />
                <div class="d-flex flex-column">
                  <v-btn
                    v-if="editable"
                    class="mr-3 my-1 ml-auto"
                    color="success"
                    text
                    @click="showAddPayment = true"
                  >
                    <v-icon left>mdi-cash</v-icon>Add Payment
                  </v-btn>
                  <payments
                    :payments.sync="payments"
                    :editable="editable"
                    @addLabel="(label) => labels.unshift(label)"
                  />
                </div>
              </v-tab-item>
              <v-tab-item value="history">
                <transaction-history :transaction="form.originalData" />
              </v-tab-item>
            </v-tabs>

            <div class="my-5 d-lg-flex pb-10">
              <div class="ml-3 order-md-1 order-lg-2">
                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto">Sub Total</div>
                  <div class="ml-10 text-right" style="width: 100px">
                    {{ toCurrency(form.total_amount) }}
                  </div>
                </div>

                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto">Discount</div>
                  <div class="ml-10 text-right" style="width: 100px">
                    {{ toCurrency(null) }}
                  </div>
                </div>

                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto">Shipping</div>
                  <div class="ml-10 text-right" style="width: 100px">
                    {{ toCurrency(0) }}
                  </div>
                </div>

                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto title">Total</div>
                  <div class="ml-10 text-right text-h5" style="width: 100px">
                    <span class="green--text">{{
                      toCurrency(form.total_amount)
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="ml-auto order-md-2 order-lg-1">
                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto">Payment Option</div>
                  <div class="ml-10 text-right" style="width: 100px">
                    {{ form.payment_option.name }}
                  </div>
                </div>

                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto">Total Payment:</div>
                  <div class="ml-10 text-right" style="width: 100px">
                    {{ toCurrency(totalPayment) }}
                  </div>
                </div>

                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto">Balance:</div>
                  <div class="ml-10 text-right" style="width: 100px">
                    {{ toCurrency(balance) }}
                  </div>
                </div>

                <div class="d-flex flex-row px-8 py-1">
                  <div class="ml-auto">Payment Status:</div>
                  <div
                    v-if="balance > 0"
                    class="ml-10 text-right pink--text"
                    style="width: 100px"
                  >
                    UNPAID
                  </div>
                  <div
                    v-else
                    class="ml-10 text-right green--text"
                    style="width: 100px"
                  >
                    PAID
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </div>

      <add-payment
        :show.sync="showAddPayment"
        :transaction="form.originalData"
        :total-payment="totalPayment"
        @addLabel="(label) => labels.unshift(label)"
        @added="(payment) => payments.push(payment)"
      />
      <v-dialog
        v-model="showReport"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <report-viewer
          :show-report.sync="showReport"
          :src="pdfSrc"
          :params="rptParam"
          @print="transactionPrinted"
        >
          <template #title> TRANSACTION REPORT </template>
        </report-viewer>
      </v-dialog>
      <textarea ref="clipboard" style="width: 1px; height: 1px"></textarea>
      <v-snackbar v-model="clipsnackbar" top :timeout="2000">
        Order details copied to clipboard!
      </v-snackbar>

      <v-dialog
        v-model="showMap"
        persistent
        max-width="800"
        :fullscreen="$vuetify.breakpoint.mobile"
      >
        <v-card>
          <v-card-title class="headline"> Google Map </v-card-title>
          <v-card-text class="px-0 pb-0">
            <address-map
              :lat="form.customer_geo_location_lat"
              :lng="form.customer_geo_location_long"
              :disable-marker="true"
              :height="
                $vuetify.breakpoint.mobile
                  ? $vuetify.breakpoint.height - 130
                  : 500
              "
            ></address-map>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="showMap = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-scrollable>
</template>

<script>
import { mapState } from 'vuex'
import Form from '~/components/core/Form.js'

export default {
  layout: 'StoreLayout',
  meta: {
    label: 'Transaction',
    permission: 'Transaction:View',
    access_level: 2,
  },
  async asyncData(ctx) {
    const { $api, params } = ctx

    const resp = await $api.Transaction.custom('transaction/search')
      .where('id', params.id)
      .include(
        'details.item',
        'payment_option',
        'user',
        'customer',
        'payments.option',
        'payments.user',
        'barangay',
        'city',
        'labels.label'
      )
      .first()

    return { data: resp }
  },
  data() {
    return {
      form: new Form({
        id: null,
        customer_id: null,
        payment_option_id: null,
        txn_date: null,
        delivery_date: '',
        customer_name: '',
        customer_delivery_address: '',
        customer_contact_number: '',
        customer_geo_location_lat: null,
        customer_geo_location_long: null,
        total_amount: null,
        status: null,
        notes: '',
        driver: {},
        customer: {},
        city: {},
        barangay: {},
        payment_option: {},
        printed: null,
        date_printed: null,
        walkin: null,
        txn_number: null,
      }),
      details: [],
      payments: [],
      history: [],
      labels: [],
      showAddPayment: false,
      txn_number: '#NEW#',
      pdfSrc: '',
      showReport: false,
      rptParam: null,
      clipsnackbar: false,
      hasBeenDeleted: false,
      showMap: false,
    }
  },

  computed: {
    ...mapState({
      active_store: (state) => state.app.store,
    }),
    totalPayment() {
      let total = 0
      for (const payment of this.payments) {
        total += payment.amount
      }

      return total
    },
    payment_status() {
      const balance = this.form.total_amount - this.totalPayment

      if (balance === 0) {
        return 'PAID'
      } else if (balance > 0) {
        return `Balance ${this.toCurrency(balance)}`
      }

      return null
    },
    balance() {
      return this.form.total_amount - this.totalPayment
    },
    editable() {
      return this.form.status === 1
    },
    channel() {
      return `transaction.${this.form.id}`
    },
    customer_info() {
      const info = [
        {
          title: 'Customer Name',
          value:
            this.form.walkin === 1
              ? 'WALK-IN CUSTOMER'
              : this.form.customer_name,
        },
        { title: 'Facebook Name', value: this.form.customer?.fb_name },
        { title: 'Contact Number', value: this.form.customer_contact_number },
        { title: 'Email', value: this.form.email },
        {
          title: 'Address',
          value: `${this.form.customer_delivery_address}
                          ${this.form.barangay?.name || 'n/a'},
                          ${this.form.city?.name || 'n/a'}`,
        },
      ]

      return info
    },
    delivery_info() {
      const info = [
        { title: 'Delivery Date', value: this.form.delivery_date },
        { title: 'Driver', value: this.form.driver?.name },
        { title: 'Delivery Notes', value: this.form.notes },
      ]
      return info
    },
    hasMapDetails() {
      return (
        this.form.customer_geo_location_lat &&
        this.form.customer_geo_location_long
      )
    },
  },
  watch: {
    active_store(store, old) {
      if (store.id && old) {
        if (store.id !== old.id) {
          const { parent } = this.$route.meta
          if (parent) {
            this.$router.push({ name: parent })
          }
        }
      }
    },
    data() {
      this.setData(this.data)
    },
  },
  mounted() {
    this.setData(this.data)
    this.listen()
  },
  beforeDestroy() {
    this.$echo.leave(this.channel)
  },
  methods: {
    setData(data) {
      if (data) {
        this.form.set(data)
        this.details = data.details
        this.payments = data.payments
        this.labels = data.labels
        this.history = data.history
        this.txn_number = data.txn_number
      } else {
        // window.location.reload()
      }
    },
    setDriver(driver) {
      this.form.driver = driver
    },
    listen() {
      if (this.form.id) {
        this.$echo
          .private(this.channel)
          .on('UpdateTransaction', (resp) => {
            if (resp.user.id !== this.$auth.user.id) {
              const data = resp.transaction
              for (const prop in data) {
                this.form[prop] = data[prop]
              }
              this.form.confirmChanges()
              this.snackbarText = 'Transaction has been updated.'
              this.snackbar = true
            }
          })
          .on('DeleteTransaction', (resp) => {
            if (resp.user.id !== this.$auth.user.id) {
              //  const data = resp.transaction
              this.hasBeenDeleted = true
              this.snackbarText = 'Transaction has been deleted.'
              this.snackbar = true
            }
          })
          .on('NewLabel', (resp) => {
            if (resp.user.id !== this.$auth.user.id) {
              this.labels.unshift(resp.label)
              this.snackbarText = 'Transaction Label has been updated.'
              this.snackbar = true
            }
          })
          .on('NewPayment', (resp) => {
            if (resp.user.id !== this.$auth.user.id) {
              this.payments.push(resp.payment)
              this.snackbarText = 'Payment has been updated.'
              this.snackbar = true
            }
          })
          .on('DeletePayment', (resp) => {
            if (resp.user.id !== this.$auth.user.id) {
              const { payment } = resp

              const ind = this.payments.findIndex((i) => i.id === payment.id)

              if (ind > -1) {
                this.payments.splice(ind, 1)
              }

              this.snackbarText = 'Payment has been deleted.'
              this.snackbar = true
            }
          })
      }
    },
    print() {
      this.pdfSrc = '/laravel/api/report'
      this.rptParam = {
        controls: {
          transaction_id: this.form.id,
        },
        report: 'Transaction',
        id: this.form.id,
      }

      this.showReport = true
    },
    transactionPrinted() {
      if (this.form.printed !== 1) {
        const transaction = new this.$api.Transaction({
          id: this.form.id,
          transaction: {
            printed: null,
            date_printed: null,
          },
        })

        transaction.transaction.printed = 1
        transaction.transaction.date_printed = this.formatDate(
          new Date(),
          'yyyy-MM-dd'
        )
        transaction.save().then((resp) => {
          this.form.printed = resp.transaction.printed
          this.form.date_printed = resp.transaction.date_printed
          this.form.confirmChanges()
        })
      }
    },
    copyToClip() {
      const textarea = this.$refs.clipboard

      let details = ''
      if (this.form) {
        for (const detail of this.details) {
          details += `${detail.quantity}${detail.item_unit} - ${
            detail.item_name
          } @ ${this.toCurrency(detail.item_price - detail.discount_amount)} `
        }
      }

      let address = 'n/a'
      let fbName = 'n/a'
      if (this.form.walkin === 0) {
        address = `${this.form.customer_delivery_address}, ${this.form.barangay.name}, ${this.form.city.name}`
        fbName = this.form.customer.fb_name
      }

      const text = `
NAME: ${this.form.customer_name}
FACEBOOK NAME: ${fbName}
ORDER#: ${this.form.txn_number}
ADDRESS: ${address === '' ? 'n/a' : address}
DELIVERY DATE: ${this.form.delivery_date}
CONTACT#: ${this.form.customer_contact_number}
MODE OF PAYMENT : ${this.form.payment_option.name}
--- ORDER DETAILS ---
${details}
---------------------
TOTAL AMOUNT: ${this.toCurrency(this.form.total_amount)}
NOTES: ${this.form.notes || 'N/A'}
      `

      textarea.value = text

      textarea.select()
      textarea.setSelectionRange(0, 99999)

      document.execCommand('copy')
      // eslint-disable-next-line no-console
      console.log(textarea.value)
      this.clipsnackbar = true
    },
  },
  head: {
    title: 'Transaction',
  },
}
</script>
