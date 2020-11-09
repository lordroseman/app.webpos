<template>
  <v-card>
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
        :readonly="!editable"
      />
      <v-text-field
        v-model="form.username"
        label="Username"
        required
        :error-messages="errors.getAll('username')"
        :readonly="!editable"
      />
      <v-text-field
        v-model="form.password"
        label="Password"
        required
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        :error-messages="errors.getAll('password')"
        :readonly="!editable"
        @click:append="showPassword = !showPassword"
      />
      <v-autocomplete
        v-model="form.access_level"
        :items="access_levels"
        label="Access Level"
        :error-messages="errors.getAll('access_level')"
        :readonly="!editable"
      />
      <v-autocomplete
        v-if="isAccessStoreAdmin"
        v-model="form.stores"
        :items="store_list"
        label="Store"
        item-text="name"
        item-value="id"
        multiple
        :error-messages="errors.getAll('store')"
        :readonly="!editable"
      />
      <v-autocomplete
        v-if="isAccessCustomer"
        v-model="customer"
        :items="customers"
        :search-input.sync="search_customer"
        label="Customer"
        item-value="id"
        :error-messages="errors.getAll('entity')"
        :readonly="!editable"
      >
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <div v-if="!search_customer">Type to search...</div>
                <div v-else>
                  No results matching "
                  <strong>{{ search_customer }}</strong
                  >".
                </div>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template #item="{ item }">
          {{ item.fname }} {{ item.lname }}
        </template>
        <template #selection="{ item }">
          {{ item.fname }} {{ item.lname }}
        </template>
      </v-autocomplete>
      <v-autocomplete
        v-if="isAccessDriver"
        v-model="driver"
        :items="drivers"
        label="Driver"
        :search-input.sync="search_driver"
        :error-messages="errors.getAll('entity')"
        :readonly="!editable"
        item-value="id"
      >
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <div v-if="!search_driver">Type to search...</div>
                <div v-else>
                  No results matching "
                  <strong>{{ search_driver }}</strong
                  >".
                </div>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>

        <template #item="{ item }">
          {{ item.fname }} {{ item.lname }}
        </template>
        <template #selection="{ item }">
          {{ item.fname }} {{ item.lname }}
        </template>
      </v-autocomplete>
      <v-autocomplete
        v-model="form.role"
        :items="role_list"
        label="User Role"
        item-text="name"
        item-value="id"
        :error-messages="errors.getAll('role')"
        :readonly="!editable"
      />
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-spacer />
      <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
      <v-btn v-if="editable" color="blue darken-1" text @click="save">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import VImageInput from 'vuetify-image-input'
import { required } from 'vuelidate/lib/validators'
import { mapGetters, mapState } from 'vuex'
import { isEmpty, isNull, debounce } from 'lodash'
import Role from '@/models/Role'
import Customer from '@/models/Customer.js'
import Driver from '@/models/Driver.js'
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
  props: {
    show: {
      type: Boolean,
      default: null,
    },
    user: {
      type: Object,
      default: null,
    },
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
        role: null,
      }),
      errors: new Errors(),
      showPassword: false,
      attributes: {
        access_level: 'Access Level',
      },
      role_list: [],
      customers: [],
      customer: null,
      search_customer: '',
      drivers: [],
      driver: null,
      search_driver: '',
      searching: false,
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
      access_level: {
        required,
      },
    },
  },
  computed: {
    ...mapState({
      response_errors: (state) => state.user.errors,
      response_message: (state) => state.user.message,
      response_data: (state) => state.user.response,
      access_levels: (state) => state.user.access_level,
      store_list: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
    }),
    ...mapGetters({
      userSendingStatus: 'user/getUserSendingStatus',
    }),
    mode() {
      return isNull(this.form.id) ? 'Add' : 'Edit'
    },
    editable() {
      return this.$can('User:' + this.mode)
    },
    isAccessStoreAdmin() {
      if (this.form.access_level) {
        return this.form.access_level === 2
      }

      return false
    },
    isAccessCustomer() {
      if (this.form.access_level) {
        return this.form.access_level === 3
      }

      return false
    },
    isAccessDriver() {
      if (this.form.access_level) {
        return this.form.access_level === 4
      }

      return false
    },
  },
  watch: {
    user(val) {
      this.setForm()
    },
    show(val) {
      this.clear()
      if (val) {
        this.setForm()
      }
    },
    driver() {
      if (this.isAccessDriver) {
        this.form.entity = 'driver'
        this.form.entity_id = this.driver
      } else if (!this.isAccessCustomer) {
        this.form.entity = null
        this.form.entity_id = null
      }
    },
    customer() {
      if (this.isAccessCustomer) {
        this.form.entity = 'customer'
        this.form.entity_id = this.customer
      } else if (!this.isAccessDriver) {
        this.form.entity = null
        this.form.entity_id = null
      }
    },
    search_customer(val) {
      this.getCustomers(this)
    },
    search_driver(val) {
      this.getDrivers(this)
    },
  },
  created() {
    this.loadStores()
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
  async beforeMount() {
    this.role_list = await Role.get()
  },
  mounted() {
    this.clear()
    this.setForm()
  },
  methods: {
    setForm() {
      if (!isEmpty(this.user)) {
        const user = Object.assign({}, this.user)
        user.role = user.roles[0] ? user.roles[0].id : null
        this.form.set(user)
      }
    },
    clear() {
      this.form.clear()
      this.$v.$reset()
    },
    close() {
      this.$emit('close')
    },
    save() {
      if (this.userSendingStatus() === 1) {
        return
      }

      this.$v.$touch()

      if (!this.$v.$invalid) {
        if (isNull(this.form.id)) {
          this.$store.dispatch('user/addUser', this.form.changedData())
        } else {
          this.$store.dispatch('user/editUser', {
            id: this.form.id,
            data: this.form.changedData(),
          })
        }
      }
    },
    applyChanges() {
      if (this.form.hasChanges()) {
        const { id } = this.response_data
        this.form.id = id
        this.form.confirmChanges()
      }
    },
    getAccessLevel(accessLevel) {
      if (!accessLevel) {
        return
      }
      return this.access_levels.filter((i) => i.value === accessLevel)[0]
    },
    loadStores() {
      if (this.storesLoadStatus !== 2) {
        this.$store.dispatch('store/loadStores')
      }
    },
    getCustomers: debounce((vm) => {
      if (vm.searching) {
        return
      }

      if (vm.search_customer === '') {
        return
      }

      Customer.custom('/customer/search')
        .where('full_name', vm.search_customer)
        .get()
        .then((resp) => {
          vm.customers = resp
        })
        .finally(() => {
          vm.searching = false
        })
    }, 300),
    getDrivers: debounce((vm) => {
      if (vm.searching) {
        return
      }

      if (vm.search_driver === '') {
        return
      }

      Driver.where('name', vm.search_driver)
        .get()
        .then((resp) => {
          vm.drivers = resp
        })
        .finally(() => {
          vm.searching = false
        })
    }, 300),
  },
}
</script>

<style></style>
