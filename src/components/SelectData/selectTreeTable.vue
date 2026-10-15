<script setup>
import {getCurrentInstance, computed, onMounted, ref} from "vue";
import moment from "moment";
import {periodmonthList} from "@/api/base";

import DialogTable from "@/components/DialogTable/index.vue";
const { proxy } = getCurrentInstance()
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: null,
  info: {}
})
const treeInfo = ref({
  defaultProps: {
    children: 'children',
    label: 'periodYear',
  },
  expandOnClickNode: false,
  defaultExpandAll: true,
  current: null,
  filterText: '',
  showCheckbox: false,
  data: []
})
const treeRef = ref()

// 表格相关
const tableInfo = ref({
  data: [],
  fieldList: [
    { label: '会计期间', value: 'periodYearAndMonth' },
    { label: '开始日期', value: 'beginDate', formatter: (row) => moment(row.beginDate).format('YYYY-MM-DD') },
    { label: '结束日期', value: 'endDate', formatter: (row) => moment(row.endDate).format('YYYY-MM-DD') },
  ],
})


const selecttableRow = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

const selectRow = ref('')

onMounted(() => {
  getList()
})
function getList() {
  const info = props.info || {}
  treeInfo.value.data = []
  info.api && info.api(info.query || {}).then((res) => {
    if (res && res.success) {
      if (res.code === 200 && res.data) {
        treeInfo.value.data = res.data

        proxy.$nextTick(() => {
          // 设置默认选中第一个节点
          treeRef.value.setCurrentKey(res.data[0].id);
        });
        handleNodeClick(res.data[0])
      }
    }
  })
}

function handleEvent(event, data) {
  switch (event) {
    case 'tableClickRow':
      selecttableRow.value = data
      break
  }
}

function handleNodeClick(node) {
  selectRow.value = node
  selecttableRow.value = ''
  tableInfo.value.data = []
  periodmonthList({periodId: node.id}).then((res) => {
    if (res && res.success) {
      if (res.code === 200 && res.data) {
        tableInfo.value.data = res.data
      }
    }
  })
}
</script>

<template>
  <div class="content-box">
    <el-tree
        class="tree-box"
        ref="treeRef"
        :data="treeInfo.data"
        node-key="id"
        :props="treeInfo.defaultProps"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        :check-on-click-node="true"
        @node-click="handleNodeClick"
    />

    <DialogTable
        v-model:data="tableInfo.data"
        :pager="false"
        :check-box="false"
        :field-list="tableInfo.fieldList"
        :highlight-row="true"
        @handleEvent="handleEvent"
    />
  </div>
</template>

<style scoped lang="scss">
.content-box {
  width: 100%;
  height: 400px;
  overflow: auto;
  display: flex;
  .tree-box {
    width: 150px;
  }
}
</style>
