<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12" sm="6" class="d-flex flex-column">
            <v-card flat outlined>
              <v-img
                height="250"
                :src="imgUrl"
                :lazy-src="tinyImg"
                contain
                :aspect-ratio="16 / 9"
                class="grey lighten-2"
              >
                <div class="d-flex flex-column" style="height: 250px">
                  <div v-if="!hasImg" class="ma-auto" style="z-index: 1">
                    Click '<v-icon @click="onClickUpload">mdi-camera</v-icon>'
                    to upload photo
                  </div>
                </div>
              </v-img>
            </v-card>

            <v-btn
              class="text-none mx-auto mt-4"
              rounded
              depressed
              @click="onClickUpload"
            >
              <v-icon left> mdi-camera </v-icon>
              Upload Photo
            </v-btn>
            <input
              ref="uploader"
              class="d-none"
              type="file"
              accept="image/*"
              @change="onFileChanged"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.sku"
                  label="SKU"
                  :error-messages="errors.getAll('sku')"
                  required
                  :readonly="!editable"
                />
              </v-col>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="form.name"
                  label="Name"
                  required
                  :error-messages="errors.getAll('name')"
                  :readonly="!editable"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Description"
                  required
                  :error-messages="errors.getAll('description')"
                  :readonly="!editable"
                  auto-grow
                  rows="1"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.item_unit_id"
                  :items="item_units"
                  item-text="title"
                  item-value="id"
                  label="Item Unit"
                  :error-messages="errors.getAll('item_unit_id')"
                  :readonly="!editable"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.category_id"
                  :items="categories"
                  item-text="title"
                  item-value="id"
                  label="Category"
                  :error-messages="errors.getAll('category_id')"
                  :readonly="!editable"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.subcategory_id"
                  :items="subcategories"
                  item-text="title"
                  item-value="id"
                  label="Sub-Category"
                  :error-messages="errors.getAll('subcategory_id')"
                  :readonly="!editable"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
      <v-dialog v-model="sending" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Saving...
            <v-progress-linear indeterminate color="white" class="mb-0" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
      <v-btn v-if="editable" color="blue darken-1" text @click="save">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import { isEmpty } from 'lodash'
import Form from '~/components/core/Form.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors.js'

