<template>
  <v-scrollable :height="'calc(100vh - 36px)'">
    <!-- Provides the application the proper gutter -->
    <v-container fluid>
      <v-row>
        <v-col
          v-for="(item, index) in stores"
          :key="index"
          cols="12"
          sm="6"
          md="3"
          xl="2"
        >
          <v-card flat @click="gotoStore(item)">
            <div
              v-if="item.image_mime == null"
              class="d-flex justify-center"
              style="height: 200px"
            >
              <v-icon size="150" color="#d1d1d1">mdi-storefront-outline</v-icon>
            </div>
            <v-img
              v-if="item.image_mime !== null"
              height="200px"
              :src="image(item)"
            />
            <v-card-text>
              <div class="d-flex justify-space-between">
                <span style="text-transform: uppercase; font-weight: bold">{{
                  item.name
                }}</span>
                <span>
                  <v-icon color="#E64A19" x-small>mdi-star</v-icon>
                </span>
              </div>
              <div
                style="
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                <span></span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-scrollable>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      store: [],
    }
  },
  computed: {
    ...mapState({
      stores: (state) => state.store.stores,
      storesLoadStatus: (state) => state.store.storesLoadStatus,
    }),
  },
  beforeMount() {
    if (this.storesLoadStatus !== 2) {
      this.$store.dispatch('store/loadStores')
    }
  },
  methods: {
    image(item) {
      return 'data: ' + item.image_mime + ';base64, ' + item.image_base64
    },
    gotoStore(store) {
      this.$store.dispatch('mobile/setActiveStore', store)
      this.$router.push('/c/store/' + store.id)
    },
  },
}
</script>
