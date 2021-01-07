<template>
  <div>
    <div class="bg"></div>
    <v-app :dark="true" style="overflow-none">
      <v-scrollable :height="'calc(100vh - 36px)'">
        <app-bar />
        <nav-drawer />

        <!-- Sizes your content based upon application components -->
        <v-main>
          <!-- Provides the application the proper gutter -->
          <nuxt />
        </v-main>
      </v-scrollable>
      <v-footer>
        <v-spacer />
        <div>&copy; {{ new Date().getFullYear() }} DSSC</div>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
// import EventBus from '~/components/core/event-bus.js'

export default {
  middleware: ['admin'],
  name: 'DefaultLayout',
  beforeMount() {
    // this.miniVariant = localStorage.getItem('miniVariant') === 1
    // if (this.$vuetify.breakpoint.smAndDown) {
    //   this.drawer = false
    // }
  },
  mounted() {
    // EventBus.$on(
    //   'app-toggle',
    //   function () {
    //     this.miniVariant = !this.miniVariant
    //     localStorage.setItem('miniVariant', this.miniVariant ? 1 : 0)
    //   }.bind(this)
    // )
  },
  methods: {
    appToggle() {},
  },
}
</script>

<style>
html {
  overflow-y: hidden !important;
}
</style>
