<template>
  <v-container fluid>
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="80%">
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Customer:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New Customer
            </v-btn>
          </template>
          <customer-form
            :data.sync="selected_customer"
            :show="dialog"
            @close="closeForm"
          />
        </v-dialog>
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="loading"
      >
        <v-data-table
          :headers="headers"
          :items="customers"
          :search="search"
          multi-sort
        >
          <template #[`item.actions`]="{ item }">
            <v-hover v-slot:default="{ hover }">
              <v-speed-dial
                direction="left"
                :open-on-hover="true"
                transition="scale-transition"
              >
                <template v-slot:activator>
                  <v-btn color="secondary" dark fab x-small>
                    <v-icon v-if="hover"> mdi-close </v-icon>
                    <v-icon v-else> mdi-cog </v-icon>
                  </v-btn>
                </template>
                <template v-slot:default class="p-0">
                  <v-btn fab dark x-small color="blue" @click="edit(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="$can('Customer:Delete')"
                    fab
                    dark
                    x-small
                    color="red"
                    @click="remove(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-speed-dial>
            </v-hover>
          </template>
        </v-data-table>
      </v-skeleton-loader>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  meta: {
    label: 'Customer',
    permission: 'Customer:View',
    access_level: 1,
  },
  data() {
    return {
      headers: [
        {
          text: 'First Name',
          align: 'start',
          sortable: true,
          value: 'fname',
        },
        { text: 'Last Name', value: 'lname' },
        { text: 'Facebook Name', value: 'fb_name' },
        {
          text: 'Contact Number',
          value: 'contact_number',
          align: 'start',
        },
        { text: 'Email', value: 'email', align: 'start' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      options: {},
      dialog: false,
      search: '',
      selected_customer: {},
    }
  },
  computed: {
    ...mapGetters({
      customers: 'customer/getCustomers',
      customersLoadStatus: 'customer/getCustomersLoadStatus',
      customerDeletingStatus: 'customer/getCustomerDeletingStatus',
      errors: 'customer/getErrors',
    }),
    loading() {
      return this.customersLoadStatus() !== 2
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Customer')
  },
  mounted() {
    this.loadCustomers()
  },
  methods: {
    loadCustomers() {
      this.$store.dispatch('customer/loadCustomers')
    },
    edit(customer) {
      this.selected_customer = customer
      this.dialog = true
    },
    remove(customer) {
      this.$swal
        .fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          showLoaderOnConfirm: true,
          preConfirm: (e) => {
            return new Promise((resolve, reject) => {
              this.$store.dispatch('customer/deleteCustomer', customer.id)
              const vue = this
              this.$store.watch(
                this.$store.getters['customer/getCustomerDeletingStatus'],
                function () {
                  if (vue.customerDeletingStatus() === 2) {
                    resolve(true)
                  } else if (vue.customerDeletingStatus() === 3) {
                    reject(this.errors)
                    this.$swal.showValidationMessage(
                      `Request failed: ${this.errors.message}`
                    )
                  }
                }
              )
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire(
              'Deleted!',
              'Customer  has been deleted.',
              'success'
            )
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_customer = {}
    },
  },
  head({ $config }) {
    const apiKey = $config.googleMapsJsApiKey
    return {
      script: [
        {
          src: 'https://maps.googleapis.com/maps/api/js?key=' + apiKey,
          async: true,
          defer: true,
        },
      ],
      title: 'Customer',
    }
  },
}
</script>

<style>
.v-speed-dial__list {
  padding: 0 0 !important;
}
</style>
