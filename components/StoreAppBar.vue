<template>
  <div>
    <v-app-bar
      app
      clipped-right
      clipped-left
      :elevate-on-scroll="true"
      dark
      :color="color.primary"
    >
      <v-app-bar-nav-icon class="hidden-lg-and-up" @click="toggle" />
      <template v-if="!isMobile">
        <div>
          <v-img
            :src="require('~/static/logo.png')"
            class="mr-2"
            height="40"
            width="40"
            contain
          />
        </div>
        <v-toolbar-title>
          <v-select
            v-model="active_store"
            :items="stores"
            solo
            item-text="name"
            flat
            class="mt-7"
            placeholder="Please select Store"
            :item-value="(item) => item"
            light
          />
        </v-toolbar-title>
      </template>
      <v-spacer />

      <v-toolbar-title>{{ title }}</v-toolbar-title>

      <v-spacer />
      <template v-if="!isMobile">
        <v-btn v-if="$can('Transaction:View')" text exact to="/s">
          Dashboard
        </v-btn>
        <v-menu left bottom offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text :class="transClass" v-on="on"> Transactions </v-btn>
          </template>

          <v-list dense>
            <v-list-item v-if="$can('Transaction:Add')" exact to="/s/order">
              <v-list-item-icon>
                <v-icon color="green"> mdi-cart-plus </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="green--text">
                  New Order
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-if="$can('Transaction:View')"
              exact
              to="/s/transaction"
            >
              <v-list-item-icon>
                <v-icon>mdi-cart</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Transactions</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <!--   Masterfile Menu -->
        <v-menu left bottom offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text :class="mfClass" v-on="on"> Masterfile </v-btn>
          </template>

          <v-list dense>
            <v-list-item v-if="$can('Item:View')" to="/s/item" exact nuxt>
              <v-list-item-icon>
                <v-icon>mdi-food</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Item </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-if="$can('Customer:View')"
              to="/s/customer"
              exact
              nuxt
            >
              <v-list-item-icon>
                <v-icon>mdi-account-group</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Customer </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-if="$can('Inventory Adjustment:View')"
              to="/s/inv_adj"
              exact
              nuxt
            >
              <v-list-item-icon>
                <v-icon>mdi-ballot-recount</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Inventory Adjustment</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <v-btn
        v-if="$vuetify.breakpoint.mdAndDown && $route.name === 's-order-id'"
        icon
        @click="toggleCart"
      >
        <v-badge overlap color="red" :content="cartCount" :value="cartCount">
          <v-icon>mdi-cart</v-icon>
        </v-badge>
      </v-btn>
      <!--   Logout Menu -->
      <v-menu left bottom offset-y :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <!-- <v-list-item>
            <v-list-item-action>
              <v-switch
                v-model="showUnavailable"
                inset
                dense
                :label="` Show Unavailable Items`"
              >
              </v-switch>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title></v-list-item-title>
            </v-list-item-content>
          </v-list-item> -->
          <v-divider />
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon color="red"> mdi-logout </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="red--text"> Logout </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      color="black"
      dark
      class="hidden-lg-and-up"
    >
      <v-list nav dense>
        <v-list-item two-line :class="miniVariant && 'px-0'">
          <v-list-item-avatar tile>
            <v-img :src="require('@/static/logo.png')" width="40" contain />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>RGC WebPOS</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider dark />
        <v-list-item>
          <v-select
            v-model="active_store"
            :items="stores"
            solo
            item-text="name"
            flat
            class="mt-7"
            placeholder="Please select Store"
            :item-value="(item) => item"
            light
        /></v-list-item>
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
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import EventBus from '~/components/core/event-bus.js'

export default {
  data() {
    return {
      miniVariant: false,
      isDark: false,
      active_store: null,
      title: '',
      mf_links: ['s-item', 's-customer', 's-inv_adj'],
      trans_links: [
        's-transaction',
        's-transaction-id',
        's-order',
        's-order-id',
      ],
      drawer: false,
      routes: [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          to: '/s',
          exact: true,
          permission: 'Dashboard:View',
        },
        {
          title: 'Transactions',
          icon: 'mdi-point-of-sale',
          children: [
            {
              title: 'New Order',
              icon: 'mdi-cart-plus',
              to: '/s/order',
              exact: true,
              permission: 'Transaction:Add',
            },
            {
              title: 'Transactions',
              icon: 'mdi-cart',
              to: '/s/transaction',
              exact: true,
              permission: 'Transaction:View',
            },
          ],
        },
        {
          title: 'Masterfile',
          icon: 'mdi-widgets',
          children: [
            {
              title: 'Item',
              icon: 'mdi-food',
              to: '/s/item',
              exact: true,
              permission: 'Item:View',
            },
            {
              title: 'Customer',
              icon: 'mdi-account-group',
              to: '/s/customer',
              exact: true,
              permission: 'Customer:View',
            },
            {
              title: 'Inventory Adjustment',
              icon: 'mdi-ballot-recount',
              to: '/s/adjustment',
              exact: true,
              permission: 'Inventory Adjustment:View',
            },
          ],
        },
      ],
      showUnavailable: true,
    }
  },
  computed: {
    navheader() {
      return this.$route.meta.label
    },
    ...mapState({
      user: (state) => state.auth.user,
      color: (state) => state.app.color,
      cartCount: (state) => state.cart.cartQty,
    }),
    stores() {
      if (this.user) {
        return this.user.stores
      }
      return []
    },
    mfClass() {
      const route = this.$route.name
      return this.mf_links.includes(route) ? 'v-btn--active' : ''
    },
    transClass() {
      const route = this.$route.name
      return this.trans_links.includes(route) ? 'v-btn--active' : ''
    },
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
  },
  watch: {
    isDark(value) {
      this.$vuetify.theme.dark = value
      localStorage.setItem('dark', value ? 1 : 0)
    },
    active_store(store, old) {
      this.$store.dispatch('cart/clearCart')
      this.$store.dispatch('app/setActiveStore', store)
      localStorage.setItem('active_store', JSON.stringify(store))
    },
    showUnavailable(value) {
      localStorage.setItem('showUnavailable', value)
      this.$store.dispatch('app/setShowUnavailable', value)
    },
  },
  beforeMount() {
    this.isDark = localStorage.getItem('dark') === 1
    this.active_store = JSON.parse(localStorage.getItem('active_store'))
  },
  mounted() {
    EventBus.$on('update-title', (title) => {
      this.title = title
    })
  },
  methods: {
    toggle() {
      this.drawer = !this.drawer
    },
    toggleCart() {
      EventBus.$emit('toggle-cart')
    },
    logout() {
      // this.$axios.post('/laravel/logout').then((resp) => {

      // })
      this.$auth.logout()
    },
  },
}
</script>
