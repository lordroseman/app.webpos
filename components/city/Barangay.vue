<template>
  <v-skeleton-loader
    ref="skeleton"
    type="table-heading,table-heading"
    class="mx-auto"
    :loading="loading"
  >
    <v-data-table
      :headers="headers"
      :items="barangays"
      :search="search"
      :fixed-header="true"
      height="370"
      :items-per-page="5"
    >
      <template v-slot:body="{ items }">
        <tbody>
          <tr v-for="(item, key) in items" :key="key" :class="rowClass(item)">
            <td>
              <template v-if="!editable">
                {{ item.name }}
              </template>
              <v-text-field
                v-else
                v-model="item.name"
                solo
                :flat="item._state != 'pre_new'"
                style="height: 48px !important"
                class="my-1"
                :items-per-page="5"
                @change="inputChange(item)"
              />
            </td>
            <td>
              <v-speed-dial
                v-model="item.fab"
                direction="left"
                :open-on-hover="true"
                transition="scale-transition"
              >
                <template v-slot:activator>
                  <v-btn v-model="item.fab" color="secondary" dark fab x-small>
                    <v-icon v-if="item.fab"> mdi-close </v-icon>
                    <v-icon v-else> mdi-cog </v-icon>
                  </v-btn>
                </template>
                <template v-slot:default class="p-0">
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
                    v-if="showFab('delete', item._state) && editable"
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
    city: {
      type: Number,
      default: null,
    },
    barangays: {
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
  },
  data() {
    return {
      headers: [
        {
          text: 'Barangay',
          align: 'start',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      search: null,
      temp_id: null,
    }
  },
  computed: {
    hasPreNew() {
      const data = this.barangays.filter((r) => {
        return r._state === 'pre_new'
      })
      return data.length > 0
    },
  },
  watch: {
    barangays() {
      this.addRow()
    },
  },
  mounted() {
    this.temp_id = new this.GenerateID()
    this.addRow()
  },
  methods: {
    addRow() {
      if (!this.hasPreNew && this.editable) {
        this.barangays.unshift({
          name: null,
          _id: this.temp_id.next().value,
          _state: 'pre_new',
        })
      }
    },
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

      // check if pre_new state exists, if not add row
      if (!this.hasPreNew) {
        this.addRow()
      }
    },
    rowClass(item) {
      const rowClass = {
        '': '',
        pre_new: 'teal lighten-5',
        new: 'green accent-1',
        edited: 'blue accent-1',
        deleted: 'red accent-1',
      }

      return rowClass[item._state]
    },
    undo(item) {
      if (item._state === 'new') {
        this.$emit(
          'update:barangays',
          reject(this.barangays, (r) => r._id === item._id)
        )
      } else {
        item.name = item._original.name
        item._state = ''
      }
    },
    remove(item) {
      item._state = 'deleted'
    },
  },
}
</script>

<style></style>
