<template>
  <v-scrollable :height="`calc(100vh - 64px)`">
    <v-container fluid class="px-0 px-md-5">
      <v-card class="mx-auto">
        <v-card-title>
          TXN# {{ txn_number }}

          <v-btn
            v-if="editable"
            color="blue-grey"
            class="white--text ml-2"
            text
            small
            :to="`/s/order/${form.id}`"
          >
            EDIT
            <v-icon right dark> mdi-circle-edit-outline </v-icon>
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="form.walkin !== 1"
            color="blue-grey lighten-1"
            class="mr-3"
            dark
            rounded
            @click="copyToClip"
          >
            <v-icon>mdi-clipboard</v-icon>
            Copy
          </v-btn>
          <v-btn v-if="form.printed !== 1" rounded @click="print">
            <v-icon>mdi-printer</v-icon>
            Print
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

          <v-chip
            v-if="form.status == 1"
            class="ma-2"
            color="green"
            text-color="white"
          >
            Open
          </v-chip>
          <v-chip
            v-if="form.status == 2"
            class="ma-2"
            color="red"
            text-color="white"
          >
            CLOSE
          </v-chip>
        </v-card-title>

        <v-row>
          <v-col cols="12" md="4" order-md="last" class="pr-10">
            <transaction-label
              :paid="balance <= 0"
              :transaction="form.originalData"
              :transaction-labels="labels"
              :editable="editable"
              @closeTransaction="form.status = 2"
              @setDriver="setDriver"
            />
          </v-col>
          <v-col cols="12" md="8">
            <div class="d-flex">
              <div class="flex-grow-1">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-simple-table>
                      <template v-slot:default>
                        <tbody>
                          <tr>
                            <td class="subtitle-2 font-weight-bold">
                              Customer Name
                            </td>
                            <td>
                              {{
                                form.walkin === 1
                                  ? 'WALK-IN CUSTOMER'
                                  : form.customer_name
                              }}
                            </td>
                          </tr>
                          <tr>
                            <td class="font-weight-bold">Facebook Name</td>
                            <td>
                              {{
                                form.customer ? form.customer.fb_name : 'n/a'
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-col>
                  <v-col cols="12" sm="6" />
                </v-row>
                <v-divider />
                <v-row class="mx-auto">
                  <v-col cols="12" md="4" class="pl-2">
                    <h3
                      class="text-uppercase subtitle font-weight-bold mb-1 text-left"
                    >
                      Delivery Details
                    </h3>
                    <v-list>
                      <v-list-item>
                        <v-list-item-avatar>
                          <v-icon>mdi-calendar</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>
                            Deliver by:
                            {{ form.delivery_date }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item two-line>
                        <v-list-item-avatar>
                          <v-icon>mdi-truck-delivery</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{
                            form.driver
                              ? form.driver.fname + ' ' + form.driver.lname
                              : 'No Driver'
                          }}</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ form.driver ? form.driver.vehicle_id : 'n/a' }} •
                            {{
                              form.driver ? form.driver.driver_license : 'n/a'
                            }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item two-line>
                        <v-list-item-avatar>
                          <v-icon>mdi-map-marker-outline</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{
                            form.customer_delivery_address || 'n/a'
                          }}</v-list-item-title>
                          <v-list-item-subtitle
                            >{{ form.barangay ? form.barangay.name : 'n/a' }},
                            {{
                              form.city ? form.city.name : 'n/a'
                            }}</v-list-item-subtitle
                          >
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-avatar>
                          <v-icon>mdi-cellphone</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{
                            form.customer_contact_number || 'n/a'
                          }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-avatar>
                          <v-icon>mdi-email</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{
                            form.customer ? form.customer.email : 'n/a'
                          }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-avatar>
                          <v-icon>mdi-note-text</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content two-line>
                          <v-list-item-title>NOTES:</v-list-item-title>
                          <v-list-item-subtitle>{{
                            form.notes
                          }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="12" md="8">
                    <static-map
                      :lat="form.customer_geo_location_lat"
                      :long="form.customer_geo_location_long"
                      :height="400"
                      :width="800"
                    />
                  </v-col>
                </v-row>
              </div>
              <v-divider vertical />
            </div>
          </v-col>
        </v-row>
        <v-divider />
        <v-tabs fixed-tabs>
          <v-tab href="#details"> Transaction Details </v-tab>
          <v-tab href="#payments"> Payment History </v-tab>
          <v-tab href="#history"> Transaction History </v-tab>
          <v-tab-item value="details">
            <transaction-detail-table :details="details" />
          </v-tab-item>
          <v-tab-item value="payments">
            <div class="d-flex flex-column">
              <v-btn
                v-if="editable"
                class="ml-3 mb-3 mr-auto"
                color="success"
                @click="showAddPayment = true"
              >
                <v-icon>mdi-cash</v-icon>Add Payment
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
              <div class="ml-10 text-right" style="width: 200px">
                {{ toCurrency(form.total_amount) }}
              </div>
            </div>
            <v-divider style="width: 500px" class="ml-auto" />
            <div class="d-flex flex-row px-8 py-1">
              <div class="ml-auto">Discount</div>
              <div class="ml-10 text-right" style="width: 200px">
                {{ toCurrency(null) }}
              </div>
            </div>
            <v-divider style="width: 500px" class="ml-auto" />
            <div class="d-flex flex-row px-8 py-1">
              <div class="ml-auto">Shipping</div>
              <div class="ml-10 text-right" style="width: 200px">
                {{ toCurrency(0) }}
              </div>
            </div>
            <v-divider style="width: 500px" class="ml-auto" />
            <div class="d-flex flex-row px-8 py-1">
              <div class="ml-auto title">Total</div>
              <div class="ml-10 text-right text-h5" style="width: 200px">
                <span class="green--text">{{
                  toCurrency(form.total_amount)
                }}</span>
              </div>
            </div>
          </div>

          <div class="ml-auto order-md-2 order-lg-1">
            <div class="d-flex flex-row px-8 py-1">
              <div class="ml-auto">Payment Option</div>
              <div class="ml-10 text-right" style="width: 200px">
                {{ form.payment_option.name }}
              </div>
            </div>
            <v-divider style="width: 500px" class="ml-auto" />
            <div class="d-flex flex-row px-8 py-1">
              <div class="ml-auto">Total Payment:</div>
              <div class="ml-10 text-right" style="width: 200px">
                {{ toCurrency(totalPayment) }}
              </div>
            </div>
            <v-divider style="width: 500px" class="ml-auto" />
            <div class="d-flex flex-row px-8 py-1">
              <div class="ml-auto">Balance:</div>
              <div class="ml-10 text-right" style="width: 200px">
                {{ toCurrency(balance) }}
              </div>
            </div>
            <v-divider style="width: 500px" class="ml-auto" />
            <div class="d-flex flex-row px-8 py-1">
              <div class="ml-auto">Payment Status:</div>
              <div
                v-if="balance > 0"
                class="ml-10 text-right pink--text"
                style="width: 200px"
              >
                UNPAID
              </div>
              <div
                v-else
                class="ml-10 text-right green--text"
                style="width: 200px"
              >
                PAID
              </div>
            </div>
          </div>
        </div>
      </v-card>

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
  asyncData(ctx) {
    const { $api, params, error } = ctx

    return $api.Transaction.find(params.id)
      .then((resp) => {
        return { data: resp }
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(
          error({ statusCode: 404, message: 'Transaction not found' })
        )
        // redirect(404, '/error')
      })
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
          } @ ${this.toCurrency(detail.item_price)} `
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
