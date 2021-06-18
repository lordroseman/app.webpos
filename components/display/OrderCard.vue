<template>
  <v-card class="mx-auto mb-3" outlined>
    <v-list-item three-line>
      <v-list-item-content>
        <div class="d-flex flex-row">
          <div class="overline mb-4">TRX {{ transaction.txn_number }}</div>
          <v-spacer />
          <h1 class="green--text">
            {{ toCurrency(transaction.total_amount) }}
          </h1>
        </div>

        <v-list-item-title class="headline mb-1">
          {{
            transaction.walkin ? 'WALK-IN CUSTOMER' : transaction.customer_name
          }}
        </v-list-item-title>
        <v-list-item-subtitle>
          <template v-for="detail in transaction.details">
            {{ toNumberFormat(detail.quantity) }} {{ detail.item_unit }}
            {{ detail.item_name }};
          </template>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-card-actions class="d-flex justify-end">
      <v-chip
        class="white--text ml-0"
        :color="getLastLabel(transaction.labels, 'color')"
        label
        small
      >
        {{ getLastLabel(transaction.labels, 'title') }}
      </v-chip>
      <v-spacer />
      <v-btn text :to="`/s/transaction/${transaction.id}`"> View </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    transaction: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapState({
      labels: (state) => state.app.labels,
    }),
  },
  methods: {
    getLastLabel(labels, prop) {
      if (labels.length === 0) {
        return null
      }

      const label = labels[0]

      const lbl = this.labels.filter((i) => i.id === label.label_id)[0]

      if (prop) {
        return lbl[prop]
      }

      return lbl
    },
  },
}
</script>

<style></style>
