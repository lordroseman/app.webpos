import { findIndex } from 'lodash'

export const state = () => ({
  item_units: [],
  itemUnitsLoadStatus: 0,

  itemUnitSendingStatus: 0,
  itemUnitDeletingStatus: 0,

  errors: {},
  message: '',
})

export const actions = {
  loadItemUnits({ commit }) {
    commit('setItemUnitsLoadStatus', 1)

    this.$axios
      .get('/laravel/api/item_unit')
      .then(function (response) {
        commit('setItemUnits', response.data)
        commit('setItemUnitsLoadStatus', 2)
      })
      .catch(function () {
        commit('setItemUnits', [])
        commit('setItemUnitsLoadStatus', 3)
      })
  },

  /**
   *  ADD ITEM UNIT
   */
  addItemUnit({ commit }, data) {
    commit('setItemUnitSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/item_unit', data)
      .then((response) => {
        commit('setMessage', 'Item Unit was added successfully')
        commit('setItemUnitSendingStatus', 2)
        commit('pushItemUnit', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setItemUnitSendingStatus', 3)
      })
  },

  /**
   *  EDIT ITEMUNIT
   */
  editItemUnit({ commit }, payload) {
    commit('setItemUnitSendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/item_unit/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Item Unit was updated successfully')
        commit('setItemUnitSendingStatus', 2)
        commit('updateItemUnit', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setItemUnitSendingStatus', 3)
      })
  },

  /**
   *  DELETE ITEMUNIT
   */
  deleteItemUnit({ commit }, id) {
    commit('setItemUnitDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/item_unit/' + id)
      .then((response) => {
        commit('setItemUnitDeletingStatus', 2)
        commit('deleteItemUnit', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setItemUnitDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the item units load status
        */
  setItemUnitsLoadStatus(state, status) {
    state.itemUnitsLoadStatus = status
  },

  /*
          Sets the user
          */
  setItemUnits(state, user) {
    state.item_units = user
  },

  /**
   *  Set ItemUnit sending status
   */
  setItemUnitSendingStatus(state, status) {
    state.itemUnitSendingStatus = status
  },

  /**
   * SET ItemUnit deleting status
   * @param {state} state
   * @param {status} status
   */
  setItemUnitDeletingStatus(state, status) {
    state.itemUnitDeletingStatus = status
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
   *  PUSH ItemUnit to array
   */
  pushItemUnit(state, itemunit) {
    state.item_units.unshift(itemunit)
  },

  /**
   *  DELETE ItemUnit from array
   */
  deleteItemUnit(state, id) {
    const ind = findIndex(state.item_units, (r) => {
      return r.id === id
    })

    state.item_units.splice(ind, 1)
  },

  /**
   *  UPDATE itemunit from array
   */
  updateItemUnit(state, data) {
    const ind = findIndex(state.item_units, (r) => {
      return r.id === data.id
    })

    const itemunit = state.item_units[ind]

    for (const prop in data) {
      itemunit[prop] = data[prop]
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getItemUnitsLoadStatus(state) {
    return function () {
      return state.itemUnitsLoadStatus
    }
  },

  /*
          Returns the user.
          */
  getItemUnits(state) {
    return state.item_units
  },

  /**
   *  Return ItemUnit sending status
   */
  getItemUnitSendingStatus(state) {
    return () => {
      return state.itemUnitSendingStatus
    }
  },

  /**
   *  Return ItemUnit deleting status
   */
  getItemUnitDeletingStatus(state) {
    return () => {
      return state.itemUnitDeletingStatus
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
