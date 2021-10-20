<template>
  <v-scrollable :height="`calc(100vh - 64px)`">
    <v-container fluid class="px-0 px-md-5">
      <v-card class="mx-auto">
        <v-card-title>
          Customer
          <v-divider class="mx-4" inset vertical />
          <v-dialog v-model="dialog" max-width="600px">
            <customer-form
              :data.sync="selected_customer"
              :show="dialog"
              @close="closeForm"
              @updateCustomer="updateCustomer"
            />
          </v-dialog>
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            single-line
            hide-details
            label="Search"
          />
        </v-card-title>
        <v-skeleton-loader
          ref="skeleton"
          type="table-tbody"
          class="mx-auto"
          :loading="loading"
        >
          <v-data-table :headers="headers" :items="customers" :search="search">
            <template #[`item.actions`]="{ item }">
              <v-hover v-slot:default="{ hover }">
                <v-speed-dial
                  direction="left"
                  transition="scale-transition"
                  open-on-hover
                >
                  <template v-slot:activator>
                    <v-btn color="secondary" dark fab x-small>
                      <v-icon v-if="hover"> mdi-close </v-icon>
                      <v-icon v-else> mdi-cog </v-icon>
                    </v-btn>
                  </template>
                  <template v-slot:default class="p-0">
                    <v-btn
                      fab
                      dark
                      x-small
                      color="purple"
                      @click="$router.push('/s/customer/' + item.id)"
                    >
                      <v-icon>mdi-account-details</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="$can('Customer:Edit')"
                      fab
                      dark
                      x-small
                      color="blue"
                      @click="edit(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-speed-dial>
              </v-hover>
            </template>
          </v-data-table>
        </v-skeleton-loader>
      </v-card>
    </v-container>
  </v-scrollable>
</template>

<script>
import { mapState } from 'vuex'
export default {
  layout: 'StoreLayout',
  meta: {
    permission: 'Customer:View',
    access_level: 2,
  },
  async asyncData({ $axios, store }) {
    const activeStore = store.state.app.store
    if (activeStore) {
      const cust = await $axios.$get(
        `/laravel/api/store/${activeStore.slug}/customers`
      )
      return {
        customers: cust,
      }
    }
  },
  data() {
    return {
      headers: [
        {
          text: 'Full Name',
          align: 'start',
          sortable: true,
          value: 'full_name',
        },
        { text: 'Facebook Name', value: 'fb_name' },
        { text: 'Contact Number', value: 'contact_number' },
        { text: 'Email', value: 'email' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      customers: [],
      search: '',
      loading: false,
      dialog: false,
      selected_customer: {},
    }
  },
  computed: {
    ...mapState({
      store: (state) => state.app.store,
    }),
  },
  watch: {
    store() {
      this.refresh()
    },
  },
  mounted() {
    if (this.customers.length === 0) {
      this.refresh()
    }
  },
  methods: {
    async refresh() {
      if (this.store) {
        this.loading = true
        const customers = await this.$axios.$get(
          '/laravel/api/store/' + this.store.slug + '/customers'
        )

        this.customers = customers
        this.loading = false
      }
    },
    edit(customer) {
      this.selected_customer = customer
      this.dialog = true
    },
    closeForm() {
      this.dialog = false
      this.selected_customer = {}
    },
    updateCustomer(customer) {
      if (customer) {
        const ind = this.customers.findIndex((i) => i.id === customer.id)

        if (this.customers[ind]) {
          this.customers[ind].fname = customer.fname
          this.customers[ind].lname = customer.lname
          this.customers[ind].full_name = customer.fname + ' ' + customer.lname
          this.customers[ind].fb_name = customer.fb_name
          this.customers[ind].contact_number = customer.contact_number
        }
      }
    },
  },
  head: {
    title: 'Customer',
  },
}
</script>

<style></style>
