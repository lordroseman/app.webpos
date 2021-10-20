<template>
  <v-scrollable :height="`calc(100vh - 64px)`">
    <v-breadcrumbs>
      <v-breadcrumbs-item href="/s/customer">Customers</v-breadcrumbs-item>
      <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
      <v-breadcrumbs-item
        >{{ customer.fname }} {{ customer.lname }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>
    <v-container fluid class="px-0 px-md-5">
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="2">
            <customer-profile :customer="customer"></customer-profile>
          </v-card>
        </v-col>
        <v-col cols="12" md="8" class="w-full h-full">
          <v-card elevation="2">
            <v-tabs>
              <v-tab href="#addresses" class="justify-start">
                <v-icon left> mdi-google-maps </v-icon>
                <span class="d-none d-md-block">Addresses</span>
              </v-tab>
              <v-tab href="#transactions" class="justify-start">
                <v-icon left
                  >mdi-checkbox-multiple-marked-circle-outline
                </v-icon>
                <span class="d-none d-md-block">Transactions</span>
              </v-tab>
              <v-tab-item value="addresses">
                <v-divider />
                <customer-address
                  :addresses="customer.address"
                ></customer-address>
              </v-tab-item>
              <v-tab-item value="transactions">
                <v-divider class="mb-3" />
                <customer-transaction
                  :customer="customer"
                ></customer-transaction>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-scrollable>
</template>
<script>
export default {
  layout: 'StoreLayout',
  meta: {
    permission: 'Customer:View',
    access_level: 2,
  },
  async asyncData({ $api, params }) {
    const customer = await $api.Customer.custom('customer/search')
      .where('id', params.id)
      .include('address.city', 'address.barangay', 'user')
      .first()

    return { customer }
  },
  data() {
    return {
      customer: {},
    }
  },
}
</script>
