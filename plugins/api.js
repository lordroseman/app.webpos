import Transaction from '@/models/Transaction'
import InventoryAdjustment from '@/models/InventoryAdjustment'
import Store from '@/models/Store'

export default ({ $axios }, inject) => {
  const api = {
    Transaction,
    InventoryAdjustment,
    Store,
  }

  inject('api', api)
}
