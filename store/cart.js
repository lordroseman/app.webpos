export const state = () => ({
  cart: [],
  cartQty: 0,
  cartTotal: 0,
})

export const mutations = {
  addToCart(state, item, qty = 1) {
    // check if exists
    const ind = state.cart.findIndex((i) => i.item_id === item.item_id)

    if (ind === -1) {
      state.cart.push(item)
    } else {
      state.cart[ind].quantity += qty
      state.cart[ind].line_total = Number(
        (state.cart[ind].line_total + state.cart[ind].item_price).toFixed(2)
      )

      if (state.cart[ind]._state !== 'new') {
        state.cart[ind]._state = 'edited'
      }
    }

    const cartTotal = state.cartTotal * 100
    const price = item.item_price * 100

    const total = cartTotal + price

    state.cartTotal = total / 100
    state.cartQty += qty
  },
  lessCart(state, item, qty = 1) {
    // check if exists
    const ind = state.cart.findIndex((i) => i.item_id === item.item_id)

    if (ind > -1) {
      state.cart[ind].quantity -= qty
      state.cart[ind].line_total = Number(
        (state.cart[ind].line_total - state.cart[ind].item_price).toFixed(2)
      )
      state.cartQty -= qty
      state.cartTotal = Number((state.cartTotal - item.item_price).toFixed(2))

      if (state.cart[ind]._state !== 'new') {
        state.cart[ind]._state = 'edited'
      }
    }
  },
  removeCart(state, item) {
    // check if exists
    const ind = state.cart.findIndex((i) => i.item_id === item.item_id)
    if (ind > -1) {
      const total = item.line_total
      const _cart = state.cart[ind]

      state.cartTotal = Number((state.cartTotal - total).toFixed(2))
      state.cartQty -= item.quantity
      if (_cart._state === 'new') {
        state.cart.splice(ind, 1)
      } else {
        _cart.quantity = 0
        _cart.line_total = 0
        _cart._state = 'deleted'
      }
    }
  },
  updateCart(state, item) {
    // check if exists
    const ind = state.cart.findIndex((i) => i.item_id === item.item_id)
    if (ind > -1) {
      const prevItem = state.cart[ind]
      const prevTotal = prevItem.line_total

      for (const props in item) {
        state.cart[ind][props] = item[props]
      }

      if ('line_total' in item) {
        state.cartTotal = state.cartTotal - prevTotal + item.line_total
      }

      if ('quantity' in item) {
        state.cartQty = state.cartQty - prevItem.quantity + item.quantity
      }
    }
  },
  clearCart(state) {
    state.cart = []
    state.cartQty = 0
    state.cartTotal = 0
  },
  setCart(state, details) {
    let total = 0
    let qty = 0
    for (const detail of details) {
      total += detail.line_total
      qty += detail.quantity
    }
    state.cart = details
    state.cartTotal = total
    state.cartQty = qty
  },
  setTotal(state, total) {
    state.cartTotal = total
  },
}

export const actions = {
  addToCart({ commit }, item, qty) {
    commit('addToCart', item, qty)
  },
  lessCart({ commit }, item, qty) {
    if (item._state !== 'deleted') {
      if (item.quantity <= 1) {
        commit('removeCart', item, qty)
      } else {
        commit('lessCart', item)
      }
    }
  },
  removeCart({ commit }, item) {
    if (item._state !== 'deleted') {
      commit('removeCart', item)
    }
  },
  updateCart({ commit }, item) {
    if (item._state !== 'deleted') {
      commit('updateCart', item)
    }
  },
  clearCart({ commit }) {
    commit('clearCart')
  },
  setCart({ commit }, details) {
    commit('setCart', details)
  },
  setTotal({ commit }, total) {
    commit('setTotal', total)
  },
}

export const getters = {
  getCartQty(state) {
    let totalQty = 0

    for (const item of state.cart) {
      if (item._state !== 'deleted') {
        totalQty += item.quantity
      }
    }

    return totalQty
  },
  getCartTotal(state) {
    let lineTotal = 0

    for (const item of state.cart) {
      if (item._state !== 'deleted') {
        lineTotal += item.line_total
      }
    }

    return lineTotal
  },
}
