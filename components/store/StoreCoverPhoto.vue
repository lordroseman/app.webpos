<template>
  <div class="black rounded-t-xl px-4 pt-4" style="width: 100%">
    <div
      class="rounded my-4 mx-auto white"
      style="width: 100px; height: 5px"
    ></div>
    <div
      class="white rounded-t-lg text--primary"
      style="width: 100%; height: 400px"
    >
      <div class="grey rounded-t-lg lighten-2 d-flex py-2 px-2">
        <span>APP</span>
        <span class="white mx-3 px-2 text--secondary" style="width: 100%"
          >Deliver to</span
        >
        <span><v-icon>mdi-cart</v-icon></span>
      </div>
      <v-img
        height="250"
        :src="imgUrl"
        :aspect-ratio="16 / 9"
        :position="imgPosition"
      >
        <div class="d-flex flex-column" style="height: 250px">
          <div>
            <v-app-bar flat color="transparent">
              <v-toolbar-title class="title white--text pl-0">
              </v-toolbar-title>

              <v-spacer></v-spacer>

              <v-btn class="text-none" rounded depressed @click="onClickUpload">
                <v-icon left> mdi-camera </v-icon>
                Upload Photo
              </v-btn>

              <input
                ref="uploader"
                class="d-none"
                type="file"
                accept="image/*"
                @change="onFileChanged"
              />
            </v-app-bar>
          </div>
        </div>
      </v-img>
      <div class="text--primary pa-2">
        <div class="title font-semibold">{{ store_name }}</div>
        <div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
        <div>
          <v-rating
            length="5"
            background-color="gray lighten-3"
            size="16"
            :value="4"
            color="yellow"
          ></v-rating>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    img: {
      type: String,
      default: null,
    },
    store: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      selectedFile: null,
      imgUrl: null,
      imgChanged: null,
      imgPosition: 'center center',
    }
  },
  computed: {
    store_name() {
      return this.store ? this.store.name : 'Store Name'
    },
  },
  watch: {
    img() {
      this.imgUrl = this.img
    },
  },
  mounted() {
    this.imgUrl = this.img
  },
  methods: {
    onClickUpload() {
      this.$refs.uploader.click()
    },
    onFileChanged(e) {
      try {
        this.selectedFile = e.target.files[0]
        this.imgUrl = URL.createObjectURL(this.selectedFile)
        this.imgChanged = true

        this.$emit('coverPhotoChanged', {
          imgChanged: true,
          selectedFile: this.selectedFile,
          imgUrl: this.imgUrl,
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }

      // do something
    },
  },
}
</script>
