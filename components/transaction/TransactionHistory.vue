<template>
  <div>
    <v-divider />
    <v-skeleton-loader
      type="list-item-three-line,list-item-three-line,list-item-three-line"
      :loading="loading"
    >
      <v-data-table
        :items="history"
        :headers="colHeaders"
        hide-default-header
        show-expand
        single-expand
        :expanded.sync="expanded"
        @click:row="expand"
      >
        <template #[`item.description`]="{ item }">
          On
          <i>{{ item.audit_date }}</i>
          ,
          <b>{{ item.metadata.user_name }}</b>
          [{{ item.metadata.audit_ip_address }}]
          <v-chip
            x-small
            class="text-uppercase white--text mr-1"
            :color="event_color[item.event]"
            label
          >
            {{ item.event }} </v-chip
          >this record
          <u>[{{ (item.auditable_type).replace(/App\\Models\\/g, ''),}}]</u>.
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length" class="py-2">
            <v-simple-table dark>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Fields</th>
                    <th class="text-left">Old Value</th>
                    <th class="text-left">New Value</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(subItem, fields) in item.modified">
                    <tr v-if="fields != 'user_id'" :key="fields">
                      <td>{{ readable(fields) }}</td>
                      <td>
                        <template v-if="fields === 'label_id' && subItem.old">
                          <span
                            class="white--text ml-0 v-chip v-chip--label theme--light v-size--small ${lbl[0].color}"
                            :class="getLabel(subItem.old, 'color')"
                          >
                            <span class="v-chip__content">{{
                              getLabel(subItem.old, 'title')
                            }}</span>
                          </span>
                        </template>
                        <template v-else-if="fields === 'status'">
                          <span
                            class="white--text mb-1 v-chip v-chip--label theme--light v-size--small"
                            :class="getStatus(subItem.old, 'color')"
                          >
                            <span class="v-chip__content">{{
                              getStatus(subItem.old, 'title')
                            }}</span>
                          </span>
                        </template>
                        <template v-else>
                          {{ getFieldValue(fields, subItem.old) }}
                        </template>
                      </td>
                      <td>
                        <template v-if="fields === 'label_id' && subItem.new">
                          <span
                            class="white--text ml-0 v-chip v-chip--label theme--light v-size--small ${lbl[0].color}"
                            :class="getLabel(subItem.new, 'color')"
                          >
                            <span class="v-chip__content">{{
                              getLabel(subItem.new, 'title')
                            }}</span>
                          </span>
                        </template>
                        <template v-else-if="fields === 'status'">
                          <span
                            class="white--text mb-1 v-chip v-chip--label theme--light v-size--small"
                            :class="getStatus(subItem.new, 'color')"
                          >
                            <span class="v-chip__content">{{
                              getStatus(subItem.new, 'title')
                            }}</span>
                          </span>
                        </template>
                        <template v-else>
                          {{ getFieldValue(fields, subItem.new) }}
                        </template>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </template>
            </v-simple-table>
          </td>
        </template>
      </v-data-table>
    </v-skeleton-loader>
    <v-divider />
  </div>
</template>

<script>
/* eslint-disable vue/no-v-html */
import { mapState } from 'vuex'

export default {
  props: {
    transaction: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      history: [],
      loading: false,
      event_color: {
        created: 'grey',
        updated: 'blue',
        deleted: 'red',
      },
      colHeaders: [
        { text: '', value: 'description' },
        { text: '', width: '50px', value: 'data-table-expand', align: 'end' },
      ],
      expanded: [],
    }
  },
  computed: {
    ...mapState({
      labels: (state) => state.app.labels,
      cities: (state) => state.city.cities,
      citiesLoadStatus: (state) => state.city.citiesLoadStatus,
      barangays: (state) => state.barangay.barangays,
      barangaysLoadStatus: (state) => state.barangay.barangaysLoadStatus,
    }),
  },
  mounted() {
    this.loadHistory()

    if (this.citiesLoadStatus === 0) {
      this.$store.dispatch('city/loadCities')
    }

    if (this.barangaysLoadStatus === 0) {
      this.$store.dispatch('barangay/loadBarangays')
    }
  },
  methods: {
    async loadHistory() {
      this.loading = true
      await this.$axios
        .get(`/laravel/api/transaction/${this.transaction.id}/history`)
        .then((resp) => {
          this.history = resp.data
        })
        .finally(() => (this.loading = false))
    },
    readable(fields) {
      const str = fields.replace('_', ' ')
      return str.toUpperCase()
    },
    getFieldValue(field, val) {
      if (val) {
        if (field === 'city_id') {
          const row = this.cities.filter((i) => i.id === val)

          return row[0] ? row[0].name : val
        } else if (field === 'barangay_id') {
          const row = this.barangays.filter((i) => i.id === val)

          return row[0] ? row[0].name : val
        } else if (
          [
            'quantity',
            'line_total',
            'item_price',
            'item_cost',
            'total_amount',
          ].includes(field)
        ) {
          return this.toNumberFormat(val)
        }

        return val
      } else {
        return ''
      }
    },
    getLabel(val, field) {
      if (val) {
        const lbl = this.labels.filter((i) => Number(i.id) === Number(val))

        return lbl[0][field]
      } else {
        return ''
      }
    },
    getStatus(val, field) {
      const status = ['UPCOMING', 'OPEN', 'CLOSE']
      const color = ['yellow', 'green', 'red']

      if (field === 'title') {
        return status[val]
      } else {
        return color[val]
      }
    },
    expand(data) {
      if (this.expanded.length > 0) {
        // check if same
        if (this.expanded[0].id === data.id) {
          this.expanded = []
        } else {
          this.expanded = [data]
        }
      } else {
        this.expanded = [data]
      }
    },
  },
}
</script>

<style></style>
