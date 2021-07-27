<template>
  <div>
    <line-chart
      v-if="loading"
      :chart-data="data"
      :chart-labels="labels"
      :chart-options="options"
      data-label="Sales"
    />
  </div>
</template>

<script>
import EventBus from '@/components/core/event-bus'
export default {
  data() {
    return {
      labels: [],
      data: [],
      loading: false,
      options: {
        tooltips: {
          callbacks: {
            label(tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label || ''

              if (label) {
                label += ': '
              }
              label += new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
              }).format(tooltipItem.yLabel)

              return label
            },
          },
        },
      },
    }
  },
  mounted() {
    EventBus.$on('reloadDashboard', this.getData)
  },
  methods: {
    async getData({ store, month }) {
      if (store === -1) {
        return
      }

      const filter = `?store=${store}&month=${month}`

      const sales = await this.$axios.$get(
        '/laravel/api/dashboard/store/sales/daily' + filter
      )
      this.data = this.arrayColumn(sales, 'sales')
      this.labels = this.arrayColumn(sales, 'delivery_date')
      this.loading = true
    },
  },
}
</script>
