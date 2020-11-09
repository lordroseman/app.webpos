<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    color="black"
    :expand-on-hover="miniVariant"
    :mini-variant="miniVariant"
    dark
    elevation-10
    permanent
    class="overflow-y-hidden"
  >
    <template v-slot:img>
      <v-img
        height="100%"
        :src="require('@/static/sidebar-4.jpg')"
        gradient="to top right, rgba(0,0,0,.8), rgba(0,0,0,.8)"
      />
    </template>
    <v-list nav class="py-0">
      <v-list-item two-line :class="miniVariant && 'px-0'">
        <v-list-item-avatar tile>
          <v-img :src="require('@/static/logo.png')" width="40" contain />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>RGC WebPOS</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider dark />

      <v-list-item two-line :class="miniVariant && 'px-0'">
        <v-list-item-avatar>
          <img
            :src="user ? user.avatar : require('@/static/default-avatar.png')"
          />
        </v-list-item-avatar>

        <v-list-item-content v-if="user">
          <v-list-item-title>{{ user.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.entity }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider dark class="mb-3" />
      <v-scrollable :height="scrollableHeight" theme="dark">
        <v-list-item-group>
          <template v-for="route in routes">
            <template v-if="route.hasOwnProperty('children')">
              <v-list-group
                :key="route.title"
                :prepend-icon="route.icon"
                :value="true"
                color="white"
              >
                <template v-slot:activator>
                  <v-list-item-title>{{ route.title }}</v-list-item-title>
                </template>
                <v-list-item-group color="white">
                  <template v-for="(_route, i) in route.children">
                    <router-link
                      v-if="$can(_route.permission)"
                      :key="i"
                      :to="_route.to"
                      tag="v-list-item"
                      :exact="_route.exact"
                      active-class="v-list-item--active"
                    >
                      <v-list-item-icon>
                        <v-icon>{{ _route.icon }}</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>{{ _route.title }}</v-list-item-title>
                    </router-link>
                  </template>
                </v-list-item-group>
              </v-list-group>
            </template>
            <template v-else-if="$can(route.permission)">
              <router-link
                :key="route.title"
                :to="route.to"
                tag="v-list-item"
                :exact="route.exact"
                active-class="v-list-item--active"
              >
                <v-list-item-icon>
                  <v-icon>{{ route.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>{{ route.title }}</v-list-item-title>
                </v-list-item-content>
              </router-link>
            </template>
          </template>
        </v-list-item-group>
      </v-scrollable>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    miniVariant: Boolean,
    drawer: Boolean,
  },
  data() {
    return {
      routes: [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          to: '/',
          exact: true,
          permission: 'Dashboard:View',
        },
        {
          title: 'Transactions',
          icon: 'mdi-point-of-sale',
          to: '/transaction',
          exact: true,
          permission: 'Transaction:View',
        },
        {
          title: 'Inventory Adjustment',
          icon: 'mdi-ballot-recount',
          to: '/adjustment',
          exact: true,
          permission: 'Inventory Adjustment:View',
        },
        {
          title: 'Customer',
          icon: 'mdi-account-group',
          to: '/customer',
          exact: true,
          permission: 'Customer:View',
        },
        {
          title: 'Masterfile',
          icon: 'mdi-widgets',
          children: [
            {
              title: 'Store',
              icon: 'mdi-store',
              to: '/store',
              exact: true,
              permission: 'Store:View',
            },
            {
              title: 'Item',
              icon: 'mdi-food',
              to: '/item',
              exact: true,
              permission: 'Item:View',
            },
            {
              title: 'Category',
              icon: 'mdi-sitemap',
              to: '/category',
              exact: true,
              permission: 'Category:View',
            },
            {
              title: 'Item Unit',
              icon: 'mdi-weight-kilogram',
              to: '/unit',
              exact: true,
              permission: 'Item Unit:View',
            },
            {
              title: 'City',
              icon: 'mdi-city',
              to: '/city',
              exact: true,
              permission: 'City:View',
            },
            {
              title: 'Driver',
              icon: 'mdi-bike-fast',
              to: '/driver',
              exact: true,
              permission: 'Driver:View',
            },
            {
              title: 'System User',
              icon: 'mdi-account',
              to: '/user',
              exact: true,
              permission: 'User:View',
            },
            {
              title: 'Roles',
              icon: 'mdi-account-settings',
              to: '/role',
              exact: true,
              permission: 'Role:View',
            },
          ],
        },
      ],
    }
  },
  computed: {
    scrollableHeight() {
      return 'calc(100vh - 186px)'
    },
    item() {
      return this.items.length
    },
    user() {
      return this.$auth.user
    },
  },
  mounted() {},
}
</script>

<style>
.v-navigation-drawer__content {
  overflow-y: hidden !important;
}
</style>
