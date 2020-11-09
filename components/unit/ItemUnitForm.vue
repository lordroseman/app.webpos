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
      />

      <v-text-field
        v-model="form.abbrev"
        label="Abbreviation"
        :error-messages="errors.getAll('abbrev')"
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
import { required, maxLength } from 'vuelidate/lib/validators'
import FormValidationMixins from '@/plugins/FormValidationMixins.vue'
import { mapGetters } from 'vuex'
import { isEmpty } from 'lodash'
import Errors from '~/components/core/Errors.js'
import Form from '~/components/core/Form.js'

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
        abbrev: '',
      }),
      errors: new Errors(),
      attributes: {
        abbrev: 'Abbreviation',
      },
    }
  },
  validations: {
    form: {
      title: {
        required,
      },
      abbrev: {
        required,
        maxLength: maxLength(15),
      },
    },
  },
  computed: {
    mode() {
      return isEmpty(this.data) ? 'Add' : 'Edit'
    },
    formTitle() {
      return isEmpty(this.data) ? 'New Item Unit' : 'Edit Item Unit'
    },
    ...mapGetters({
      itemUnitSendingStatus: 'unit/getItemUnitSendingStatus',
      response_errors: 'unit/getErrors',
      response_message: 'unit/getMessage',
    }),
    sending() {
      return this.itemUnitSendingStatus() === 1
    },
    editable() {
      return this.$can('Item Unit:' + this.mode)
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
      this.$store.getters['unit/getItemUnitSendingStatus'],
      function () {
        const val = vue.itemUnitSendingStatus()

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
      }
    },
    save() {
      if (this.itemUnitSendingStatus() === 1) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          this.$store.dispatch('unit/editItemUnit', {
            id: this.form.id,
            data: this.form.changedData(),
          })
        } else {
          this.$store.dispatch('unit/addItemUnit', this.form.changedData())
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
