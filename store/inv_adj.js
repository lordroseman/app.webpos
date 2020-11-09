import { findIndex } from 'lodash'

export const state = () => ({
  adjustments: [],
  adjustmentsLoadStatus: 0,

  adjustmentSendingStatus: 0,
  adjustmentDeletingStatus: 0,

  errors: {},
  message: '',
  response_data: null,
})

export const actions = {
  /**
   *  ADD ADJUSTMENT
   */
  addAdjustment({ commit }, data) {
    commit('setAdjustmentSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/inventory_adjustment', data)
      .then((response) => {
        commit('setMessage', 'Adjustment was added successfully')
        commit('setAdjustmentSendingStatus', 2)
        // commit('pushAdjustment', response.data)
        commit('setResponseData', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setAdjustmentSendingStatus', 3)
      })
  },

  /**
   *  EDIT ADJUSTMENT
   */
  editAdjustment({ commit }, payload) {
    commit('setAdjustmentSendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/inventory_adjustment/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Adjustment was updated successfully')
        commit('setAdjustmentSendingStatus', 2)
        // commit('updateAdjustment', response.data)
        commit('setResponseData', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setAdjustmentSendingStatus', 3)
      })
  },
  updateLocalAdjustment({ commit }, payload) {
    commit('updateAdjustment', payload)
  },

  /**
   *  DELETE ADJUSTMENT
   */
  deleteAdjustment({ commit }, id) {
    commit('setAdjustmentDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/inventory_adjustment/' + id)
      .then((response) => {
        commit('setAdjustmentDeletingStatus', 2)
        commit('deleteAdjustment', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setAdjustmentDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the adjustments load status
        */
  setAdjustmentsLoadStatus(state, status) {
    state.adjustmentsLoadStatus = status
  },

  /*
  Sets the user
  */
  setAdjustments(state, user) {
    state.adjustments = user
  },

  /**
   *  Set Adjustment sending status
   */
  setAdjustmentSendingStatus(state, status) {
    state.adjustmentSendingStatus = status
  },

  /**
   * SET Adjustment deleting status
   * @param {state} state
   * @param {status} status
   */
  setAdjustmentDeletingStatus(state, status) {
    state.adjustmentDeletingStatus = status
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
   * set response data
   * @param {object} states
   * @param {*} data
   */
  setResponseData(state, data) {
    state.response_data = data
  },

  /**
   *  PUSH Adjustment to array
   */
  pushAdjustment(state, data) {
    let adjustment = data
    if ('adjustment' in data) {
      adjustment = data.adjustment
    }

    state.adjustments.unshift(adjustment)
  },

  /**
   *  DELETE Adjustment from array
   */
  deleteAdjustment(state, id) {
    const ind = findIndex(state.adjustments, (r) => {
      return r.id === id
    })

    state.adjustments.splice(ind, 1)
  },

  /**
   *  UPDATE adjustment from array
   */
  updateAdjustment(state, data) {
    if ('adjustment' in data) {
      data = data.adjustment

      const ind = findIndex(state.adjustments, (r) => {
        return r.id === data.id
      })

      const adjustment = state.adjustments[ind]

      for (const prop in data) {
        adjustment[prop] = data[prop]
      }
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getAdjustmentsLoadStatus(state) {
    return function () {
      return state.adjustmentsLoadStatus
    }
  },

  /**
   *  Return Adjustment sending status
   */
  getAdjustmentSendingStatus(state) {
    return () => {
      return state.adjustmentSendingStatus
    }
  },

  /**
   *  Return Adjustment deleting status
   */
  getAdjustmentDeletingStatus(state) {
    return () => {
      return state.adjustmentDeletingStatus
    }
  },
}
