import { findIndex } from 'lodash'

export const state = () => ({
  cities: [],
  citiesLoadStatus: 0,

  citySendingStatus: 0,
  cityDeletingStatus: 0,

  errors: {},
  message: '',
  response: null,
})

export const actions = {
  async loadCities({ commit }) {
    commit('setCitiesLoadStatus', 1)

    await this.$axios
      .get('/laravel/api/city')
      .then(function (response) {
        commit('setCities', response.data.data)
        commit('setCitiesLoadStatus', 2)
      })
      .catch(function () {
        commit('setCities', [])
        commit('setCitiesLoadStatus', 3)
      })
  },

  /**
   *  ADD CITY
   */
  addCity({ commit }, data) {
    commit('setCitySendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/city', data)
      .then((response) => {
        commit('setMessage', 'City was added successfully')
        commit('setCitySendingStatus', 2)
        commit('pushCity', response.data)
        commit('setResponse', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCitySendingStatus', 3)
      })
  },

  /**
   *  EDIT CITY
   */
  editCity({ commit }, payload) {
    commit('setCitySendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/city/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'City was updated successfully')
        commit('setCitySendingStatus', 2)
        commit('updateCity', response.data)
        commit('setResponse', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCitySendingStatus', 3)
      })
  },

  /**
   *  DELETE CITY
   */
  deleteCity({ commit }, id) {
    commit('setCityDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/city/' + id)
      .then((response) => {
        commit('setCityDeletingStatus', 2)
        commit('deleteCity', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCityDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the cities load status
        */
  setCitiesLoadStatus(state, status) {
    state.citiesLoadStatus = status
  },

  /*
          Sets the user
          */
  setCities(state, user) {
    state.cities = user
  },

  /**
   *  Set City sending status
   */
  setCitySendingStatus(state, status) {
    state.citySendingStatus = status
  },

  /**
   * SET City deleting status
   * @param {status} status
   */
  setCityDeletingStatus(state, status) {
    state.cityDeletingStatus = status
  },

  /**
   *  Set response Message
   */
  setMessage(state, message) {
    state.message = message
  },

  /**
   *  set Errors
   *  @param {object} state
   * @param {object} errors
   */
  setErrors(state, errors) {
    state.errors = errors
  },

  /**
   *
   * @param {object} state
   * @param {object} response
   */
  setResponse(state, response) {
    state.response = response
  },

  /**
   *  PUSH City to array
   * @param {object} state
   * @param {object} data
   */
  pushCity(state, data) {
    const city = 'city' in data ? data.city : data

    state.cities.unshift(city)
  },

  /**
   *  DELETE City from array
   *   @param {object} state
   * @param {string} id
   */
  deleteCity(state, id) {
    const ind = findIndex(state.cities, (r) => {
      return r.id === id
    })

    state.cities.splice(ind, 1)
  },

  /**
   *  UPDATE city from array
   */
  updateCity(state, data) {
    const _city = 'city' in data ? data.city : data

    const ind = findIndex(state.cities, (r) => {
      return r.id === _city.id
    })

    const city = state.cities[ind]

    for (const prop in city) {
      city[prop] = _city[prop]
    }
  },
}

export const getters = {
  /*
        Returns the user load status.
        */
  getCitiesLoadStatus(state) {
    return function () {
      return state.citiesLoadStatus
    }
  },

  /*
          Returns the user.
          */
  getCities(state) {
    return state.cities
  },

  /**
   *  Return City sending status
   */
  getCitySendingStatus(state) {
    return () => {
      return state.citySendingStatus
    }
  },

  /**
   *  Return City deleting status
   */
  getCityDeletingStatus(state) {
    return () => {
      return state.cityDeletingStatus
    }
  },
}
