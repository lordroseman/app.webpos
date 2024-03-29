<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        TXN# {{ txn_number }}
        <v-spacer />

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
        <v-col cols="12" md="3" order-md="last" class="pr-10 px-0">
          <transaction-label
            :paid="balance <= 0"
            :transaction="form.originalData"
            :transaction-labels="labels"
            :editable="allowEditLabel"
            @closeTransaction="form.status = 2"
            @setDriver="setDriver"
          />
        </v-col>
        <v-col cols="12" md="9">
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
                            {{ form.customer ? form.customer.fb_name : '' }}
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-img
                    v-if="hasBeenDeleted"
                    :src="require('@/static/deleted.png')"
                    class="mx-auto mb-5"
                    width="350"
                  />
                </v-col>
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
                          Deliver by: {{ form.delivery_date }}
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
                          {{ form.driver ? form.driver.driver_license : 'n/a' }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item two-line>
                      <v-list-item-avatar>
                        <v-icon>mdi-map-marker-outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{
                          form.customer_delivery_address
                        }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ form.barangay ? form.barangay.name : '' }},
                          {{ form.city ? form.city.name : '' }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-avatar>
                        <v-icon>mdi-cellphone</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{
                          form.customer_contact_number
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
          <v-divider />
          <div class="d-flex flex-column">
            <v-btn
              v-if="allowAddPayment"
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

    <v-snackbar v-model="snackbar" timeout="2000" top>
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
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
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import Form from '~/components/core/Form.js'

export default {
  meta: {
    label: 'Transaction',
    permission: 'Transaction:View',
    access_level: 1,
  },
  async asyncData({ $api, params }) {
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
        'city'
      )
      .first()

    const transaction = new $api.Transaction({ id: params.id })
    const labels = await transaction.labels().get()

    return { data: resp, labels }
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
      snackbarText: '',
      snackbar: null,
      hasBeenDeleted: false,
      txn_number: '#NEW#',
      pdfSrc: '',
      showReport: false,
      rptParam: null,
    }
  },
  computed: {
    ...mapState({
      active_store: (state) => state.app.store,
    }),
    id() {
      return this.padStart(this.form.id, 5, 0)
    },
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
      if (this.hasBeenDeleted) {
        return false
      }

      return this.form.status === 1
    },
    allowAddPayment() {
      if (this.$can('Transaction:Add Payment')) {
        return this.editable
      } else {
        return false
      }
    },
    allowEditLabel() {
      if (this.$can('Transaction:Add Label')) {
        return this.editable
      } else {
        return false
      }
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
  },
  mounted() {
    this.setData(this.data)
    this.listen()
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Transaction')
  },
  beforeDestroy() {
    this.$echo.leave(this.channel)
  },
  methods: {
    setData(data) {
      if (!data) {
        return
      }

      this.form.set(data)
      this.details = data.details
      this.payments = data.payments
      this.history = data.history
      this.txn_number = data.txn_number
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
          this.form.printed = resp.printed
          this.form.date_printed = resp.date_printed
          this.form.confirmChanges()
        })
      }
    },
  },
  head: {
    title: 'Transaction',
  },
}
</script>
