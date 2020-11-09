import Model from './Model'
import InventoryAdjustmentDetail from './InventoryAdjustmentDetail'

export default class InventoryAdjustment extends Model {
  resource() {
    return 'inventory_adjustment'
  }

  details() {
    return this.hasMany(InventoryAdjustmentDetail)
  }
}
