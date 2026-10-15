<template>
  <div>
    <page-dialog
      :title="dialogInfo.title"
      v-model:visible="shows"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
    >
      <!-- 条件栏 -->
      <page-filter
        v-model:query="filterInfo.query"
        :filter-list="filterInfo.list"
      />
      <dialog-table
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        row-key="id"
        :query="filterInfo.query"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        :highlight-row="highlightRow"
        :check-box="checkBox"
        :pager="false"
        :reserve-selection="true"
        :checked-row-list="checkedRowList"
        :checkedList="checkBox ? checkedList : []"
        @handleEvent="handleEvent"
      />
    </page-dialog>
  </div>
</template>

<script setup name="selectDept">
import PageDialog from '../PageDialog/index'
import PageFilter from '../PageFilter/index'
import DialogTable from '../DialogTable/index'
import { getDeptPage } from '@/api/core.js'
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: Boolean,
    default: '选择部门',
  },
  highlightRow: {
    type: Boolean,
    default: false,
  },
  checkBox: {
    type: Boolean,
    default: true,
  },
  api: {
    type: Function,
    default: getDeptPage,
  },
  showDialog: {
    type: Boolean,
  },
  query: {
    type: Object,
    default: function () {
      return {}
    },
  },
  checkedRowList: {
    type: Array,
    default: function () {
      return []
    },
  },
  saveEmpty: {
    type: Boolean,
    default: false,
  },
  checkedList: {
    type: Array,
    default: function () {
      return []
    },
  },
  fieldList: {
    type: Array,
    default: function () {
      return [
        { label: '名称', value: 'name' },
        { label: '编码', value: 'code' },
      ]
    },
  },
  filterInfoList: {
    type: Array,
    default: function () {
      return []
    },
  },
})

// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: 'create_time desc',
    status: 1,
    ...props.query,
    pageNo: 1,
    pageSize: 99999,
  },
  list: [
    {
      type: 'input',
      label: '名称/编码',
      value: 'keyword',
      event: search,
    },
    { type: 'button', label: '查询', event: search },
  ],
})
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: undefined,
  data: [],
  fieldList: props.fieldList,
})
// 弹窗相关
const dialogInfo = ref({
  title: props.title || '选择部门',
  btLoading: false,
  btList: [
    { label: '关闭', event: handleClose, show: true },
    {
      label: '保存',
      type: 'primary',
      disabled: !props.saveEmpty,
      event: save,
      show: true,
    },
  ],
})
const selectRow = ref('')

const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})

onMounted(() => {
  // hack, 在table创建出来之后再去调用
  proxy.$nextTick(() => {
    getList()
    fullQuery()
  })
})
function fullQuery() {
  if (props.filterInfoList.length) {
    let arr = [{ type: 'button', label: '查询' }]
    filterInfo.value.list = props.filterInfoList.concat(arr)
    filterInfo.value.list.forEach((item) => {
      item.event = search
    })
  }
}

// 获取列表
function getList() {
  tableInfo.value.api = props.api
  tableInfo.value.refresh = Math.random()
}
function search() {
  tableInfo.value.api = props.api
  tableInfo.value.initCurpage = Math.random()
  tableInfo.value.refresh = Math.random()
}
function save() {
  // emits('input', data)
  if (selectRow.value) {
    handleClose()
    emits('callback', selectRow.value)
  } else {
    handleClose()
    emits('callback', selectRow.value)
    // proxy.$message({
    //   type: "warning",
    //   duration: 3500,
    //   showClose: true,
    //   message: "请选择部门"
    // });
  }
}
function handleEvent(event, data) {
  console.log(456)
  console.log(data)
  switch (event) {
    case 'tableClickRow':
      selectRow.value = data
      if (!props.saveEmpty) {
        dialogInfo.value.btList[1].disabled = !selectRow.value
      }
      break
    case 'tableCheck':
      selectRow.value = data
      if (!props.saveEmpty) {
        dialogInfo.value.btList[1].disabled = !selectRow.value
      }
      break
  }
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emits('reset')
}
</script>

<style scoped></style>
