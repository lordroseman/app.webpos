<template>
  <v-card>
    <v-card-title>
      <span id="header" class="headline">{{ formTitle }}</span>
    </v-card-title>

    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12" sm="6">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.fname"
                  label="First Name"
                  :error-messages="errors.getAll('fname')"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.lname"
                  label="Last Name"
                  required
                  :error-messages="errors.getAll('lname')"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.fb_name"
                  label="Facebook Name"
                  required
                  :error-messages="errors.getAll('fb_name')"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.contact_number"
                  label="Contact Number"
                  required
                  :error-messages="errors.getAll('contact_number')"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.email"
                  label="Email Address"
                  required
                  :error-messages="errors.getAll('email')"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.delivery_address"
                  label="Delivery Address"
                  required
                  :error-messages="errors.getAll('delivery_address')"
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
                <v-combobox
                  v-model="form.barangay"
                  :items="barangay_options"
                  label="Barangay"
                  :search-input.sync="search_barangay"
                  :error-messages="errors.getAll('barangay')"
                  required
                  autocomplete="no"
                  item-text="name"
                >
                  <template v-slot:no-data>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          No results matching "
                          <strong>{{ search_barangay }}</strong
                          >". This will be save to database.
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="6" class="d-flex">
            <v-divider vertical />
            <address-map
              class="ml-5 my-auto"
              :lat="form.geo_location_lat"
              :lng="form.geo_location_long"
              @click="setLatLng"
            />
          </v-col>
        </v-row>
      </v-container>

      <v-dialog v-model="sending" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Saving...
            <v-progress-linear indeterminate color="white" class="mb-0" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
      <v-btn v-if="editable" color="blue darken-1" text @click="save">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters, mapState } from 'vuex'
import { isEmpty, find } from 'lodash'
import Errors from '~/components/core/Errors.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Form from '~/components/core/Form.js'
import Barangay from '~/models/Barangay'

export default {
  mixins: [FormValidationMixins],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    show: Boolean,
  },
  data() {
    return {
      form: new Form({
        id: null,
        fname: '',
        lname: '',
        fb_name: '',
        contact_number: null,
        delivery_address: null,
        email: '',
        geo_location_lat: null,
        geo_location_long: null,
        city_id: null,
        barangay: null,
      }),
      errors: new Errors(),
      attributes: {
        fname: 'First Name',
        lname: 'Last Name',
        fb_name: 'Facebook Name',
        contact_number: 'Contact Number',
        delivery_address: 'Delivery Address',
        city_id: 'City',
        barangay_id: 'Barangay',
      },
      toolbarColor: '',
      barangay_options: [],
      search_barangay: null,
    }
  },
  validations: {
    form: {
      fname: {
        required,
      },
      lname: {
        required,
      },
      contact_number: {
        required,
      },
      delivery_address: {
        required,
      },
      email: {
        required,
      },
      city_id: {
        required,
      },
      barangay: {
        required,
      },
    },
  },
  computed: {
    mode() {
      return isEmpty(this.data) ? 'Add' : 'Edit'
    },
    formTitle() {
      let title = ''
      if (isEmpty(this.data)) {
        title = 'New Customer'
      } else {
        title = 'Edit Customer'
      }

      return title
    },
    ...mapState({
      cities: (state) => state.city.cities,
      citiesLoadStatus: (state) => state.city.citiesLoadStatus,
    }),
    ...mapGetters({
      customerSendingStatus: 'customer/getCustomerSendingStatus',
      response_errors: 'customer/getErrors',
      response_message: 'customer/getMessage',
    }),
    sending() {
      return this.customerSendingStatus() === 1
    },
    editable() {
      return this.$can('Customer:' + this.mode)
    },
  },

  watch: {
    data(val) {
      this.setForm()
      this.$v.$reset()
      this.errors.clear()
    },
    show(val) {
      if (val) {
        this.$v.$reset()
        this.errors.clear()
      }
    },
    'form.city_id'(val) {
      if (val) {
        this.getBarangay(val)
      }
    },
  },
  created() {
    this.setForm()
    const vue = this
    this.$store.watch(
      this.$store.getters['customer/getCustomerSendingStatus'],
      function () {
        const val = vue.customerSendingStatus()

        if (val === 3) {
          vue.errors.record(vue.response_errors)
          vue.$swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: vue.response_errors.message,
            footer: '<a href>Why do I have this issue?</a>',
          })
        } else if (val === 2) {
          vue.$swal.fire({
            position: 'top-end',
            icon: 'success',
            title: vue.response_message,
            showConfirmButton: false,
            timer: 1500,
          })
          vue.close()
        }
      }
    )

    if (this.citiesLoadStatus !== 2) {
      this.$store.dispatch('city/loadCities')
    }
  },

  methods: {
    setForm() {
      if (!isEmpty(this.data)) {
        this.form.set(this.data)
      }
    },
    save() {
      if (this.customerSendingStatus() === 1) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          this.$store.dispatch('customer/editCustomer', {
            id: this.form.id,
            data: this.form.changedData(),
          })
        } else {
          this.$store.dispatch('customer/addCustomer', this.form.changedData())
        }
      }
    },
    close() {
      this.form.clear()
      this.$v.$reset()
      this.errors.clear()
      this.$emit('close')
    },
    setLatLng(position) {
      this.form.geo_location_lat = position.lat
      this.form.geo_location_long = position.lng
    },
    getBarangay(city) {
      Barangay.custom('barangay/search')
        .where('city_id', city)
        .get()
        .then((resp) => {
          this.barangay_options = resp
          if (!isEmpty(this.data)) {
            this.form.barangay = find(this.barangay_options, {
              id: this.data.barangay_id,
            })
          }
        })
    },
  },
}
</script>
