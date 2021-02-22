<template>
  <v-navigation-drawer :value="showSideNav" disable-resize-watcher app>
    <v-card class="mx-auto" :color="color.primary" tile>
      <v-list-item two-line>
        <v-list-item-avatar>
          <img
            :src="user ? user.avatar : require('@/static/default-avatar.png')"
          />
        </v-list-item-avatar>

        <v-list-item-content v-if="user" class="white--text">
          <v-list-item-title>{{ user.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.entity }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-card>

    <v-list class="mt-2" dense nav>
      <v-list-item v-for="(item, index) in items" :key="index" link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="logout">
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Log out</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'SideNav',
  data() {
    return {
      items: [
        { title: 'My Orders', icon: 'mdi-cart-outline', link: '' },
        { title: 'My Profile', icon: 'mdi-account-circle-outline', link: '' },
        {
          title: 'My Addresses',
          icon: 'mdi-map-marker-radius-outline',
          link: '',
        },
        { title: 'My Vouchers', icon: 'mdi-ticket-percent-outline', link: '' },
        { title: 'Help Center', icon: 'mdi-help-circle-outline', link: '' },
      ],
    }
  },
  computed: {
    ...mapState({
      showSideNav: (state) => state.mobile.showSideNav || false,
      color: (state) => state.mobile.color,
    }),
    user() {
      return this.$auth.user
    },
  },
  methods: {
    logout() {
      this.$auth.logout()
    },
  },
}
</script>
