<template>
  <report-viewer
    :show-report.sync="showReport"
    :src="pdfSrc"
    :params="rptParam"
    :is-dialog="false"
    :has-sidebar="hasSidebar"
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
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="delivery_date">
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn text color="primary" @click="savePickerMenu"> OK </v-btn>
          </v-date-picker>
        </v-menu>
        <div>
          <v-spacer />
          <v-btn
            text
            class="float-right"
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
    label: 'Inventory Report',
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
    }
  },
  computed: {
    ...mapState({
      stores: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
    }),
    selectedDate() {
      if (this.delivery_date) {
        return this.formatDate(this.delivery_date)
      }

      return null
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Sales Report')
  },
  mounted() {
    if (this.storesLoadStatus !== 2) {
      this.$store.dispatch('store/loadStores')
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
        controls: {
          store: this.store.id,
          delivery_date: this.delivery_date,
        },
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
