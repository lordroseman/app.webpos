import { findIndex } from 'lodash'

export const state = () => ({
  users: [],
  usersLoadStatus: 0,

  userSendingStatus: 0,
  userDeletingStatus: 0,

  response: null,
  errors: null,
  message: '',

  access_level: [
    { text: 'Administrator', value: 1 },
    { text: 'Store Admin', value: 2 },
    { text: 'Customer', value: 3 },
    { text: 'Driver', value: 4 },
  ],
})

export const actions = {
  loadUsers({ commit }) {
    commit('setUsersLoadStatus', 1)

    this.$axios
      .get('/laravel/api/users')
      .then(function (response) {
        commit('setUsers', response.data)
        commit('setUsersLoadStatus', 2)
      })
      .catch(function () {
        commit('setUsers', {})
        commit('setUsersLoadStatus', 3)
      })
  },

  /**
   *  ADD USER
   */
  addUser({ commit }, data) {
    commit('setUserSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/users', data)
      .then((response) => {
        commit('setMessage', 'User was added successfully')
        commit('setUserSendingStatus', 2)
        commit('pushUser', response.data)
        commit('setResponseData', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setUserSendingStatus', 3)
      })
  },

  /**
   *  EDIT USER
   */
  editUser({ commit }, { id, data }) {
    commit('setUserSendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .put('/laravel/api/users/' + id, data)
      .then((response) => {
        commit('setMessage', 'User was updated successfully')
        commit('setUserSendingStatus', 2)
        commit('setResponseData', response.data)
        commit('updateUser', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setUserSendingStatus', 3)
      })
  },

  /**
   *  DELETE USER
   */
  deleteUser({ commit }, id) {
    commit('setUserDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/users/' + id)
      .then((response) => {
        commit('setUserDeletingStatus', 2)
        commit('deleteUser', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setUserDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the users load status
        */
  setUsersLoadStatus(state, status) {
    state.usersLoadStatus = status
  },

  /*
          Sets the users
          */
  setUsers(state, users) {
    state.users = users
  },

  /*
          Sets the users update status
          */
  setUsersUpdateStatus(state, status) {
    state.usersUpdateStatus = status
  },

  setUserSendingStatus(state, status) {
    state.userSendingStatus = status
  },

  setUserDeletingStatus(state, status) {
    state.userDeletingStatus = status
  },

  pushUser(state, data) {
    if ('user' in data) {
      data = data.user
    }

    state.users.push(data)
  },

  setResponseData(state, data) {
    state.response = data
  },

  setErrors(state, errors) {
    state.errors = errors
  },

  setMessage(state, message) {
    state.message = message
  },
  /**
   *  UPDATE User from array
   */
  updateUser(state, data) {
    const ind = findIndex(state.users, (r) => {
      return r.id === data.id
    })

    if (ind > -1) {
      const user = state.users[ind]

      for (const prop in data) {
        user[prop] = data[prop]
      }
    }
  },

  /**
   *  DELETE User from array
   */
  deleteUser(state, id) {
    const ind = findIndex(state.users, (r) => {
      return r.id === id
    })

    state.users.splice(ind, 1)
  },
}

export const getters = {
  /*
        Returns the users load status.
        */
  getUsersLoadStatus(state) {
    return function () {
      return state.usersLoadStatus
    }
  },

  /*
          Returns the users load status.
          */
  getUserSendingStatus(state) {
    return function () {
      return state.userSendingStatus
    }
  },

  /*
          Returns the users load status.
          */
  getUserDeletingStatus(state) {
    return function () {
      return state.userDeletingStatus
    }
  },

  /*
          Returns the users.
          */
  getUsers(state) {
    return state.users
  },

  /*
          Gets the users update status
          */
  getUsersUpdateStatus(state, status) {
    return state.usersUpdateStatus
  },
}
