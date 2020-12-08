export const state = () => ({
  store: null,
  drawer: true,
  miniVariant: false,
  navHeader: '',
  labels: [
    {
      id: 1,
      title: 'HOLD',
      action: 1,
      color: 'orange',
      icon: 'mdi-car-brake-hold',
      'icon-color': 'white',
    },
    {
      id: 2,
      title: 'PAID',
      action: 1,
      color: 'green',
      icon: 'mdi-currency-php',
      'icon-color': 'white',
    },
    {
      id: 3,
      title: 'FOR DELIVERY',
      action: 1,
      color: 'purple',
      icon: 'mdi-truck-delivery-outline',
      'icon-color': 'white',
    },
    {
      id: 4,
      title: 'PICK-UP',
      action: 1,
      color: 'deep-purple',
      icon: 'mdi-hand',
      'icon-color': 'white',
    },
    {
      id: 5,
      title: 'COMPLETED',
      action: 2,
      color: 'blue',
      icon: 'mdi-checkbox-marked-circle-outline',
      'icon-color': 'white',
    },
    {
      id: 6,
      title: 'VOID',
      action: 2,
      color: 'red',
      icon: 'mdi-close-circle-outline',
      'icon-color': 'white',
    },
    {
      id: 7,
      title: 'UNPAID',
      action: 1,
      color: 'pink',
      icon: 'mdi-currency-usd-off',
      'icon-color': 'white',
    },
    {
      id: 8,
      title: 'CREATED',
      action: 1,
      color: 'grey',
      icon: 'mdi-cart',
      'icon-color': 'white',
    },
  ],
})

export const mutations = {
  setStore(state, store) {
    state.store = store
  },
  logoutUser(state) {
    state.store = null
  },
  setNavHeader(state, header) {
    state.navHeader = header
  },
  setDrawer(state, drawer) {
    state.drawer = drawer
  },
  setMiniVariant(state, mini) {
    state.miniVariant = mini
  },
}

export const actions = {
  async setActiveStore({ commit }, store) {
    await this.$axios.$post('/laravel/api/store/session/' + store.id)
    commit('setStore', store)
  },
  logoutUser({ commit }) {
    commit('logoutUser')
  },
  setNavHeader({ commit }, header) {
    commit('setNavHeader', header)
  },
  setDrawer({ commit }, drawer) {
    commit('setDrawer', drawer)
  },
  setMiniVariant({ commit }, mini) {
    commit('setMiniVariant', mini)
  },
}
