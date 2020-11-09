<template>
  <v-container fluid>
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="500px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Driver:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New Driver
            </v-btn>
          </template>

          <driver-form :data="selected_driver" @close="closeForm" />
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
          <template #[`item.available`]="{ item }">
            <v-chip
              v-if="item.available == 1"
              color="green"
              class="ma-2"
              text-color="white"
              x-small
            >
              Available
            </v-chip>
            <v-chip v-else color="grey" class="ma-2" text-color="white" x-small>
              Unvailable
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
                    v-if="$can('Driver:Delete')"
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
import { mapState } from 'vuex'

export default {
  meta: {
    label: 'Driver',
    permission: 'Driver:View',
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
        {
          text: 'Last Name',
          align: 'start',
          sortable: true,
          value: 'lname',
        },
        {
          text: 'Vehicle ID',
          align: 'start',
          sortable: true,
          value: 'vehicle_id',
        },
        {
          text: 'Driver License',
          align: 'start',
          sortable: true,
          value: 'driver_license',
        },
        {
          text: 'Avaliable',
          align: 'start',
          sortable: true,
          value: 'available',
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
      selected_driver: null,
      search: '',
      dialog: false,
    }
  },
  computed: {
    ...mapState({
      drivers: (state) => (state.driver ? state.driver.drivers : []),
      driversLoadStatus: (state) =>
        state.driver ? state.driver.driversLoadStatus : 0,
      driverDeletingStatus: (state) => state.driver.driverDeletingStatus,
    }),
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Driver')
  },
  mounted() {
    if (this.driversLoadStatus !== 2) {
      this.loadDrivers()
    }
  },
  methods: {
    loadDrivers() {
      this.$store.dispatch('driver/loadDrivers')
    },
    close() {
      this.dialog = false
    },
    edit(driver) {
      this.selected_driver = driver
      this.dialog = true
    },
    remove(driver) {
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
              this.$store.dispatch('driver/deleteDriver', driver.id)
              const vue = this
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
            this.$swal.fire('Deleted!', 'Driver  has been deleted.', 'success')
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_driver = {}
    },
  },
  head: {
    title: 'Driver',
  },
}
</script>

<style></style>
