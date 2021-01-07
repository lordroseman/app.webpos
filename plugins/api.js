import Transaction from '@/models/Transaction'
import InventoryAdjustment from '@/models/InventoryAdjustment'
import Store from '@/models/Store'
import Customer from '@/models/Customer'
import CustomerAddress from '@/models/CustomerAddress'
import Report from '@/models/Report'

export default ({ $axios }, inject) => {
  const api = {
    Transaction,
    InventoryAdjustment,
    Store,
    Customer,
    CustomerAddress,
    Report,
  }

  inject('api', api)
}
