import Model from './Model'
import TransactionDetail from './TransactionDetail'

export default class Transaction extends Model {
  resource() {
    return 'transaction'
  }

  details() {
    return this.hasMany(TransactionDetail)
  }
}
