<template>
  <v-navigation-drawer v-model="drawer" app clipped right width="400">
    <div class="d-flex flex-column">
      <div class="px-3 py-3">
        <v-dialog v-model="dialog" max-width="80%" persistent scrollable>
          <template v-slot:activator="{ on }">
            <v-btn color="blue" dark block large v-on="on">
              {{ form.customer_name || 'Order Details' }}
            </v-btn>
          </template>
          <order-form :show="dialog" :form.sync="form" @close="closeForm" />
        </v-dialog>
      </div>

      <v-divider />

      <v-list class="mb-auto">
        <v-list-item
          v-for="item in orderedItems"
          :key="`${item.item_id}_${item._state}`"
          link
          :class="rowClass(item || '')"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ item.item_name }}
              <span class="float-right"
                >{{ toNumberFormat(item.quantity) }}
                {{ item.item_unit.abbrev }}</span
              >
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              v-if="item._state == ''"
              fab
              x-small
              dark
              color="red lighten-1"
              @click.stop="remove"
            >
              <v-icon id="delete" @click="remove(item, $event)">
                mdi-delete
              </v-icon>
            </v-btn>
            <v-btn v-else dark fab color="grey" x-small @click.stop="undo">
              <v-icon id="delete" @click="undo(item, $event)">
                mdi-undo
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
    <template #append>
      <v-divider />
      <div class="pa-2">
        <h2 class="text-center">TOTAL: {{ toCurrency(form.total_amount) }}</h2>
        <div class="px-3 py-3">
          <v-btn color="green" dark block large @click="settle">
            {{ mode === 'new' ? 'PLACE ORDER' : 'UPDATE ORDER' }}
          </v-btn>
        </div>
      </div>
    </template>
    <v-dialog v-model="saving" persistent width="400">
      <v-card color="primary" dark>
        <v-card-text class="pt-4">
          Saving transaction, please stand by
          <v-progress-linear
            indeterminatee
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { isEmpty } from 'lodash'
import EventBus from '~/components/core/event-bus.js'

export default {
  props: {
    orderedItems: {
      type: Array,
      default: () => {
        return []
      },
    },
    form: {
      type: Object,
      default: () => {},
    },
    mode: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      drawer: true,
      dialog: false,
      saving: false,
    }
  },
  computed: {
    total() {
      let total = 0
      for (const item of this.orderedItems) {
        if (item._state !== 'deleted') {
          total += item.quantity * item.item_price
        }
      }

      return total
    },
    params() {
      const params = {}

      if (Object.entries(this.form.changedData()).length !== 0) {
        params.transaction = this.form.changedData()
      }

      if (this.orderedItems.length > 0) {
        params.details = this.orderedItems.filter((i) => {
          return i._state && i._state !== ''
        })
      }

      return params
    },
    ...mapGetters({
      transactionSendingStatus: 'transaction/getTransactionSendingStatus',
    }),
    ...mapState({
      response_message: (state) => state.transaction.message,
      response_errors: (state) => state.transaction.errors,
      active_store: (state) => state.app.store,
    }),
    hasCustomer() {
      return this.form && !isEmpty(this.form.customer)
    },
  },
  watch: {
    total(val) {
      this.form.total_amount = val
    },
    hasCustomer(val) {
      if (!val) {
        this.form.customer_name = ''
      }
    },
    active_store(store, old) {
      if (store.id && old) {
        if (store.id !== old.id) {
          this.refresh()
        }
      }
    },
    params(val) {
      this.form.printed = 0
    },
  },
  created() {
    const vue = this
    this.$store.watch(
      this.$store.getters['transaction/getTransactionSendingStatus'],
      function () {
        const val = vue.transactionSendingStatus()

        if (val === 3) {
          vue.errors.record(vue.response_errors)
          vue.$swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: vue.response_errors.message,
            footer: '<a href>Why do I have this issue?</a>',
          })
          vue.saving = false
        } else if (val === 2) {
          vue.$swal.fire({
            position: 'top-end',
            icon: 'success',
            title: vue.response_message,
            showConfirmButton: false,
            timer: 1500,
          })

          if (vue.mode === 'new') {
            vue.clear()
          } else {
            vue.$emit('applyChanges')
          }
          vue.saving = false
        } else if (val === 1) {
          vue.saving = true
        }
      }
    )

    EventBus.$on('toggle-cart', () => {
      this.drawer = !this.drawer
    })
  },
  methods: {
    refresh() {
      this.clear()
    },
    remove(item, e) {
      this.$emit('removeItem', item)
    },
    undo(item, e) {
      this.$emit('undoItem', item)
    },
    closeForm() {
      this.dialog = false
    },
    settle() {
      if (Object.entries(this.params).length === 0) {
        this.$swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please select items',
          footer: '<a href>Why do I have this issue?</a>',
        })
        return
      }

      if (this.transactionSendingStatus === 1) {
        return
      }

      if (!this.hasCustomer) {
        this.$swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please input Order Details',
          footer: '<a href>Why do I have this issue?</a>',
        })
        return
      }

      if (this.mode === 'new') {
        this.$store.dispatch('transaction/addTransaction', this.params)
      } else {
        this.$store.dispatch('transaction/editTransaction', {
          id: this.form.id,
          data: this.params,
        })
      }
    },
    clear() {
      this.form.clear()
      this.$emit('update:orderedItems', [])
    },
  },
}
</script>
