<template>
  <v-container fluid class="px-0 px-md-5">
    <v-card class="mx-auto"> test</v-card>
  </v-container>
</template>

<script>
export default {
  meta: {
    label: 'Inventory Report',
    permission: 'Reports:View',
    access_level: 1,
  },
  data() {
    return {}
  },
  beforeMount() {
    this.$store.dispatch('app/setNavHeader', 'Inventory Report')
  },
  head: {
    title: 'Inventory Report',
  },
}
</script>

<style></style>
