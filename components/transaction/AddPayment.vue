<template>
  <v-dialog
    v-model="show"
    scrollable
    width="800"
    :fullscreen="$vuetify.breakpoint.xsOnly"
    height="80%"
    persistent
  >
    <v-card>
      <v-card-title>
        <span>Add Payment</span>
        <v-spacer />
        <span class="green--text">Balance: {{ toCurrency(balance) }}</span>
      </v-card-title>
      <v-card-text class="pb-0">
        <v-container>
          <v-row>
            <v-spacer />
            <v-col cols="12" sm="6">
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
                    label="Payment Date"
                    :error-messages="errors.getAll('payment_date')"
                    autocomplete="no"
                    prepend-icon="mdi-calendar-month"
                    @blur="form.payment_date = parseDate(form.payment_date)"
                    v-on="on"
                  />
                </template>
                <v-date-picker v-model="form.payment_date" no-title />
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="selected_payment_option"
                :items="payment_options"
                label="Payment Option"
                required
                autocomplete="off"
                item-text="name"
                width="50%"
                hide-selected
                :error-messages="errors.getAll('payment_option_id')"
                :search-input.sync="search_option"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-currency-field
                v-model="form.amount"
                label="Amount"
                type="text"
                :decimal-length="2"
                prepend-icon="mdi-currency-php"
                :error-messages="errors.getAll('amount')"
              />
            </v-col>
          </v-row>
          <v-textarea v-model="form.notes" label="Notes" auto-grow />
        </v-container>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
        <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import Form from '~/components/core/Form.js'
import Errors from '~/components/core/Errors.js'
import FormValidationMixins from '~/plugins/FormValidationMixins'

export default {
  mixins: [FormValidationMixins],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    transaction: {
      type: Object,
      default: null,
    },
    totalPayment: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: new Form({
        payment_option_id: null,
        payment_date: null,
        amount: null,
        notes: '',
      }),
      dateFormatted: null,
      errors: new Errors(),
      selected_payment_option: null,
      attributes: {
        payment_date: 'Payment Date',
        payment_option_id: 'Payment Option',
      },
      sending: false,
      search_option: null,
    }
  },
  validations: {
    form: {
      payment_option_id: {
        required,
      },
      payment_date: {
        required,
      },
      amount: {
        required,
      },
    },
  },
  computed: {
    ...mapState({
      payment_options: (state) => state.payment_option.payment_options,
      paymentOptionsLoadStatus: (state) =>
        state.payment_option.paymentOptionsLoadStatus,
    }),
    balance() {
      return this.transaction.total_amount - this.totalPayment
    },
    user() {
      return this.$auth.user
    },
  },
  watch: {
    'form.payment_date'(val) {
      this.dateFormatted = this.formatDate(val)
    },
    selected_payment_option(val) {
      if (val) {
        this.form.payment_option_id = val.id
      }
    },
    show(val) {
      if (val) {
        this.clear()
      }
    },
  },
  mounted() {
    this.loadPaymentOptions()
  },
  methods: {
    loadPaymentOptions() {
      this.$store.dispatch('payment_option/loadPaymentOptions')
    },
    close() {
      this.$emit('update:show', false)
    },
    save() {
      if (this.sending) {
        return true
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.sending = true
        this.$axios
          .post(
            `/laravel/api/transaction/${this.transaction.id}/payment`,
            this.form.changedData()
          )
          .then((resp) => {
            if (resp.status === 201) {
              this.$swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Payment successfuly added',
                showConfirmButton: false,
                timer: 1500,
              })

              const payment = resp.data
              payment.option = {
                name: this.selected_payment_option.name,
              }
              payment.user = {
                name: this.user.name,
              }

              if ('label' in payment) {
                this.$emit('addLabel', payment.label)
              }

              this.$emit('added', payment)
              this.close()
            }
          })
          .catch((error) => {
            this.$swal.fire({
              position: 'top-end',
              icon: 'error',
              title: error.message || 'Oops.. Something went wrong!',
              showConfirmButton: false,
              timer: 1500,
            })
          })
          .finally(() => {
            this.sending = false
          })
      }
    },
    clear() {
      this.form.clear()
      this.form.payment_date = this.formatDate(new Date(), 'yyyy-MM-dd')
      this.search_option = null
    },
  },
}
</script>

<style></style>
