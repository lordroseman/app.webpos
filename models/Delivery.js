import Model from './Model'
import DeliveryDetail from './DeliveryDetail'

export default class Delivery extends Model {
  resource() {
    return 'delivery'
  }

  details() {
    return this.hasMany(DeliveryDetail)
  }
}
