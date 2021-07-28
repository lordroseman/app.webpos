<template>
  <v-card class="d-flex flex-column">
    <div>
      <v-toolbar dark :color="color.primary">
        <v-toolbar-title>
          <v-list color="transparent">
            <v-list-item-content>
              <v-list-item-title class="white--text">
                {{ item.item_name }}
              </v-list-item-title>
              <v-list-item-subtitle :style="`color:${color.dark}`">
                {{ item.item_desc }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list>
        </v-toolbar-title>
        <v-spacer />
        <span v-if="discountAmount === 0">
          {{ toCurrency(item.item_price) }}
        </span>
        <div v-else>
          <span
            class="text-decoration-line-through mr-2"
            :style="`color: ${color.dark}`"
          >
            {{ toCurrency(item.item_price) }}
          </span>
          <span> {{ toCurrency(discountedPrice) }} </span>
        </div>
        <v-btn icon dark @click="close">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
    </div>

    <v-card-text class="pt-5">
      <div class="text-h6">Discount</div>
      <v-row>
        <v-col cols="12" sm="4">
          <v-currency-field
            v-model="discountValue"
            outlined
            label="Value"
            :prepend-inner-icon="discountTypeIcon"
            dense
            :color="color.primary"
            :hint="discountHint"
            persistent-hint
            @click:prepend-inner="toggleDiscountType"
          ></v-currency-field>
        </v-col>
        <v-col cols="12" sm="4">
          <v-currency-field
            v-model="discountAmount"
            outlined
            label="Amount"
            dense
            :color="color.primary"
            readonly
          ></v-currency-field>
        </v-col>
        <v-col cols="12" sm="4">
          <v-currency-field
            v-model="discountedPrice"
            outlined
            dense
            label="Discounted Price"
            :color="color.primary"
            readonly
          ></v-currency-field>
        </v-col>
      </v-row>
      <v-divider />
      <div class="text-h6">Special instructions</div>
      <v-textarea
        v-model="form.instructions"
        outlined
        name="input-7-4"
        :color="color.primary"
        dense
      ></v-textarea>
      <div class="text-h6">If this product is not availabe</div>
      <v-select
        v-model="form.action"
        :items="actions_options"
        label=""
        outlined
        item-text="action"
        item-value="value"
        :color="color.primary"
        dense
      ></v-select>
    </v-card-text>
    <v-card-actions class="mt-auto">
      <v-btn
        class="mx-2"
        :dark="!removeFromCart"
        fab
        :color="color.primary"
        x-small
        :disabled="removeFromCart"
        @click="form.quantity -= 1"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-currency-field
        v-model="form.quantity"
        outlined
        dense
        label="Qty"
        :color="color.primary"
        single-line
        class="text--center"
        hide-details
      ></v-currency-field>
      <v-btn
        class="mx-2"
        dark
        fab
        :color="color.primary"
        x-small
        @click="form.quantity += 1"
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
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Form from '~/components/core/Form.js'

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
    mode: {
      type: String,
      default: '',
    },
    updateProduct: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: new Form({
        item_id: null,
        action: '',
        instructions: '',
        quantity: 0,
        discount_type: null,
        discount_value: null,
        discount_amount: 0,
        line_total: 0,
        item_price: 0,
      }),
      itemCloned: null,
      action: 1,
      instructions: '',
      actions_options: [
        { action: 'Remove it from my order', value: 1 },
        { action: 'Cancel entire order', value: 2 },
        { action: 'Call me', value: 3 },
      ],
      discountType: 'percent',
      discountValue: 0,
    }
  },
  computed: {
    ...mapState({
      color: (state) => state.mobile.color,
    }),
    removeFromCart() {
      return this.form.quantity === 0
    },
    discountTypeIcon() {
      if (this.discountType === 'percent') {
        return 'mdi-percent'
      } else {
        return 'mdi-currency-php'
      }
    },
    discountAmount() {
      let value = 0
      if (this.discountType === 'percent') {
        value = (this.discountValue / 100) * this.item.item_price
      } else {
        value = this.discountValue
      }
      return this.toFixed(value)
    },
    discountedPrice() {
      if (this.discountAmount !== 0) {
        return this.toFixed(this.item.item_price - this.discountAmount)
      } else {
        return null
      }
    },
    discountHint() {
      let hint
      if (this.discountType === 'percent') {
        hint = 'Click the percent icon to switch to cash discount'
      } else {
        hint = 'Click the Peso icon to switch to percentage discount'
      }
      return hint
    },
  },
  watch: {
    item: {
      handler(val) {
        if (val) {
          this.setForm()
        }
      },
      deep: true,
    },
    discountValue(val) {
      this.form.discount_value = val
      this.form.discount_amount = this.discountAmount
      this.form.discount_type = this.discountType
      this.form.line_total = this.toFixed(
        (this.form.item_price - this.discountAmount) * this.form.quantity
      )
    },
    discountType(val) {
      this.form.discount_type = val
      this.form.discount_amount = this.discountAmount
    },
    'form.quantity'(val) {
      this.form.line_total = this.toFixed(
        (this.form.item_price - this.discountAmount) * this.form.quantity
      )
      if (val < 0) {
        this.form.quantity = 0
      }
    },
    show(val) {
      if (!val) {
        this.form.clear()
      } else {
        this.setForm()
      }
    },
  },
  mounted() {
    this.setForm()
  },
  methods: {
    ...mapActions({
      removeCart: 'cart/removeCart',
      updateCart: 'cart/updateCart',
    }),
    setForm() {
      if (this.item) {
        this.itemCloned = JSON.parse(JSON.stringify(this.item))
        this.form.set(this.itemCloned)
        this.discountValue = this.form.discount_value
        if (this.form.discount_type !== null) {
          this.discountType = this.form.discount_type
        }
      }
    },
    save() {
      if (this.removeFromCart) {
        if (this.item._state !== 'deleted') {
          this.removeCart(this.item)
        }
      } else {
        let state = ''
        if (this.mode === 'new') {
          state = 'new'
        } else if (this.item._state === 'new') {
          state = 'new'
        } else {
          state = 'edited'
        }

        if (this.form.quantity >= this.updateProduct.pivot.inventory) {
          this.form.quantity = this.updateProduct.pivot.inventory
        }

        this.updateCart({
          item_id: this.item.item_id,
          ...this.form.changedData(),
          _state: state,
        })
      }
      this.close()
    },
    close() {
      this.form.clear()
      this.$emit('close', false)
    },
    toggleDiscountType() {
      if (this.discountType === 'percent') {
        this.discountType = 'cash'
      } else {
        this.discountType = 'percent'
      }
    },
  },
}
</script>
