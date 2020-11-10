<template>
  <v-container fluid>
    <v-card class="mx-auto">
      <v-card-title>
        Customer
        <v-divider class="mx-4" inset vertical />
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
                  <v-btn fab dark x-small color="blue" @click="edit(item)">
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
</template>

<script>
export default {
  layout: 'StoreLayout',
  meta: {
    permission: 'Customer:View',
    access_level: 2,
  },
  async asyncData({ $api }) {
    const cust = $api.Customer.custom('/store')
              .where(store)
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
    }
  },
  methods: {
    edit(customer) {},
  },
  head: {
    title: 'Customer',
  },
}
</script>

<style></style>
