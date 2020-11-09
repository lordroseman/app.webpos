import { findIndex } from 'lodash'

export const state = () => ({
  items: [],
  itemsLoadStatus: 0,

  itemSendingStatus: 0,
  itemDeletingStatus: 0,

  errors: {},
  message: '',
})

export const actions = {
  loadItems({ commit }) {
    commit('setItemsLoadStatus', 1)

    this.$axios
      .get('/laravel/api/item')
      .then(function (response) {
        commit('setItems', response.data)
        commit('setItemsLoadStatus', 2)
      })
      .catch(function () {
        commit('setItems', [])
        commit('setItemsLoadStatus', 3)
      })
  },

  loadStoreItems({ commit }, store) {
    commit('setItemsLoadStatus', 1)

    this.$axios
      .get('/laravel/api/store/' + store + '/items')
      .then(function (response) {
        commit('setItems', response.data)
        commit('setItemsLoadStatus', 2)
      })
      .catch(function () {
        commit('setItems', [])
        commit('setItemsLoadStatus', 3)
      })
  },

  /**
   *  ADD ITEM
   */
  addItem({ commit }, data) {
    commit('setItemSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/item', data)
      .then((response) => {
        commit('setMessage', 'Item was added successfully')
        commit('setItemSendingStatus', 2)
        commit('pushItem', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setItemSendingStatus', 3)
      })
  },

  /**
   *  EDIT ITEM
   */
  editItem({ commit }, payload) {
    commit('setItemSendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/item/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Item was updated successfully')
        commit('setItemSendingStatus', 2)
        commit('updateItem', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setItemSendingStatus', 3)
      })
  },

  /**
   *  DELETE ITEM
   */
  deleteItem({ commit }, id) {
    commit('setItemDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/item/' + id)
      .then((response) => {
        commit('setItemDeletingStatus', 2)
        commit('deleteItem', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setItemDeletingStatus', 3)
      })
  },
  pushItem({ commit }, item) {
    commit('pushItem', item)
  },
  updateItem({ commit }, item) {
    commit('updateItem', item)
  },
  removeItem({ commit }, id) {
    commit('deleteItem', id)
  },
}

export const mutations = {
  /*
        Sets the items load status
        */
  setItemsLoadStatus(state, status) {
    state.itemsLoadStatus = status
  },

  /*
          Sets the user
          */
  setItems(state, user) {
    state.items = user
  },

  /**
   *  Set Item sending status
   */
  setItemSendingStatus(state, status) {
    state.itemSendingStatus = status
  },

  /**
   * Set Item Deleting Status
   * @param {state} state
   * @param {status} message
   */
  setItemDeletingStatus(state, status) {
    state.itemDeletingStatus = status
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
   *  PUSH Item to array
   */
  pushItem(state, item) {
    state.items.unshift(item)
  },

  /**
   *  DELETE Item from array
   */
  deleteItem(state, id) {
    const ind = findIndex(state.items, (r) => {
      return r.id === id
    })

    state.items.splice(ind, 1)
  },

  /**
   *  UPDATE item from array
   */
  updateItem(state, data) {
    const ind = findIndex(state.items, (r) => {
      return r.id === data.id
    })

    const item = state.items[ind]

    for (const prop in data) {
      if (prop === 'pivot') {
        for (const pivotProp in data[prop]) {
          item[prop][pivotProp] = data[prop][pivotProp]
        }
      } else {
        item[prop] = data[prop]
      }
    }
  },
}

export const getters = {
  /*
    Returns the user load status.
    */
  getItemsLoadStatus(state) {
    return function () {
      return state.itemsLoadStatus
    }
  },

  /*
    Returns the user.
    */
  getItems(state) {
    return state.items
  },

  /**
   *  Return Item sending status
   */
  getItemSendingStatus(state) {
    return () => {
      return state.itemSendingStatus
    }
  },

  /**
   *  Return Item sending status
   */
  getItemDeletingStatus(state) {
    return () => {
      return state.itemDeletingStatus
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
