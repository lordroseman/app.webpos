<template>
  <v-container fluid>
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="500px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Item Unit:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New Item Unit
            </v-btn>
          </template>

          <item-unit-form :data="selected_unit" @close="closeForm" />
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
        <v-data-table :headers="headers" :items="item_units" :search="search">
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
                    v-if="$can('Item Unit:Delete')"
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
    label: 'Item Unit',
    permission: 'Item Unit:View',
  },
  data() {
    return {
      headers: [
        {
          text: 'Title',
          align: 'start',
          sortable: true,
          value: 'title',
        },
        {
          text: 'Abbreviation',
          align: 'start',
          sortable: true,
          value: 'abbrev',
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
      selected_unit: {},
    }
  },
  computed: {
    ...mapGetters({
      item_units: 'unit/getItemUnits',
      itemUnitsLoadStatus: 'unit/getItemUnitsLoadStatus',
      itemUnitDeletingStatus: 'unit/getItemUnitDeletingStatus',
    }),
    loading() {
      return this.itemUnitsLoadStatus() === 1
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Item Unit')
  },
  mounted() {
    if (this.itemUnitsLoadStatus() !== 2) {
      this.loadItemUnits()
    }
  },
  methods: {
    loadItemUnits() {
      this.$store.dispatch('unit/loadItemUnits')
    },
    close() {
      this.dialog = false
    },
    edit(unit) {
      this.selected_unit = unit
      this.dialog = true
    },
    remove(unit) {
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
              this.$store.dispatch('unit/deleteItemUnit', unit.id)
              const vue = this
              this.$store.watch(
                this.$store.getters['unit/getItemUnitDeletingStatus'],
                function () {
                  if (vue.itemUnitsLoadStatus() === 2) {
                    resolve(true)
                  } else if (vue.itemUnitsLoadStatus() === 3) {
                    this.$swal.showValidationMessage(
                      `Request failed: ${this.errors.message}`
                    )
                    reject(this.errors)
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
              'Item Unit  has been deleted.',
              'success'
            )
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_unit = {}
    },
  },
  head: {
    title: 'Item Unit',
  },
}
</script>
