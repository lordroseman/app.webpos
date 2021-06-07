import Model from './Model'
import Item from './Item'

export default class SubCategory extends Model {
  resource() {
    return 'subcategory'
  }

  items() {
    return this.hasMany(Item)
  }
}
