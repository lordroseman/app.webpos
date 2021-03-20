<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="500px" persistent scrollable>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('User:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New System User
            </v-btn>
          </template>

          <user-form :user="selected_user" :show="dialog" @close="closeForm" />
        </v-dialog>
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <v-skeleton-loader
        ref="skeleton"
        type="table-tbody"
        class="mx-auto"
        :loading="loading"
      >
        <v-data-table :headers="headers" :items="users" :search="search">
          <template #[`item.avatar`]="{ item }">
            <v-avatar size="36">
              <img
                :src="
                  item.avatar
                    ? item.avatar
                    : require('@/static/default-avatar.png')
                "
              />
            </v-avatar>
          </template>
          <template #[`item.access_level`]="{ item }">
            {{ getAccessLevel(item.access_level) }}
          </template>
          <template #[`item.role`]="{ item }">
            <v-chip v-for="role in item.roles" :key="role.id" small>
              {{ role.name }}
            </v-chip>
          </template>
          <template #[`item.actions`]="{ item }">
            <v-hover v-slot:default="{ hover }">
              <v-speed-dial
                direction="left"
                :open-on-hover="true"
                transition="scale-transition"
              >
                <template v-slot:activator>
                  <v-btn color="secondary" dark fab x-small>
                    <v-icon v-if="hover"> mdi-close </v-icon>
                    <v-icon v-else> mdi-cog </v-icon>
                  </v-btn>
                </template>
                <template v-slot:default class="p-0">
                  <v-btn fab dark x-small color="blue" @click="edit(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="$can('User:Delete')"
                    fab
                    dark
                    x-small
                    color="red"
                    @click="remove(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-speed-dial>
            </v-hover>
          </template>
        </v-data-table>
      </v-skeleton-loader>
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { filter } from 'lodash'

export default {
  meta: {
    label: 'System Users',
    permission: 'User:View',
  },
  data() {
    return {
      search: null,
      selected_user: {},
      dialog: false,
      headers: [
        {
          text: '',
          value: 'avatar',
          sortable: false,
          width: 40,
        },
        {
          text: 'User ID',
          align: 'start',
          sortable: true,
          value: 'id',
        },
        {
          text: 'Entity',
          align: 'start',
          sortable: true,
          value: 'entity',
        },
        {
          text: 'Name',
          align: 'start',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Username',
          align: 'start',
          sortable: true,
          value: 'username',
        },
        {
          text: 'Access Level',
          align: 'start',
          sortable: true,
          value: 'access_level',
        },
        {
          text: 'Role',
          align: 'start',
          sortable: true,
          value: 'role',
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
    }
  },
  computed: {
    ...mapState({
      users: (state) => state.user.users,
      usersLoadStatus: (state) => state.user.usersLoadStatus,
      userDeletingStatus: (state) => state.user.userDeletingStatus,
      access_level: (state) => state.user.access_level,
      errors: (state) => state.user.errors,
    }),
    loading() {
      return this.usersLoadStatus === 1
    },
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'System Users')
  },
  mounted() {
    this.loadUsers()
  },
  methods: {
    loadUsers() {
      this.$store.dispatch('user/loadUsers')
    },
    closeForm() {
      this.dialog = false
      this.selected_user = {}
    },
    remove(user) {
      this.$swal
        .fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          showLoaderOnConfirm: true,
          preConfirm: (e) => {
            return new Promise((resolve, reject) => {
              this.$store.dispatch('user/deleteUser', user.id)
              const vue = this
              this.$store.watch(
                this.$store.getters['user/getUserDeletingStatus'],
                function () {
                  if (vue.userDeletingStatus === 2) {
                    resolve(true)
                  } else if (vue.userDeletingStatus === 3) {
                    reject(vue.errors)
                    this.$swal.showValidationMessage(
                      `Request failed: ${vue.errors.message}`
                    )
                  }
                }
              )
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire('Deleted!', 'User has been deleted.', 'success')
          }
        })
    },
    edit(user) {
      this.selected_user = user
      this.dialog = true
    },
    getAccessLevel(accessLevel) {
      if (typeof accessLevel === 'object') {
        return accessLevel.text
      }

      const lvl = filter(this.access_level, (i) => i.value === accessLevel)

      if (!lvl[0]) {
        return null
      }

      return lvl[0].text
    },
  },
  head: {
    title: 'System User',
  },
}
</script>

<style></style>
