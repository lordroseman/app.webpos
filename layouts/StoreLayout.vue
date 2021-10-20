<template>
  <div>
    <div class="page-gray"></div>
    <v-app>
      <appbar />

      <!-- Provides the application the proper gutter -->
      <v-main>
        <div v-if="hasActiveStore" class="mask">
          <div style="position: absolute; left: 260px; top: -30px">
            <img src="/arrow.png" height="200" />
            <span>Please select store here</span>
          </div>
        </div>
        <v-scrollable :height="scrollHeight">
          <router-view />
        </v-scrollable>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import { isNull } from 'lodash'
import { mapState } from 'vuex'
import Appbar from '~/components/StoreAppBar.vue'

export default {
  name: 'StoreLayout',
  middleware: ['store', 'permission'],
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
    showFooter() {
      const page = ['s-order-id']

      return page.findIndex((i) => i === this.$route.name) === -1
    },
    scrollHeight() {
      let height = `auto`
      const pages = ['s-order-id', 's']

      if (pages.findIndex((i) => i === this.$route.name) === -1) {
        height = `calc(100vh - 64px)`
      }

      return height
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
  background: #00000080;
  width: 100%;
  height: 100%;
  z-index: 5;
}

.mask span {
  font-size: xx-large;
  margin-left: -40px;
  color: white;
}
</style>
