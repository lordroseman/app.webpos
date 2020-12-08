import Model from './Model'
import CustomerAddress from './CustomerAddress'
import Transaction from './Transaction'

export default class Customer extends Model {
  resource() {
    return 'customer'
  }

  addresses() {
    return this.hasMany(CustomerAddress)
  }

  transactions() {
    return this.hasMany(Transaction)
  }
}
