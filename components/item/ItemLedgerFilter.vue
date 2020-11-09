<template>
  <v-dialog v-model="show" max-width="800px" persistent scrollable>
    <v-card>
      <v-card-title>Advance Filter</v-card-title>
      <v-card-text class="pt-2">
        <v-autocomplete
          v-model="selectedStore"
          label="Store"
          outlined
          :items="stores"
          item-text="name"
          item-value="id"
          multiple
        >
          <template v-slot:selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              @click="data.select"
              @click:close="removeStore(data.item)"
            >
              {{ data.item.name }}
            </v-chip>
          </template>
        </v-autocomplete>
        <v-menu
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateFormatted"
              label="Date"
              readonly
              v-bind="attrs"
              outlined
              v-on="on"
            />
          </template>
          <v-date-picker v-model="date" no-title scrollable range>
            <v-spacer />
            <v-btn text color="primary" @click="dateMenu = false">
              Cancel
            </v-btn>
            <v-btn text color="primary" @click="$refs.dateMenu.save(date)">
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>

        <v-text-field v-model="notes" label="Notes" outlined />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
        <v-btn color="blue darken-1" text @click="save"> Filter </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { isEmpty } from 'lodash'
import { mapState } from 'vuex'
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    filters: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      date: [],
      dateMenu: false,
      notes: '',
      selectedStore: [],
    }
  },
  computed: {
    ...mapState({
      stores: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
    }),
    dateFormatted() {
      if (this.date.length === 2) {
        return (
          this.formatDate(this.date[0], 'MM/dd/yyyy') +
          ' ~ ' +
          this.formatDate(this.date[1], 'MM/dd/yyyy')
        )
      } else {
        return ''
      }
    },
    filter() {
      const filter = {}

      if (!isEmpty(this.date)) {
        filter.date_between = this.date
      }
      if (!isEmpty(this.notes)) {
        filter.notes = this.notes
      }

      if (!isEmpty(this.selectedStore)) {
        filter.store_id = this.selectedStore
      }

      return filter
    },
  },
  mounted() {
    if (this.storesLoadStatus !== 2) {
      this.$store.dispatch('store/loadStores')
    }
  },
  methods: {
    close() {
      this.$emit('update:show', false)
    },
    save() {
      this.$emit('update:filters', this.filter)
      this.close()
    },
    removeStore(item) {
      const index = this.selectedStore.indexOf(item.id)
      if (index >= 0) {
        this.selectedStore.splice(index, 1)
      }
    },
  },
}
</script>

<style></style>
