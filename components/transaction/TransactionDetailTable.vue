<template>
  <div>
    <v-divider />
    <div v-for="(detail, i) in details" :key="i">
      <template v-if="i < limit">
        <v-card
          flat
          class="d-flex flex-row pl-0 pr-3 py-3 border-bottom-1s"
          tile
        >
          <div
            style="height: 100px; width: 100px"
            class="mr-1 ml-3 br-1 d-none d-md-block"
          >
            <v-img
              v-if="detail.item.img"
              :height="100"
              :width="100"
              contain
              :lazy-src="detail.item.img.tiny"
              :src="detail.item.img.thumb"
            />
          </div>
          <div class="mr-auto ml-3">
            <div class="title">
              {{ detail.item_name }}
            </div>
            <div>
              {{ detail.item_desc }}
            </div>
            <div>
              <span class="text--disabled">Qty:</span>
              x{{ detail.quantity }} {{ detail.item_unit }} @
              <template v-if="!hasValue(detail.discount_amount)">
                <span class="text--disabled">Price:</span>
                {{ toCurrency(detail.item_price) }}
              </template>
              <template v-else>
                <span class="text--disabled">Price:</span>
                <v-menu
                  :close-on-content-click="false"
                  :nudge-width="200"
                  offset-x
                  open-on-hover
                >
                  <template #activator="{ attrs, on }">
                    <span v-bind="attrs" v-on="on">
                      <span class="text-decoration-line-through">
                        {{ toCurrency(detail.item_price) }}
                      </span>
                      <span>
                        {{
                          toCurrency(detail.item_price - detail.discount_amount)
                        }}
                      </span>
                    </span>
                  </template>
                  <v-card>
                    <v-card-title>
                      Discounted Price
                      {{
                        toCurrency(detail.item_price - detail.discount_amount)
                      }}
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="text--primary">
                      <div class="d-flex">
                        <span>Original Price :</span>
                        <span class="ml-auto">
                          {{ toCurrency(detail.item_price) }}
                        </span>
                      </div>
                      <div class="d-flex">
                        <span>Discount Type:</span>
                        <span class="ml-auto">{{ detail.discount_type }} </span>
                      </div>
                      <div class="d-flex">
                        <span>Discount Value:</span>
                        <span class="ml-auto"
                          >{{
                            detail.discount_type === 'percent'
                              ? toNumberFormat(detail.discount_value)
                              : toCurrency(detail.discount_value)
                          }}
                        </span>
                      </div>
                      <div class="d-flex">
                        <span>Discount Amount:</span>
                        <span class="ml-auto"
                          >{{ toCurrency(detail.discount_amount) }}
                        </span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>
            </div>
            <div class="caption">
              If product is not available, {{ actions[detail.action] }}
            </div>
            <div v-if="detail.instructions" class="caption">
              {{ detail.instructions }}
            </div>
          </div>
          <div class="my-auto">
            {{ toCurrency(detail.line_total) }}
          </div>
        </v-card>
        <v-divider />
      </template>
    </div>
    <div class="py-3 ml-6 d-flex">
      <span class="text--disabled caption" style="width: 100px">
        {{ details.length }} items
      </span>
      <div class="mx-auto">
        <v-btn
          v-if="details.length > limit"
          text
          x-small
          block
          @click="goToTransaction(details)"
        >
          View more items
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    details: {
      type: Array,
      default: () => [],
    },
    limit: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      headers: [
        { text: 'Item', align: 'start', value: 'item_name' },
        { text: 'Description', value: 'item_desc' },
        { text: 'Unit', value: 'item_unit' },
        { text: 'Cost', value: 'item_cost', align: 'end' },
        { text: 'Price', value: 'item_price', align: 'end' },
        { text: 'Quantity', value: 'quantity', align: 'end' },
        { text: 'Total', value: 'line_total', align: 'end' },
      ],
      search: null,
      actions: [
        '',
        'Remove it from my order',
        'Cancel entire order',
        'Call me',
      ],
    }
  },
  methods: {
    getImg(item) {
      if (!item.img) {
        return null
      }

      const img = `data:${item.image_mime};base64,${item.image_base64}`
      return img
    },
    goToTransaction(details) {
      const access = this.$auth.user.access_level
      if (access === 1) {
        this.$router.push('/transaction/' + details[0].transaction_id)
      }
      this.$router.push('/s/transaction/' + details[0].transaction_id)
    },
  },
}
</script>

<style></style>
