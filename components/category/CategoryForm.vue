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
import { mapGetters } from 'vuex'
import { isEmpty } from 'lodash'
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
      return isEmpty(this.data) ? 'New Category' : 'Edit Category'
    },
    ...mapGetters({
      categorySendingStatus: 'category/getCategorySendingStatus',
      response_errors: 'category/getErrors',
      response_message: 'category/getMessage',
    }),
    sending() {
      return this.categorySendingStatus() === 1
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
    const vue = this
    this.$store.watch(
      this.$store.getters['category/getCategorySendingStatus'],
      function () {
        const val = vue.categorySendingStatus()

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
  methods: {
    setForm() {
      if (!isEmpty(this.data)) {
        this.form.set(this.data)
      } else {
        this.form.clear()
      }
    },
    save() {
      if (this.categorySendingStatus() === 1) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          this.$store.dispatch('category/editCategory', {
            id: this.form.id,
            data: this.form.changedData(),
          })
        } else {
          this.$store.dispatch('category/addCategory', this.form.changedData())
        }
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
