import Vue from 'vue'
import VCurrencyField from 'v-currency-field'

Vue.use(VCurrencyField, {
  locale: 'en-PH',
  decimalLength: 2,
  autoDecimalMode: true,
  min: null,
  max: null,
  defaultValue: 0,
})
