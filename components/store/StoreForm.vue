<template>
  <v-card>
    <v-img
      height="250"
      :src="imgUrl"
      :aspect-ratio="16 / 9"
      gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"
    >
      <div class="d-flex flex-column" style="height: 250px">
        <div>
          <v-app-bar flat color="transparent">
            <v-toolbar-title class="title white--text pl-0"> </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn class="text-none" rounded depressed @click="onButtonClick">
              <v-icon left> mdi-camera </v-icon>
              Upload Photo
            </v-btn>
            <v-btn
              class="text-none ml-2"
              rounded
              color="primary"
              depressed
              @click="save"
            >
              <v-icon left> mdi-content-save </v-icon>
              Save
            </v-btn>
            <input
              ref="uploader"
              class="d-none"
              type="file"
              accept="image/*"
              @change="onFileChanged"
            />
          </v-app-bar>
        </div>
        <div class="mt-auto">
          <v-tabs v-model="tab" fixed-tabs background-color="transparent" dark>
            <v-tab href="#info"> Store Information </v-tab>
            <v-tab href="#items"> Store Items </v-tab>
          </v-tabs>
        </div>
      </div>
    </v-img>

    <v-card-text>
      <v-tabs-items v-model="tab">
        <v-tab-item value="info">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name"
                label="Name"
                :error-messages="
                  errors.getAll('name') || errors.getAll('store.name')
                "
                required
                autocomplete="off"
                :readonly="!editable" />
              <v-textarea
                v-model="form.address"
                label="Address"
                :error-messages="
                  errors.getAll('address') || errors.getAll('store.address')
                "
                auto-grow
                rows="1"
              ></v-textarea
            ></v-col>
            <v-col cols="12" sm="6">
              <address-map
                id="store_address"
                :lat="form.geo_location_lat"
                :lng="form.geo_location_long"
                :height="350"
                @click="setLatLng"
              ></address-map>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item value="items">
          <v-row v-if="editable" class="my-0">
            <v-col cols="12" sm="6" class="py-0">
              <v-spacer />
              <v-combobox
                v-model="selected_item"
                :items="item_options"
                label="Select Item"
                required
                autocomplete="off"
                item-text="name"
                append-outer-icon="mdi-plus"
                width="50%"
                :search-input.sync="search_item"
                @click:append-outer="addItem"
              />
            </v-col>
          </v-row>
          <store-item
            :store="form.id"
            :store-items.sync="items"
            :editable="editable"
            :loading="itemsLoading"
            @undoChanges="undoChanges"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
    <v-dialog v-model="sending" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Saving...
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import { findIndex, reject, isEmpty, isNull } from 'lodash'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors'
import Form from '~/components/core/Form'

