<template>
  <v-scrollable :height="`calc(100vh - 64px)`">
    <v-container fluid class="px-0 px-md-5">
      <v-card class="mx-auto" min-height="83vh">
        <v-row>
          <v-col cols="12" md="4" class="pt-0 pr-md-0">
            <customer-profile :customer="customer"></customer-profile>
          </v-col>
          <v-col cols="12" md="8" class="d-flex pl-md-0">
            <v-divider vertical />
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
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-scrollable>
</template>
<script>
export default {
  layout: 'StoreLayout',
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
