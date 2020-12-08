<template>
  <div>
    <div class="bg"></div>
    <v-app>
      <v-scrollable :height="'calc(100vh - 36px)'">
        <appbar />

        <!-- Provides the application the proper gutter -->
        <v-main>
          <div v-if="hasActiveStore" class="mask" />

          <router-view />
        </v-main>
      </v-scrollable>
      <v-footer app dense>
        <v-spacer />
        <div>&copy; {{ new Date().getFullYear() }} DSSC</div>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
import { isNull } from 'lodash'
import { mapState } from 'vuex'
import Appbar from '~/components/StoreAppBar.vue'

export default {
  name: 'StoreLayout',
  middleware: ['store'],
  components: {
    Appbar,
  },
  computed: {
    ...mapState({
      active_store: (state) => state.app.store,
    }),
    hasActiveStore() {
      return isNull(this.active_store)
    },
  },
}
</script>
<style>
html {
  overflow-y: hidden !important;
}
.mask {
  position: fixed;
  top: 64px;
  left: 0px;
  background: #00000050;
  width: 100%;
  height: 100%;
  z-index: 5;
}
</style>
