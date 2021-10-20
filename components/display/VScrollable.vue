<template>
  <div :class="scrollbarTheme" :style="style">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: [Number, String],
      default: 'auto',
    },
    theme: {
      type: String,
      default: null,
    },
    persistent: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    scrollbarTheme() {
      let theme = ''
      if (!this.theme) {
        theme = this.$vuetify.theme.dark ? 'dark' : 'light'
      } else {
        theme = this.theme
      }

      return this.$vuetify.breakpoint.mobile ? ' ' : theme + this.scrollClass
    },
    style() {
      return {
        height: this.height,
        'overflow-x': 'hidden',
        'overflow-y': this.persistent ? 'overlay' : 'hidden',
      }
    },
    scrollClass() {
      return ' scrollable '
    },
  },
}
</script>

<style>
.scrollable {
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: 4;
}

.scrollable:hover {
  overflow-y: overlay !important;
}

.light::-webkit-scrollbar {
  width: 10px;
}

.light::-webkit-scrollbar-track {
  background: transparent;
}

.light::-webkit-scrollbar-thumb {
  background: #b0b0b0;
  border: solid 3px #e6e6e6;
  border-radius: 7px;
}

.light::-webkit-scrollbar-thumb:hover {
  background: #686464;
  border: solid 3px #e6e6e645;
}

.dark::-webkit-scrollbar {
  width: 10px;
}

.dark::-webkit-scrollbar-track {
  background: #202020;
  border-left: 1px solid #2c2c2c;
}

.dark::-webkit-scrollbar-thumb {
  background: #3e3e3e;
  border: solid 3px #202020;
  border-radius: 7px;
}

.dark::-webkit-scrollbar-thumb:hover {
  background: white;
}
</style>
