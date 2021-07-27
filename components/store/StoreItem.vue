<template>
  <v-skeleton-loader
    ref="skeleton"
    type="table-heading,table-heading"
    class="mx-auto"
    :loading="loading"
  >
    <v-data-table :headers="colHeaders" :items="storeItems" :search="search">
      <template v-slot:body="{ items, headers }">
        <tbody>
          <tr v-if="items.length < 1">
            <td :colspan="headers.length">
              <div class="d-flex flex-column align-center pa-5">
                <v-avatar color="indigo darken-2" size="128">
                  <v-icon class="text-h1" color="indigo lighten-5"
                    >mdi-food</v-icon
                  >
                </v-avatar>
                <div class="text--secondary my-4">
                  Add items for this store, and start selling.
                </div>
                <v-btn color="primary" @click="addItems">
                  <v-icon left> mdi-plus </v-icon> ADD ITEMS
                </v-btn>
              </div>
            </td>
          </tr>

          <tr v-for="(item, key) in items" :key="key" :class="rowClass(item)">
            <td>{{ item.name }}</td>
            <td class="text-right">
              <template v-if="!editable">
                {{ toNumberFormat(item.pivot.selling_price) }}
              </template>
              <v-currency-field
                v-else
                v-model="item.pivot.selling_price"
                label="Selling"
                solo
                flat
                required
                hide-details
                single-line
                :rules="[rules.required]"
                dense
                @keypress="changeInput(item)"
              />
            </td>
            <td class="text-right">
              <template v-if="!editable">
                {{ toNumberFormat(item.pivot.selling_price) }}
              </template>
              <v-currency-field
                v-else
                v-model="item.pivot.cost"
                label="Cost"
                solo
                flat
                required
                hide-details
                single-line
                dense
                @keypress="changeInput(item)"
              />
            </td>
            <td class="text-right">
              <span :class="item.pivot.inventory < 1 ? 'red--text' : ''">{{
                toNumberFormat(item.pivot.inventory)
              }}</span>
            </td>
            <td>
              <v-speed-dial
                v-model="item.fab"
                direction="left"
                :open-on-hover="true"
                transition="scale-transition"
              >
                <template v-slot:activator>
                  <v-btn
                    v-model="item.fab"
                    color="secondary"
                    tabindex="-1"
                    dark
                    fab
                    x-small
                  >
                    <v-icon v-if="item.fab"> mdi-close </v-icon>
                    <v-icon v-else> mdi-cog </v-icon>
                  </v-btn>
                </template>
                <template v-if="editable" v-slot:default class="p-0">
                  <v-btn
                    v-if="showFab('undo', item._state)"
                    fab
                    dark
                    x-small
                    color="grey"
                    @click="undo(item)"
                  >
                    <v-icon>mdi-undo</v-icon>
                  </v-btn>

                  <v-btn
                    v-if="showFab('delete', item._state)"
                    fab
                    dark
                    x-small
                    color="red"
                    @click="remove(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-speed-dial>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
  </v-skeleton-loader>
</template>

<script>
import { isEmpty, reject } from 'lodash'
export default {
  props: {
    store: {
      type: Number,
      default: null,
    },
    storeItems: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    search: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      colHeaders: [
        {
          text: 'Item',
          align: 'start',
          sortable: true,
          value: 'name',
        },
        { text: 'Selling Price', value: 'selling_price', width: '150' },
        { text: 'Cost', value: 'cost', width: '150' },
        {
          text: 'Inventory',
          value: 'inventory',
          align: 'end',
          width: '150',
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      temp_id: null,
      rules: {
        required: (value) => !!value,
      },
    }
  },
  computed: {
    hasPreNew() {
      const data = this.storeItems.filter((r) => {
        return r._state === 'pre_new'
      })
      return data.length > 0
    },
  },
  mounted() {
    this.temp_id = new this.GenerateID()
  },
  methods: {
    *GenerateID() {
      let i = 1
      while (true) {
        yield i++
      }
    },
    inputChange(item) {
      // check state

      if (isEmpty(item.name)) {
        return
      }

      if (item._state === 'pre_new') {
        item._state = 'new'
      } else if (item._state === '') {
        item._state = 'edited'
      }
    },

    undo(item) {
      if (item._state === 'new') {
        this.$emit(
          'update:store-items',
          reject(this.storeItems, (r) => r.item_id === item.item_id)
        )
      } else {
        this.$emit('undoChanges', item)
      }
    },
    remove(item) {
      item._state = 'deleted'
    },
    changeInput(item) {
      if (['', undefined].includes(item._state)) {
        item._state = 'edited'
      }
    },
    addItems() {
      this.$emit('addItem')
    },
  },
}
</script>

<style></style>
