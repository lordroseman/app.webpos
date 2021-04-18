<template>
  <v-dialog v-model="show" fullscreen>
    <v-card v-if="item" class="d-flex flex-column">
      <div>
        <v-toolbar dark :color="color.primary">
          <v-btn icon dark @click="close">
            <v-icon color="white">mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Customize</v-toolbar-title>
        </v-toolbar>
      </div>
      <v-card-title>
        {{ item.item_name }} <v-spacer />
        <span class="text-subtitle-2">
          {{ toCurrency(item.item_price) }}
        </span>
      </v-card-title>
      <v-card-subtitle>
        {{ item.item_desc }}
      </v-card-subtitle>

      <v-divider class="my-2" />

      <v-card-text>
        <div class="text-h6">Special instructions</div>
        <v-textarea
          v-model="instructions"
          outlined
          name="input-7-4"
          :color="color.primary"
        ></v-textarea>
        <div class="text-h6">If this product is not availabe</div>
        <v-radio-group v-model="action" mandatory>
          <v-radio
            :color="color.primary"
            label="Remove it from my order"
            value="1"
          ></v-radio>
          <v-radio
            :color="color.primary"
            label="Cancel entire order"
            value="2"
          ></v-radio>
          <v-radio :color="color.primary" label="Call me" value="3"></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions class="mt-auto">
        <v-btn
          class="mx-2"
          :dark="!removeFromCart"
          fab
          :color="color.primary"
          x-small
          :disabled="removeFromCart"
          @click="quantity -= 1"
        >
          <v-icon>mdi-minus</v-icon>
        </v-btn>
        <span class="mx-2"> {{ quantity }} </span>
        <v-btn
          class="mx-2"
          dark
          fab
          :color="color.primary"
          x-small
          @click="quantity += 1"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <v-btn
          class="ml-auto"
          dark
          :color="color.primary"
          width="70%"
          @click="save"
        >
          <template v-if="removeFromCart"> Remove from order </template>
          <template v-else> Update Order </template>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    show: {
      type: Boolean,
      default: false,
    },
    product: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      itemCloned: null,
      action: 1,
      quantity: 0,
      instructions: '',
    }
  },
  computed: {
    ...mapState({
      color: (state) => state.mobile.color,
    }),
    removeFromCart() {
      return this.quantity === 0
    },
  },
  watch: {
    item(val) {
      this.itemCloned = Object.assign({}, val)
      this.quantity = this.itemCloned.quantity
    },
  },
  methods: {
    ...mapActions({
      removeCart: 'cart/removeCart',
      updateCart: 'cart/updateCart',
    }),
    save() {
      if (this.removeFromCart) {
        this.removeCart(this.item)
      } else {
        this.updateCart({
          id: this.item.id,
          quantity: this.quantity,
          action: this.action,
          instructions: this.instructions,
        })
      }
      this.close()
    },
    close() {
      this.$emit('update:show', false)
    },
  },
}
</script>
