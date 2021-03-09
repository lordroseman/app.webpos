<style lang="scss">
div.address-map {
  width: 100%;
}
</style>

<template>
  <div :id="id" class="address-map" :style="`height:${height}px`" />
</template>

<script>
export default {
  props: {
    lat: {
      type: Number,
      default() {
        return null
      },
    },
    lng: {
      type: Number,
      default() {
        return null
      },
    },
    zoom: {
      type: Number,
      default() {
        return 17
      },
    },
    height: {
      type: Number,
      default() {
        return 500
      },
    },
    id: {
      type: String,
      default: 'address-map',
    },
    disableMarker: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      markers: [],
      current_location: null,
      latLng: {},
      ramx_location: {
        lat: 10.666744,
        lng: 122.945681,
      },
    }
  },
  computed: {
    defaultLocation() {
      if (this.lat && this.lng) {
        return { lat: this.lat, lng: this.lng }
      }

      return this.ramx_location
    },
  },
  watch: {
    lat(val) {
      this.resetMap()
    },
  },
  mounted() {
    // eslint-disable-next-line no-undef
    this.map = new google.maps.Map(document.getElementById(this.id), {
      center: this.defaultLocation,
      zoom: this.zoom,
    })

    this.createMarker(this.defaultLocation)

    if (!this.disableMarker) {
      this.map.addListener('click', (e) => {
        this.placeMarkerAndPanTo(e.latLng, this.map)
        this.latLng = {
          lat: Number(e.latLng.lat().toFixed(8)),
          lng: Number(e.latLng.lng().toFixed(8)),
        }
        this.$emit('click', this.latLng)
      })
    }

    this.resetMap()
  },
  methods: {
    resetMap() {
      if (!this.lat && !this.lng) {
        // mark to current location if allowed
        this.current_location = this.setGeoLocation()
        if (this.current_location) {
          this.placeMarkerAndPanTo(this.current_pos)
        } else {
          this.placeMarkerAndPanTo(this.ramx_location)
        }
      } else {
        this.placeMarkerAndPanTo({ lat: this.lat, lng: this.lng })
      }
    },
    placeMarkerAndPanTo(latLng, map) {
      if (!map) {
        map = this.map
      }

      this.clearMarkers()
      this.createMarker(latLng, map)
      map.panTo(latLng)
    },
    createMarker(position, map) {
      if (!map) {
        map = this.map
      }

      // eslint-disable-next-line no-undef
      const marker = new google.maps.Marker({
        position,
        map,
        draggable: !this.disableMarker,
        // eslint-disable-next-line no-undef
        animation: google.maps.Animation.DROP,
      })

      if (!this.disableMarker) {
        marker.addListener('click', () => {
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null)
          } else {
            setTimeout(() => {
              // eslint-disable-next-line no-undef
              marker.setAnimation(google.maps.Animation.BOUNCE)
            }, 3000)
          }
        })
      }
      this.markers.push(marker)
    },
    /*
            Clears the markers from the map.
            */
    clearMarkers() {
      /*
                Iterate over all of the markers and set the map
                to null so they disappear.
            */
      for (let i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null)
      }
      this.markers = []
    },

    /**
     *
     */
    setGeoLocation() {
      navigator.geolocation.getCurrentPosition((position, html5Error) => {
        const geoLoc = this.processGeolocationResult(position)

        return geoLoc
      })
    },
    processGeolocationResult(position) {
      const html5Lat = position.coords.latitude // Get latitude
      const html5Lon = position.coords.longitude // Get longitude

      return {
        lat: Number(html5Lat.toFixed(8)),
        lng: Number(html5Lon.toFixed(8)),
      }
    },
  },
}
</script>
