<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="form.name"
        label="Name"
        :error-messages="errors.getAll('name') || errors.getAll('store.name')"
        required
        autocomplete="off"
        :readonly="!editable"
      />
      <v-divider />

      <v-row v-if="editable" class="my-0">
        <v-col cols="12" sm="6" class="py-0">
          <v-spacer />
          <v-combobox
            v-model="selected_item"
            :items="item_options"
            label="Select Item"
            required
            autocomplete="off"
            item-text="name"
            append-outer-icon="mdi-plus"
            width="50%"
            hide-selected
            :search-input.sync="search_item"
            @click:append-outer="addItem"
          />
        </v-col>
      </v-row>

      <store-item
        :store="form.id"
        :store-items.sync="items"
        :editable="editable"
        :loading="itemsLoading"
        @undoChanges="undoChanges"
      />

      <v-dialog v-model="sending" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Saving...
            <v-progress-linear indeterminate color="white" class="mb-0" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
      <v-btn v-if="editable" color="blue darken-1" text @click="save">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters, mapState } from 'vuex'
import { findIndex, reject, isEmpty, isNull } from 'lodash'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors'
import Form from '~/components/core/Form'
import Store from '~/models/Store'

export default {
  mixins: [FormValidationMixins],
  props: {
    data: {
      type: Object,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: new Form({
        id: null,
        name: '',
      }),
      items: [],
      errors: new Errors(),
      itemsLoading: false,
      selected_item: null,
      search_item: null,
    }
  },
  validations: {
    form: {
      name: {
        required,
      },
    },
  },
  computed: {
    ...mapGetters({
      storeSendingStatus: 'store/getStoreSendingStatus',
    }),
    ...mapState({
      response_errors: (state) => state.store.errors,
      response_message: (state) => state.store.message,
      response_data: (state) => state.store.response,
      item_list: (state) => state.item.items,
      itemsLoadStatus: (state) => state.item.itemsLoadStatus,
    }),
    mode() {
      return isNull(this.form.id) ? 'Add' : 'Edit'
    },
    formTitle() {
      return this.form.id ? 'Edit Store' : 'New Store'
    },

    sending() {
      return false
    },
    params() {
      const param = {}

      if (this.form.hasChanges()) {
        param.store = this.form.changedData()
      }

      if (!isEmpty(this.pivotData)) {
        param.items = this.pivotData
      }

      return param
    },
    item_options() {
      const availItems = []

      for (const row of this.item_list) {
        const ind = findIndex(this.items, (i) => {
          return i.id === row.id
        })

        if (ind === -1) {
          availItems.push(row)
        }
      }

      return availItems
    },
    pivotData() {
      const data = {}

      for (const row of this.items) {
        if (row._state !== 'deleted') {
          data[`${row.item_id || row.id}`] = {
            cost: row.pivot.cost,
            selling_price: row.pivot.selling_price,
          }
        }
      }

      return data
    },
    editable() {
      return this.$can('Store:' + this.mode)
    },
  },
  watch: {
    data(val) {
      this.setForm()
    },
    selected_item(val) {
      if (val) {
        this.addItem()
      }
    },
    show(val) {
      if (val) {
        this.form.clear()
        this.search_item = ''
      }
    },
  },

  created() {
    this.setForm()
    const vue = this
    this.$store.watch(
      this.$store.getters['store/getStoreSendingStatus'],
      function () {
        const val = vue.storeSendingStatus()

        if (val === 3) {
          vue.errors.record(vue.response_errors)
          vue.$swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: vue.response_errors.message,
            footer: '<a href>Why do I have this issue?</a>',
          })
        } else if (val === 2) {
          vue.$swal.fire({
            position: 'top-end',
            icon: 'success',
            title: vue.response_message,
            showConfirmButton: false,
            timer: 1500,
          })

          vue.applychanges()
          // vue.close();
        }
      }
    )
  },
  mounted() {
    this.loadItems()
  },
  methods: {
    loadItems() {
      if (this.itemsLoadStatus !== 2) {
        this.$store.dispatch('item/loadItems')
      }
    },
    setForm() {
      if (!isEmpty(this.data)) {
        this.form.set(this.data)
        this.itemsLoading = true
        Store.find(this.data.id)
          .then((resp) => {
            this.form.set({
              id: resp.id,
              name: resp.name,
            })
            this.items = []
            for (const item of resp.items) {
              item._original = JSON.parse(JSON.stringify(item))
              item._state = ''
              this.items.push(item)
            }
          })
          .finally(() => {
            this.itemsLoading = false
          })
      }
    },
    close() {
      this.form.clear()
      this.$v.$reset()
      this.items = []
      this.$emit('close')
    },
    save() {
      if (this.storeSendingStatus() === 1) {
        return
      }

      if (isEmpty(this.params)) {
        return
      }

      this.$v.$touch()

      if (!this.$v.$invalid) {
        if (isNull(this.form.id)) {
          this.$store.dispatch('store/addStore', this.params)
        } else {
          this.$store.dispatch('store/editStore', {
            id: this.form.id,
            data: this.params,
          })
        }
      }
    },
    applychanges() {
      if (this.form.hasChanges()) {
        this.form.id = this.response_data.store.id
        this.form.confirmChanges()
      }

      if ('items' in this.response_data) {
        for (const item of this.items) {
          if (item._state === 'new') {
            item._state = ''
          } else if (item._state === 'edited') {
            item._state = ''
          }
        }

        // remove deleted
        this.items = reject(this.items, {
          _state: 'deleted',
        })
      }
    },
    addItem() {
      if (this.selected_item == null) {
        return
      }

      const item = {
        item_id: this.selected_item.id,
        name: this.selected_item.name,
        pivot: {
          selling_price: 0,
          cost: 0,
          inventory: 0,
        },
        _state: 'new',
      }

      this.items.push(item)
      this.selected_item = null
      this.search_item = null
    },
    undoChanges(item) {
      const ind = findIndex(this.items, (i) => i.id === item.id)

      this.items[ind].pivot.selling_price = item._original.pivot.selling_price
      this.items[ind].pivot.cost = item._original.pivot.cost
      this.items[ind]._state = ''
    },
  },
}
</script>

<style></style>
