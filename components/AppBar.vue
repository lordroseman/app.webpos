<template>
  <v-app-bar app :elevate-on-scroll="true">
    <v-app-bar-nav-icon @click="toggle" />
    <v-toolbar-title>{{ navHeader }}</v-toolbar-title>

    <v-spacer />

    <v-btn icon @click="isDark = !isDark">
      <v-icon>{{ isDark ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
    </v-btn>
    <v-menu left bottom>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <nuxt-link to="/profile" exact tag="v-list-item">
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item-content>
        </nuxt-link>

        <v-list-item color="#F00" @click="logout">
          <v-list-item-icon>
            <v-icon color="#F00"> mdi-logout </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title> Logout </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { mapState } from 'vuex'
import EventBus from '~/components/core/event-bus.js'

export default {
  data() {
    return {
      isDark: false,
    }
  },
  computed: {
    ...mapState({
      navHeader: (state) => state.app.navHeader,
      drawer: (state) => state.app.drawer,
      miniVariant: (state) => state.app.miniVariant,
    }),
  },
  watch: {
    isDark(value) {
      this.$vuetify.theme.dark = value
      localStorage.setItem('dark', value ? 1 : 0)
    },
  },
  beforeMount() {
    this.isDark = localStorage.getItem('dark') === 1
  },
  methods: {
    toggle() {
      EventBus.$emit('app-toggle')
      if (this.drawer) {
        this.$store.dispatch('app/setMiniVariant', !this.miniVariant)
      } else {
        this.$store.dispatch('app/setDrawer', true)
      }
    },
    async logout() {
      await this.$auth.logout()
    },
  },
}
</script>
