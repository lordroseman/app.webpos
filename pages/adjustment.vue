<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="800px" persistent scrollable>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Inventory Adjustment:Add')"
              color="success"
              dark
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New
            </v-btn>
          </template>
          <inventory-adjustment-detail
            :data.sync="selected_adjustment"
            :show="dialog"
            @close="closeForm"
            @saveAdjustment="saveAdjustment"
          />
        </v-dialog>
        <v-btn rounded class="ml-2" @click="showFilter = true">
          <v-icon> mdi-filter </v-icon>Filter
        </v-btn>
        <v-btn class="ml-2" rounded @click="refresh">
          <v-icon> mdi-refresh </v-icon>Refresh
        </v-btn>
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
        :loading="skelLoading"
      >
        <v-data-table
          :headers="headers"
          :items="adjustments"
          :search.sync="search"
          :options.sync="options"
          :server-items-length="total"
          :loading="loading"
        >
          <template #[`item.date`]="{ item }">
            {{ formatDate(item.date) }}
          </template>
          <template #[`item.type`]="{ item }">
            <v-chip
              v-if="item.type == 1"
              color="green"
              text-color="white"
              small
            >
              IN
            </v-chip>
            <v-chip
              v-else-if="item.type == 2"
              color="red"
              text-color="white"
              small
            >
              OUT
            </v-chip>
          </template>
          <template #[`item.status`]="{ item }">
            <v-chip
              v-if="item.status == 1"
              color="green"
              text-color="white"
              small
            >
              Pending
            </v-chip>
            <v-chip v-else-if="item.status == 2" color="primary" small>
              Approved
            </v-chip>
          </template>
          <template #[`item.prepared_by`]="{ item }">
            {{ item.prepared_by ? item.prepared_by.name : '' }}
          </template>
          <template #[`item.approved_by`]="{ item }">
            {{ item.approved_by ? item.approved_by.name : '' }}
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
                    v-if="
                      item.status == 1 && $can('Inventory Adjustment:Delete')
                    "
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
          <template v-if="hasFilters" #top>
            <v-btn text x-small class="ml-2" @click="filters = {}">
              <v-icon x-small> mdi-close-circle </v-icon>
              Clear current search query, filters, and sort
            </v-btn>
          </template>
        </v-data-table>
      </v-skeleton-loader>
      <div v-if="showFilter">
        <inventory-adjustment-filter
          :show.sync="showFilter"
          :filters.sync="filters"
        />
      </div>
    </v-card>
    <v-snackbar v-model="snackbar" timeout="2000" top>
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import { isEmpty, debounce, isArray, findIndex } from 'lodash'

