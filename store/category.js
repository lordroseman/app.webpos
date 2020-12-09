import { findIndex } from 'lodash'

export const state = () => ({
  categories: [],
  categoriesLoadStatus: 0,

  categorySendingStatus: 0,
  categoryDeletingStatus: 0,

  errors: {},
  message: '',
})

export const actions = {
  async loadCategories({ commit }) {
    commit('setCategoriesLoadStatus', 1)

    await this.$axios
      .get('/laravel/api/category')
      .then(function (response) {
        commit('setCategories', response.data)
        commit('setCategoriesLoadStatus', 2)
      })
      .catch(function () {
        commit('setCategories', [])
        commit('setCategoriesLoadStatus', 3)
      })
  },

  /**
   *  ADD CATEGORY
   */
  addCategory({ commit }, data) {
    commit('setCategorySendingStatus', 1)
    commit('setErrors', {})
    this.$axios
      .post('/laravel/api/category', data)
      .then((response) => {
        commit('setMessage', 'Category was added successfully')
        commit('setCategorySendingStatus', 2)
        commit('pushCategory', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCategorySendingStatus', 3)
      })
  },

  /**
   *  EDIT CATEGORY
   */
  editCategory({ commit }, payload) {
    commit('setCategorySendingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .put('/laravel/api/category/' + payload.id, payload.data)
      .then((response) => {
        commit('setMessage', 'Category was updated successfully')
        commit('setCategorySendingStatus', 2)
        commit('updateCategory', response.data)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCategorySendingStatus', 3)
      })
  },

  /**
   *  DELETE CATEGORY
   */
  deleteCategory({ commit }, id) {
    commit('setCategoryDeletingStatus', 1)
    commit('setErrors', {})

    this.$axios
      .delete('/laravel/api/category/' + id)
      .then((response) => {
        commit('setCategoryDeletingStatus', 2)
        commit('deleteCategory', id)
      })
      .catch((errors) => {
        commit('setErrors', errors.response.data)
        commit('setCategoryDeletingStatus', 3)
      })
  },
}

export const mutations = {
  /*
        Sets the categories load status
        */
  setCategoriesLoadStatus(state, status) {
    state.categoriesLoadStatus = status
  },

  /*
          Sets the user
          */
  setCategories(state, user) {
    state.categories = user
  },

  /**
   *  Set Category sending status
   */
  setCategorySendingStatus(state, status) {
    state.categorySendingStatus = status
  },

  /**
   * SET Category deleting status
   * @param {state} state
   * @param {status} status
   */
  setCategoryDeletingStatus(state, status) {
    state.categoryDeletingStatus = status
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
   *  PUSH Category to array
   */
  pushCategory(state, category) {
    state.categories.unshift(category)
  },

  /**
   *  DELETE Category from array
   */
  deleteCategory(state, id) {
    const ind = findIndex(state.categories, (r) => {
      return r.id === id
    })

    state.categories.splice(ind, 1)
  },

  /**
   *  UPDATE category from array
   */
  updateCategory(state, data) {
    const ind = findIndex(state.categories, (r) => {
      return r.id === data.id
    })

    const category = state.categories[ind]

    for (const prop in data) {
      category[prop] = data[prop]
    }
  },
}

export const getters = {
  /*
    Returns the user load status.
    */
  getCategoriesLoadStatus(state) {
    return function () {
      return state.categoriesLoadStatus
    }
  },

  /*
    Returns the user.
    */
  getCategories(state) {
    return state.categories
  },

  /**
   *  Return Category sending status
   */
  getCategorySendingStatus(state) {
    return () => {
      return state.categorySendingStatus
    }
  },

  /**
   *  Return Category deleting status
   */
  getCategoryDeletingStatus(state) {
    return () => {
      return state.categoryDeletingStatus
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
