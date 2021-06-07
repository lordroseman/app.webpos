<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="800px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('City:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New City
            </v-btn>
          </template>

          <city-form :data="selected_city" @close="closeForm" />
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
        <v-data-table :headers="headers" :items="cities" :search="search">
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
                    v-if="$can('City:Delete')"
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
import { mapGetters, mapState } from 'vuex'
export default {
  meta: {
    label: 'City',
    permission: 'City:View',
    access_level: 1,
  },
  data() {
    return {
      headers: [
        {
          text: 'Name',
          align: 'start',
          sortable: true,
          value: 'name',
        },
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
      selected_city: {},
    }
  },
  computed: {
    ...mapGetters({
      citiesLoadStatus: 'city/getCitiesLoadStatus',
      cityDeletingStatus: 'city/getCityDeletingStatus',
    }),
    ...mapState({
      cities: (state) => state.city.cities,
      errors: (state) => state.city.errors,
    }),
    loading() {
      return this.citiesLoadStatus() === 1
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'City')
  },
  mounted() {
    if (this.citiesLoadStatus() !== 2) {
      this.loadCities()
    }
  },
  methods: {
    loadCities() {
      this.$store.dispatch('city/loadCities')
    },
    close() {
      this.dialog = false
    },
    edit(city) {
      this.selected_city = city
      this.dialog = true
    },
    remove(city) {
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
              this.$store.dispatch('city/deleteCity', city.id)
              const vue = this
              this.$store.watch(
                this.$store.getters['city/getCityDeletingStatus'],
                function () {
                  if (vue.cityDeletingStatus() === 2) {
                    resolve(true)
                  } else if (vue.cityDeletingStatus() === 3) {
                    this.$swal.showValidationMessage(
                      `Request failed: ${vue.errors.message}`
                    )
                    resolve(false)
                  }
                }
              )
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire('Deleted!', 'City  has been deleted.', 'success')
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_city = {}
    },
  },
  head: {
    title: 'City',
  },
}
</script>
