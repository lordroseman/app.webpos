<template>
  <v-navigation-drawer v-model="drawer" app clipped :mini-variant="mini" dark>
    <v-list-item class="px-2">
      <v-list-item-avatar>
        <v-btn icon @click.stop="mini = !mini">
          <v-icon>{{
            !mini ? 'mdi-chevron-left' : 'mdi-chevron-right'
          }}</v-icon>
        </v-btn>
      </v-list-item-avatar>

      <v-list-item-title>Categories</v-list-item-title>
    </v-list-item>

    <v-divider />

    <v-list>
      <v-list-item-group>
        <v-list-item link @click="selectCategory(null)">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item-icon v-on="on">
                <v-icon>mdi-shape</v-icon>
              </v-list-item-icon>
            </template>
            <span>All Items</span>
          </v-tooltip>

          <v-list-item-content>
            <v-list-item-title>All Items</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="category in categories"
          :key="category.title"
          link
          @click="selectCategory(category)"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item-icon class="text-center" v-on="on">
                <span class="mx-auto">{{ category.title.substr(0, 1) }}</span>
              </v-list-item-icon>
            </template>
            <span>{{ category.title }}</span>
          </v-tooltip>

          <v-list-item-content>
            <v-list-item-title>{{ category.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import EventBus from '~/components/core/event-bus.js'

export default {
  props: {
    categories: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      mini: false,
      drawer: true,
    }
  },
  mounted() {
    EventBus.$on('app-toggle', (e) => {
      this.drawer = !this.drawer
      // eslint-disable-next-line no-console
      console.log(this.drawer)
    })
  },
  methods: {
    selectCategory(category) {
      this.$emit('selectCategory', category)
    },
  },
}
</script>
