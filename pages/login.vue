<template>
  <v-container>
    <v-img
      src="/logo.png"
      lazy-src="/logo.png"
      width="400"
      class="mx-auto mb-3"
      elevation="8"
    >
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular
            indeterminate
            color="grey lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <v-card outlined class="mx-auto my-auto" width="500px" elevation="8">
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
              <v-alert v-if="serverOffline" type="error" dense>
                Error: Gateway Timeout! Server is offline
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="pink darken-1"
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
    <div class="mt-4 text-center">
      <span class="mx-auto white--text"
        >&copy; {{ new Date().getFullYear() }} DSSC
      </span>
    </div>
  </v-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors.js'

export default {
  layout: 'auth',
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
      generalError: '',
      serverOffline: false,
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
            } else if (error.response.status === 403) {
              this.errors.record({
                errors: {
                  username: 'Invalid Credentials',
                },
                message: 'Invalid Credentials',
              })
            } else if (error.response.status === 504) {
              this.serverOffline = true
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
