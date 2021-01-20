<template>
  <v-card flat color="#525659" class="pb-3">
    <v-toolbar dark color="primary" dense>
      <v-btn v-if="isDialog" icon dark @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>
        <slot name="title"></slot>
      </v-toolbar-title>
      <v-spacer />
      <div class="my-auto mt-1">
        <v-text-field
          v-model.number="page"
          type="number"
          style="width: 50px"
          :max="numPages"
          :min="1"
          class="no-arrow-number-field"
          :suffix="`/ ${numPages || 1}`"
          flat
          single-line
        />
      </div>
      <v-spacer />
      <v-btn icon title="Refresh PDF" @click="loadPDF">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn icon title="Rotate clockwise" @click="rotate += 90">
        <v-icon>mdi-rotate-right</v-icon>
      </v-btn>
      <v-btn icon title="Print" @click="print">
        <v-icon>mdi-printer</v-icon>
      </v-btn>
    </v-toolbar>

    <div class="d-flex-inline" style="height: calc(100% - 48); overflow: auto">
      <div :style="`width: ${width}%`" class="mx-auto pb-3">
        <div
          v-if="loadedRatio > 0 && loadedRatio < 1"
          style="background-color: green; color: white; text-align: center"
          :style="{ width: loadedRatio * 100 + '%' }"
        >
          {{ Math.floor(loadedRatio * 100) }}%
        </div>
        <v-card
          elevation="5"
          flat
          class="mt-3"
          :loading="statusTxt == 'loading'"
          :height="800"
        >
          <template v-if="statusTxt == 'loading'">
            <v-card-text>
              <div>
                <v-skeleton-loader
                  type="table-heading, divider, list-item-three-line, table, divider, actions"
                ></v-skeleton-loader>
              </div>
            </v-card-text>
          </template>
          <template v-if="statusTxt == 'empty'">
            <v-card-text>
              <v-alert type="info" prominent>
                <div>
                  {{ statusTxt }}
                </div>
                <v-divider class="my-3 error" />
                <div>Report is empty, please generate report.</div>
              </v-alert>
            </v-card-text>
          </template>
          <v-card-text v-else-if="statusTxt !== 'OK' && statusTxt !== ''">
            <v-alert type="error" prominent>
              <div>
                {{ statusTxt }}
              </div>
              <v-divider class="my-3 error" />
              <div>
                Click refresh <kbd><v-icon>mdi-refresh</v-icon></kbd> while
                holding <kbd>ALT</kbd> key to display the pdf.
              </div>
            </v-alert>
          </v-card-text>
          <pdf
            v-if="show || statusTxt === ''"
            ref="pdf"
            :src="pdfSrc"
            :page="page"
            :rotate="rotate"
            @progress="loadedRatio = $event"
            @error="error"
            @num-pages="numPages = $event"
            @link-clicked="page = $event"
          ></pdf>
        </v-card>
      </div>

      <div style="position: relative">
        <div
          class="d-flex justify-end"
          style="position: sticky; bottom: 100px; right: 20px"
        >
          <div>
            <div class="mb-2">
              <v-btn fab x-small @click="toggleFullScreen">
                <v-icon v-if="fullscreen" title="Fit to page"
                  >mdi-fullscreen-exit</v-icon
                >
                <v-icon v-else title="Fit to width">mdi-fullscreen</v-icon>
              </v-btn>
            </div>
            <div class="mb-2">
              <v-btn fab x-small @click="zoom(10)">+</v-btn>
            </div>
            <div class="mb-2">
              <v-btn fab x-small @click="zoom(-10)">-</v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import pdf from 'vue-pdf'
export default {
  components: {
    pdf,
  },
  props: {
    showReport: {
      type: Boolean,
      default: false,
    },
    src: {
      type: String,
      default: '',
    },
    params: {
      type: Object,
      default: () => {},
    },
    isDialog: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      pdfSrc: null,
      numPages: 0,
      show: false,
      loadedRatio: 0,
      page: 1,
      rotate: 0,
      objectUrl: null,
      fullscreen: false,
      width: 50,
      statusTxt: 'empty',
    }
  },
  watch: {
    showReport(value) {
      if (value) {
        this.loadPDF()
      } else {
        this.destroyPdf()
      }
    },
    page(newVal, oldVal) {
      if (newVal > this.numPages || newVal < 1) {
        this.page = oldVal
      }
    },
    statusTxt(val) {
      if (val === 'OK') {
        this.show = true
      }
    },
    params: {
      handler() {
        this.destroyPdf()
        this.loadPDF()
      },
      deep: true,
    },
  },
  mounted() {
    if (this.isDialog) {
      this.loadPDF()
    }
  },
  methods: {
    close() {
      this.$emit('update:showReport', false)
    },
    loadPDF() {
      this.destroyPdf()
      // eslint-disable-next-line no-console
      console.log('load pdf')
      this.statusTxt = 'loading'
      this.$axios
        .get(this.src, {
          responseType: 'blob',
          params: this.params,
        })
        .then((response) => {
          // eslint-disable-next-line no-console
          console.log('Success', response)
          this.statusTxt = response.statusText
          const blob = new Blob([response.data], { type: 'application/pdf' })
          this.objectUrl = URL.createObjectURL(blob)
          this.pdfSrc = pdf.createLoadingTask(this.objectUrl)
          // eslint-disable-next-line no-console
          console.log('this.pdfsrc.promise', this.pdfSrc.promise)
          this.pdfSrc.promise.then((xpdf) => {
            // eslint-disable-next-line no-console
            console.log('pdf in callback', xpdf)
            this.numPages = xpdf.numPages
            // eslint-disable-next-line no-console
            console.log(
              `this.numPages: ${this.numPages} pdf.numPages: ${xpdf.numPages} `
            )
          })

          this.$emit('loaded')
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log('error', error)
          this.$emit('error', error)
        })
    },
    error(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    },
    destroyPdf() {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl)
        this.pdfSrc = null
        this.objectUrl = null
        this.statusTxt = 'loading'
        this.page = 1
      }
    },
    print() {
      this.$refs.pdf.print()
      this.$emit('print')
    },
    toggleFullScreen() {
      if (!this.fullscreen) {
        this.width = 100
      } else {
        this.width = 30
      }

      this.fullscreen = !this.fullscreen
    },
    zoom(val) {
      this.width += val

      if (this.width < 10) {
        this.width = 10
      } else if (this.width > 200) {
        this.width = 200
      }
    },
  },
}
</script>

<style>
.no-arrow-number-field input[type='number']::-webkit-inner-spin-button,
.no-arrow-number-field input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
