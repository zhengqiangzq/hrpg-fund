<script setup>
const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  },
  noTitle: {
    type: Boolean
  }
})
</script>

<template>
  <div class="model-panel">
    <div class="model-panel-title" v-if="!noTitle">
      <p>{{ info.title ?? '基础信息' }}</p>
    </div>
    <basic-information :info="info" :labelWidth="info.labelWidth">
      <template
          v-for="(slotKey, index) in Object.keys($slots).filter(key => /^basic-.+/.test(key))"
          #[slotKey]="scope"
          :key="index">
        <slot :name="slotKey" v-bind="scope" />
      </template>
    </basic-information>
  </div>
</template>

<style scoped lang="scss">

</style>