export default {
  mixins: [FormValidationMixins],
  props: {
    id: {
      type: String,
      default: 'new',
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tab: {
        active: 'info',
        data: [
          { id: 'info', title: 'Store Information' },
          { id: 'items', title: 'Store Items' },
        ],
      },
      form: new Form({
        id: null,
        name: '',
        address: '',
        geo_location_lat: null,
        geo_location_long: null,
      }),
      items: [],
      errors: new Errors(),
      itemsLoading: false,
      selected_item: null,
      search_item: null,
      backdoor: 0,
      selectedFile: null,
      imgUrl: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
      defaultImg: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
      imgChanged: false,
      storeSendingStatus: 0,
    }
  },
  validations: {
    form: {
      name: {
        required,
      },
    },
  },
  computed: {
    ...mapState({
      item_list: (state) => state.item.items,
      itemsLoadStatus: (state) => state.item.itemsLoadStatus,
    }),
    mode() {
      return isNull(this.form.id) ? 'Add' : 'Edit'
    },
    formTitle() {
      return this.form.id ? 'Edit Store' : 'New Store'
    },
    sending() {
      return false
    },
    params() {
      const param = {}

      if (this.form.hasChanges()) {
        param.store = this.form.changedData()
      }

      if (!isEmpty(this.pivotData)) {
        param.items = this.pivotData
      }

      return param
    },
    item_options() {
      const availItems = []
      // eslint-disable-next-line no-unused-expressions
      this.backdoor
      for (const row of this.item_list) {
        const ind = findIndex(this.items, (i) => {
          return i.id === row.id
        })

        if (ind === -1) {
          availItems.push(row)
        }
      }

      return availItems
    },
    pivotData() {
      const data = {}

      for (const row of this.items) {
        if (row._state !== 'deleted') {
          data[`${row.item_id || row.id}`] = {
            cost: row.pivot.cost,
            selling_price: row.pivot.selling_price,
          }
        }
      }

      return data
    },
    editable() {
      return this.$can('Store:' + this.mode)
    },
  },
  watch: {
    selected_item(val) {
      if (val) {
        this.addItem()
      }
    },
    show(val) {
      if (val) {
        this.form.clear()
        this.search_item = ''
      }
    },
  },

  created() {
    const vue = this
    this.$store.watch(
      this.$store.getters['store/getStoreSendingStatus'],
      function () {
        const val = vue.storeSendingStatus()

        if (val === 3) {
          vue.errors.record(vue.response_errors)
        } else if (val === 2) {
          // vue.close();
        }
      }
    )
  },
  mounted() {
    this.setForm()
    this.loadItems()
  },
  methods: {
    loadItems() {
      if (this.itemsLoadStatus !== 2) {
        this.$store.dispatch('item/loadItems')
      }
    },
    setForm() {
      if (this.id !== 'new') {
        this.itemsLoading = true
        this.$api.Store.find(this.id)
          .then((resp) => {
            this.form.set({
              id: resp.id,
              name: resp.name,
              address: resp.address,
              geo_location_lat: resp.geo_location_lat,
              geo_location_long: resp.geo_location_long,
              img: null,
            })

            this.imgUrl = resp.image || this.defaultImg
            this.items = []
            for (const item of resp.items) {
              item._original = JSON.parse(JSON.stringify(item))
              item._state = ''
              this.items.push(item)
            }
          })
          .finally(() => {
            this.itemsLoading = false
          })
          .catch((error) => {
            this.clear()
            this.showErrorMessage(error)
          })
      }
    },
    setLatLng(data) {
      this.form.geo_location_lat = data.lat
      this.form.geo_location_long = data.lng
    },
    clear() {
      this.form.clear()
      this.$v.$reset()
      this.items = []
      this.imgUrl = this.defaultImg
    },
    save() {
      if (this.storeSendingStatus === 1) {
        return
      }

      if (isEmpty(this.params)) {
        return
      }

      this.$v.$touch()

      if (!this.$v.$invalid) {
        if (isNull(this.form.id)) {
          this.postNewStore()
        } else {
          this.editStore()
        }
      }
    },
    postNewStore() {
      const formdata = new FormData()

      if (this.imgChanged) {
        formdata.append('image', this.selectedFile)
      }

      for (const key in this.params) {
        formdata.append(key, JSON.stringify(this.params[key]))
      }

      this.$axios
        .post('/laravel/api/store', formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          this.applychanges(response.data)
          this.$swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Store successfuly added!',
            showConfirmButton: false,
            timer: 1500,
          })
        })
        .catch((error) => {
          this.showErrorMessage(error)
          return error
        })
    },
    editStore() {
      // eslint-disable-next-line no-console
      console.log('edit')
      const formdata = new FormData()

      if (this.imgChanged) {
        formdata.append('image', this.selectedFile)
      }

      for (const key in this.params) {
        formdata.append(key, JSON.stringify(this.params[key]))
      }

      this.$axios
        .post('/laravel/api/store/' + this.form.id, formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          this.applychanges(response.data)
          this.$swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Store successfuly saved!',
            showConfirmButton: false,
            timer: 1500,
          })
        })
        .catch((error) => {
          this.showErrorMessage(error)
          return error
        })
    },
    showErrorMessage(error) {
      let message = 'Unknown error occured!'
      if ('message' in error) {
        message = error.message
      }

      this.$swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        footer: '<a href>Why do I have this issue?</a>',
      })

      // eslint-disable-next-line no-console
      console.log(error)
    },
    applychanges(response) {
      this.imgChanged = false
      this.selectedFile = null
      // eslint-disable-next-line no-console
      console.log(response)
      if (this.form.hasChanges()) {
        this.form.id = response.store.id
        this.form.confirmChanges()
      }

      if ('items' in response) {
        for (const item of this.items) {
          if (item._state === 'new') {
            item._state = ''
          } else if (item._state === 'edited') {
            item._state = ''
          }
        }

        // remove deleted
        this.items = reject(this.items, {
          _state: 'deleted',
        })
      }
    },
    addItem() {
      if (this.selected_item == null) {
        return
      }
      this.backdoor++
      const item = {
        item_id: this.selected_item.id,
        name: this.selected_item.name,
        id: this.selected_item.id,
        pivot: {
          selling_price: 0,
          cost: 0,
          inventory: 0,
        },
        _state: 'new',
      }

      this.items.push(item)
      this.selected_item = null
      this.search_item = null
    },
    undoChanges(item) {
      const ind = findIndex(this.items, (i) => i.id === item.id)

      this.items[ind].pivot.selling_price = item._original.pivot.selling_price
      this.items[ind].pivot.cost = item._original.pivot.cost
      this.items[ind]._state = ''
    },
    onButtonClick() {
      this.$refs.uploader.click()
    },
    onFileChanged(e) {
      this.selectedFile = e.target.files[0]
      this.imgUrl = URL.createObjectURL(this.selectedFile)
      this.imgChanged = true
      // do something
    },
  },
}
</script>

<style></style>
