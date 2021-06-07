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
              append-inner-icon="mdi-calendar"
              readonly
              dense
              v-bind="attrs"
              outlined
              class="mt-4"
              hide-details
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="dates" range>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn text color="primary" @click="savePickerMenu"> OK </v-btn>
          </v-date-picker>
        </v-menu>
        <v-combobox
          v-model="category"
          label="Category"
          outlined
          :items="categories"
          item-text="title"
          item-value="id"
          dense
          :hide-details="true"
          class="mt-4"
          clearable
        >
        </v-combobox>
        <v-combobox
          v-model="subcategory"
          label="Sub-Category"
          outlined
          :items="subcategories"
          item-text="title"
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
      dates: [],
      subcategories: [],
      category: null,
      subcategory: null,
    }
  },
  computed: {
    ...mapState({
      stores: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
      categories: (state) => state.category.categories,
      categoriesLoadStatus: (state) => state.category.categoriesLoadStatus,
    }),
    dateFrom() {
      return this.dates[0] || null
    },
    dateTo() {
      return this.dates[1] || null
    },
    selectedDate() {
      if (this.dates) {
        if (this.dates.length === 1) {
          return this.formatDate(this.dateFrom)
        } else if (this.dates.length === 2) {
          return (
            this.formatDate(this.dateFrom) +
            ' - ' +
            this.formatDate(this.dateTo)
          )
        }
      }

      return null
    },
    controls() {
      let dateTo = this.dateTo
      if (this.dates.length === 1) {
        dateTo = this.dateFrom
      }

      const controls = {
        store_id: this.store.id,
        dateFrom: this.dateFrom,
        dateTo,
      }

      if (this.category) {
        controls.category = this.category
      }

      if (this.subcategory) {
        controls.subcategory = this.subcategory
      }

      return controls
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Product Movement Report')
  },
  mounted() {
    if (this.storesLoadStatus !== 2) {
      this.$store.dispatch('store/loadStores')
    }
    if (this.storesLoadStatus !== 2) {
      this.$store.dispatch('category/loadCategories')
    }
    this.loadSubCategories()
  },
  methods: {
    async loadSubCategories() {
      this.subcategories = await this.$api.SubCategory.get()
    },
    savePickerMenu() {
      this.dates.sort()
      this.$refs.menu.save(this.dates)
    },
    print() {
      if (!this.store) {
        return
      }

      this.loading = true

      this.pdfSrc = '/laravel/api/report'
      this.rptParam = {
        controls: this.controls,
        report: 'DailyProductMovement',
        store: this.store.id,
      }

      this.showReport = true
    },
  },
  head: {
    title: 'Product Movement Report',
  },
}
</script>

<style></style>
