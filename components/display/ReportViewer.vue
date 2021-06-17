<template>
  <v-card
    flat
    tile
    color="#525659"
    class="pb-3"
    style="overflow: hidden"
    :height="`calc(100vh - 64px)`"
  >
    <v-toolbar dark :color="color.primary" dense>
      <template v-if="isDialog">
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="mr-3">
          <slot name="title"></slot>
        </v-toolbar-title>
        <v-divider vertical inset />
      </template>

      <v-btn
        icon
        title="First Page"
        :disabled="page === 1 || numPages === 0"
        @click="goToFirstPage"
      >
        <v-icon>mdi-arrow-collapse-left</v-icon>
      </v-btn>
      <v-btn
        icon
        title="Prev Page"
        :disabled="page === 1 || numPages === 0"
        @click="goToPrevPage"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <div class="my-auto mt-1">
        <v-text-field
          v-model.number="page"
          type="number"
          style="width: 50px"
          :max="numPages"
          :min="1"
          class="no-arrow-number-field mt-1 text-right"
          :suffix="`/ ${numPages || 1}`"
          flat
          single-line
        />
      </div>

      <v-btn
        icon
        title="Next Page"
        :disabled="page === numPages || numPages === 0"
        @click="goToNextPage"
      >
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn
        icon
        title="Last Page"
        :disabled="page === numPages || numPages === 0"
        @click="goToLastPage"
      >
        <v-icon>mdi-arrow-collapse-right</v-icon>
      </v-btn>

      <v-divider vertical inset />

      <v-btn icon title="Refresh PDF" @click="loadPDF">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>

      <v-divider vertical inset />
      <v-btn icon @click="toggleFullScreen">
        <v-icon v-if="fullscreen" title="Fit to page">
          mdi-fullscreen-exit
        </v-icon>
        <v-icon v-else title="Fit to width">mdi-fullscreen</v-icon>
      </v-btn>
      <v-btn icon @click="zoom(1)"><v-icon>mdi-magnify-plus</v-icon></v-btn>
      {{ scalePercent }}%
      <v-btn icon @click="zoom(-1)"><v-icon>mdi-magnify-minus</v-icon></v-btn>
      <v-spacer />

      <v-btn icon title="Rotate clockwise" @click="rotate += 90">
        <v-icon>mdi-rotate-right</v-icon>
      </v-btn>
      <v-btn icon title="Print" @click="print">
        <v-icon>mdi-printer</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="report-view" class="d-flex">
      <v-navigation-drawer
        v-if="hasSidebar"
        ref="filter-drawer"
        v-model="sidebar"
        height=""
      >
        <slot name="filter"></slot>
      </v-navigation-drawer>
      <v-scrollable :height="`calc(100vh - 64px)`" class="flex-grow-1">
        <div id="pdf-container" ref="pdf-container" class="d-flex">
          <div
            ref="card-area"
            :style="`width: ${width}%;`"
            class="mx-auto pb-3 card-area"
          >
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
              <v-card-text
                v-else-if="
                  statusTxt !== 'OK' &&
                  statusTxt !== '' &&
                  statusTxt !== 'loading'
                "
              >
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
        </div>
      </v-scrollable>
    </div>
  </v-card>
</template>

<script>
import pdf from 'vue-pdf'
import { mapState } from 'vuex'
import { renderer } from '@/plugins/renderer'
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
    hasSidebar: {
      type: Boolean,
      default: false,
    },
    landscape: {
      type: Boolean,
      default: false,
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
      statusTxt: 'empty',
      scalePercent: 100,
      instance: null,
      axis: {
        x: 1150,
        y: 160,
      },
      sidebar: false,
    }
  },
  computed: {
    ...mapState({
      color: (state) => state.app.color,
    }),
    width() {
      if (this.landscape) {
        return 80
      } else {
        return 50
      }
    },
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
    this.initRenderer()

    if (this.hasSidebar) {
      this.sidebar = true
    }
  },
  methods: {
    close() {
      this.$emit('update:showReport', false)
    },
    initRenderer() {
      const container = this.$refs['pdf-container']
      const pdf = this.$refs['card-area']
      let hold = false

      this.instance = renderer({
        minScale: 0.1,
        maxScale: 30,
        element: container.children[0],
        scaleSensitivity: 9.6,
      })

      pdf.addEventListener('mousedown', (event) => {
        pdf.style.cursor = 'all-scroll'
        hold = true

        event.preventDefault()
      })

      pdf.addEventListener('mouseup', (event) => {
        pdf.style.cursor = 'auto'
        hold = false

        event.preventDefault()
      })

      container.addEventListener('wheel', (event) => {
        if (!event.ctrlKey) {
          return
        }
        event.preventDefault()

        const scale = this.instance.zoom({
          deltaScale: Math.sign(event.deltaY) > 0 ? 1 : -1,
          x: event.pageX,
          y: event.pageY,
        })

        this.scalePercent = Math.round(scale * 100)
      })
      container.addEventListener('dblclick', () => {
        this.instance.panTo({
          originX: 0,
          originY: 0,
          scale: 1,
        })
        this.scalePercent = 100
      })
      pdf.addEventListener('mousemove', (event) => {
        if (!hold) {
          return
        }
        event.preventDefault()
        this.instance.panBy({
          originX: event.movementX,
          originY: event.movementY,
        })
      })
    },
    loadPDF() {
      this.destroyPdf()

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
    zoom(delta) {
      if (this.instance) {
        const scale = this.instance.zoom({
          deltaScale: delta,
          x: this.axis.x,
          y: this.axis.y,
        })

        this.scalePercent = Math.round(scale * 100)
      }
    },
    goToFirstPage() {
      this.page = 1
    },
    goToLastPage() {
      this.page = this.numPages
    },
    async goToPrevPage() {
      if (this.page > 1) {
        this.page = await new Promise((resolve) => {
          resolve((this.page -= 1))
        })
      }
    },
    async goToNextPage() {
      if (this.page < this.numPages) {
        this.page = await new Promise((resolve) => {
          resolve((this.page += 1))
        })
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

#pdf-container {
  height: 100%;
  width: 100%;
}

.card-area {
  height: 80%;
  width: 80%;
}
</style>
