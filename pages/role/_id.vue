<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        New Role
        <v-spacer />
        <v-btn v-if="editable" color="primary" @click="save"> Save </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.name"
              label="Role Name"
              required
              :error-messages="errors.getAll('name')"
            />
          </v-col>
        </v-row>
        <v-divider />

        <h5>Add Module</h5>
        <v-row>
          <v-col>
            <v-autocomplete
              v-model="activeModules"
              :items="modules"
              hide-selected
              label="Modules"
              multiple
              persistent-hint
              small-chips
            >
              <template #selection="{ attrs, item }">
                <v-chip
                  v-bind="attrs"
                  close
                  small
                  @click:close="removeModule(item)"
                >
                  <span>{{ item }}</span>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <h5 v-if="hasModules">Permissions</h5>
        <v-row>
          <v-col v-for="module in activeModules" :key="module" cols="12" lg="6">
            <v-combobox
              v-model="permission[module]"
              :items="getItems(module)"
              hide-selected
              :label="module"
              multiple
              persistent-hint
              small-chips
              item-text="name"
            >
              <template #selection="{ attrs, item }">
                <v-chip
                  v-bind="attrs"
                  :color="getColor(item)"
                  close
                  small
                  text-color="white"
                  @click:close="remove(module, item)"
                >
                  <span>{{ showItemText(item) }}</span>
                </v-chip>
              </template>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      No results matching. Press <kbd>enter</kbd> to create a
                      new one
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
          </v-col>
        </v-row>
        <v-divider />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { reject } from 'lodash'
import Role from '@/models/Role'
import Form from '~/components/core/Form.js'
import FormValidationMixins from '~/plugins/FormValidationMixins.vue'
import Errors from '~/components/core/Errors.js'

export default {
  meta: {
    label: 'Role',
    permission: 'Role:View',
    access_level: 1,
  },
  mixins: [FormValidationMixins],
  async asyncData({ params }) {
    let role = null
    if (params.id !== 'new') {
      role = await Role.where('id', params.id).include('permissions').first()
    }

    const permissionList = await Role.custom('/role/permissions').get()

    return {
      role,
      permissionList,
    }
  },
  data() {
    return {
      modules: [
        'Transaction',
        'Inventory Adjustment',
        'Customer',
        'Report',
        'Store',
        'Item',
        'Category',
        'Item Unit',
        'City',
        'Driver',
        'User',
        'Role',
      ],
      activeModules: [],
      permission: {},
      form: new Form({
        id: null,
        name: '',
        guard_name: '',
      }),
      sending: false,
      errors: new Errors(),
      colors: {
        view: 'secondary',
        add: 'green',
        edit: 'blue',
        delete: 'red',
        print: 'purple',
      },
      backdoor: 0,
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
    mode() {
      return this.form.id != null ? 'Add' : 'Edit'
    },
    hasModules() {
      return this.activeModules.length > 0
    },
    editable() {
      if (this.form.name === 'super-admin') {
        return false
      } else {
        return this.$can('Role:' + this.mode)
      }
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Role & Permission')
    // eslint-disable-next-line no-console
    this.setForm()
  },
  methods: {
    setForm() {
      if (this.role) {
        const role = this.role
        const permissions = role.permissions
        this.form.set({
          id: role.id,
          name: role.name,
          guard_name: role.guard_name,
        })

        for (const row of permissions) {
          const perm = row.name.split(':')

          if (perm[0] in this.permission) {
            this.permission[perm[0]].push(perm[1])
          } else {
            this.activeModules.push(perm[0])
            this.permission[perm[0]] = [perm[1]]
          }
        }
      }
    },
    save() {
      if (this.sending) {
        return
      }

      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.form.id != null) {
          // update
          this.role.permission = this.permission
          this.role.name = this.form.name
          this.role.save().then(() => {
            this.$swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Roles & Permissions has been saved',
              showConfirmButton: false,
              timer: 1500,
            })
          })
        } else {
          const data = {
            role: this.form.changedData(),
            permission: this.permission,
          }
          const role = new Role(data)
          role.save().then(() => {
            this.$swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Roles & Permissions has been saved',
              showConfirmButton: false,
              timer: 1500,
            })
          })
        }
      }
    },
    getColor(item) {
      if (typeof item === 'string') {
        return this.colors[item.toLowerCase()] || 'grey'
      } else {
        const perm = item.name.split(':')
        return this.colors[perm[1]]
      }
    },
    remove(module, permission) {
      if (!this.editable) {
        return
      }

      this.permission[module] = reject(
        this.permission[module],
        (i) => i === permission
      )
      this.backdoor++
    },
    removeModule(module) {
      if (!this.editable) {
        return
      }
      this.activeModules = reject(this.activeModules, (i) => i === module)
    },
    getItems(module) {
      const list = []
      for (const row of this.permissionList) {
        const perm = row.name.split(':')
        if (perm[0] === module) {
          list.push(perm[1])
        }
      }
      // eslint-disable-next-line no-unused-expressions
      this.backdoor
      return list
    },
    showItemText(item) {
      if (typeof item === 'string') {
        return item
      } else {
        const perm = item.name.split(':')
        return perm[1]
      }
    },
  },
  head: {
    title: 'Role',
  },
}
</script>
