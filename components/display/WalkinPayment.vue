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
        <v-btn icon dark @click="$emit('')">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
    </div>

    <v-card-text class="pt-5 text--primary">
      <div class="d-flex">
        <div class="text-h6">Total Amount</div>
        <div class="ml-auto text-h6 mr-3">{{ toCurrency(totalAmount) }}</div>
      </div>
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
        <div class="ml-auto text-subtitle-2 mr-3">{{ toCurrency(change) }}</div>
      </div>

      <v-divider />
    </v-card-text>
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
  },
  data() {
    return {
      tendered: null,
    }
  },
  computed: {
    ...mapState({
      color: (state) => state.mobile.color,
    }),
    change() {
      return this.tendered - this.totalAmount
    },
  },
  watch: {
    showPaymentDialog(show) {
      if (show) {
        this.focusTextField()
      }
    },
  },
  mounted() {
    this.focusTextField()
  },
  methods: {
    focusTextField() {
      this.$nextTick(() => {
        const theElement = this.$refs.tendered
        const input = theElement.$refs.textfield // .querySelector('input:not([type=hidden])')
        if (input) {
          setTimeout(() => {
            input.focus()
          }, 0)
        }
      })
    },
    close() {
      this.$emit('update:showPaymentDialog', false)
    },
    save() {
      if (this.change < 0) {
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
        payment_option_id: 1,
        notes: `Tendered Amount: ${this.toCurrency(
          this.tendered
        )} \n Change: ${this.toCurrency(this.change)}`,
      }
      this.$emit('savePayment', payment)
    },
  },
}
</script>