export default {
  mixins: [FormValidationMixins],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    show: Boolean,
  },
  data() {
    return {
      imageData: null,
      form: new Form({
        id: null,
        sku: '',
        name: '',
        description: '',
        item_unit_id: null,
        category_id: null,
        selling_price: null,
        cost: null,
        subcategory_id: null,
      }),
      errors: new Errors(),
      attributes: {
        sku: 'SKU',
        item_unit_id: 'Item Unit',
        category_id: 'Category',
        selling_price: 'Selling Price',
      },
      custom_message: {
        required_sku: 'SKU is required',
      },
      subcategories: [],
      selectedFile: null,
      imgUrl: null,
      imgChanged: false,
      tinyImg: null,
    }
  },
  validations: {
    form: {
      sku: {
        required,
      },
      name: {
        required,
      },
      description: {
        required,
      },
      category_id: {
        required,
      },
      item_unit_id: {
        required,
      },
    },
  },
  computed: {
    mode() {
      return isEmpty(this.data) ? 'Add' : 'Edit'
    },
    formTitle() {
      return isEmpty(this.data) ? 'New Item' : 'Edit Item'
    },
    ...mapGetters({
      itemSendingStatus: 'item/getItemSendingStatus',
      response_errors: 'item/getErrors',
      response_message: 'item/getMessage',
      categories: 'category/getCategories',
      categoriesLoadStatus: 'category/getCategoriesLoadStatus',
      item_units: 'unit/getItemUnits',
      itemUnitsLoadStatus: 'unit/getItemUnitsLoadStatus',
    }),
    sending() {
      return this.itemSendingStatus() === 1
    },
    showUndoImg() {
      return isEmpty(this.form.img) && !isEmpty(this.form.originalData.img)
    },
    editable() {
      return this.$can('Item:' + this.mode)
    },
    hasImg() {
      return !!this.imgUrl
    },
  },
  watch: {
    data(val) {
      if (!isEmpty(val)) {
        this.setForm()
      } else {
        this.clear()
      }
    },
  },
  created() {
    this.setForm()
    const vue = this
    this.$store.watch(
      this.$store.getters['item/getItemSendingStatus'],
      function () {
        const val = vue.itemSendingStatus()

        if (val === 3) {
          vue.errors.record(vue.response_errors)
          vue.$swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: vue.response_errors.message,
            footer: '<a href>Why do I have this issue?</a>',
          })
        } else if (val === 2) {
          vue.$swal.fire({
            position: 'top-end',
            icon: 'success',
            title: vue.response_message,
            showConfirmButton: false,
            timer: 1500,
          })
          vue.close()
        }
      }
    )
  },
  mounted() {
    if (this.categoriesLoadStatus() !== 2) {
      this.$store.dispatch('category/loadCategories')
    }

    if (this.itemUnitsLoadStatus() !== 2) {
      this.$store.dispatch('unit/loadItemUnits')
    }
    this.loadSubCategories()
  },
  methods: {
    setForm() {
      if (!isEmpty(this.data)) {
        const data = Object.assign({}, this.data)

        this.form.set(data)

        if (this.data.img) {
          this.imgUrl = this.data.img.original
          this.tinyImg = this.data.img.tiny
        }
      }
    },
    save() {
      if (this.itemSendingStatus() === 1) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          this.editItem()
        } else {
          this.addItem()
          // this.$store.dispatch('item/addItem', this.form.changedData())
        }
      }
    },
    addItem() {
      // const item = new this.$api.Item()
      const form = this.form.changedData()
      // // const formdata = new FormData()

      // console.log(1)
      // for (const field in form) {
      //   item[field] = form[field]
      // }
      // console.log(2)
      // if (this.imgChanged) {
      //   item.img = this.selectedFile
      // }
      // console.log(3, item)
      // item.save().then((resp) => {
      //   console.log(4)
      //   this.$swal.fire({
      //     position: 'top-end',
      //     icon: 'success',
      //     title: 'Item has been succesfuly saved.',
      //     showConfirmButton: false,
      //     timer: 1500,
      //   })
      //   console.log(5)

      const formdata = new FormData()
      for (const field in form) {
        formdata.append(field, form[field])
      }

      if (this.imgChanged) {
        formdata.append('img', this.selectedFile)
      }

      this.$axios
        .post('/laravel/api/item', formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          this.$swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Item has been succesfuly saved.',
            showConfirmButton: false,
            timer: 1500,
          })
          this.$emit('addItem', response.data)
          this.close()
        })
        .catch((error) => {
          this.showErrorMessage(error.response.data)
          this.errors.record(error.response.data)
          return error
        })
    },
    editItem() {
      const item = new this.$api.Item({ id: this.form.id })
      item.config({ method: 'POST', data: { _method: 'PUT' } })
      const form = this.form.changedData()

      for (const field in form) {
        item[field] = form[field]
      }

      if (this.imgChanged) {
        item.img = this.selectedFile
      }

      item.save().then((resp) => {
        this.$swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Item has been succesfuly saved.',
          showConfirmButton: false,
          timer: 1500,
        })

        const formChangedData = this.form.changedData()

        const updatedItem = { id: this.form.id, ...formChangedData }

        if ('category_id' in formChangedData) {
          updatedItem.category = this.categories.find(
            (i) => i.id === formChangedData.category_id
          )
        }

        if ('subcategory_id' in formChangedData) {
          updatedItem.subcategory = this.subcategories.find(
            (i) => i.id === formChangedData.subcategory_id
          )
        }

        if (this.imgChanged) {
          updatedItem.img = {
            original: this.imgUrl,
            thumb: this.imgUrl,
          }
        }

        this.$emit('updateItem', updatedItem)
        this.close()
      })
    },
    clear() {
      this.$v.$reset()
      this.errors.clear()
      this.form.clear()
      this.imgUrl = null
      this.tinyImg = null
      this.selectedFile = null
      this.imgChanged = false
    },
    close() {
      this.$emit('close')
      this.clear()
    },
    async loadSubCategories() {
      this.subcategories = await this.$api.SubCategory.get()
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
    },
  },
}
</script>
