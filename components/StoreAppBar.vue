<template>
  <v-app-bar app clipped-right clipped-left :elevate-on-scroll="true" dark>
    <v-app-bar-nav-icon class="hidden-lg-and-up" @click="toggle" />

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
      />
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-title>{{ title }}</v-toolbar-title>

    <v-spacer />
    <v-btn text to="/s"> Dashboard </v-btn>
    <v-menu left bottom offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          text
          :class="$route.meta.parent == 'transactions' ? 'v-btn--active' : ''"
          v-on="on"
        >
          Transactions
        </v-btn>
      </template>

      <v-list dense>
        <v-list-item to="/s/order">
          <v-list-item-icon>
            <v-icon color="green"> mdi-cart-plus </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="green--text">
              New Order
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/s/transaction">
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
        <v-btn
          text
          :class="$route.meta.parent == 'masterfile' ? 'v-btn--active' : ''"
          v-on="on"
        >
          Masterfile
        </v-btn>
      </template>

      <v-list dense>
        <v-list-item to="/s/item">
          <v-list-item-icon>
            <v-icon>mdi-food</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="green--text"> Item </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/s/inv_adj">
          <v-list-item-icon>
            <v-icon>mdi-ballot-recount</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Inventory Adjustment</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

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
    <v-menu left bottom offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list dense>
        <v-list-item @click="isDark = !isDark">
          <v-list-item-icon>
            <v-icon>{{
              isDark ? 'mdi-brightness-4' : 'mdi-brightness-7'
            }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Dark Mode</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
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
      cartCount: 0,
    }
  },
  computed: {
    navheader() {
      return this.$route.meta.label
    },
    ...mapState({
      user: (state) => state.auth.user,
    }),
    stores() {
      if (this.user) {
        return this.user.stores
      }
      return []
    },
  },
  watch: {
    isDark(value) {
      this.$vuetify.theme.dark = value
      localStorage.setItem('dark', value ? 1 : 0)
    },
    active_store(store) {
      this.$store.dispatch('app/setActiveStore', store)
      localStorage.setItem('active_store', JSON.stringify(store))
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

    EventBus.$on('updateCartCount', (count) => {
      this.cartCount = count
    })
  },
  methods: {
    toggle() {
      EventBus.$emit('app-toggle')

      if (!this.drawer) {
        this.miniVariant = false
        this.drawer = true
      } else {
        this.miniVariant = !this.miniVariant
      }
      this.$emit('toggle', {
        drawer: this.drawer,
        miniVariant: this.miniVariant,
      })
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
