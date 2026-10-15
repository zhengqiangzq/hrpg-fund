<script setup>
import {computed, onMounted, ref} from "vue";

const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: null,
  info: {}
})
const treeInfo = ref({
  defaultProps: {
    children: 'children',
    label: (data, node) => { return data.code ? `${data.code}-${data.name}` : data.name },
  },
  expandOnClickNode: false,
  defaultExpandAll: true,
  current: null,
  filterText: '',
  showCheckbox: false,
  data: []
})

const selectRowComputed = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

onMounted(() => {
  const info = props.info || {}
  treeInfo.value = Object.assign(treeInfo.value, info)
  info.api && info.api(info.query || {}).then(res => {
    if (res.success) {
      treeInfo.value.data = res.data
    }
  })
})
function handleNodeClick(data) {
  if (treeInfo.value.showCheckbox) return
  selectRowComputed.value = data
}
function handleCheckChange(data) {
  if (!treeInfo.value.showCheckbox) return
  selectRowComputed.value = data
}
</script>

<template>
  <page-tree
      :tree-info="treeInfo"
      @node-click="handleNodeClick"
      @check-change="handleCheckChange"
  >
  </page-tree>
</template>

<style scoped lang="scss">

</style>