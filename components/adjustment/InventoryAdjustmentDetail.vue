<template>
  <v-card>
    <v-card-title>
      <span :style="deleted ? `color: red;text-decoration: line-through;` : ``">
        Inventory Adjustment :: {{ id }}
      </span>
      <v-spacer />
      <v-btn v-if="form.status === 2" rounded @click="print">
        <v-icon>mdi-printer</v-icon>
        Print
      </v-btn>
      <div v-if="viewers.length > 0">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-chip class="ma-2" small v-bind="attrs" v-on="on">
              <v-icon left color="green"> mdi-face-agent </v-icon>
              {{ viewers.length }}
            </v-chip>
          </template>
          <ul class="pa-0">
            <li v-for="(item, i) in viewers" :key="i">
              {{ item.name }}
            </li>
          </ul>
        </v-tooltip>
      </div>
      <v-menu
        v-if="form.status == 1"
        down
        :close-on-content-click="true"
        offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-chip
            class="ma-2"
            color="green"
            text-color="white"
            v-bind="attrs"
            v-on="on"
          >
            Pending
          </v-chip>
        </template>

        <v-list v-if="$can('Inventory Adjustment:Approved')">
          <v-list-item @click="approve">
            <v-list-item-icon>
              <v-icon color="primary"> mdi-thumb-up </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title color="primary"> Approve </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-chip v-else-if="form.status == 2" class="ma-2" color="primary">
        Approved
      </v-chip>
      <v-chip v-else class="ma-2"> Unsaved </v-chip>
    </v-card-title>
    <v-card-text class="pb-0" style="height: 800px">
      <v-scrollable height="720px" class="mx-n4 px-4">
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" class="py-0">
              <v-autocomplete
                v-model="form.store_id"
                :items="stores"
                label="Store"
                required
                autocomplete="off"
                item-text="name"
                item-value="id"
                width="50%"
                :error-messages="errors.getAll('store_id')"
                :readonly="isStoreComboDisabled"
              />
            </v-col>

            <v-col cols="12" sm="3" class="py-0">
              <v-radio-group
                v-model="form.type"
                row
                :error-messages="errors.getAll('type')"
                :readonly="!editable"
              >
                <v-radio label="IN" :value="1" color="green" />
                <v-radio label="OUT" :value="2" color="red" />
              </v-radio-group>
            </v-col>

            <v-col cols="12" sm="3" class="py-0">
              <v-menu
                :close-on-content-click="true"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="dateFormatted"
                    label="Date"
                    :error-messages="errors.getAll('date')"
                    autocomplete="no"
                    prepend-icon="mdi-calendar-month"
                    :readonly="!editable"
                    @blur="form.date = parseDate(form.date)"
                    v-on="on"
                  />
                </template>
                <v-date-picker v-model="form.date" no-title />
              </v-menu>
            </v-col>
          </v-row>

          <v-divider />

          <v-row v-if="editable">
            <v-col cols="12" sm="4" class="pb-0">
              <v-combobox
                v-model="selected_item"
                :items="item_options"
                label="Select Item"
                required
                autocomplete="off"
                item-text="name"
                width="50%"
                hide-selected
                :search-input.sync="search_item"
                :loading="itemLoading"
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        <span v-if="!form.store_id">Please select store</span>
                        <span v-else>No results found</span>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-combobox>
            </v-col>
            <v-col cols="12" sm="4" class="pb-0">
              <v-currency-field
                v-model="selected_item_qty"
                label="Quantity"
                type="text"
                append-outer-icon="mdi-plus"
                :decimal-length="3"
                :suffix="suffix"
                @click:append-outer="addItem"
                @keypress.enter="addItem"
              />
            </v-col>
          </v-row>

          <v-skeleton-loader
            ref="skeleton"
            type="table-tbody"
            class="mx-auto"
            :loading="detailsLoading"
          >
            <v-data-table
              :headers="headers"
              :items="details"
              :search="search"
              multi-sort
            >
              <template v-slot:body="{ items }">
                <tbody>
                  <tr
                    v-for="(item, key) in items"
                    :key="key"
                    :class="rowClass(item)"
                  >
                    <td>{{ item.item.name }}</td>
                    <td class="text-right">
                      {{ toNumberFormat(item.qty) }}
                    </td>
                    <td>{{ item.item.item_unit.abbrev }}</td>
                    <td>
                      <v-speed-dial
                        v-model="item.fab"
                        direction="left"
                        :open-on-hover="true"
                        transition="scale-transition"
                      >
                        <template v-slot:activator>
                          <v-btn
                            v-model="item.fab"
                            color="secondary"
                            dark
                            fab
                            x-small
                          >
                            <v-icon v-if="item.fab"> mdi-close </v-icon>
                            <v-icon v-else> mdi-cog </v-icon>
                          </v-btn>
                        </template>
                        <template v-if="editable" v-slot:default class="p-0">
                          <v-btn
                            v-if="showFab('delete', item._state)"
                            fab
                            dark
                            x-small
                            color="red"
                            @click="remove(item)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                          <v-btn
                            v-if="showFab('undo', item._state)"
                            fab
                            dark
                            x-small
                            color="grey"
                            @click="undo(item)"
                          >
                            <v-icon>mdi-undo</v-icon>
                          </v-btn>
                        </template>
                      </v-speed-dial>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-data-table>
          </v-skeleton-loader>
          <v-textarea
            v-model="form.remarks"
            label="Remarks"
            :rows="1"
            auto-grow
            :readonly="!editable"
          />
          <v-row>
            <v-spacer />
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="prepared_by"
                label="Prepared By"
                readonly
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="approved_by"
                label="Approved By"
                readonly
              />
            </v-col>
          </v-row>
        </v-container>
      </v-scrollable>
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-spacer />
      <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
      <v-btn v-if="editable" color="blue darken-1" text @click="save">
        Save
      </v-btn>
    </v-card-actions>
    <v-snackbar v-model="snackbar" timeout="2000" top>
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-dialog
      v-model="showReport"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <report-viewer
        :show-report.sync="showReport"
        :params="rptParam"
        :src="pdfSrc"
      >
        <template #title> INVENTORY ADJUSTMENT REPORT </template>
      </report-viewer>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { isNull, reject, isEmpty, upperFirst } from 'lodash'
