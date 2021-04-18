export const state = () => ({
  showSideNav: 123,
  activeStore: null,
  color: {
    primary: '#C32B33',
    secondary: '#F8E85B',
    dark: '#161514',
    pink: '#E4949C',
  },
})

export const mutations = {
  setSideNav(state, value) {
    state.showSideNav = value
  },
  setActiveStore(state, store) {
    state.activeStore = store
  },
}

export const actions = {
  toggleSideNav({ commit }, value) {
    commit('setSideNav', value)
  },
  setActiveStore({ commit }, store) {
    commit('setActiveStore', store)
  },
}
