import Model from './Model'
import TransactionDetail from './TransactionDetail'
import TransactionLabel from './TransactionLabel'

export default class Transaction extends Model {
  resource() {
    return 'transaction'
  }

  details() {
    return this.hasMany(TransactionDetail)
  }

  labels() {
    return this.hasMany(TransactionLabel)
  }
}
