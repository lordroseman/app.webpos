<template>
  <div>
    <v-divider />
    <v-data-table
      :headers="tblHeaders"
      :items="payments"
      show-expand
      single-expand
    >
      <template #[`item.amount`]="{ item }">
        {{ toCurrency(item.amount) }}
      </template>
      <template #[`item.action`]="{ item }">
        <v-btn
          v-if="showDelete"
          fab
          dark
          x-small
          color="red"
          @click="remove(item)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <div class="px-5">Notes : {{ item.notes }}</div>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { reject } from 'lodash'
export default {
  props: {
    payments: {
      type: Array,
      default: () => [],
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tblHeaders: [
        { text: '', value: 'data-table-expand' },
        { text: 'Date', value: 'payment_date' },
        { text: 'Encoded by', value: 'user.name' },
        { text: 'Payment Method', value: 'option.name' },
        { text: 'Reference Number', value: 'reference_number' },
        { text: 'Amount', value: 'amount' },
        { text: '', value: 'action', width: 40, sortable: false },
      ],
    }
  },
  computed: {
    showDelete() {
      if (this.$can('Transaction:Delete Payment')) {
        return this.editable
      } else {
        return false
      }
    },
  },
  methods: {
    remove(item) {
      const id = item.id
      const transactionId = item.transaction_id

      this.$swal
        .fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          showLoaderOnConfirm: true,
          preConfirm: (e) => {
            return new Promise((resolve, reject) => {
              this.$axios
                .delete(
                  `/laravel/api/transaction/${transactionId}/payment/${id}`
                )
                .then((resp) => {
                  if (resp.status === 200) {
                    if ('label' in resp.data) {
                      this.$emit('addLabel', resp.data.label)
                    }
                    resolve(true)
                  }
                })
                .catch((errors) => {
                  this.$swal.showValidationMessage(
                    `Request failed: ${this.errors.message}`
                  )
                  reject(this.errors)
                })
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire('Deleted!', 'Payment  has been deleted.', 'success')

            this.$emit(
              'update:payments',
              reject(this.payments, (r) => r.id === id)
            )
          }
        })
    },
  },
}
</script>

<style></style>
