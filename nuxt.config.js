import path from 'path'
import fs from 'fs'
import colors from 'vuetify/es5/util/colors'

export default {
  ssr: false,
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    titleTemplate: '%s - ' + process.env.APP_NAME,
    title: '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon-32x32.png' }],
    script: [
      {
        src:
          'https://maps.googleapis.com/maps/api/js?key=' +
          process.env.GOOGLE_MAPS_JS_API_KEY,
        async: true,
        defer: true,
      },
    ],
  },

  /*
   ** Server Config
   ** See https://nuxtjs.org/api/configuration-server
   */
  server: {
    host: process.env.HOSTNAME,
    port: process.env.PORT,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/server.crt')),
    },
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['~/assets/main.scss', '@sweetalert2/theme-material-ui/material-ui.css'],

  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    { src: '~/plugins/helper-mixin-plugin.js' },
    { src: '~/plugins/vuelidate.js' },
    { src: '~/plugins/v-currency-field.js' },
    { src: '~/plugins/sweetalert.js', mode: 'client' },
    { src: '~/plugins/vue-api-query.js' },
    { src: '~/plugins/permission.js' },
    { src: '~/plugins/api.js' },
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/laravel-echo',
    'nuxt-compress',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    '@nuxtjs/auth-next',
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    proxy: true,
    credentials: true,
  },
  proxy: {
    '/laravel': {
      target: process.env.PHP_API_URL,
      pathRewrite: { '^/laravel': '/' },
      changeOrigin: true,
    },
  },

  /**
   *  AUTH
   */
  auth: {
    // Options
    strategies: {
      laravelSanctum: {
        provider: 'laravel/sanctum',
        url: '/laravel',
      },
    },
    redirect: {
      logout: '/login',
      home: '/',
    },
    watchLoggedIn: true,
    plugins: [{ src: '~/plugins/axios.js' }],
  },

  /**
   *
   *  echo
   */
  echo: {
    broadcaster: 'pusher',
    plugins: ['~/plugins/echo.js'],
    authEndpoint: '/laravel/broadcasting/auth',
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    disableStats: true,
    connectOnLogin: true,
    disconnectOnLogout: true,
    proxy: true,
    authModule: false,
  },

  /**
   *  ROUTER CONFIG
   */
  router: {
    middleware: ['auth', 'permission'],
  },

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
    treeShake: false,
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},

  // NUXT COMPRESS
  'nuxt-compress': {
    gzip: {
      cache: true,
    },
    brotli: {
      threshold: 10240,
    },
  },
  /*
   **  ENV Variables
   **
   */
  publicRuntimeConfig: {
    baseURL: process.env.BASE_URL || '',
    googleMapsJsApiKey: process.env.GOOGLE_MAPS_JS_API_KEY || '',
    googleMapsStaticApiKey: process.env.GOOGLE_MAPS_STATIC_API_KEY || '',
  },
  privateRunTimeConfig: {},
}