import Form from '~/components/core/Form.js'
import Errors from '~/components/core/Errors.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'

export default {
  mixins: [FormValidationMixins],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: new Form({
        id: null,
        store_id: null,
        type: null,
        status: null,
        date: null,
        remarks: null,
        prepared_by: null,
        approved_by: null,
      }),
      headers: [
        { text: 'Item', value: 'item.name' },
        { text: 'Quantity', value: 'qty', align: 'end' },
        { text: 'UoM', value: 'uom' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      search_item: '',
      selected_item: null,
      selected_item_qty: null,
      item_options: [],
      itemLoading: false,
      detailsLoading: false,
      details: [],
      payments: [],
      search: null,
      dateFormatted: null,
      errors: new Errors(),
      ids: null,
      approved_by: '',
      attributes: {
        store_id: 'Store',
      },
      snackbar: false,
      snackbarText: '',
      viewers: [],
      deleted: false,
      showReport: false,
      pdfSrc: '',
      rptParam: null,
    }
  },
  validations: {
    form: {
      store_id: {
        required,
      },
      type: {
        required,
      },
      date: {
        required,
      },
    },
  },
  computed: {
    ...mapState({
      user: (state) => state.app.user,
      stores: (state) => state.store.stores,
      response_message: (state) => state.inv_adj.message,
      response_errors: (state) => state.inv_adj.errors,
      response_data: (state) => state.inv_adj.response_data,
      activeStore: (state) => state.app.store,
    }),
    mode() {
      return isNull(this.form.id) ? 'add' : 'edit'
    },
    ...mapGetters({
      adjustmentSendingStatus: 'inv_adj/getAdjustmentSendingStatus',
    }),
    suffix() {
      if (
        typeof this.selected_item === 'object' &&
        !isNull(this.selected_item)
      ) {
        return this.selected_item.item_unit.abbrev
      } else {
        return ''
      }
    },
    params() {
      const param = {}

      if (this.form.hasChanges()) {
        param.adjustment = this.form.changedData()
      }

      const changes = this.details.filter((r) => {
        return r._state !== '' && r._state !== 'pre_new'
      })

      if (changes.length > 0) {
        param.details = changes
      }

      return param
    },
    id() {
      if (this.form.id) {
        return this.padStart(this.form.id, 4, 0)
      } else {
        return 'NEW'
      }
    },
    editable() {
      if (!this.deleted) {
        if (this.$can('Inventory Adjustment:' + upperFirst(this.mode))) {
          return this.form.status !== 2
        } else {
          return false
        }
      } else {
        return false
      }
    },
    prepared_by() {
      if (isEmpty(this.form.prepared_by)) {
        return this.$auth.user.name
      } else {
        return this.form.prepared_by.name
      }
    },
    channel() {
      if (this.form.id) {
        return `adjustment.${this.form.id}`
      } else {
        return null
      }
    },
    isStoreComboDisabled() {
      if (this.$auth.user.access_level !== 1) {
        return true
      }
      return !this.editable
    },
  },
  watch: {
    'form.date'(val) {
      this.dateFormatted = this.formatDate(val)
    },
    'form.store_id'(val) {
      this.item_options = []
      this.search_item = ''
      if (val) {
        this.loadItems(val)
      }
    },
    'form.approved_by'(user) {
      if (user) {
        this.approved_by = user.name
      } else {
        this.approved_by = ''
      }
    },
    show(val) {
      if (val) {
        this.clear()
      }
    },
    data(val) {
      this.setForm()
    },
  },
  created() {
    this.setForm()
  },
  mounted() {
    this.clear()
    // this.listen()
    if (this.$auth.user.access_level === 1) {
      this.$store.dispatch('store/loadStores')
    }
  },
  beforeDestroy() {
    if (this.channel) {
      this.$echo.leave(this.channel)
    }
  },
  methods: {
    loadItems(storeId) {
      this.itemLoading = true

      const store = this.stores.filter((i) => i.id === storeId)

      if (store.length > 0) {
        this.$api.Store.include('item')
          .find(store[0].slug)
          .then((resp) => {
            this.item_options = []
            for (const item of resp.items) {
              item._state = ''
              this.item_options.push(item)
            }
          })
          .finally(() => {
            this.itemLoading = false
          })
      }
    },
    *GenerateID() {
      let i = 1
      while (true) {
        yield i++
      }
    },
    addItem() {
      if (
        !this.selected_item ||
        !this.selected_item_qty ||
        this.selected_item_qty === 0
      ) {
        return
      }

      const item = this.selected_item

      this.details.push({
        _id: this.ids.next().value,
        item_id: item.id,
        item: {
          name: item.name,
          item_unit: item.item_unit,
        },
        qty: this.selected_item_qty,
        _state: 'new',
      })

      this.selected_item = null
      this.selected_item_qty = null
    },
    undo(item) {
      if (item._state === 'new') {
        this.details = reject(this.details, (r) => r._id === item._id)
      } else if (item._state === 'deleted') {
        item._state = ''
      }
    },
    remove(item) {
      item._state = 'deleted'
    },
    close() {
      this.$echo.leave(this.channel)
      this.clear()
      this.$emit('close')
    },
    save() {
      if (this.adjustmentSendingStatus() === 1) {
        return
      }

      if (isEmpty(this.params)) {
        return
      }

      this.$v.$touch()

      if (!this.$v.$invalid) {
        if (isNull(this.form.id)) {
          if ('details' in this.params) {
            // this.$store.dispatch('inv_adj/addAdjustment', this.params)
            const adjustment = new this.$api.InventoryAdjustment(this.params)
            adjustment.save().then((resp) => {
              this.$swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Inventory Adjustment was saved succesfully',
                showConfirmButton: false,
                timer: 1500,
              })
              this.$emit('saveAdjustment', resp, this.mode)
              this.applychanges(resp)
            })
          } else {
            this.$swal.fire({
              position: 'center',
              icon: 'error',
              title: 'Please select Item',
              showConfirmButton: false,
              timer: 1500,
            })
          }
        } else {
          this.$axios
            .put(
              '/laravel/api/inventory_adjustment/' + this.form.id,
              this.params
            )
            .then((resp) => {
              this.$swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Inventory Adjustment was updated succesfully',
                showConfirmButton: false,
                timer: 1500,
              })
              this.$emit('saveAdjustment', resp.data, this.mode)
              this.applychanges(resp.data)
            })
        }
      }
    },
    applychanges(resp) {
      if (this.form.hasChanges()) {
        const { id, status } = resp.adjustment
        this.form.id = id
        this.form.status = status
        this.form.confirmChanges()
      }

      if ('details' in resp) {
        for (const detail of this.details) {
          if (detail._state === 'new') {
            // get id from resp
            const respDetail = resp.details.find((i) => i._id === detail._id)
            if (respDetail) {
              detail.id = respDetail.id
            }
            detail._state = ''
          }
        }

        // remove deleted
        this.details = reject(this.details, {
          _state: 'deleted',
        })
      }
    },
    clear() {
      this.form.clear()
      this.form.date = this.formatDate(new Date(), 'yyyy-MM-dd')
      this.form.prepared_by = this.user
      this.ids = new this.GenerateID()
      this.details = []
      this.$v.$reset()

      if (this.activeStore) {
        this.form.store_id = this.activeStore.id
      }
    },
    setForm() {
      if (!isEmpty(this.data)) {
        const data = this.data
        data.date = this.formatDate(this.data.date, 'yyyy-MM-dd')
        this.form.set(data)
        this.detailsLoading = true
        this.$axios
          .get('/laravel/api/inventory_adjustment/' + this.data.id)
          .then((resp) => {
            // this.form.set({
            //   id: resp.data.id,
            //   store_id: resp.data.store_id,
            //   type: resp.data.type,
            //   status: resp.data.status,
            //   date: resp.data.date,
            //   remarks: resp.data.remarks,
            //   prepared_by: resp.data.preparedBy,
            //   approved_by: resp.data.approvedBy,
            // })
            this.details = []
            for (const detail of resp.data.details) {
              detail._state = ''
              this.details.push(detail)
            }
          })
          .finally(() => {
            this.detailsLoading = false
          })
      } else if (this.activeStore) {
        this.form.store_id = this.activeStore.id
      }
    },
    approve() {
      this.$swal
        .fire({
          title: 'Are you sure?',
          text: 'Approving means, inventory will be updated',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, approved it!',
          showLoaderOnConfirm: true,
          preConfirm: (e) => {
            return new Promise((resolve, reject) => {
              const url =
                '/laravel/api/inventory_adjustment/approve/' + this.form.id
              const params = { status: 2 }

              this.$axios
                .put(url, params)
                .then((resp) => {
                  this.form.status = 2
                  this.form.approved_by = resp.data.approvedBy
                  resolve(true)
                })
                .catch((e) => {
                  this.$swal.showValidationMessage(
                    `Request failed: ${this.errors.message}`
                  )
                  reject(this.errors)
                })
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire(
              'Approved!',
              'Inventory Adustment  has been approved.',
              'success'
            )
            this.$emit(
              'saveAdjustment',
              {
                id: this.form.id,
                status: 2,
                approved_by: this.form.approved_by,
              },
              'edit'
            )
          }
        })
    },
    listen() {
      if (!this.channel) {
        return
      }

      this.$echo
        .private(this.channel)
        .on('UpdateInventoryAdjustment', (resp) => {
          if (resp.user.id !== this.$auth.user.id) {
            const data = resp.adjustment
            this.form.set(data)
            this.snackbarText =
              'This Inventory Adjustment has been updated by ' + resp.user.name
            this.snackbar = true
          }
        })
        .on('DeleteInventoryAdjustment', (resp) => {
          if (resp.user.id !== this.$auth.user.id) {
            const data = resp.adjustment
            const ind = this.adjustments.findIndex((i) => i.id === data.id)
            this.adjustments.splice(ind, 1)
            this.snackbarText =
              'This Inventory Adjustment has been deleted by ' + resp.user.name
            this.snackbar = true
          }
        })
        .on('NewDetail', (resp) => {
          if (resp.user.id !== this.$auth.user.id) {
            resp.detail._state = ''
            this.details.push(resp.detail)
            this.snackbarText =
              'This Inventory Adjustment has been updated by ' + resp.user.name
            this.snackbar = true
          }
        })
        .on('UpdateDetail', (resp) => {
          if (resp.user.id !== this.$auth.user.id) {
            const detail = resp.detail
            const ind = this.details.findIndex((i) => i.id === detail.id)
            if (ind > -1) {
              for (const prop of detail) {
                if (prop in this.details[ind]) {
                  this.details[ind][prop] = detail[prop]
                }
              }
            }
          }
        })
        .on('DeleteDetail', (resp) => {
          if (resp.user.id !== this.$auth.user.id) {
            const detail = resp.detail
            const ind = this.details.findIndex((i) => i.id === detail.id)
            if (ind > -1) {
              this.details.splice(ind, 1)
              this.snackbarText =
                'This Inventory Adjustment has been updated by ' +
                resp.user.name
              this.snackbar = true
            }
          }
        })

      this.$echo
        .join(this.channel)
        .here((users) => {
          this.viewers = reject(users, (i) => i.id === this.$auth.user.id)
        })
        .joining((user) => {
          this.viewers.push(user)
        })
        .leaving((user) => {
          this.viewers = reject(this.viewers, (i) => i.id === user.id)
        })
    },
    print() {
      this.pdfSrc = '/laravel/api/report'
      this.rptParam = {
        controls: {
          id: this.form.id,
        },
        report: 'InventoryAdjustment',
        id: this.form.id,
      }

      this.showReport = true
    },
  },
}
</script>
