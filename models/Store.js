import Model from './Model'
import Item from './Item'

export default class Store extends Model {
  resource() {
    return 'store'
  }

  items() {
    return this.hasMany(Item)
  }
}
