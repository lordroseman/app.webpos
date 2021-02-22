import { findIndex } from 'lodash'

export const state = () => ({
  transactions: [],
  transactionsLoadStatus: 0,

  transactionSendingStatus: 0,
  transactionDeletingStatus: 0,

  errors: {},
  response: null,
  message: '',
  status: {
    1: { label: 'Open', color: 'success' },
    2: { label: 'Close', color: 'red' },
  },
})

export const actions = {
  async loadTransactions({ commit }) {
    commit('setTransactionsLoadStatus', 1)

    const transactions = await this.$axios.$get('/laravel/api/transaction')
    if (transactions) {
      commit('setTransactions', transactions)
      commit('setTransactionsLoadStatus', 2)
    } else {
      commit('setTransactions', [])
      commit('setTransactionsLoadStatus', 3)
    }
  },

  /**
   *  ADD TRANSACTION
   */
  addTransaction({ commit }, data) {
    commit('setTransactionSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/transaction', data)
      .then((response) => {
        commit('setResponse', response.data)
        commit('setMessage', 'Transaction was added successfully')
        commit('setTransactionSendingStatus', 2)
        commit('pushTransaction', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data.transaction)
        commit('setTransactionSendingStatus', 3)
      })
  },

  /**
   *  EDIT TRANSACTION
   */
  editTransaction({ commit }, payload) {
    commit('setTransactionSendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/transaction/' + payload.id, payload.data)
      .then((response) => {
        commit('setResponse', response.data)
        commit('setMessage', 'Transaction was updated successfully')
        commit('setTransactionSendingStatus', 2)
        commit('updateTransaction', response.data.transaction)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setTransactionSendingStatus', 3)
      })
  },

  /**
   *  DELETE TRANSACTION
   */
  deleteTransaction({ commit }, id) {
    commit('setTransactionDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/transaction/' + id)
      .then((response) => {
        commit('setTransactionDeletingStatus', 2)
        // commit('deleteTransaction', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setTransactionDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the transactions load status
        */
  setTransactionsLoadStatus(state, status) {
    state.transactionsLoadStatus = status
  },

  /*
          Sets the user
          */
  setTransactions(state, user) {
    state.transactions = user
  },

  /**
   *  Set Transaction sending status
   */
  setTransactionSendingStatus(state, status) {
    state.transactionSendingStatus = status
  },

  /**
   * Set Transaction Deleting Status
   * @param {state} state
   * @param {status} message
   */
  setTransactionDeletingStatus(state, status) {
    state.transactionDeletingStatus = status
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
   *  set Errors
   */
  setResponse(state, response) {
    state.response = response
  },

  /**
   *  PUSH Transaction to array
   */
  pushTransaction(state, transaction) {
    state.transactions.unshift(transaction)
  },

  /**
   *  DELETE Transaction from array
   */
  deleteTransaction(state, id) {
    const ind = findIndex(state.transactions, (r) => {
      return r.id === id
    })

    state.transactions.splice(ind, 1)
  },

  /**
   *  UPDATE transaction from array
   */
  updateTransaction(state, data) {
    const ind = findIndex(state.transactions, (r) => {
      return r.id === data.id
    })

    const transaction = state.transactions[ind]

    for (const prop in data) {
      transaction[prop] = data[prop]
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getTransactionsLoadStatus(state) {
    return function () {
      return state.transactionsLoadStatus
    }
  },

  /*
          Returns the user.
          */
  getTransactions(state) {
    return state.transactions
  },

  /**
   *  Return Transaction sending status
   */
  getTransactionSendingStatus(state) {
    return () => {
      return state.transactionSendingStatus
    }
  },

  /**
   *  Return Transaction sending status
   */
  getTransactionDeletingStatus(state) {
    return () => {
      return state.transactionDeletingStatus
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

  /**
   *  return status
   */
  getStatus(state) {
    return state.status
  },
}
