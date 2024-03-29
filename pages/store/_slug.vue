<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card>
      <v-card-title>
        <div>{{ formTitle }}</div>
        <v-spacer />
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
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="7" xl="6">
            <v-tabs
              v-model="tab"
              fixed-tabs
              background-color="transparent"
              color="primary"
              :show-arrows="true"
            >
              <v-tab href="#info"> Store Information </v-tab>
              <v-tab href="#items"> Store Items </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item value="info" class="pt-4">
                <v-text-field
                  v-model="form.name"
                  label="Name"
                  :error-messages="
                    errors.getAll('name') || errors.getAll('store.name')
                  "
                  required
                  autocomplete="off"
                  :readonly="!editable"
                />
                <v-textarea
                  v-model="form.address"
                  label="Address"
                  :error-messages="
                    errors.getAll('address') || errors.getAll('store.address')
                  "
                  auto-grow
                  rows="4"
                ></v-textarea>
                <v-autocomplete
                  v-model="storeTags"
                  :items="tags"
                  item-value="id"
                  item-text="title"
                  label="Tags"
                  multiple
                  :readonly="!editable"
                  small-chips
                ></v-autocomplete>
              </v-tab-item>
              <v-tab-item value="items">
                <v-row v-if="editable" class="my-0">
                  <v-col cols="12" sm="6" class="d-flex">
                    <v-btn class="mt-auto" text @click="showAddItem = true">
                      <v-icon left>mdi-plus</v-icon> Add Items
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="searchItem"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                    />
                  </v-col>
                </v-row>
                <store-item
                  :store="form.id"
                  :store-items.sync="items"
                  :editable="editable"
                  :loading="itemsLoading"
                  :search="searchItem"
                  @undoChanges="undoChanges"
                  @addItem="showAddItem = true"
                />
              </v-tab-item>
            </v-tabs-items>
          </v-col>
          <v-col cols="12" lg="5" xl="6">
            <v-responsive :aspect-ratio="16 / 9">
              <div class="font-weight-medium">Select Cover Photo</div>
              <store-cover-photo
                :img="imgUrl"
                :store="store"
                @coverPhotoChanged="coverPhotoChanged"
              />

              <div class="mt-10">
                <div class="font-weight-medium">Pin address on Map</div>
                <address-map
                  id="store_address"
                  :lat="form.geo_location_lat"
                  :lng="form.geo_location_long"
                  :height="350"
                  @click="setLatLng"
                ></address-map>
              </div>
            </v-responsive>
          </v-col>
        </v-row>
      </v-card-text>
      <v-dialog v-model="sending" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Saving...
            <v-progress-linear indeterminate color="white" class="mb-0" />
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showAddItem" width="800" scrollable>
        <add-store-item
          :items="item_options"
          @addSelectedItems="addSelectedItems"
        ></add-store-item>
      </v-dialog>
    </v-card>
  </v-container>
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
  async asyncData({ $api, params }) {
    const id = params.slug
    let data = {
      store: null,
    }
    if (id && id !== 'new') {
      await $api.Store.find(id).then((resp) => {
        data = {
          store: resp,
        }
      })
    }

    return data
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
        slug: null,
        address: '',
        geo_location_lat: null,
        geo_location_long: null,
      }),
      items: [],
      errors: new Errors(),
      itemsLoading: false,
      backdoor: 0,
      selectedFile: null,
      imgUrl: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
      defaultImg: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
      imgChanged: false,
      storeSendingStatus: 0,
      showAddItem: false,
      tags: [],
      storeTags: [],
      searchItem: null,
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
      return this.form.id ? 'Update Store Details' : 'Create New Store'
    },
    sending() {
      return false
    },
    params() {
      const param = {}

      if (this.form.hasChanges()) {
        param.store = this.form.changedData()
      }

      if (this.itemHasChanges) {
        param.items = this.pivotData
      }

      if (this.storeTags) {
        param.tags = this.storeTags
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
    itemHasChanges() {
      let changes = false
      for (const row of this.items) {
        if (row._state !== '') {
          changes = true
        }
      }

      return changes
    },
    editable() {
      return this.$can('Store:' + this.mode)
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Store')
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
    this.loadTags()
  },
  methods: {
    loadItems() {
      if (this.itemsLoadStatus !== 2) {
        this.$store.dispatch('item/loadItems')
      }
    },
    loadTags() {
      this.$api.Tag.get().then((resp) => (this.tags = resp))
    },
    setForm() {
      if (this.store) {
        const resp = this.store

        this.form.set({
          id: resp.id,
          name: resp.name,
          slug: resp.slug,
          address: resp.address,
          geo_location_lat: resp.geo_location_lat,
          geo_location_long: resp.geo_location_long,
          img: null,
        })

        this.imgUrl = resp.img ? resp.img.original : this.defaultImg
        this.storeTags = resp.tags
        this.items = []
        for (const item of resp.items) {
          item._original = JSON.parse(JSON.stringify(item))
          item._state = ''
          this.items.push(item)
        }
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
        if (!this.imgChanged) {
          return
        }
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
      const formdata = new FormData()

      if (this.imgChanged) {
        formdata.append('image', this.selectedFile)
      }

      for (const key in this.params) {
        formdata.append(key, JSON.stringify(this.params[key]))
      }
      formdata.append('_method', 'PUT')

      this.$axios
        .post('/laravel/api/store/' + this.form.slug, formdata, {
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
        footer: '<a href>Why do I have this issuess?</a>',
      })
    },
    applychanges(response) {
      this.imgChanged = false
      this.selectedFile = null

      if (this.form.hasChanges()) {
        this.form.id = response.store.id
        this.form.slug = response.store.slug
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
    addSelectedItems(items) {
      for (const item of items) {
        this.addItem(item)
      }
    },
    addItem(item) {
      const _item = {
        item_id: item.id,
        name: item.name,
        id: item.id,
        pivot: {
          selling_price: 0,
          cost: 0,
          inventory: 0,
        },
        _state: 'new',
      }

      this.items.unshift(_item)
    },
    undoChanges(item) {
      const ind = findIndex(this.items, (i) => i.id === item.id)

      this.items[ind].pivot.selling_price = item._original.pivot.selling_price
      this.items[ind].pivot.cost = item._original.pivot.cost
      this.items[ind]._state = ''
    },
    onClickUpload() {
      this.$refs.uploader.click()
    },
    onFileChanged(e) {
      this.selectedFile = e.target.files[0]
      this.imgUrl = URL.createObjectURL(this.selectedFile)
      this.imgChanged = true
      // do something
    },
    coverPhotoChanged(data) {
      this.imgChanged = data.imgChanged
      this.imgUrl = data.imgUrl
      this.selectedFile = data.selectedFile
    },
  },
}
</script>