export default {
  meta: {
    label: 'Inventory Adjustment',
    permission: 'Inventory Adjustment:View',
    access_level: 1,
  },
  data() {
    return {
      headers: [
        {
          text: '#',
          align: 'start',
          sortable: true,
          value: 'id',
        },
        { text: 'Store', value: 'store.name' },
        { text: 'Date', value: 'date' },
        { text: 'Type', value: 'type' },
        {
          text: 'Status',
          value: 'status',
          align: 'center',
        },
        { text: 'Prepared By', value: 'prepared_by', align: 'start' },
        { text: 'Approved By', value: 'approved_by', align: 'start' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      dialog: false,
      search: '',
      selected_adjustment: {},
      options: {},
      adjustments: [],
      total: 0,
      loading: false,
      skelLoading: true,
      showFilter: false,
      filters: {},
      snackbar: false,
      snackbarText: '',
    }
  },
  computed: {
    ...mapState({
      errors: (state) => state.inv_adj.errors,
    }),
    ...mapGetters({
      adjustmentDeletingStatus: 'inv_adj/getAdjustmentDeletingStatus',
    }),
    hasFilters() {
      return !isEmpty(this.filters)
    },
    channel() {
      return 'adjustments'
    },
  },
  watch: {
    options: {
      handler(newVal, oldVal) {
        if (!isEmpty(oldVal)) {
          this.loadAdjustments(this)
        }
      },
      deep: true,
    },
    search(val) {
      if (val !== '') {
        this.loadAdjustments(this)
      }
    },
    filters: {
      handler(newVal, oldVal) {
        this.loadAdjustments(this)
      },
      deep: true,
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Inventory Adjustment')
  },
  beforeDestroy() {
    this.$echo.leave(this.channel)
  },
  mounted() {
    this.loadAdjustments(this)
    this.listen()
  },
  methods: {
    refresh() {
      this.loadAdjustments(this)
    },
    loadAdjustments: debounce((vm) => {
      if (vm.loading) {
        return
      }
      vm.loading = true
      const adjustments = vm.$api.InventoryAdjustment.custom(
        'inventory_adjustment/search'
      ).include('store', 'prepared_by', 'approved_by')

      if (!isEmpty(vm.options)) {
        adjustments.paginate({
          size: vm.options.itemsPerPage,
          number: vm.options.page,
        })

        if (vm.options.sortBy.length > 0) {
          adjustments.orderBy(
            (vm.options.sortDesc[0] ? '-' : '') + vm.options.sortBy[0]
          )
        }
      } else {
        adjustments.paginate({
          size: 10,
          number: 1,
        })
      }

      if (vm.search !== '') {
        adjustments.where('q', vm.search)
      }

      if (!isEmpty(vm.filters)) {
        for (const index in vm.filters) {
          const value = vm.filters[index]
          if (isArray(value)) {
            adjustments.whereIn(index, value)
          } else {
            adjustments.where(index, vm.filters[index])
          }
        }
      }

      adjustments
        .get()
        .then((resp) => {
          vm.adjustments = resp.data
          vm.total = resp.total
        })
        .finally(() => {
          vm.loading = false
          vm.skelLoading = false
        })
    }, 500),
    edit(adjustment) {
      this.selected_adjustment = adjustment
      this.dialog = true
    },
    remove(adjustment) {
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
              adjustment
                .delete()
                .then((resp) => {
                  this.removeAdjustment(adjustment.id)
                  resolve(true)
                })
                .catch((e) => {
                  reject(e)
                  this.$swal.showValidationMessage(
                    `Request failed: ${e.message}`
                  )
                })
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire(
              'Deleted!',
              'Inventory Adustment  has been deleted.',
              'success'
            )
          }
        })
    },
    removeAdjustment(id) {
      const ind = findIndex(this.adjustments, (r) => {
        return r.id === id
      })

      this.adjustments.splice(ind, 1)
    },
    saveAdjustment(data, mode) {
      if (mode === 'add') {
        let adjustment = data
        if ('adjustment' in data) {
          adjustment = data.adjustment
        }

        this.adjustments.unshift(adjustment)
      } else if (mode === 'edit') {
        if ('adjustment' in data) {
          data = data.adjustment
        }

        const ind = findIndex(this.adjustments, (r) => {
          return r.id === data.id
        })

        if (ind > -1) {
          const adjustment = this.adjustments[ind]

          for (const prop in data) {
            if (prop in adjustment) {
              adjustment[prop] = data[prop]
            }
          }
        }
      }
    },
    closeForm() {
      this.dialog = false
      this.selected_adjustment = {}
    },
    listen() {
      this.$echo
        .private(this.channel)
        .on('NewInventoryAdjustment', (data) => {
          if (data.user.id !== this.$auth.user.id) {
            this.adjustments.unshift(data.adjustment)
            this.snackbarText = 'New Inventory Adjustment has been added!'
            this.snackbar = true
          }
        })
        .on('UpdateInventoryAdjustment', (resp) => {
          if (resp.user.id !== this.$auth.user.id) {
            const data = resp.adjustment
            const ind = this.adjustments.findIndex((i) => i.id === data.id)

            if (ind > -1) {
              for (const prop in data) {
                this.adjustments[ind][prop] = data[prop]
              }
            }
          }
        })
        .on('DeleteInventoryAdjustment', (resp) => {
          if (resp.user.id !== this.$auth.user.id) {
            const data = resp.adjustment
            const ind = this.adjustments.findIndex((i) => i.id === data.id)
            this.adjustments.splice(ind, 1)
          }
        })
    },
  },
  head: {
    title: 'Inventory Adjustment',
  },
}
</script>

<style></style>
