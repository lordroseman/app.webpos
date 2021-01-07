<template>
  <div>
    <div class="d-flex my-2">
      <div>
        <span class="text-h6">
          Transaction # {{ transaction.txn_number }}
        </span>
        <a
          :href="'/transaction/' + transaction.id"
          target="_blank"
          style="text-decoration: none"
        >
          <v-icon small class="blue--text"> mdi-open-in-new </v-icon>
        </a>
      </div>
      <v-chip
        :color="status[transaction.status].color"
        text-color="white"
        x-small
        class="ml-auto my-auto"
      >
        {{ status[transaction.status].text }}
      </v-chip>
    </div>
    <v-divider />
    <div class="d-flex px-2 py-2">
      <div class="mr-auto">
        <div class="text-overline">Customer</div>
        <div class="ml-3">{{ transaction.customer_name }}</div>
        <div class="ml-3">{{ transaction.customer_contact_number }}</div>
        <div class="ml-3">{{ transaction.customer_delivery_address }}</div>
      </div>
      <div class="d-flex-inline">
        <div>Date: {{ transaction.txn_date }}</div>
        <div>Store: {{ transaction.store.name }}</div>
        <div>Payment Option: {{ transaction.payment_option.name }}</div>
        <div class="text-subtitle-2">
          TOTAL: {{ toCurrency(transaction.total_amount) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    transaction: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      status: [
        { text: 'UPCOMING', color: 'blue' },
        { text: 'OPEN', color: 'green' },
        { text: 'CLOSE', color: 'red' },
      ],
    }
  },
}
</script>

<style></style>
