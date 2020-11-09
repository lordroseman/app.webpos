<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="form.fname"
        label="First Name"
        :error-messages="errors.getAll('fname')"
        required
        :readonly="!editable"
      />
      <v-text-field
        v-model="form.lname"
        label="Last Name"
        :error-messages="errors.getAll('lname')"
        required
        :readonly="!editable"
      />
      <v-text-field
        v-model="form.vehicle_id"
        label="Vehicle ID"
        :error-messages="errors.getAll('vehicle_id')"
        required
        :readonly="!editable"
      />
      <v-text-field
        v-model="form.driver_license"
        label="Driver License"
        :error-messages="errors.getAll('driver_license')"
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
      form: new Form({
        id: null,
        fname: '',
        lname: '',
        vehicle_id: '',
        driver_license: '',
      }),
      errors: new Errors(),
    }
  },
  validations: {
    form: {
      fname: {
        required,
      },
      lname: {
        required,
      },
      vehicle_id: {
        required,
      },
      driver_license: {
        required,
      },
    },
  },
  computed: {
    mode() {
      return isEmpty(this.data) ? 'Add' : 'Edit'
    },
    formTitle() {
      return isEmpty(this.data) ? 'New Driver' : 'Edit Driver'
    },
    ...mapGetters({
      driverSendingStatus: 'driver/getDriverSendingStatus',
      response_errors: 'driver/getErrors',
      response_message: 'driver/getMessage',
    }),
    sending() {
      return this.driverSendingStatus() === 1
    },
    editable() {
      return this.$can('Driver:' + this.mode)
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
      } else {
        this.form.clear()
      }
    },
  },
  created() {
    this.setForm()
    const vue = this
    this.$store.watch(
      this.$store.getters['driver/getDriverSendingStatus'],
      function () {
        const val = vue.driverSendingStatus()

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
        this.$v.$reset()
        this.errors.clear()
      }
    },
    save() {
      if (this.driverSendingStatus() === 1) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          this.$store.dispatch('driver/editDriver', {
            id: this.form.id,
            data: this.form.changedData(),
          })
        } else {
          this.$store.dispatch('driver/addDriver', this.form.changedData())
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

<style></style>
