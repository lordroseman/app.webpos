<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <div>Filters</div>
            <v-combobox
              v-model="store"
              label="Store"
              outlined
              :items="stores"
              item-text="name"
              item-value="id"
            >
            </v-combobox>
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
          </v-col>
          <v-col cols="12" md="9">
            <report-viewer
              :show-report.sync="showReport"
              :src="pdfSrc"
              :params="rptParam"
              :is-dialog="false"
              @loaded="loading = false"
            ></report-viewer
          ></v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
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
