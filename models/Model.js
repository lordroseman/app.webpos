import { Model as BaseModel } from 'vue-api-query'

export default class Model extends BaseModel {
  // define a base url for a REST API
  baseURL() {
    return '/laravel/api'
  }

  // implement a default request method
  request(config) {
    return this.$http.request(config)
  }

  limit(val) {
    this.paginate({ size: val })
    return this
  }

  page(val) {
    this.paginate({ number: val })
    return this
  }

  paginate(params) {
    const existing =
      this._builder.payload && this._builder.payload.page
        ? this._builder.payload.page
        : {}
    if (this._builder.pageValue) {
      existing.number = this._builder.pageValue
    }
    if (this._builder.limitValue) {
      existing.size = this._builder.limitValue
    }
    this._builder.payload = {
      ...this._builder.payload,
      page: {
        ...existing,
        ...params,
      },
    }
    return this
  }
}
