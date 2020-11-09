import { findIndex } from 'lodash'

export const state = () => ({
  stores: [],
  storesLoadStatus: 0,

  storeSendingStatus: 0,
  storeDeletingStatus: 0,

  errors: {},
  message: '',
  response: null,
})

export const actions = {
  loadStores({ commit }) {
    commit('setStoresLoadStatus', 1)

    this.$axios
      .get('/laravel/api/store')
      .then(function (response) {
        commit('setStores', response.data)
        commit('setStoresLoadStatus', 2)
      })
      .catch(function () {
        commit('setStores', [])
        commit('setStoresLoadStatus', 3)
      })
  },

  /**
   *  ADD STORE
   */
  addStore({ commit }, data) {
    commit('setStoreSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/store', data)
      .then((response) => {
        commit('setMessage', 'Store was added successfully')
        commit('setStoreSendingStatus', 2)
        commit('pushStore', response.data)
        commit('setResponse', response.data)
      })
      .catch((errors) => {
        commit('setStoreSendingStatus', 3)
        commit('setErrors', errors.response.data)
      })
  },

  /**
   *  EDIT STORE
   */
  editStore({ commit }, payload) {
    commit('setStoreSendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/store/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Store was updated successfully')
        commit('setStoreSendingStatus', 2)
        commit('setResponse', response.data)
        commit('updateStore', response.data)
      })
      .catch((errors) => {
        commit('setStoreSendingStatus', 3)
        commit('setErrors', errors.response.data)
      })
  },

  /**
   *  DELETE STORE
   */
  deleteStore({ commit }, id) {
    commit('setStoreDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/store/' + id)
      .then((response) => {
        commit('setStoreDeletingStatus', 2)
        commit('deleteStore', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setStoreDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the stores load status
        */
  setStoresLoadStatus(state, status) {
    state.storesLoadStatus = status
  },

  /*
          Sets the user
          */
  setStores(state, user) {
    state.stores = user
  },

  /**
   *  Set Store sending status
   */
  setStoreSendingStatus(state, status) {
    state.storeSendingStatus = status
  },

  /**
   * Set Store Deleting Status
   * @param {state} state
   * @param {status} message
   */
  setStoreDeletingStatus(state, status) {
    state.storeDeletingStatus = status
  },

  /**
   *  Set response Message
   */
  setMessage(state, message) {
    state.message = message
  },

  /**
   *  set Errors
   */
  setErrors(state, errors) {
    state.errors = errors
  },

  /**
   *
   * @param {object} state
   * @param {object} store
   */
  setResponse(state, response) {
    state.response = response
  },

  /**
   *  PUSH Store to array
   */
  pushStore(state, data) {
    if ('store' in data) {
      state.stores.unshift(data.store)
    } else {
      state.stores.unshift(data)
    }
  },

  /**
   *  DELETE Store from array
   */
  deleteStore(state, id) {
    const ind = findIndex(state.stores, (r) => {
      return r.id === id
    })

    state.stores.splice(ind, 1)
  },

  /**
   *  UPDATE store from array
   */
  updateStore(state, response) {
    let data = response
    if ('store' in response) {
      data = response.store

      const ind = findIndex(state.stores, (r) => {
        return r.id === data.id
      })

      const store = state.stores[ind]

      for (const prop in data) {
        store[prop] = data[prop]
      }
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getStoresLoadStatus(state) {
    return function () {
      return state.storesLoadStatus
    }
  },

  /**
   *  Return Store sending status
   */
  getStoreSendingStatus(state) {
    return () => {
      return state.storeSendingStatus
    }
  },

  /**
   *  Return Store sending status
   */
  getStoreDeletingStatus(state) {
    return () => {
      return state.storeDeletingStatus
    }
  },
}
