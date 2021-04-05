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
        <v-list-item>
          <v-list-item-content>
            <v-combobox
              v-model="store"
              label="Store"
              outlined
              :items="stores"
              item-text="name"
              item-value="id"
            >
            </v-combobox>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <div>
              <v-spacer />
              <v-btn
                text
                class="float-right"
                color="blue"
                :loading="loading"
                @click="print"
                ><v-icon>mdi-send</v-icon> Generate</v-btn
              >
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
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
    }
  },
  computed: {
    ...mapState({
      stores: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
    }),
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Inventory Report')
  },
  mounted() {
    if (this.storesLoadStatus !== 2) {
      this.$store.dispatch('store/loadStores')
    }
  },
  methods: {
    print() {
      if (!this.store) {
        return
      }

      this.loading = true

      this.pdfSrc = '/laravel/api/report'
      this.rptParam = {
        controls: {
          store: this.store.id,
        },
        report: 'Inventory',
        store: this.store.id,
      }

      this.showReport = true
    },
  },
  head: {
    title: 'Inventory Report',
  },
}
</script>

<style></style>
