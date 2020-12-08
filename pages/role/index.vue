<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-btn
          v-if="$can('Role:Add')"
          color="success"
          dark
          class="mb-2"
          rounded
          @click="addNew"
        >
          <v-icon>mdi-plus</v-icon>New Role
        </v-btn>
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
        <v-data-table :headers="colHeaders" :items="roles" :search="search">
          <template #[`item.created_at`]="{ item }">
            {{ formatDate(item.created_at, 'MM/dd/yyyy hh:mm:ss') }}
          </template>

          <template #[`item.updated_at`]="{ item }">
            {{ formatDate(item.updated_at, 'MM/dd/yyyy hh:mm:ss') }}
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
                    v-if="$can('Role:Delete')"
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
import Role from '@/models/Role'

export default {
  meta: {
    label: 'Role',
    permission: 'Role:View',
    access_level: 1,
  },
  async asyncData() {
    const roles = await Role.get()
    return {
      roles,
    }
  },
  data() {
    return {
      colHeaders: [
        { text: 'Name', value: 'name' },
        { text: 'Guard Name', value: 'guard_name' },
        { text: 'Created At', value: 'created_at' },
        { text: 'Updated At', value: 'updated_at' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      search: '',
      loading: false,
    }
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Role & Permission')
  },
  methods: {
    addNew() {
      this.$router.push('/role/new')
    },
    edit(role) {
      this.$router.push('/role/' + role.id)
    },
  },
  head: {
    title: 'Role',
  },
}
</script>

<style></style>
