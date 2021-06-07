<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="500px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Sub-Category:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New
            </v-btn>
          </template>

          <sub-category-form :data="selected_subcategory" @close="closeForm" />
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
        <v-data-table
          :headers="headers"
          :items="subcategories"
          :search="search"
        >
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
                    v-if="$can('Sub-Category:Delete')"
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
import EventBus from '@/components/core/event-bus'
export default {
  meta: {
    label: 'Sub-Category',
    permission: 'Sub-Category:View',
    access_level: 1,
  },
  data() {
    return {
      headers: [
        {
          text: 'Title',
          align: 'start',
          sortable: true,
          value: 'title',
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end',
          width: '40',
        },
      ],
      options: {},
      dialog: false,
      search: '',
      selected_subcategory: {},
      loading: true,
      subcategories: [],
    }
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Subcategory')
  },
  mounted() {
    EventBus.$on('newSubCategory', this.addSubCategory)
    EventBus.$on('editSubCategory', this.updateSubCategory)
    this.loadCateogries()
  },
  methods: {
    async loadCateogries() {
      this.subcategories = await this.$api.SubCategory.get()
      this.loading = false
    },
    addSubCategory(category) {
      this.subcategories.push(category)
    },
    updateSubCategory(category) {
      const ind = this.subcategories.findIndex((i) => i.id === category.id)

      if (ind > -1) {
        this.subcategories[ind].title = category.title
      }
    },
    close() {
      this.dialog = false
    },
    edit(subcategory) {
      this.selected_subcategory = subcategory
      this.dialog = true
    },
    remove(subcategory) {
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
              resolve(subcategory.delete())
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire(
              'Deleted!',
              'Subcategory  has been deleted.',
              'success'
            )
            this.removeSubcategory(subcategory)
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_subcategory = {}
    },
    removeSubcategory(subcategory) {
      const ind = this.subcategories.findIndex((i) => i.id === subcategory.id)
      if (ind > -1) {
        this.subcategories.splice(ind, 1)
      }
    },
  },
  head: {
    title: 'Sub-Category',
  },
}
</script>

<style>
.v-speed-dial__list {
  padding: 0 0 !important;
}
</style>
