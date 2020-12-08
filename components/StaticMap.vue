<template>
  <v-img
    :height="height"
    :width="width"
    contain
    :src="src"
    :lazy-src="require('@/static/preload.png')"
  />
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
      const url = `https://maps.googleapis.com/maps/api/staticmap?center=${this.lat},${this.long}&markers=${this.lat},${this.long}&size=${this.width}x${this.height}&zoom=${this.zoom}&key=${this.apiKey}`
      return url
    },
    apiKey() {
      return this.$config.googleMapsStaticApiKey
    },
  },
  mounted() {},
}
</script>
