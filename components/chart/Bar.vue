<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    chartData: {
      type: Array,
      required: false,
      default: () => [],
    },
    chartLabels: {
      type: Array,
      required: true,
    },
    dataLabel: {
      type: String,
      required: true,
    },
    chartOptions: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    }
  },
  mounted() {
    this.renderChart(
      {
        labels: this.chartLabels,
        datasets: [
          {
            label: this.dataLabel,
            borderColor: '#249EBF',
            pointBackgroundColor: 'white',
            borderWidth: 1,
            pointBorderColor: '#249EBF',
            data: this.chartData,
            maxBarThickness: 100,
          },
        ],
      },
      { ...this.options, ...this.chartOptions }
    )
  },
}
</script>
