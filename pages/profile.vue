<template>
  <v-container fluid>
    <v-card class="mx-auto" width="80%">
      <v-card-title
        >User :: {{ form.id ? padStart(form.id, 5, 0) : 'NEW' }}</v-card-title
      >
      <v-card-text>
        <div class="d-flex">
          <v-image-input
            :key="form.id"
            v-model="form.avatar"
            class="mx-auto"
            :image-quality="0.85"
            image-format="jpeg"
            :image-width="100"
            :image-height="100"
            clearable
          />
        </div>
        <v-text-field
          v-model="form.name"
          label="Name"
          required
          :error-messages="errors.getAll('name')"
        />
        <v-text-field
          v-model="form.username"
          label="Username"
          required
          :error-messages="errors.getAll('username')"
        />
        <v-text-field
          v-model="form.password"
          label="Password"
          required
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          :error-messages="errors.getAll('password')"
          @click:append="showPassword = !showPassword"
        />
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import VImageInput from 'vuetify-image-input'
import { required } from 'vuelidate/lib/validators'
import { mapGetters, mapState } from 'vuex'
import { isEmpty } from 'lodash'
import Form from '~/components/core/Form.js'
import Errors from '~/components/core/Errors.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'

function requirePass(value) {
  if (this.form.id) {
    return true
  } else {
    return required(value)
  }
}

export default {
  components: {
    VImageInput,
  },
  mixins: [FormValidationMixins],
  meta: {
    label: 'My Profile',
    access_level: 1,
  },
  data() {
    return {
      form: new Form({
        id: null,
        entity: '',
        entity_id: '',
        name: '',
        username: '',
        password: '',
        avatar: null,
        access_level: '',
        stores: null,
      }),
      errors: new Errors(),
      showPassword: false,
      attributes: {
        access_level: 'Access Level',
      },
    }
  },

  validations: {
    form: {
      name: {
        required,
      },
      username: {
        required,
      },
      password: {
        required: requirePass,
      },
    },
  },
  computed: {
    ...mapState({
      response_errors: (state) => state.user.errors,
      response_message: (state) => state.user.message,
      response_data: (state) => state.user.response,
    }),
    ...mapGetters({
      userSendingStatus: 'user/getUserSendingStatus',
    }),
    isAccessStoreAdmin() {
      if (this.form.access_level) {
        return this.form.access_level.value === 2
      }

      return false
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'My Profile')
  },
  created() {
    const vue = this
    this.$store.watch(
      this.$store.getters['user/getUserSendingStatus'],
      function () {
        const val = vue.userSendingStatus()

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

          vue.applyChanges()
          // vue.close();
        }
      }
    )
  },
  mounted() {
    this.setForm()
  },
  methods: {
    setForm() {
      if (!isEmpty(this.$auth.user)) {
        const user = Object.assign({}, this.$auth.user)
        this.form.set(user)
      }
    },
    save() {
      if (this.userSendingStatus() === 1) {
        return
      }

      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.$store.dispatch('user/editUser', {
          id: this.form.id,
          data: this.form.changedData(),
        })
      }
    },
    applyChanges() {
      if (this.form.hasChanges()) {
        const { id } = this.response_data
        this.form.id = id
        this.form.confirmChanges()
        this.$auth.setUser(Object.assign({}, this.form.originalData))
      }
    },
  },
}
</script>

<style></style>
