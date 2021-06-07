<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="800px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Item:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New Item
            </v-btn>
          </template>
          <item-form
            :data.sync="selected_item"
            :show="dialog"
            @close="closeForm"
          />
        </v-dialog>
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="loading"
      >
        <v-data-table
          :headers="colHeaders"
          :items="items"
          :search="search"
          multi-sort
          show-expand
          single-expand
        >
          <template #[`item.category`]="{ item }">
            {{ item.category.title }}
          </template>
          <template #[`item.subcategory`]="{ item }">
            {{ item.subcategory ? item.subcategory.title : '' }}
          </template>
          <template #[`item.selling_price`]="{ item }">
            {{ toCurrency(item.selling_price) }}
          </template>
          <template #[`item.inventory`]="{ item }">
            <span :class="item.inventory < 1 ? 'red--text' : ''">{{
              item.inventory
            }}</span>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-hover v-slot:default="{ hover }">
              <v-speed-dial
                direction="left"
                :open-on-hover="true"
                transition="scale-transition"
              >
                <template v-slot:activator>
                  <v-btn color="secondary" dark fab x-small>
                    <v-icon v-if="hover"> mdi-close </v-icon>
                    <v-icon v-else> mdi-cog </v-icon>
                  </v-btn>
                </template>
                <template v-slot:default class="p-0">
                  <v-btn fab dark x-small color="blue" @click="edit(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn fab dark x-small color="black" @click="ledger(item)">
                    <v-icon>mdi-clipboard-flow</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="$can('Item:Delete')"
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
            </v-hover>
          </template>
          <template #expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <div class="d-flex py-3">
                <v-card outlined width="100">
                  <v-img
                    width="100"
                    height="100"
                    lazy-src="/preload.png"
                    :src="getImg(item) || '/preload.png'"
                    eager
                  >
                    <template v-slot:placeholder>
                      <v-skeleton-loader type="image" />
                    </template>
                  </v-img>
                </v-card>
                <div class="ml-2">
                  <h3>{{ item.sku }} - {{ item.name }}</h3>
                  <div>
                    <span>Description :</span>
                    {{ item.description }}
                  </div>
                  <div>
                    <span>Item Unit :</span>
                    {{ item.item_unit.title }}({{ item.item_unit.abbrev }})
                  </div>
                </div>
              </div>
            </td>
          </template>
        </v-data-table>
      </v-skeleton-loader>
    </v-card>

    <v-dialog
      v-model="showLedger"
      max-width="800px"
      :fullscreen="$vuetify.breakpoint.smAndDown"
      scrollable
    >
      <item-ledger :active-item="item_ledger" :show.sync="showLedger" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  meta: {
    label: 'Item',
    permission: 'Item:View',
    access_level: 1,
  },
  data() {
    return {
      colHeaders: [
        {
          text: 'SKU',
          align: 'start',
          sortable: true,
          value: 'sku',
        },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' },
        { text: 'Sub-Category', value: 'subcategory' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      options: {},
      dialog: false,
      search: '',
      selected_item: {},
      showLedger: false,
      item_ledger: null,
      showFilter: false,
      filters: {},
    }
  },
  computed: {
    ...mapGetters({
      items: 'item/getItems',
      itemsLoadStatus: 'item/getItemsLoadStatus',
      itemDeletingStatus: 'item/getItemDeletingStatus',
    }),
    loading() {
      return this.itemsLoadStatus() !== 2
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Item')
  },
  mounted() {
    this.loadItems()
  },
  methods: {
    loadItems() {
      this.$store.dispatch('item/loadItems')
    },
    edit(item) {
      this.selected_item = item
      this.dialog = true
    },
    remove(item) {
      this.$swal
        .fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          showLoaderOnConfirm: true,
          preConfirm: (e) => {
            return new Promise((resolve, reject) => {
              this.$store.dispatch('item/deleteItem', item.id)
              const vue = this
              this.$store.watch(
                this.$store.getters['item/getItemDeletingStatus'],
                function () {
                  if (vue.itemDeletingStatus() === 2) {
                    resolve(true)
                  } else {
                    reject(this.errors)
                    this.$swal.showValidationMessage(
                      `Request failed: ${this.errors.message}`
                    )
                  }
                }
              )
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire('Deleted!', 'Item  has been deleted.', 'success')
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_item = {}
    },
    ledger(item) {
      this.showLedger = true
      this.item_ledger = item
    },
    getImg(item) {
      if (!item.img) {
        return null
      }

      const img = `data:${item.image_mime};base64,${item.image_base64}`
      return img
    },
  },
  head: {
    title: 'Item',
  },
}
</script>
