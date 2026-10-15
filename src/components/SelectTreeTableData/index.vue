<template>
  <page-dialog
      :title="title"
      v-model:visible="shows"
      :width="width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
  >
    <div class="content-box">
      <el-tree
          class="tree-box"
          :data="treeInfo.data"
          ref="treeRef"
          node-key="id"
          :props="defaultProps"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          :check-on-click-node="true"
          @node-click="nodeClick"
      />
      <DialogTable
          v-model:data="tableInfo.data"
          :api="tableInfo.api"
          :pager="false"
          :check-box="false"
          :field-list="tableInfo.fieldList"
          :highlight-row="true"
          @handleEvent="handleEvent"
      />
    </div>
  </page-dialog>
</template>

<script setup name="selectTreeData">
import PageDialog from '../PageDialog/index'
import {periodmonthList, periodyearList} from "@/api/base";
import DialogTable from "@/components/DialogTable/index.vue";
import moment from "moment";
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: '会计期间',
  },
  showDialog: {
    type: Boolean,
  },
  width: {
    type: String,
    default: '640px',
  },
})
const defaultProps = {
  children: 'children',
  label: 'periodYear',
}
// 表格相关
const treeInfo = ref({
  data: [],
})// 表格相关
const tableInfo = ref({
  data: [],
  fieldList: [
    { label: '会计期间', value: 'periodYearAndMonth' },
    { label: '开始日期', value: 'beginDate', formatter: (row) => moment(row.beginDate).format('YYYY-MM-DD') },
    { label: '结束日期', value: 'endDate', formatter: (row) => moment(row.endDate).format('YYYY-MM-DD') },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '分类',
  width: '640px',
  btLoading: false,
  btList: [
    { label: '取消', event: handleClose, show: true },
    {
      label: '确定',
      type: 'primary',
      event: save,
      show: true,
    },
  ],
})

const treeRef = ref(null);
const selectRow = ref('')
const selecttableRow = ref('')
const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})


watch(
    () => shows.value,
    { immediate: true }
)

onMounted(() => {
  getList()
})

// 获取列表
function getList() {
  treeInfo.value.data = []
  periodyearList({}).then((res) => {
    if (res && res.success) {
      if (res.code === 200 && res.data) {
        treeInfo.value.data = res.data

        proxy.$nextTick(() => {
          // 设置默认选中第一个节点
          treeRef.value.setCurrentKey(res.data[0].id);
        });
        nodeClick(res.data[0])
      }
    }
  })
}

function save() {
  emits('callback', selecttableRow.value)
  handleClose()
}
function nodeClick(node) {
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

function handleEvent(event, data) {
  switch (event) {
    case 'tableClickRow':
      selecttableRow.value = data
      break
  }
}

// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emits('reset')
}
</script>
<style lang="scss" scoped>
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
