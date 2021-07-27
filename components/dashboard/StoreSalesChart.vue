<template>
  <div>
    <bar
      v-if="loading"
      :chart-data="data"
      :chart-labels="labels"
      :chart-options="options"
      data-label="Sales"
    />
  </div>
</template>

<script>
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
    this.getData()
  },
  methods: {
    async getData() {
      const sales = await this.$axios.$get('/laravel/api/dashboard/store/sales')
      this.data = this.arrayColumn(sales, 'sales')
      this.labels = this.arrayColumn(sales, 'store')
      this.loading = true
    },
  },
}
</script>
