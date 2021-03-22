<template>
  <div>
    <div class="err"></div>

    <div id="notfound">
      <div class="notfound">
        <v-img
          src="/logo.png"
          lazy-src="/logo.png"
          width="400"
          class="mx-auto mb-3"
          elevation="8"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular
                indeterminate
                color="grey lighten-5"
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>
        <div class="notfound-404">
          <h1>Oops!</h1>
          <h2 v-if="error.statusCode === 404">{{ pageNotFound }}</h2>
          <h2 v-if="error.statusCode === 403">ACCESS FORBIDDEN</h2>
          <h2 v-else>
            {{ otherError }}
          </h2>
        </div>
        <div>{{ error.message }}</div>
        <NuxtLink to="/" class="mt-5">Go TO Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'err',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred',
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title,
    }
  },
}
</script>

<style scoped>
.err {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(247, 247, 247);
}

h1 {
  font-size: 20px;
}

#notfound {
  position: relative;
  height: calc(100vh - 141px);
}

#notfound .notfound {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.notfound {
  max-width: 520px;
  width: 100%;
  line-height: 1.4;
  text-align: center;
}

.notfound .notfound-404 {
  position: relative;
  height: 200px;
  margin: 0 auto;
  z-index: -1;
}

.notfound .notfound-404 h1 {
  font-family: montserrat, sans-serif;
  font-size: 236px;
  font-weight: 200;
  margin: 0;
  color: #211b19;
  text-transform: uppercase;
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.notfound .notfound-404 h2 {
  font-family: montserrat, sans-serif;
  font-size: 28px;
  font-weight: 400;
  text-transform: uppercase;
  color: #211b19;
  background: rgb(247, 247, 247);
  padding: 10px 5px;
  margin: auto;
  display: inline-block;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.notfound a {
  font-family: montserrat, sans-serif;
  display: inline-block;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
  text-transform: uppercase;
  padding: 13px 23px;
  background: #007bff;
  font-size: 18px;
  -webkit-transition: 0.2s all;
  transition: 0.2s all;
}

.notfound a:hover {
  color: #007bff;
  background: #211b19;
}

@media only screen and (max-width: 767px) {
  .notfound .notfound-404 h1 {
    font-size: 148px;
  }
}

@media only screen and (max-width: 480px) {
  .notfound .notfound-404 {
    height: 148px;
    margin: 0 auto 10px;
  }
  .notfound .notfound-404 h1 {
    font-size: 86px;
  }
  .notfound .notfound-404 h2 {
    font-size: 16px;
  }
  .notfound a {
    padding: 7px 15px;
    font-size: 14px;
  }
}
</style>
