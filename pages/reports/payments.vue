<template>
  <report-viewer
    :show-report.sync="showReport"
    :src="pdfSrc"
    :params="rptParam"
    :is-dialog="false"
    :has-sidebar="hasSidebar"
    :landscape="true"
    @loaded="loading = false"
  >
    <template slot="filter">
      <v-list>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-filter</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Filter</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <div class="px-2">
        <v-combobox
          v-model="store"
          label="Store"
          outlined
          :items="stores"
          item-text="name"
          item-value="id"
          dense
          :hide-details="true"
        >
        </v-combobox>
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="dates"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="selectedDate"
              label="Select Delivery Date"
              append-icon="mdi-calendar"
              readonly
              dense
              v-bind="attrs"
              outlined
              class="mt-4"
              hide-details
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="delivery_date">
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn text color="primary" @click="savePickerMenu"> OK </v-btn>
          </v-date-picker>
        </v-menu>

        <v-combobox
          v-model="payment_option"
          label="Payment Option"
          outlined
          :items="payment_options"
          item-text="name"
          item-value="id"
          dense
          :hide-details="true"
          class="mt-4"
          clearable
        >
        </v-combobox>
        <div>
          <v-spacer />
          <v-btn
            text
            class="float-right mt-4"
            color="blue"
            :loading="loading"
            @click="print"
          >
            <v-icon>mdi-send</v-icon> Generate
          </v-btn>
        </div>
      </div>
    </template>
  </report-viewer>
</template>
<script>
import { mapState } from 'vuex'
import ReportViewer from '~/components/display/ReportViewer.vue'

export default {
  components: { ReportViewer },
  meta: {
    label: 'Payments Report',
    permission: 'Report:View',
    access_level: 1,
  },
  data() {
    return {
      pdfSrc: '',
      showReport: false,
      rptParam: null,
      store: null,
      loading: false,
      hasSidebar: true,
      menu: false,
      delivery_date: null,
      payment_option: null,
    }
  },
  computed: {
    ...mapState({
      stores: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
      payment_options: (state) => state.payment_option.payment_options,
      paymentOptionsLoadStatus: (state) =>
        state.payment_option.paymentOptionsLoadStatus,
    }),
    selectedDate() {
      if (this.delivery_date) {
        return this.formatDate(this.delivery_date)
      }

      return null
    },
    controls() {
      const controls = {
        store: this.store.id,
        delivery_date: this.delivery_date,
      }

      if (this.payment_option) {
        controls.payment_option = this.payment_option
      }

      return controls
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Payments Report')
  },
  mounted() {
    if (this.storesLoadStatus !== 2) {
      this.$store.dispatch('store/loadStores')
    }

    if (this.paymentOptionsLoadStatus !== 2) {
      this.$store.dispatch('payment_option/loadPaymentOptions')
    }
  },
  methods: {
    savePickerMenu() {
      this.$refs.menu.save(this.delivery_date)
    },
    print() {
      if (!this.store) {
        return
      }

      this.loading = true

      this.pdfSrc = '/laravel/api/report'

      this.rptParam = {
        controls: this.controls,
        report: 'Payments',
        store: this.store.id,
      }

      this.showReport = true
    },
  },
  head: {
    title: 'Sales Report',
  },
}
</script>

<style></style>
