import { findIndex } from 'lodash'

export const state = () => ({
  payment_options: [],
  paymentOptionsLoadStatus: 0,

  paymentOptionSendingStatus: 0,
  paymentOptionDeletingStatus: 0,

  errors: {},
  message: '',
})

export const actions = {
  async loadPaymentOptions({ commit }) {
    commit('setPaymentOptionsLoadStatus', 1)

    const paymentOptions = await this.$axios.$get('/laravel/api/payment_option')
    if (paymentOptions) {
      commit('setPaymentOptions', paymentOptions)
      commit('setPaymentOptionsLoadStatus', 2)
    } else {
      commit('setPaymentOptions', [])
      commit('setPaymentOptionsLoadStatus', 3)
    }
  },

  /**
   *  ADD PAYMENTOPTION
   */
  addPaymentOption({ commit }, data) {
    commit('setPaymentOptionSendingStatus', 1)
    commit('setErrors', {})
    this._vm.$PaymentOptionAPI
      .create(data)
      .then((response) => {
        commit('setMessage', 'Payment Option was added successfully')
        commit('setPaymentOptionSendingStatus', 2)
        commit('pushPaymentOption', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setPaymentOptionSendingStatus', 3)
      })
  },

  /**
   *  EDIT PAYMENTOPTION
   */
  editPaymentOption({ commit }, payload) {
    commit('setPaymentOptionSendingStatus', 1)
    commit('setErrors', {})

    this._vm.$PaymentOptionAPI
      .update(payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Payment Option was updated successfully')
        commit('setPaymentOptionSendingStatus', 2)
        commit('updatePaymentOption', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setPaymentOptionSendingStatus', 3)
      })
  },

  /**
   *  DELETE PAYMENTOPTION
   */
  deletePaymentOption({ commit }, id) {
    commit('setPaymentOptionDeletingStatus', 1)
    commit('setErrors', {})

    this._vm.$PaymentOptionAPI
      .delete(id)
      .then((response) => {
        commit('setPaymentOptionDeletingStatus', 2)
        commit('deletePaymentOption', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setPaymentOptionDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the paymentOptions load status
        */
  setPaymentOptionsLoadStatus(state, status) {
    state.paymentOptionsLoadStatus = status
  },

  /*
          Sets the payment options
          */
  setPaymentOptions(state, paymentOptions) {
    state.payment_options = paymentOptions
  },

  /**
   *  Set PaymentOption sending status
   */
  setPaymentOptionSendingStatus(state, status) {
    state.paymentOptionSendingStatus = status
  },

  /**
   * SET PaymentOption deleting status
   * @param {state} state
   * @param {status} status
   */
  setPaymentOptionDeletingStatus(state, status) {
    state.paymentOptionDeletingStatus = status
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
   *  PUSH PaymentOption to array
   */
  pushPaymentOption(state, paymentOption) {
    state.paymentOptions.unshift(paymentOption)
  },

  /**
   *  DELETE PaymentOption from array
   */
  deletePaymentOption(state, id) {
    const ind = findIndex(state.paymentOptions, (r) => {
      return r.id === id
    })

    state.paymentOptions.splice(ind, 1)
  },

  /**
   *  UPDATE paymentOption from array
   */
  updatePaymentOption(state, data) {
    const ind = findIndex(state.paymentOptions, (r) => {
      return r.id === data.id
    })

    const paymentOption = state.paymentOptions[ind]

    for (const prop in data) {
      paymentOption[prop] = data[prop]
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getPaymentOptionsLoadStatus(state) {
    return function () {
      return state.paymentOptionsLoadStatus
    }
  },

  /*
          Returns the user.
          */
  getPaymentOptions(state) {
    return state.paymentOptions
  },

  /**
   *  Return PaymentOption sending status
   */
  getPaymentOptionSendingStatus(state) {
    return () => {
      return state.paymentOptionSendingStatus
    }
  },

  /**
   *  Return PaymentOption deleting status
   */
  getPaymentOptionDeletingStatus(state) {
    return () => {
      return state.paymentOptionDeletingStatus
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
