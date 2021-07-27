<template>
  <v-card min-height="438">
    <div class="d-flex">
      <div class="flex-grow-1">
        <v-card-title>Tags </v-card-title>
        <v-card-subtitle>Reorder tags base on priority.</v-card-subtitle>
      </div>
      <div class="my-auto mr-6">
        <v-btn icon @click="add"><v-icon>mdi-plus</v-icon></v-btn>
      </div>
    </div>
    <v-card-text>
      <v-list v-if="tags.length > 0">
        <transition-group name="list" tag="div">
          <v-list-item
            v-for="(tag, index) in tags"
            :key="tag.id || tag._id"
            tag="div"
            class="px-0"
          >
            <v-list-item-action class="flex-row">
              <v-btn
                tabindex="-1"
                icon
                :disabled="index === 0"
                @click="up(index)"
              >
                <v-icon>mdi-arrow-up</v-icon></v-btn
              >
              <v-btn
                tabindex="-1"
                icon
                :disabled="index + 1 >= tags.length"
                @click="down(index)"
              >
                <v-icon>mdi-arrow-down</v-icon></v-btn
              >
            </v-list-item-action>
            <v-list-item-content>
              <v-text-field
                v-model="tag.title"
                class="mt-0 pt-0"
                hide-details
              ></v-text-field
            ></v-list-item-content>
            <v-list-item-action>
              <v-btn tabindex="-1" icon @click="remove(index)">
                <v-icon>mdi-close</v-icon></v-btn
              >
            </v-list-item-action>
          </v-list-item>
        </transition-group>
      </v-list>
      <div v-else class="d-flex flex-column align-center pa-5">
        <v-avatar color="indigo darken-2" size="128">
          <v-icon class="text-h1" color="indigo lighten-5">mdi-tag</v-icon>
        </v-avatar>
        <div class="text--secondary my-4 text-center" style="width: 75%">
          Create new Tag and start tagging store to display its priority in our
          Mobile App
        </div>
        <v-btn color="primary" @click="add">
          <v-icon left> mdi-plus </v-icon> ADD TAG
        </v-btn>
      </div>
    </v-card-text>
    <v-card-actions class="pr-8 pb-4">
      <v-spacer />
      <div v-if="deletedTags.length > 0" class="red--text text-caption mr-4">
        {{ deletedTags.length }} tag(s) removed
      </div>
      <v-btn
        v-if="tags.length > 0"
        color="indigo"
        dark
        :loading="loading"
        @click="save"
        >Save</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      colHeader: [{}],
      tags: [],
      ids: null,
      deletedTags: [],
      loading: false,
    }
  },
  computed: {
    params() {
      this.tags.map((i, ind) => {
        const tag = JSON.parse(JSON.stringify(i))
        if (i._state !== 'deleted') {
          i.priority = ind + 1
          if (tag.priority !== i.priority) {
            i._state = 'edited'
          }
        }
      })
      return [...this.tags.filter((i) => i._state !== ''), ...this.deletedTags]
    },
  },
  mounted() {
    this.ids = new this.GenerateID()
    this.loadTags()
  },
  methods: {
    *GenerateID() {
      let i = 1
      while (true) {
        yield i++
      }
    },
    loadTags() {
      this.$api.Tag.all().then((resp) => {
        const tags = []
        for (const tag of resp) {
          tag._state = ''
          tags.push(tag)
        }
        this.tags = tags
      })
    },
    up(index) {
      const newTags = [...this.tags]
      newTags[index] = this.tags[index - 1]
      newTags[index - 1] = this.tags[index]
      this.tags = newTags
    },
    down(index) {
      const newTags = [...this.tags]
      newTags[index] = this.tags[index + 1]
      newTags[index + 1] = this.tags[index]
      newTags[index + 1].priority = index + 1
      this.tags = newTags
    },
    remove(index) {
      this.tags[index]._state = 'deleted'
      this.deletedTags.push(this.tags[index])
      const newTags = [
        ...this.tags.slice(0, index),
        ...this.tags.slice(index + 1),
      ]
      this.tags = newTags
    },
    add() {
      this.tags.push({
        title: null,
        _id: 'new_' + this.ids.next().value,
        priority: this.tags.length + 1,
        _state: 'new',
      })
    },
    save() {
      if (this.params.length > 0) {
        this.loading = true
        this.$axios
          .post('/laravel/api/tag', this.params)
          .then((response) => {
            for (const tag in this.tags) {
              if (tag._state === 'new') {
                const tagResp = response.find((i) => i._id === tag._id)
                tag.id = tagResp.id
                tag._state = ''
              } else if (tag._state === 'edited') {
                tag._state = ''
              }
            }
            this.deletedTags = []
            this.$swal.fire('Success!', 'Tags has been saved.', 'success')
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
  },
}
</script>

<style scoped>
.list-enter,
.list-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: opacity 0.5s ease;
}

.list-move {
  transition: transform 0.5s ease-out;
}
</style>
