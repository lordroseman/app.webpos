<template>
  <div>
    <v-card
      v-if="!src"
      :height="height"
      :width="width"
      class="d-flex"
      color=""
      outlined
    >
      <div class="ma-auto red--text">Customer has no map details</div>
    </v-card>
    <v-img
      v-else
      :height="height"
      :width="width"
      contain
      :src="src"
      :lazy-src="require('@/static/preload.png')"
    />
  </div>
</template>

<script>
export default {
  props: {
    lat: {
      type: Number,
      default: null,
    },
    long: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: 200,
    },
    width: {
      type: Number,
      default: 300,
    },
    zoom: {
      type: Number,
      default: 15,
    },
  },
  data() {
    return {
      gmaps: 'https://maps.googleapis.com/maps/api/staticmap?',
    }
  },
  computed: {
    src() {
      let url = `https://maps.googleapis.com/maps/api/staticmap?center=${this.lat},${this.long}&markers=${this.lat},${this.long}&size=${this.width}x${this.height}&zoom=${this.zoom}&key=${this.apiKey}`

      if (this.lat === null || this.long === null) {
        url = null
      }

      return url
    },
    apiKey() {
      return this.$config.googleMapsStaticApiKey
    },
    attrs() {
      return {
        height: this.height + 'px',
        width: this.width + 'px',
      }
    },
  },
  mounted() {},
}
</script>
