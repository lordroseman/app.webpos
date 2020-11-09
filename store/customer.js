import { findIndex } from 'lodash'

export const state = () => ({
  customers: [],
  customersLoadStatus: 0,

  customerSendingStatus: 0,
  customerDeletingStatus: 0,

  errors: {},
  message: '',
})

export const actions = {
  loadCustomers({ commit }) {
    commit('setCustomersLoadStatus', 1)

    this.$axios
      .get('/laravel/api/customer')
      .then(function (response) {
        commit('setCustomers', response.data)
        commit('setCustomersLoadStatus', 2)
      })
      .catch(function () {
        commit('setCustomers', [])
        commit('setCustomersLoadStatus', 3)
      })
  },

  /**
   *  ADD CUSTOMER
   */
  addCustomer({ commit }, data) {
    commit('setCustomerSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/customer', data)
      .then((response) => {
        commit('setMessage', 'Customer was added successfully')
        commit('setCustomerSendingStatus', 2)
        commit('pushCustomer', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCustomerSendingStatus', 3)
      })
  },

  /**
   *  EDIT CUSTOMER
   */
  editCustomer({ commit }, payload) {
    commit('setCustomerSendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/customer/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Customer was updated successfully')
        commit('setCustomerSendingStatus', 2)
        commit('updateCustomer', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCustomerSendingStatus', 3)
      })
  },

  /**
   *  DELETE CUSTOMER
   */
  deleteCustomer({ commit }, id) {
    commit('setCustomerDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/customer/' + id)
      .then((response) => {
        commit('setCustomerDeletingStatus', 2)
        commit('deleteCustomer', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCustomerDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the customers load status
        */
  setCustomersLoadStatus(state, status) {
    state.customersLoadStatus = status
  },

  /*
          Sets the user
          */
  setCustomers(state, user) {
    state.customers = user
  },

  /**
   *  Set Customer sending status
   */
  setCustomerSendingStatus(state, status) {
    state.customerSendingStatus = status
  },

  /**
   * Set Customer Deleting Status
   * @param {state} state
   * @param {status} message
   */
  setCustomerDeletingStatus(state, status) {
    state.customerDeletingStatus = status
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
   *  PUSH Customer to array
   */
  pushCustomer(state, customer) {
    state.customers.unshift(customer)
  },

  /**
   *  DELETE Customer from array
   */
  deleteCustomer(state, id) {
    const ind = findIndex(state.customers, (r) => {
      return r.id === id
    })

    state.customers.splice(ind, 1)
  },

  /**
   *  UPDATE customer from array
   */
  updateCustomer(state, data) {
    const ind = findIndex(state.customers, (r) => {
      return r.id === data.id
    })

    const customer = state.customers[ind]

    for (const prop in data) {
      customer[prop] = data[prop]
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getCustomersLoadStatus(state) {
    return function () {
      return state.customersLoadStatus
    }
  },

  /*
          Returns the user.
          */
  getCustomers(state) {
    return state.customers
  },

  /**
   *  Return Customer sending status
   */
  getCustomerSendingStatus(state) {
    return () => {
      return state.customerSendingStatus
    }
  },

  /**
   *  Return Customer sending status
   */
  getCustomerDeletingStatus(state) {
    return () => {
      return state.customerDeletingStatus
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
