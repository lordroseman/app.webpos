import { findIndex } from 'lodash'

export const state = () => ({
  barangays: [],
  barangaysLoadStatus: 0,

  barangaySendingStatus: 0,
  barangayDeletingStatus: 0,

  errors: {},
  message: '',
})

export const actions = {
  async loadBarangays({ commit }) {
    commit('setBarangaysLoadStatus', 1)

    await this.$axios
      .get('/laravel/api/barangay')
      .then(function (response) {
        commit('setBarangays', response.data)
        commit('setBarangaysLoadStatus', 2)
      })
      .catch(function () {
        commit('setBarangays', [])
        commit('setBarangaysLoadStatus', 3)
      })
  },

  /**
   *  ADD BARANGAY
   */
  addBarangay({ commit }, data) {
    commit('setBarangaySendingStatus', 1)
    commit('setErrors', {})
    this._vm.$BarangayAPI
      .create(data)
      .then((response) => {
        commit('setMessage', 'Barangay was added successfully')
        commit('setBarangaySendingStatus', 2)
        commit('pushBarangay', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setBarangaySendingStatus', 3)
      })
  },

  /**
   *  EDIT BARANGAY
   */
  editBarangay({ commit }, payload) {
    commit('setBarangaySendingStatus', 1)
    commit('setErrors', {})

    this._vm.$BarangayAPI
      .update(payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Barangay was updated successfully')
        commit('setBarangaySendingStatus', 2)
        commit('updateBarangay', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setBarangaySendingStatus', 3)
      })
  },

  /**
   *  DELETE BARANGAY
   */
  deleteBarangay({ commit }, id) {
    commit('setBarangayDeletingStatus', 1)
    commit('setErrors', {})

    this._vm.$BarangayAPI
      .delete(id)
      .then((response) => {
        commit('setBarangayDeletingStatus', 2)
        commit('deleteBarangay', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setBarangayDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the barangays load status
        */
  setBarangaysLoadStatus(state, status) {
    state.barangaysLoadStatus = status
  },

  /*
          Sets the user
          */
  setBarangays(state, user) {
    state.barangays = user
  },

  /**
   *  Set Barangay sending status
   */
  setBarangaySendingStatus(state, status) {
    state.barangaySendingStatus = status
  },

  /**
   * SET Barangay deleting status
   * @param {state} state
   * @param {status} status
   */
  setBarangayDeletingStatus(state, status) {
    state.barangayDeletingStatus = status
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
   *  PUSH Barangay to array
   */
  pushBarangay(state, barangay) {
    state.barangays.unshift(barangay)
  },

  /**
   *  DELETE Barangay from array
   */
  deleteBarangay(state, id) {
    const ind = findIndex(state.barangays, (r) => {
      return r.id === id
    })

    state.barangays.splice(ind, 1)
  },

  /**
   *  UPDATE barangay from array
   */
  updateBarangay(state, data) {
    const ind = findIndex(state.barangays, (r) => {
      return r.id === data.id
    })

    const barangay = state.barangays[ind]

    for (const prop in data) {
      barangay[prop] = data[prop]
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getBarangaysLoadStatus(state) {
    return function () {
      return state.barangaysLoadStatus
    }
  },

  /*
          Returns the user.
          */
  getBarangays(state) {
    return state.barangays
  },

  /**
   *  Return Barangay sending status
   */
  getBarangaySendingStatus(state) {
    return () => {
      return state.barangaySendingStatus
    }
  },

  /**
   *  Return Barangay deleting status
   */
  getBarangayDeletingStatus(state) {
    return () => {
      return state.barangayDeletingStatus
    }
  },

  /**
   *  Return response message
   */
  getMessage(state) {
    return state.message
  },

  /**
   * Return errors
   */
  getErrors(state) {
    return state.errors
  },
}
