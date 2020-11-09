import Vue from 'vue'

if (!Vue.__permission__mixin__) {
  Vue.__permission__mixin__ = true

  Vue.mixin({
    computed: {
      permissions() {
        return this.$auth.user.permission || []
      },
    },
    methods: {
      $can(permissionName) {
        return this.permissions.includes(permissionName)
      },
    },
  })
}
