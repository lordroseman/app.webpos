<template>
  <v-container>
    <v-img
      src="/ribshack logo.png"
      lazy-src="/ribshack logo.png"
      width="300"
      class="mx-auto mb-3"
    />
    <v-card outlined class="mx-auto my-auto" width="500px">
      <v-row>
        <v-col border="left">
          <v-card-text>
            <div class="mb-3">
              <v-card-title class="text-center">
                <span class="mx-auto">LOG IN</span>
              </v-card-title>
            </div>
            <v-form>
              <v-text-field
                v-model="form.username"
                label="Username"
                outlined
                prepend-inner-icon="mdi-account-circle"
                :error-messages="errors.getAll('username')"
              />
              <v-text-field
                v-model="form.password"
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                name="password"
                label="Password"
                outlined
                prepend-inner-icon="mdi-lock"
                :error-messages="errors.getAll('password')"
                @click:append="show = !show"
                @keypress.enter="login"
              />
              <v-alert v-if="hasError" type="error" dense>
                Invalid credentials
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="success"
              :loading="loading"
              dark
              block
              large
              @click="login"
            >
              Login
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors.js'

export default {
  name: 'LoginPage',
  mixins: [FormValidationMixins],
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      show: false,
      hasError: false,
      loading: false,
      errors: new Errors(),
    }
  },
  methods: {
    login() {
      if (this.loading) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.loading = true

        this.$auth
          .loginWith('laravelSanctum', {
            data: {
              username: this.form.username,
              password: this.form.password,
              device_name: 'access_token',
            },
          })
          .then((resp) => {
            // this.$auth.setUserToken(resp.data)
            // // this.$axios.setToken(resp.data, 'Bearer')
            // // eslint-disable-next-line no-console
            // console.log(resp)
            this.loading = false
          })
          .catch((error, resp) => {
            if (error.response.status === 422) {
              this.errors.record(error.response.data)
            } else {
              alert(error.message)
            }

            this.loading = false
          })
      }
    },
    loginSocial(provider) {
      this.axios
        .get('/sanctum/csrf-cookie', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        })
        .then(() => {
          window.location = `/login/${provider}`
        })
    },
  },
  head: {
    title: 'Login',
  },
  layout: 'login',
  validations: {
    form: {
      username: {
        required,
      },
      password: {
        required,
      },
    },
  },
}
</script>
