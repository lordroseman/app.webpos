<template>
  <div>
    <v-card v-for="(address, i) in addresses" :key="i" flat>
      <v-card-title>
        <span>{{ address.title }}</span>
        <v-chip color="blue" dark class="ml-3" small>Primary</v-chip>
      </v-card-title>
      <v-card-text>
        <div class="d-flex">
          <div>
            <div class="d-flex">
              <div class="text-seconddary">Address</div>
              <div class="ml-5">
                <b>{{ address.address }}</b>
              </div>
            </div>
            <div class="d-flex">
              <div class="text-secondary">City</div>
              <div class="ml-5">
                <b>{{ address.city.name }}</b>
              </div>
              <div class="text-secondary ml-5">Barangay</div>
              <div class="ml-5">
                <b>{{ address.barangay.name }}</b>
              </div>
            </div>
          </div>
          <div class="mx-auto">
            <v-btn text small @click="showGoogleMap(address)">
              <v-icon left>mdi-map</v-icon>
              <span class="d-none d-md-block"> View in Map </span>
            </v-btn>
          </div>
        </div>
        <v-divider class="my-3" />
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="showMap"
      persistent
      max-width="800"
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card>
        <v-card-title class="headline"> Google Map </v-card-title>
        <v-card-text class="px-0 pb-0">
          <address-map
            :lat="activeAddress.lat"
            :lng="activeAddress.lng"
            :disable-marker="true"
            :height="
              $vuetify.breakpoint.smAndDown
                ? $vuetify.breakpoint.height - 130
                : 500
            "
          ></address-map>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="showMap = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    addresses: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showMap: false,
      activeAddress: {},
    }
  },
  methods: {
    showGoogleMap(address) {
      this.activeAddress = address

      this.showMap = true
    },
  },
}
</script>

<style></style>
