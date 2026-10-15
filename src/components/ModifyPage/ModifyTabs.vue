<script setup>
import {computed} from "vue";

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: null,
  title: {
    type: String,
    default: '明细信息'
  },
  isDynamic: {
    type: Boolean,
    default: false
  },
})

const activeName = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})
</script>

<template>
  <div class="model-panel">
    <div class="model-panel-title">
      <p>{{ title ?? '明细信息' }}</p>
    </div>
    <div class="model-panel-body">
      <el-tabs v-model="activeName">
        <slot />
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.model-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  .model-panel-body {
    flex: 1;
  }
}
</style>