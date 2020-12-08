/* eslint-disable vue/no-v-html */
<template>
  <v-card>
    <v-card-title>
      <span id="header" class="headline">Order Details</span>
    </v-card-title>
    <v-card-text class="overflow-y-hidden px-0">
      <v-scrollable :height="scrollHeight">
        <v-container id="order_detail_modal" ref="modal-container" class="px-5">
          <v-row>
            <v-col cols="12" sm="6">
              <span class="subtitle">CUSTOMER DETAILS</span>
              <v-row>
                <v-col cols="12" class="py-0">
                  <v-combobox
                    v-model="form.customer"
                    :items="customers"
                    :search-input.sync="search"
                    label="Customer Name"
                    :error-messages="errors.getAll('customer_id')"
                    :loading="isLoading"
                    required
                    autocomplete="no"
                    prepend-icon="mdi-database"
                    item-text="text"
                    clearable
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            <div v-if="!search">Type to search...</div>
                            <div v-else>
                              No results matching "
                              <strong>{{ search }}</strong
                              >".
                              <v-btn
                                id="addCustomer"
                                x-small
                                class="mb-1"
                                @click="addAsNewCustomer(search, $event)"
                              >
                                Add as New Customer
                              </v-btn>
                            </div>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>

                    <template #selection="{ item }">
                      {{ item.name }}
                    </template>
                    <!-- eslint-disable -->
                  <template #item="{item, parent}">
                    <v-list-item-content>
                      <v-list-item-title
                        v-html="`${parent.genFilteredText(item.name)}`"
                      />
                      <v-list-item-subtitle
                        v-html="`${parent.genFilteredText(item.email)}`"
                      />
                    </v-list-item-content>
                  </template>
                   <!-- eslint-enable -->
                  </v-combobox>
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-text-field
                    :value="form.customer ? form.customer.email : null"
                    label="Email"
                    :error-messages="errors.getAll('email')"
                    required
                    autocomplete="no"
                    prepend-icon="mdi-at"
                    readonly
                  />
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-text-field
                    :value="form.customer ? form.customer.fb_name : null"
                    label="Facebook Name"
                    required
                    :error-messages="errors.getAll('fb_name')"
                    autocomplete="no"
                    prepend-icon="mdi-facebook"
                    readonly
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="6">
              <span class="subtitle">PAYMENT DETAILS</span>
              <v-row>
                <v-col cols="12" md="6" class="py-0">
                  <v-select
                    v-model="form.payment_option_id"
                    :items="payment_options"
                    item-text="name"
                    item-value="id"
                    label="Payment Option"
                    :error-messages="errors.getAll('payment_option_id')"
                    autocomplete="no"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider class="mb-3" />
          <span class="subtitle">DELIVERY DETAILS</span>
          <v-row>
            <v-col cols="12" md="5" class="py-0">
              <v-row>
                <v-col cols="12" class="py-0">
                  <v-textarea
                    v-model="form.customer_delivery_address"
                    label="Delivery Address"
                    required
                    :error-messages="errors.getAll('customer_delivery_address')"
                    autocomplete="no"
                  />
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <v-autocomplete
                    v-model="form.city_id"
                    :items="cities"
                    label="City"
                    :error-messages="errors.getAll('city_id')"
                    required
                    autocomplete="no"
                    item-text="name"
                    item-value="id"
                  />
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <v-autocomplete
                    v-model="form.barangay_id"
                    :items="barangay_options"
                    label="Barangay"
                    :search-input.sync="search_barangay"
                    :error-messages="errors.getAll('barangay_id')"
                    required
                    autocomplete="no"
                    item-text="name"
                    item-value="id"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            No results matching "
                            <strong>{{ search_barangay }}</strong
                            >".
                            <v-btn x-small class="mb-1"> Add Barangay </v-btn>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <v-text-field
                    v-model="form.customer_contact_number"
                    label="Contact Number"
                    required
                    prepend-icon="mdi-cellphone"
                    :error-messages="errors.getAll('customer_contact_number')"
                    autocomplete="no"
                  />
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <v-menu
                    ref="menu1"
                    v-model="dr_date_menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="dateFormatted"
                        label="Delivery Date"
                        :error-messages="errors.getAll('delivery_date')"
                        autocomplete="no"
                        prepend-icon="mdi-calendar-month"
                        @blur="
                          form.delivery_date = parseDate(form.delivery_date)
                        "
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="form.delivery_date"
                      no-title
                      @input="dr_date_menu = false"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-textarea
                    v-model="form.notes"
                    label="Delivery Notes"
                    required
                    :error-messages="errors.getAll('notes')"
                    autocomplete="no"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="7" class="py-0">
              <address-map
                :id="`delivery-map`"
                :lat="form.customer_geo_location_lat"
                :lng="form.customer_geo_location_long"
                @click="setLatLng"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-scrollable>
      <v-dialog v-model="sending" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Saving...
            <v-progress-linear indeterminate color="white" class="mb-0" />
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="customer_dialog"
        max-width="600px"
        transition="dialog-bottom-transition"
      >
        <customer-form
          :show="customer_dialog"
          @close="customer_dialog = false"
        />
      </v-dialog>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
      <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import { isEmpty, reject, debounce, findIndex } from 'lodash'
import Errors from '~/components/core/Errors.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import AddressMap from '~/components/display/AddressMap.vue'

