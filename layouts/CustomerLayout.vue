<template>
  <div>
    <v-app>
      <side-nav :visible="showSideNav" @hide="showSideNav = false" />

      <v-main>
        <router-view />
      </v-main>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'CustomerLayout',
  middleware: ['customer'],
  data() {
    return {
      showSideNav: false,
    }
  },
}
</script>
