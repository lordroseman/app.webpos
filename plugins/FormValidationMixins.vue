<script>
import { startCase } from 'lodash'
export default {
  computed: {
    custom_attributes() {
      return this.attributes || {}
    },
  },
  watch: {
    $v: {
      handler(val, oldval) {
        const form = val.form
        const formParams = val.form.$params
        this.errors.clear()
        if (form.$error) {
          for (const field in formParams) {
            if (field in form) {
              if (form[field].$invalid) {
                const fieldParams = form[field].$params
                for (const validator in fieldParams) {
                  if (!form[field][validator]) {
                    this.errors.set(
                      field,
                      this.getErrorMessage(field, validator)
                    )
                  }
                }
              }
            }
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    getErrorMessage(field, validator) {
      const customMessage = this.customMessage || {}

      // check if theres custom message
      if (`${validator}_${field}` in customMessage) {
        validator = `${validator}_${field}`
      }

      if (field in this.custom_attributes) {
        field = this.custom_attributes[field]
      } else {
        field = startCase(field)
      }

      const message = {
        required: `${field} is required`,
        decimal: `${field} mmust be decimal number`,
        ...customMessage,
      }

      return message[validator]
    },
  },
}
</script>
