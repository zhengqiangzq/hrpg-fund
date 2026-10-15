<script setup>
import {ref, watch} from "vue";
import {mergeWith} from "lodash";

const emits = defineEmits(['node-click', 'check-change'])
const props = defineProps({
  treeInfo: Object
})

const tree = ref()
const _treeInfo = ref({
  filterText: undefined,
  nodeKey: 'id',
  defaultProps: {
    children: 'children',
    label: 'name'
  },
  defaultCheckedKeys: [],
  defaultExpandAll: false,
  expandOnClickNode: true,
  data: []
})

watch(() => props.treeInfo, (info) => {
  _treeInfo.value = mergeWith(_treeInfo.value, info, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return srcValue
    }
  })
}, { immediate: true, deep: true })

function treeSearch() {
  tree.value.filter(_treeInfo.value.filterText)
}

function filterNodeMethod(value, data, node) {
  if (!value?.length) return true
  if (props.treeInfo.filterNodeMethod) {
    return props.treeInfo.filterNodeMethod(value, data, node)
  }
  let __label
  if (typeof _treeInfo.value.defaultProps.label === 'string') {
    __label = data[_treeInfo.value.defaultProps.label]
  } else {
    __label = _treeInfo.value.defaultProps.label(data, node)
  }
  return __label.indexOf(value) !== -1
}

function handleNodeClick(...args) {
  emits('node-click', ...args)
}
function handleCheckChange(...args) {
  emits('check-change', ...args)
}
</script>

<template>
  <div>
    <el-input
        v-model="_treeInfo.filterText"
        style="flex: 1; margin-right: 10px; width: 98%"
        :clearable="true"
        placeholder="请输入文字筛选"
        @keyup.enter.native="treeSearch"
    ></el-input>
    <el-tree
        ref="tree"
        class="treeDialog"
        :data="_treeInfo.data"
        highlight-current
        :props="_treeInfo.defaultProps"
        :node-key="_treeInfo.nodeKey"
        :default-checked-keys="_treeInfo.defaultCheckedKeys"
        :default-expand-all="_treeInfo.defaultExpandAll"
        :accordion="_treeInfo.accordion"
        :current-node-key="_treeInfo.currentNodeKey"
        :filter-node-method="filterNodeMethod"
        :expand-on-click-node="_treeInfo.expandOnClickNode"
        @node-click="handleNodeClick"
        @check-change="handleCheckChange"
    >
      <template #default="{ node, data }">
        <div class="custom-label">
          <span>{{ node.label }}</span>
          <div class="menus">
            <slot name="operate" :node="node" :data="data" />
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<style scoped lang="scss">
.custom-label {
  display: flex;
  align-items: center;
  width: 100%;
  .menus {
    margin-left: auto;
    color: #c0c0c0;
    >* {
      margin-left: 3px;
      margin-right: 3px;
    }
  }
}

.treeDialog {
  max-height: 500px;
  overflow: auto;
}
</style>
