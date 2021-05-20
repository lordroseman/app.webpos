<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="500px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Discount:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New Discount
            </v-btn>
          </template>

          <driver-form :data="selected_discount" @close="closeForm" />
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
        <v-data-table :headers="headers" :items="drivers" :search="search">
          <template #[`item.active`]="{ item }">
            <v-chip
              v-if="item.active == 1"
              color="green"
              class="ma-2"
              text-color="white"
              x-small
            >
              Active
            </v-chip>
            <v-chip v-else color="grey" class="ma-2" text-color="white" x-small>
              Inactive
            </v-chip>
          </template>
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
                    v-if="$can('Discount:Delete')"
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
export default {
  meta: {
    label: 'Discount Registry',
    permission: 'Discount:View',
    access_level: 1,
  },
  data() {
    return {
      headers: [
        {
          text: 'Code',
          align: 'start',
          sortable: true,
          value: 'code',
        },
        {
          text: 'Title',
          align: 'start',
          sortable: true,
          value: 'short_desc',
        },
        {
          text: 'Description',
          align: 'start',
          sortable: true,
          value: 'long_desc',
        },
        {
          text: 'Discount Type',
          align: 'start',
          sortable: true,
          value: 'type',
        },
        {
          text: 'Max Amount',
          align: 'end',
          sortable: true,
          value: 'max_amount',
        },
        {
          text: 'Active',
          align: 'middle',
          sortable: true,
          value: 'active',
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      loading: false,
      selected_discount: null,
      search: '',
      dialog: false,
      discounts: [],
    }
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Discount Registry')
  },
  mounted() {},
  methods: {
    close() {
      this.dialog = false
    },
    edit(discount) {
      this.selected_discount = discount
      this.dialog = true
    },
    remove(discount) {
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
              this.$store.dispatch('driver/deleteDriver', discount.id)
              const vue = discount
              this.$store.watch(
                this.$store.getters['driver/getDriverDeletingStatus'],
                function () {
                  if (vue.driverDeletingStatus === 2) {
                    resolve(true)
                  } else if (vue.driverDeletingStatus === 3) {
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
              'Discount  has been deleted.',
              'success'
            )
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_driver = {}
    },
  },
  head: {
    title: 'Discount Registry',
  },
}
</script>

<style></style>
