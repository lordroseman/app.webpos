<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="form.name"
        label="Name"
        :error-messages="errors.getAll('name') || errors.getAll('city.name')"
        required
        autocomplete="off"
        :readonly="!editable"
      />

      <barangay
        :city="form.id"
        :barangays.sync="barangays"
        :editable="editable"
        :loading="brgyLoading"
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
import { mapGetters, mapState } from 'vuex'
import { isEmpty, isNull, reject, find } from 'lodash'
import Form from '~/components/core/Form'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors'
import Barangay from '~/models/Barangay'

export default {
  meta: {
    label: 'City',
  },
  mixins: [FormValidationMixins],
  props: {
    data: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: new Form({
        id: null,
        name: '',
      }),
      barangays: [],
      errors: new Errors(),
      brgyLoading: false,
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
    ...mapGetters({
      citySendingStatus: 'city/getCitySendingStatus',
    }),
    ...mapState({
      response_errors: (state) => state.city.errors,
      response_message: (state) => state.city.message,
      response_data: (state) => state.city.response,
    }),
    mode() {
      return this.form.id ? 'Edit' : 'Add'
    },
    formTitle() {
      return this.form.id ? 'Edit City' : 'New City'
    },
    sending() {
      return false
    },
    params() {
      const param = {}

      if (this.form.hasChanges()) {
        param.city = this.form.changedData()
      }

      const changes = this.barangays.filter((r) => {
        return r._state !== '' && r._state !== 'pre_new'
      })

      if (changes.length > 0) {
        param.barangay = changes
      }

      return param
    },
    editable() {
      return this.$can('City:' + this.mode)
    },
  },
  watch: {
    data(val) {
      this.setForm()
    },
  },
  created() {
    this.setForm()
    const vue = this
    this.$store.watch(
      this.$store.getters['city/getCitySendingStatus'],
      function () {
        const val = vue.citySendingStatus()

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

          vue.applychanges()
          // vue.close();
        }
      }
    )
  },
  methods: {
    setForm() {
      if (!isEmpty(this.data)) {
        this.form.set(this.data)
        this.brgyLoading = true
        Barangay.custom('barangay/search')
          .where('city_id', this.data.id)
          .get()
          .then((resp) => {
            this.barangays = []
            for (const brgy of resp) {
              brgy._original = Object.assign({}, brgy)
              this.barangays.push(brgy)
            }
          })
          .finally(() => {
            this.brgyLoading = false
          })
      }
    },
    close() {
      this.form.clear()
      this.$v.$reset()
      this.barangays = [
        {
          name: null,
          _id: new Date().getTime(),
          _state: 'pre_new',
        },
      ]
      this.$emit('close')
    },
    save() {
      if (this.citySendingStatus() === 1) {
        return
      }

      this.$v.$touch()

      if (!this.$v.invalid) {
        if (isNull(this.form.id)) {
          this.$store.dispatch('city/addCity', this.params)
        } else {
          this.$store.dispatch('city/editCity', {
            id: this.form.id,
            data: this.params,
          })
        }
      }
    },
    applychanges() {
      if (this.form.hasChanges()) {
        this.form.id = this.response_data.city.id
        this.form.confirmChanges()
      }

      if ('barangay' in this.response_data) {
        const brgyResponse = this.response_data.barangay

        for (const brgy of this.barangays) {
          if (brgy._state === 'new') {
            const newBrgy = find(brgyResponse, ['_id', brgy._id])
            brgy.id = newBrgy.id
            brgy._state = ''
            brgy._original = Object.assign({}, brgy)
          } else if (brgy._state === 'edited') {
            brgy._state = ''
            brgy._original.name = brgy.name
          }
        }

        // remove deleted
        this.barangays = reject(this.barangays, {
          _state: 'deleted',
        })
      }
    },
  },
}
</script>

<style></style>
