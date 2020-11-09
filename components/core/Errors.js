// @ts-check
class Errors {
  /**
   * Create a new Error instance.
   */

  constructor() {
    this.errors = {}
    this.message = ''
  }

  /**
   * Determine if an errors exists for the given field
   * @param {string} field
   */

  has(field) {
    // eslint-disable-next-line no-prototype-builtins
    return this.errors.hasOwnProperty(field)
  }

  /**
   * Determine if we have any errors
   */

  any() {
    return Object.keys(this.errors).length > 0
  }

  /**
   * Retrieve the error message for a field
   * @param {string} field
   */

  get(field) {
    if (this.errors[field]) {
      return this.errors[field][0]
    }
  }

  /**
   * Get all multiple errors of field
   * @param {string} field
   */
  getAll(field) {
    if (this.errors[field]) {
      return this.errors[field]
    }
  }

  /**
   * Record the new errors
   * @param {object} data
   */
  record(data) {
    this.errors = data.errors
    this.message = data.message
  }

  /**
   * Pushes new error record
   * @param {object} field
   * @param {object} error
   */
  set(field, error) {
    if (field in this.errors) {
      this.errors[field].push(error)
    } else {
      this.errors[field] = [error]
    }
  }

  /**
   * Clear one or all errors
   * @param {string=} field
   */

  clear(field) {
    if (field) {
      delete this.errors[field]
      return
    }
    this.errors = {}
  }
}

export default Errors