export default {
  components: {
    AddressMap,
    CustomerForm: () => import('~/components/customer/CustomerForm'),
  },
  mixins: [FormValidationMixins],
  props: {
    form: {
      type: Object,
      default: () => {},
    },
    show: Boolean,
  },
  data() {
    return {
      imageData: null,
      errors: new Errors(),
      attributes: {
        customer_id: 'Customer',
        payment_option_id: 'Payment Option',
        city_id: 'City',
        barangay_id: 'Barangay',
        delivery_date: 'Delivery Date',
        customer_delivery_address: 'Delivery Address',
        customer_contact_number: 'Contact Number',
      },
      search: null,
      isLoading: false,
      customers: [],
      dr_date_menu: false,
      date: new Date().toISOString().substr(0, 10),
      dateFormatted: null,
      search_city: null,
      selected_city: null,
      search_barangay: null,
      customer_dialog: false,
      orderSendingStatus: 0,
    }
  },
  validations: {
    form: {
      customer_id: {
        required,
      },
      payment_option_id: {
        required,
      },
      city_id: {
        required,
      },
      barangay_id: {
        required,
      },
      delivery_date: {
        required,
      },
      customer_delivery_address: {
        required,
      },
      customer_contact_number: {
        required,
      },
    },
  },
  computed: {
    formTitle() {
      return isEmpty(this.data) ? 'New Item' : 'Edit Item'
    },
    ...mapState({
      payment_options: (state) => state.payment_option.payment_options,
      paymentOptionsLoadStatus: (state) =>
        state.payment_option.paymentOptionsLoadStatus,
      cities: (state) => state.city.cities,
      citiesLoadStatus: (state) => state.city.citiesLoadStatus,
      barangays: (state) => state.barangay.barangays,
      barangaysLoadStatus: (state) => state.barangay.barangaysLoadStatus,
    }),
    showUndoImg() {
      return isEmpty(this.form.img) && !isEmpty(this.form.originalData.img)
    },
    barangay_options() {
      const city = this.form.city_id

      if (city) {
        return reject(this.barangays, (r) => {
          return r.city_id !== city
        })
      } else {
        return []
      }
    },
    new_barangay() {
      if (this.form.barangay_id == null) {
        return {
          name: this.search_barangay,
          city: this.form.city_id,
        }
      }

      return null
    },
    sending() {
      return this.orderSendingStatus === 1
    },
    scrollHeight() {
      return window.innerHeight * 0.9 - 58 - 52 + 'px'
    },
    customerAddress() {
      let address = null
      if (!this.form.customer) {
        address = null
      } else {
        const custAddress = this.form.customer.address

        if (custAddress && custAddress.length > 0) {
          // get primary address
          const ind = findIndex(custAddress, (i) => {
            return i.primary === 1
          })
          if (ind === -1) {
            address = custAddress[0]
          } else {
            address = custAddress[ind]
          }
        } else {
          address = null
        }
      }

      return address
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.$v.$reset()
        this.errors.clear()
        document.getElementsByClassName('v-dialog--active')[0].scrollTop = 0
      }
    },
    'form.delivery_date'(val) {
      this.dateFormatted = this.formatDate(val)
    },
    search(val) {
      // Items have already been loaded
      if (!val) {
        return
      }

      // Items have already been requested
      if (this.isLoading) {
        return
      }

      this.isLoading = true

      // Lazily load input items
      this.getCustomer(val, this)
    },
    'form.customer'(customer) {
      if (!customer) {
        return
      }

      this.form.customer_id = customer.id
      this.form.customer_name = customer.name
      this.form.customer_contact_number = customer.contact_number
    },
    customerAddress(address) {
      if (address) {
        this.form.customer_delivery_address = address.address

        this.form.customer_geo_location_lat = address.geo_location_lat
        this.form.customer_geo_location_long = address.geo_location_long
        this.form.city_id = address.city_id
        this.form.barangay_id = address.barangay_id
      } else {
        this.form.customer_delivery_address = null
        this.form.customer_contact_number = null
        this.form.customer_geo_location_lat = null
        this.form.customer_geo_location_long = null
        this.form.city_id = null
        this.form.barangay_id = null
      }
    },
    selected_city(val) {
      if (val && typeof val === 'object') {
        this.form.city_id = val.id
        this.$store.dispatch('barangay/')
      }
    },
  },
  mounted() {
    if (this.paymentOptionsLoadStatus !== 2) {
      this.$store.dispatch('payment_option/loadPaymentOptions')
    }

    if (this.citiesLoadStatus !== 2) {
      this.$store.dispatch('city/loadCities')
    }

    if (this.barangayLoadStatus !== 2) {
      this.$store.dispatch('barangay/loadBarangays')
    }

    if (this.form.customer) {
      this.customers = [
        {
          ...this.form.customer,
          name: this.form.customer.full_name,
          text: this.form.customer.email + ' ' + this.form.customer.full_name,
        },
      ]
    }
  },
  methods: {
    undoImg() {
      this.form.img = this.form.originalData.img
    },
    save() {
      if (this.orderSendingStatus === 1) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.$emit('save', Object.assign({}, this.form.changedData()))
        this.close()
      }
    },
    close() {
      this.$v.$reset()
      this.errors.clear()
      this.$emit('close')
    },
    setLatLng(data) {
      this.form.lat = data.lat
      this.form.long = data.long
    },
    getCustomer: debounce((name, vm) => {
      const customers = vm.$api.Customer.custom('/customer/search')

      if (name) {
        customers.where('full_name', name)
      }

      customers
        .include('address')
        .get()
        .then((res) => {
          vm.customers = res.map((obj) => ({
            ...obj,
            name: `${obj.fname} ${obj.lname}`,
            text: `${obj.email} ${obj.fname} ${obj.lname}`,
          }))
        })
        .finally(() => {
          vm.isLoading = false
        })
    }, 500),
    addAsNewCustomer(search) {
      this.customer_dialog = true
    },
  },
}
</script>
