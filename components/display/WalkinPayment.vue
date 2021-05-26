<template>
  <v-card class="d-flex flex-column">
    <div>
      <v-toolbar dark :color="color.primary">
        <v-toolbar-title>
          <v-list color="transparent">
            <v-list-item-content>
              <v-list-item-title class="white--text">
                Settle Payment
              </v-list-item-title>
            </v-list-item-content>
          </v-list>
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon dark @click="close">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
    </div>

    <v-card-text class="pt-5 text--primary">
      <div class="d-flex flex-column">
        <div class="text-secondary">Total Amount</div>
        <div class="mx-auto text-h2">{{ toCurrency(totalAmount) }}</div>
      </div>
    </v-card-text>
    <v-divider />
    <v-tabs
      v-model="payment_option_tab"
      centered
      :slider-color="color.primary"
      :color="color.primary"
      grow
    >
      <v-tab v-for="i in options" :key="i.id" :href="`#${i.tab}`">
        {{ i.text }}
      </v-tab>
    </v-tabs>
    <v-divider />
    <v-card-text class="mt-4">
      <template v-if="payment_option_tab === 'tab-cod'">
        <div class="d-flex">
          <div class="my-auto text-subtitle-2">Tendered Amount</div>
          <div class="ml-auto">
            <v-currency-field
              ref="tendered"
              v-model="tendered"
              outlined
              solo
              flat
              dense
              :color="color.primary"
              hide-details
              reverse
              append-icon="mdi-currency-php"
              @keydown.enter="save"
            ></v-currency-field>
          </div>
        </div>
        <div class="d-flex py-2">
          <div class="text-subtitle-2">Change</div>
          <div class="ml-auto text-subtitle-2 mr-3">
            {{ toCurrency(change) }}
          </div>
        </div>
      </template>
      <template v-else>
        <div class="d-flex">
          <div class="my-auto text-subtitle-2">Total Amount</div>
          <div class="ml-auto">{{ toCurrency(totalAmount) }}</div>
        </div>
        <div class="d-flex py-2">
          <div class="my-auto text-subtitle-2">Transaction/Reference No.</div>
          <div class="ml-auto">
            <v-text-field
              ref="reference"
              v-model="reference_no"
              outlined
              solo
              flat
              dense
              :color="color.primary"
              hide-details
              reverse
            ></v-text-field>
          </div>
        </div>
      </template>
      <v-divider />
      <div class="d-flex flex-column mt-3">
        <div class="my-auto text-subtitle-2">Notes</div>
        <div class="">
          <v-textarea
            v-model="transaction_notes"
            outlined
            solo
            flat
            dense
            :color="color.primary"
            hide-details
            auto-grow
            rows="3"
          ></v-textarea>
        </div>
      </div>
    </v-card-text>
    <v-divider />
    <v-card-actions class="mt-auto">
      <v-btn
        class="ml-auto"
        dark
        :color="color.primary"
        width="70%"
        @click="save"
      >
        <template> Pay Amount </template>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    totalAmount: {
      type: Number,
      default: 0,
    },
    showPaymentDialog: {
      type: Boolean,
      default: false,
    },
    transactionNotes: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      tendered: null,
      payment_option_tab: null,
      options: [
        { id: 1, text: 'COD', tab: 'tab-cod' },
        { id: 2, text: 'GCASH', tab: 'tab-gcash' },
        { id: 7, text: 'PAYMAYA', tab: 'tab-paymaya' },
      ],
      reference_no: null,
      notes_txt: null,
      transaction_notes: null,
    }
  },
  computed: {
    ...mapState({
      color: (state) => state.mobile.color,
    }),
    change() {
      return this.tendered - this.totalAmount
    },
    payment_option() {
      const option = this.options.find((i) => i.tab === this.payment_option_tab)

      return option
    },
    notes() {
      if (this.payment_option_tab === 'tab-cod') {
        return `Tendered Amount: ${this.toCurrency(
          this.tendered
        )} \n Change: ${this.toCurrency(this.change)}`
      } else {
        return this.notes_txt
      }
    },
  },
  watch: {
    showPaymentDialog(show) {
      if (show) {
        this.focusTextField()
      } else {
        this.clear()
      }
    },
  },
  mounted() {
    this.focusTextField()
  },
  methods: {
    focusTextField() {
      this.$nextTick(() => {
        let theElement

        if (this.payment_option_tab === 'tab-gcash') {
          theElement = this.$refs.tendered
        } else {
          theElement = this.$refs.reference
        }

        if (theElement) {
          const input = theElement.$refs.textfield // .querySelector('input:not([type=hidden])')
          if (input) {
            setTimeout(() => {
              input.focus()
            }, 0)
          }
        }
      })
    },
    close() {
      this.clear()
      this.$emit('update:showPaymentDialog', false)
    },
    save() {
      if (this.payment_option_tab === 'tab-cod' && this.change < 0) {
        this.$swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Insufficient amount!',
        })
        return
      }

      const payment = {
        user_id: this.$auth.user.id,
        payment_date: this.formatDate(new Date(), 'yyyy-MM-dd'),
        amount: this.totalAmount,
        payment_option_id: this.payment_option.id,
        reference_number: this.reference_no,
        notes: this.notes,
      }
      this.$emit('update:transactionNotes', this.transaction_notes)
      this.$emit('savePayment', payment)
    },
    clear() {
      this.tendered = null
    },
  },
}
</script>
