<template>
  <div>
    <v-card class="mx-0" tile>
      <v-img
        height="100%"
        :src="coverPhoto"
        gradient="to top right, rgba(0,0,0,.1), rgba(0,0,0,.1)"
      >
        <v-row align="end" class="fill-height">
          <v-col align-self="start" class="pa-0" cols="12">
            <v-avatar class="profile" color="grey" size="164" tile>
              <v-img :src="getAvatar()" contain></v-img>
            </v-avatar>
          </v-col>
          <v-col class="py-0">
            <v-list-item color="rgba(0, 0, 0, .4)" dark>
              <v-list-item-content>
                <v-list-item-title class="title">
                  {{ customer.fname }} {{ customer.lname }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  @ {{ customer.user ? customer.user.username : '--' }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
        </v-row>
      </v-img>
    </v-card>

    <div class="mx-5">
      <v-form readonly>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="customer.full_name"
              label="Full Name"
              required
              prepend-icon="mdi-account"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="customer.email"
              label="E-mail"
              required
              prepend-icon="mdi-email"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="customer.contact_number"
              label="Contact Number"
              required
              prepend-icon="mdi-cellphone"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="customer.fb_name"
              prepend-icon="mdi-facebook"
              label="Social Media Name"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="customer.provider"
              label="Social Media Provider"
              prepend-icon="mdi-facebook-workplace"
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    coverPhoto() {
      const cover = this.getRandomInt(1, 5)
      return require(`@/static/cover${cover}.jpg`)
    },
  },
  methods: {
    getAvatar() {
      if (this.customer.user) {
        return this.customer.user.avatar
      } else {
        return require('@/static/default-avatar.png')
      }
    },
  },
}
</script>

<style></style>
