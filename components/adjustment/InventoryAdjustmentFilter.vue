<template>
  <v-dialog v-model="show" max-width="800px" persistent scrollable>
    <v-card>
      <v-card-title>Advance Filter</v-card-title>
      <v-card-text class="pt-2">
        <v-text-field
          v-model="ids"
          label="Inventory Adjustment ID"
          outlined
          hint="You can search multiple 'ID' seperated by comma (,) "
        />

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
        <v-autocomplete
          v-model="selectedItem"
          label="Items"
          outlined
          hint="Select Items included in adjustment"
          persistent-hint
          :items="items"
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
              @click:close="remove(data.item)"
            >
              {{ data.item.name }}
            </v-chip>
          </template>
        </v-autocomplete>
        <v-text-field v-model="remarks" label="Remarks" outlined />
        <v-row class="justify-space-around">
          <v-col class="py-0" cols="12" sm="4">
            <span class="mt-1">Type</span>
          </v-col>
          <v-col class="py-0" cols="12" sm="4">
            <v-checkbox v-model="type" value="1" class="mx-2 mt-0" label="IN" />
          </v-col>
          <v-col class="py-0" cols="12" sm="4">
            <v-checkbox
              v-model="type"
              value="2"
              class="mx-2 mt-0"
              label="OUT"
            />
          </v-col>
        </v-row>

        <v-row class="justify-space-around">
          <v-col class="py-0" cols="12" sm="4">
            <span class="mt-1">Status</span>
          </v-col>
          <v-col class="py-0" cols="12" sm="4">
            <v-checkbox
              v-model="status"
              value="1"
              class="mx-2 mt-0"
              label="Pending"
            />
          </v-col>
          <v-col class="py-0" cols="12" sm="4">
            <v-checkbox
              v-model="status"
              value="2"
              class="mx-2 mt-0"
              label="Approved"
            />
          </v-col>
        </v-row>
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
import { isEmpty, trimEnd } from 'lodash'
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
      ids: '',
      customer: '',
      date: [],
      dateMenu: false,
      status: [],
      type: [],
      remarks: '',
      item: [],
      selectedStore: [],
      selectedItem: [],
    }
  },
  computed: {
    ...mapState({
      stores: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
      items: (state) => state.item.items,
      itemsLoadStatus: (state) => state.item.itemsLoadStatus,
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
      if (!isEmpty(this.ids)) {
        filter.id = trimEnd(this.ids, ',')
      }

      if (!isEmpty(this.date)) {
        filter.date_between = this.date
      }

      if (!isEmpty(this.status)) {
        filter.status = this.status
      }

      if (!isEmpty(this.selectedItem)) {
        filter.has_items = this.item
      }

      if (!isEmpty(this.type)) {
        filter.type = this.type
      }

      if (!isEmpty(this.remarks)) {
        filter.remarks = this.remarks
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

    if (this.itemsLoadStatus !== 2) {
      this.$store.dispatch('item/loadItems')
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
    remove(item) {
      const index = this.item.indexOf(item.id)
      if (index >= 0) {
        this.item.splice(index, 1)
      }
    },
  },
}
</script>

<style></style>
