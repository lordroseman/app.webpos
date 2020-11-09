<template>
  <v-container>
    <v-combobox
      v-model="selected_label"
      :items="labels"
      item-text="title"
      label="Transaction Label"
      chips
      outlined
      solo
      flat
      :search-input.sync="search"
      :readonly="!editable"
    >
      <template #selection="{ attrs, item, selected }">
        <v-chip
          v-if="item === Object(item)"
          v-bind="attrs"
          :color="`${getLabel(item.title, 'color')}`"
          :input-value="selected"
          label
          small
          :text-color="getLabel(item.title, 'icon-color')"
        >
          <span class="pr-2">{{ item.title }}</span>
        </v-chip>
      </template>
    </v-combobox>
    <v-timeline dense style="max-height: 430px; overflow: hidden">
      <v-scrollable :height="'405px'">
        <v-timeline-item
          v-for="tlabel in transactionLabels"
          :key="tlabel.id"
          :icon="getLabel(tlabel.label.title, 'icon')"
          :icon-color="getLabel(tlabel.label.title, 'icon-color')"
          :color="getLabel(tlabel.label.title, 'color')"
          fill-dot
        >
          <div class="d-xl-flex mt-2">
            <v-chip
              class="white--text ml-0"
              :color="getLabel(tlabel.label.title, 'color')"
              label
              small
            >
              {{ tlabel.label.title }}
            </v-chip>
            <span class="text--secondary text-caption mt-1 ml-auto"
              >{{ tlabel.user.name }} • {{ tlabel.date_time }}</span
            >
          </div>
          <div class="text-caption text--secondary font-italic">
            {{ tlabel.remarks }}
          </div>
        </v-timeline-item>
      </v-scrollable>
    </v-timeline>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    paid: {
      type: Boolean,
      default: false,
    },
    transaction: {
      type: Object,
      default: null,
    },
    transactionLabels: {
      type: Array,
      default: () => [],
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selected_label: null,
      search: null,
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.app.user,
      labels: (state) => state.app.labels,
      drivers: (state) => state.driver.drivers,
      driversLoadStatus: (state) => state.driver.driversLoadStatus,
    }),
    driverOptions() {
      const options = {}

      for (const row of this.drivers) {
        options[row.id] = `${row.fname} ${row.lname}`
      }

      return options
    },
  },
  watch: {
    selected_label(newVal, oldVal) {
      if (!this.editable) {
        // this.selected_label = oldVal;
        return
      }

      if (!newVal) {
        return
      }

      if (newVal !== oldVal) {
        if (this.transactionLabels.length > 0) {
          if (
            this.transactionLabels[0].label.title.toUpperCase() === newVal.title
          ) {
            this.setDefaultLbl()
            return
          }
        }
      }

      this.setLabel(newVal)
    },
    transactionLabels(labels) {
      if (labels.length > 0) {
        this.setDefaultLbl()
      }
    },
  },
  mounted() {
    setTimeout(() => {
      this.setDefaultLbl()
    }, 0)

    if (this.driversLoadStatus === 0) {
      this.$store.dispatch('driver/loadDrivers')
    }
  },
  methods: {
    getLabel(title, prop) {
      if (!title) {
        return null
      }

      const lbl = this.labels.filter((i) => i.title === title.toUpperCase())[0]

      if (prop) {
        return lbl[prop]
      }

      return lbl
    },
    setLabel(newLbl) {
      if (newLbl.title === 'PAID') {
        // check if paid already exists
        if (
          this.transactionLabels.filter((i) => i.title === 'PAID').length > 0
        ) {
          setTimeout(() => {
            this.setDefaultLbl()
          }, 1)

          return
        } else if (!this.paid) {
          this.$swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Transaction is not yet fully paid.',
          })
          setTimeout(() => {
            this.setDefaultLbl()
          }, 300)

          return
        }
      }

      if (newLbl.title === 'COMPLETED') {
        // check if has balance
        if (!this.paid) {
          this.$swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Cannot `Complete` transaction with remaining balance.',
          })
          setTimeout(() => {
            this.setDefaultLbl()
          }, 300)

          return
        }
      }

      this.$swal
        .fire({
          title: `Set Transaction as '${newLbl.title}'?`,
          // eslint-disable-next-line eqeqeq
          text:
            this.getLabel(newLbl.title, 'action') === '1'
              ? ''
              : 'Transaction status will be close upon confirmation.',
          icon: 'warning',
          input: newLbl.title === 'FOR DELIVERY' ? 'select' : 'textarea',
          inputAttributes: {
            placeholder:
              newLbl.title === 'FOR DELIVERY' ? 'Select Driver' : 'Remarks',
          },
          inputPlaceholder:
            newLbl.title === 'FOR DELIVERY' ? 'Select Driver' : 'Remarks',
          inputOptions: this.driverOptions,
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes!',
          showLoaderOnConfirm: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (newLbl.title === 'FOR DELIVERY') {
                if (value) {
                  resolve()
                } else {
                  resolve('You need to select driver')
                }
              } else {
                resolve()
              }
            })
          },
          preConfirm: (e, a) => {
            return new Promise((resolve, reject) => {
              let driver = null
              let remarks = e
              if (newLbl.title === 'FOR DELIVERY') {
                driver = e
                remarks = 'Driver : ' + this.driverOptions[e]
              }

              this.$axios
                .post(`/laravel/api/transaction/${this.transaction.id}/label`, {
                  label_id: this.selected_label.id,
                  remarks,
                  driver,
                  action: this.selected_label.action,
                })
                .then((resp) => {
                  if (resp.status === 201) {
                    this.transactionLabels.unshift(resp.data)
                    if (resp.data.with_driver) {
                      this.$emit('setDriver', resp.data.driver)
                    }
                    if (this.selected_label.action === 2) {
                      this.$emit('closeTransaction')
                    }
                    resolve(true)
                  }
                })
                .catch((errors) => {
                  this.$swal.showValidationMessage(
                    `Request failed: ${this.errors.message}`
                  )
                  reject(this.errors)
                })
            })
          },
        })
        .then((result) => {
          if (result.value) {
            this.$swal.fire(
              'Success!',
              'Transaction Label has been updated.',
              'success'
            )
          } else if (result.isDismissed) {
            this.setDefaultLbl()
          }
        })
    },
    setDefaultLbl() {
      if (this.transactionLabels.length > 0) {
        this.selected_label = this.getLabel(
          this.transactionLabels[0].label.title
        )
      } else {
        this.selected_label = null
      }
    },
  },
}
</script>

<style></style>
