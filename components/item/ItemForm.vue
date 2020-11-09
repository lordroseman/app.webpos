<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12" sm="6">
            <v-image-input
              :key="form.id || 'new_img'"
              v-model="form.img"
              :image-quality="0.85"
              clearable
              image-format="jpeg"
              :image-width="200"
              :image-height="200"
              :readonly="!editable"
            />
            <v-btn v-if="showUndoImg" text @click="undoImg"> Undo </v-btn>
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
                <v-text-field
                  v-model="form.description"
                  label="Description"
                  required
                  :error-messages="errors.getAll('description')"
                  :readonly="!editable"
                />
              </v-col>
              <v-col cols="12" sm="6">
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
              <v-col cols="12" sm="6">
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
import VImageInput from 'vuetify-image-input'
import { isEmpty } from 'lodash'
import Form from '~/components/core/Form.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors.js'

export default {
  components: {
    VImageInput,
  },
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
        img: '',
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
  },
  watch: {
    data(val) {
      this.setForm()
      // this.$v.$reset();
      // this.errors.clear();
    },
    show(val) {
      if (val) {
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
  },
  methods: {
    setForm() {
      if (!isEmpty(this.data)) {
        const data = Object.assign({}, this.data)
        if ('image_base64' in data) {
          data.img = `data:${data.image_mime};base64,${data.image_base64}`
        }
        this.form.set(data)
      }
    },
    undoImg() {
      this.form.img = this.form.originalData.img
    },
    save() {
      if (this.itemSendingStatus() === 1) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          this.$store.dispatch('item/editItem', {
            id: this.form.id,
            data: this.form.changedData(),
          })
        } else {
          this.$store.dispatch('item/addItem', this.form.changedData())
        }
      }
    },
    clear() {
      this.$v.$reset()
      this.errors.clear()
      this.form.clear()
    },
    close() {
      this.clear()
      this.$emit('close')
    },
  },
}
</script>
