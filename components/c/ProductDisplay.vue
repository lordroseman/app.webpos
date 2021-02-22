<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col class="mb-n6" cols="12">
        <div
          class="pa-4 rounded"
          style="background-color: rgba(255, 255, 255, 0.5)"
        >
          <v-text-field
            color="#E64A19"
            prepend-inner-icon="mdi-magnify"
            label="Find something you like"
            outlined
          >
            <template v-slot:append-outer>
              <v-icon size="28" color="#E64A19">mdi-tune-vertical</v-icon>
            </template>
          </v-text-field>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <span class="text-h6">All Products</span>
      </v-col>
    </v-row>
    <v-row> </v-row>
  </v-container>
</template>

<script>
export default {}
</script>

<style></style>
