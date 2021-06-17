import Transaction from '@/models/Transaction'
import InventoryAdjustment from '@/models/InventoryAdjustment'
import Store from '@/models/Store'
import Customer from '@/models/Customer'
import CustomerAddress from '@/models/CustomerAddress'
import Discount from '@/models/Discount'
import Report from '@/models/Report'
import SubCategory from '@/models/SubCategory'
import Item from '@/models/Item'

export default ({ $axios }, inject) => {
  const api = {
    Transaction,
    InventoryAdjustment,
    Store,
    Customer,
    CustomerAddress,
    Report,
    Discount,
    SubCategory,
    Item,
  }

  inject('api', api)
}
