<script setup>
import PageFilter from "@/components/PageFilter/index.vue";
import DialogTable from "@/components/DialogTable/index.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {deepClone} from "../../utils";

const emits = defineEmits(['update:modelValue', 'handleEvent'])
const props = defineProps({
  modelValue: null,
  info: {},
  filterInfo: {},
  tableInfo: {},
  checkBox: false
})

const selectRow = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

const checkBox = ref(false)
// 默认选中值
const defaultSelected = ref(null)
const checkedList = ref([])
// 过滤相关配置
const filterInfo = reactive({
  query: {},
  list: [
    {
      type: 'input',
      label: '编码',
      clearable: true,
      value: 'code',
      event: search,
    },
    {
      type: 'input',
      label: '名称',
      clearable: true,
      value: 'name',
      event: search,
    },
    { type: 'button', label: '查询', event: search },
    // { type: 'button', label: '重置', event: reset },
  ],
})
// 表格相关
const tableInfo = reactive({
  refresh: 1,
  initCurpage: 1,
  className: '',
  data: [],
  fieldList: [],
})

onMounted(() => {
  const info = props.info || {}
  checkBox.value = info.checkBox ?? false
  filterInfo.query = Object.assign({
    status: 1,
    sort: 'create_time desc'
  }, info.query)
  console.log(info.query)
  filterInfo.initQuery = deepClone(filterInfo.query)
  if (!info.filters) {
    filterInfo.list = []
  } else {
    filterInfo.list = (info.filters.map(it => {
      !it.event && (it.event = search)
      return it
    }) || [
      { type: 'input', label: '编码', clearable: true, value: 'code', event: search, },
      { type: 'input', label: '名称', clearable: true, value: 'name', event: search, },
    ]).concat([{ type: 'button', show: true, label: '查询', event: search }])
  }
  tableInfo.api = info.api
  tableInfo.className = info.className
  tableInfo.pager = info.pager ?? true
  tableInfo.fieldList = info.fieldList || [
    { label: '编码', value: 'code' },
    { label: '名称', value: 'name' },
  ]
  // 默认选中
  if (info.defaultSelected !== undefined && info.defaultSelected !== null) {
    defaultSelected.value = info.defaultSelected
    if (checkBox.value) {
      const arr = Array.isArray(info.defaultSelected)
          ? info.defaultSelected
          : [info.defaultSelected]
      selectRow.value = arr
      checkedList.value = arr

    } else {
      selectRow.value = info.defaultSelected
    }
  }
  search()
})

function search() {
  tableInfo.initCurpage = Math.random()
  tableInfo.refresh = Math.random()
}
function reset() {
  filterInfo.query = deepClone(filterInfo.initQuery)
  search()
}

function handleEvent(event, data) {
  switch (event) {
    case 'tableClickRow':
      if (checkBox.value) return
      selectRow.value = data
      break
    case 'tableCheck':
      selectRow.value = data
      break
  }
}
</script>

<template>
  <!-- 条件栏 -->
  <page-filter
      v-model:query="filterInfo.query"
      :filter-list="filterInfo.list"
  />
  <DialogTable
      :refresh="tableInfo.refresh"
      :init-curpage="tableInfo.initCurpage"
      v-model:data="tableInfo.data"
      :api="tableInfo.api"
      :listen-height="false"
      :pager="tableInfo.pager"
      :checkedList="checkedList"
      :className="tableInfo.className"
      v-model:query="filterInfo.query"
      :field-list="tableInfo.fieldList"
      :handle="tableInfo.handle"
      :highlight-row="true"
      :check-box="checkBox"
      @handleEvent="handleEvent"
  />
</template>

<style scoped lang="scss">

</style>
