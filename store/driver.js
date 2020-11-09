import { findIndex } from 'lodash'

export const state = () => ({
  drivers: [],
  driversLoadStatus: 0,

  driverSendingStatus: 0,
  driverDeletingStatus: 0,

  errors: {},
  message: '',
})

export const actions = {
  loadDrivers({ commit }) {
    commit('setDriversLoadStatus', 1)

    this.$axios
      .get('/laravel/api/driver')
      .then(function (response) {
        commit('setDrivers', response.data)
        commit('setDriversLoadStatus', 2)
      })
      .catch(function () {
        commit('setDrivers', [])
        commit('setDriversLoadStatus', 3)
      })
  },

  /**
   *  ADD DRIVER
   */
  addDriver({ commit }, data) {
    commit('setDriverSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/driver', data)
      .then((response) => {
        commit('setMessage', 'Driver was added successfully')
        commit('setDriverSendingStatus', 2)
        commit('pushDriver', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setDriverSendingStatus', 3)
      })
  },

  /**
   *  EDIT DRIVER
   */
  editDriver({ commit }, payload) {
    commit('setDriverSendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/driver/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Driver was updated successfully')
        commit('setDriverSendingStatus', 2)
        commit('updateDriver', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setDriverSendingStatus', 3)
      })
  },

  /**
   *  DELETE DRIVER
   */
  deleteDriver({ commit }, id) {
    commit('setDriverDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/driver/' + id)
      .then((response) => {
        commit('setDriverDeletingStatus', 2)
        commit('deleteDriver', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setDriverDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the drivers load status
        */
  setDriversLoadStatus(state, status) {
    state.driversLoadStatus = status
  },

  /*
          Sets the user
          */
  setDrivers(state, user) {
    state.drivers = user
  },

  /**
   *  Set Driver sending status
   */
  setDriverSendingStatus(state, status) {
    state.driverSendingStatus = status
  },

  /**
   * SET Driver deleting status
   * @param {state} state
   * @param {status} status
   */
  setDriverDeletingStatus(state, status) {
    state.driverDeletingStatus = status
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
   *  PUSH Driver to array
   */
  pushDriver(state, driver) {
    state.drivers.unshift(driver)
  },

  /**
   *  DELETE Driver from array
   */
  deleteDriver(state, id) {
    const ind = findIndex(state.drivers, (r) => {
      return r.id === id
    })

    state.drivers.splice(ind, 1)
  },

  /**
   *  UPDATE driver from array
   */
  updateDriver(state, data) {
    const ind = findIndex(state.drivers, (r) => {
      return r.id === data.id
    })

    const driver = state.drivers[ind]

    for (const prop in data) {
      driver[prop] = data[prop]
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getDriversLoadStatus(state) {
    return function () {
      return state.driversLoadStatus
    }
  },

  /*
          Returns the user.
          */
  getDrivers(state) {
    return state.drivers
  },

  /**
   *  Return Driver sending status
   */
  getDriverSendingStatus(state) {
    return () => {
      return state.driverSendingStatus
    }
  },

  /**
   *  Return Driver deleting status
   */
  getDriverDeletingStatus(state) {
    return () => {
      return state.driverDeletingStatus
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
