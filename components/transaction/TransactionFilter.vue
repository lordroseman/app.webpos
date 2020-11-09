<template>
  <v-dialog v-model="show" max-width="800px" persistent scrollable>
    <v-card>
      <v-card-title>Advance Filter</v-card-title>
      <v-card-text class="pt-2">
        <v-text-field
          v-model="ids"
          label="Transaction ID"
          outlined
          hint="You can search multiple 'ID' seperated by comma (,) "
        />
        <v-text-field
          v-model="customer"
          label="Customer Details"
          outlined
          hint="Will search through Customer Name, Address and Contact Number"
        />
        <v-autocomplete
          v-model="selectedItem"
          label="Item"
          outlined
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
              @click:close="removeItem(data.item)"
            >
              {{ data.item.name }}
            </v-chip>
          </template>
        </v-autocomplete>
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
          ref="trxMenu"
          v-model="trxMenu"
          :close-on-content-click="false"
          :return-value.sync="trxDate"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="trxDateFormatted"
              label="Transaction Date"
              readonly
              v-bind="attrs"
              outlined
              v-on="on"
            />
          </template>
          <v-date-picker v-model="trxDate" no-title scrollable range>
            <v-spacer />
            <v-btn text color="primary" @click="trxMenu = false">
              Cancel
            </v-btn>
            <v-btn text color="primary" @click="$refs.trxMenu.save(trxDate)">
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
        <v-menu
          ref="drMenu"
          v-model="drMenu"
          :close-on-content-click="false"
          :return-value.sync="drDate"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="drDateFormatted"
              label="Delivery Date"
              readonly
              v-bind="attrs"
              outlined
              v-on="on"
            />
          </template>
          <v-date-picker v-model="drDate" no-title scrollable range>
            <v-spacer />
            <v-btn text color="primary" @click="drMenu = false"> Cancel </v-btn>
            <v-btn text color="primary" @click="$refs.drMenu.save(drDate)">
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
        <v-row class="justify-space-around">
          <span class="mt-1">Status</span>
          <v-checkbox
            v-model="status"
            value="0"
            class="mx-2 mt-0"
            label="Upcoming"
          />
          <v-checkbox
            v-model="status"
            value="1"
            class="mx-2 mt-0"
            label="Open"
          />
          <v-checkbox
            v-model="status"
            value="2"
            class="mx-2 mt-0"
            label="Close"
          />
          <v-checkbox
            v-model="status"
            color="red"
            value="deleted"
            class="mx-2 mt-0"
            label="Deleted"
          />
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
      trxDate: [],
      trxMenu: false,
      drDate: [],
      drMenu: false,
      status: [],
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
    trxDateFormatted() {
      if (this.trxDate.length === 2) {
        return (
          this.formatDate(this.trxDate[0], 'MM/dd/yyyy') +
          ' ~ ' +
          this.formatDate(this.trxDate[1], 'MM/dd/yyyy')
        )
      } else {
        return ''
      }
    },
    drDateFormatted() {
      if (this.drDate.length === 2) {
        return (
          this.formatDate(this.drDate[0], 'MM/dd/yyyy') +
          ' ~ ' +
          this.formatDate(this.drDate[1], 'MM/dd/yyyy')
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

      if (!isEmpty(this.customer)) {
        filter.customer = this.customer
      }

      if (!isEmpty(this.trxDate)) {
        filter.txn_date_between = this.trxDate
      }

      if (!isEmpty(this.drDate)) {
        filter.delivery_date_between = this.drDate
      }

      if (!isEmpty(this.status)) {
        filter.status = this.status
        if (this.status.includes('deleted')) {
          filter.trashed = 'with'
        }
        filter.status.splice(this.status.indexOf('deleted'), 1)
      }

      if (!isEmpty(this.selectedStore)) {
        filter.store = this.selectedStore
      }

      if (!isEmpty(this.selectedItem)) {
        filter.has_items = this.selectedItem
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
    removeStore(item) {
      const index = this.selectedStore.indexOf(item.id)
      if (index >= 0) {
        this.selectedStore.splice(index, 1)
      }
    },
    removeItem(item) {
      const index = this.selectedItem.indexOf(item.id)
      if (index >= 0) {
        this.selectedItem.splice(index, 1)
      }
    },
  },
}
</script>

<style></style>
