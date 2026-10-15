<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <el-tab-pane :name="name" lazy>
    <template #label>
      <slot :name="label">
        <span v-if="required" style="color: var(--el-color-danger); margin-right: 4px;">*</span>{{ label }}
      </slot>
    </template>
    <slot />
  </el-tab-pane>
</template>

<style scoped lang="scss">

</style>