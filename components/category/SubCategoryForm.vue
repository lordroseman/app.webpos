<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="form.title"
        label="Title"
        :error-messages="errors.getAll('title')"
        required
        :readonly="!editable"
      />

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
import { isEmpty } from 'lodash'
import EventBus from '@/components/core/event-bus'
import Form from '~/components/core/Form.js'
import Errors from '~/components/core/Errors.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'

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
      form: new Form({
        id: null,
        title: '',
      }),
      errors: new Errors(),
      sending: false,
    }
  },
  validations: {
    form: {
      title: {
        required,
      },
    },
  },
  computed: {
    mode() {
      return isEmpty(this.data) ? 'Add' : 'Edit'
    },
    formTitle() {
      return isEmpty(this.data) ? 'New Sub-Category' : 'Edit Sub-Category'
    },
    editable() {
      return this.$can('Category:' + this.mode)
    },
  },
  watch: {
    data(val) {
      this.setForm()
      this.$v.$reset()
      this.errors.clear()
    },
    show(val) {
      if (val) {
        this.$v.$reset()
        this.errors.clear()
      }
    },
  },
  created() {
    this.setForm()
  },
  methods: {
    setForm() {
      if (!isEmpty(this.data)) {
        this.form.set(this.data)
      }
    },
    async save() {
      if (this.sending) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          // edit
          const subcategory = new this.$api.SubCategory({ id: this.form.id })
          subcategory.title = this.form.title
          await subcategory.save()
          EventBus.$emit('editSubCategory', {
            id: this.form.id,
            title: this.form.title,
          })
        } else {
          // new
          const subcategory = new this.$api.SubCategory()
          subcategory.title = this.form.title

          const _sub = await subcategory.save()
          EventBus.$emit('newSubCategory', _sub)
        }

        this.$swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Sub-Category has been saved succesfully',
          showConfirmButton: false,
          timer: 1500,
        })
        this.close()
      }
    },
    close() {
      this.form.clear()
      this.$v.$reset()
      this.errors.clear()
      this.$emit('close')
    },
  },
}
</script>
