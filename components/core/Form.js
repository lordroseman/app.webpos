// @ts-check
import axios from 'axios'
import Errors from './Errors'

class Form {
  /**
   * Create a new Form instance.
   * @param {object} data
   */

  constructor(data) {
    this.originalData = Object.assign({}, data)
    this.defaultValues = Object.assign({}, data)

    for (const field in data) {
      this[field] = data[field]
    }

    this.errors = new Errors()
  }

  /**
   * Set data in form object
   * @param {object} data
   */
  set(data) {
    for (const field in this.defaultValues) {
      this[field] = data[field]
      this.originalData[field] = data[field]
    }

    this.errors = new Errors()
  }

  confirmChanges() {
    for (const property in this) {
      if (
        property !== 'originalData' &&
        property !== 'errors' &&
        property !== 'defaultValues'
      ) {
        this.originalData[property] = this[property]
      }
    }
    this.errors = new Errors()
  }

  /**
   * Fetch all relevant data for the form
   */

  data() {
    const data = {}

    for (const property in this.originalData) {
      data[property] = this[property]
    }

    return data
  }

  /**
   * Fetch all has changed data for the form
   */

  changedData() {
    const data = {}

    for (const property in this.originalData) {
      if (this.originalData[property] !== this[property]) {
        data[property] = this[property]
      }
    }

    return data
  }

  hasChanges() {
    return (
      Object.entries(this.changedData()).length > 0 &&
      this.changedData().constructor === Object
    )
  }

  /**
   * Reset the form fields
   */

  reset() {
    for (const field in this.originalData) {
      this[field] = ''
    }

    this.errors.clear()
  }

  /*
   * Clear the form
   */
  clear() {
    for (const field in this.originalData) {
      this[field] = this.originalData[field]
      this.originalData[field] = this.defaultValues[field]
    }

    this.errors.clear()
  }

  /** d
   * Submit the form using POST method
   * @param {string} url
   */

  post(url) {
    return this.submit('post', url)
  }

  /**
   * Submit the form using PATCH method
   * @param {string} url
   */

  patch(url) {
    return this.submit('patch', url)
  }

  /**
   * Submit the form using PUT method
   * @param {string} url
   */

  put(url) {
    return this.submit('put', url)
  }

  /**
   * Submit the form using DELETE method
   * @param {string} url
   */
  delete(url) {
    return this.submit('delete', url)
  }

  /**
   * Submit the form
   * @param {string} requestType
   * @param {string} url
   */

  submit(requestType, url) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      axios[requestType](url, this.changedData())
        .then((response) => {
          this.onSuccess(response.data)

          resolve(response.data)
        })
        .catch((error) => {
          this.onFail(error.response.data)
          reject(error.response.data)
        })
    })
  }

  /**
   * Handle a successful form submission
   * @param {object} data
   */

  onSuccess(data) {
    // this.reset()
  }

  /**
   * Handle a failed form submission
   * @param {object} data
   */
  onFail(data) {
    this.errors.record(data)
  }
}

export default Form
