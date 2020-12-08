<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto">
      <v-card-title>
        <v-dialog v-model="dialog" max-width="500px" persistent>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$can('Category:Add')"
              color="success"
              dark
              class="mb-2"
              rounded
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>New Category
            </v-btn>
          </template>

          <category-form :data="selected_category" @close="closeForm" />
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
        <v-data-table :headers="headers" :items="categories" :search="search">
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
                    v-if="$can('Category:Delete')"
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
import { mapGetters, mapState } from 'vuex'
export default {
  meta: {
    label: 'Category',
    permission: 'Category:View',
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
      selected_category: {},
    }
  },
  computed: {
    ...mapState({
      errors: (state) => state.category.errors,
    }),
    ...mapGetters({
      categories: 'category/getCategories',
      categoriesLoadStatus: 'category/getCategoriesLoadStatus',
      categoryDeletingStatus: 'category/getCategoryDeletingStatus',
    }),
    loading() {
      return this.categoriesLoadStatus() !== 2
    },
  },

  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Category')
  },
  mounted() {
    if (this.categoriesLoadStatus() !== 2) {
      this.loadCateogries()
    }
  },
  methods: {
    loadCateogries() {
      this.$store.dispatch('category/loadCategories')
    },
    close() {
      this.dialog = false
    },
    edit(category) {
      this.selected_category = category
      this.dialog = true
    },
    remove(category) {
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
              this.$store.dispatch('category/deleteCategory', category.id)
              const vue = this
              this.$store.watch(
                this.$store.getters['category/getCategoryDeletingStatus'],
                function () {
                  if (vue.categoryDeletingStatus() === 2) {
                    resolve(true)
                  } else if (vue.categoryDeletingStatus() === 3) {
                    reject(this.errors)
                    this.$swal.showValidationMessage(
                      `Request failed: ${this.errors.message}`
                    )
                  }
                }
              )
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire(
              'Deleted!',
              'Category  has been deleted.',
              'success'
            )
          }
        })
    },
    closeForm() {
      this.dialog = false
      this.selected_category = {}
    },
  },
  head: {
    title: 'Category',
  },
}
</script>

<style>
.v-speed-dial__list {
  padding: 0 0 !important;
}
</style>
