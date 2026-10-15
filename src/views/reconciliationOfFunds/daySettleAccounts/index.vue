<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import {useSelectData} from "@/hooks/useSelectData";
import moment from "moment";
import useMonthCheckout from "@/components/MonthCheckout/useMonthCheckout";
import {
  closeCheckDaySettleAccounts,
  closeDaySettleAccounts,
  listDaySettleAccounts, reCloseCheckDaySettleAccounts,
  reCloseDaySettleAccounts
} from "@/api/reconciliationOfFunds/daySettleAccounts";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'daySettleAccounts'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: listDaySettleAccounts,
  close: closeDaySettleAccounts,
  reClose: reCloseDaySettleAccounts
}

const { openCheckout, openReCheckout } = useMonthCheckout({
  isDay: true,
  PERMISSION_CODE: `${PERMISSION_CODE}:confirm`,
  api: {
    check: closeCheckDaySettleAccounts,
    reCheck: reCloseCheckDaySettleAccounts,
    closeCheck: API.close,
    cancelCloseCheck: API.reClose
  }
})

const filterInfo = reactive({
  query: {
  },
  copyQuery: {},
  list: [
    { label: '会计期间', value: 'accountingPeriodName', type: 'slot', showLabel: true, required: true },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '会计期间', value: 'periodmonth' },
    { label: '日期', value: 'closeDay' },
    { label: '结账状态', value: 'isCloseName' },
    { label: '结账人', value: 'closeUserName' },
    { label: '结账日期', value: 'closeTime', align: 'center', formatter: (val) => moment(val.closeTime).format('YYYY-MM-DD') },
    { label: '反结账人', value: 'recloseUserName' },
    { label: '反结账日期', value: 'recloseTime', align: 'center', formatter: (val) => moment(val.recloseTime).format('YYYY-MM-DD') },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '结账',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: closeData,
        ifRender: (row) => row.isClose == '0'
      },
      {
        label: '反结账',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: reCloseData,
        ifRender: (row) => row.isClose == '1'
      },
    ]
  },
  sectionRows: []
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()

// watch(() => tableInfo.currentRow, (row) => {
//   const btns = filterInfo.btnList
//   const closeBtn = btns.find(it => it.label === '结账'), reCloseBtn = btns.find(it => it.label === '反结账')
//   closeBtn.disabled = !row || row.isClose == 1
//   reCloseBtn.disabled = !row || row.isClose == 0
// }, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  if (!filterInfo.query.accountingPeriodId) {
    proxy.$message.warning('请先选择会计期间')
    return
  }
  filterInfo.copyQuery = {
    ...filterInfo.query,
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
  }
  getList()
}

function closeData(row) {
  openCheckout(row, getList)
  // if (!tableInfo.currentRow?.id) {
  //   proxy.$message.warning('请选择数据')
  //   return
  // }
  // API.close(tableInfo.currentRow.id).then(res => {
  //   if (res.success) {
  //     proxy.$message.success('操作成功')
  //     getList()
  //   }
  // })
}
function reCloseData(row) {
  openReCheckout(row, getList)
  // if (!tableInfo.currentRow?.id) {
  //   proxy.$message.warning('请选择数据')
  //   return
  // }
  // API.reClose(tableInfo.currentRow.id).then(res => {
  //   if (res.success) {
  //     proxy.$message.success('操作成功')
  //     getList()
  //   }
  // })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableClickRow') {
    tableInfo.currentRow = raw
  }
}
const periodInfo = ref({
  title: '会计期间',
  type: 'accountingPeriod',
  pager: true,
  checkBox: false,
  visible: false,
  filters: null,
  callBack: null,
  query: {}
})

function openAccountingPeriodSelector() {
  periodInfo.value.filters = null
  periodInfo.value.visible = true
}
function periodCallback(data) {
  filterInfo.query.accountingPeriodId = data.id
  filterInfo.query.accountingPeriodName = data.periodYearAndMonth
  periodInfo.value.visible = false
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
            ref="filterRef"
            v-model:query="filterInfo.query"
            :filter-list="filterInfo.list"
            :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-accountingPeriodName>
              <el-input
                v-model="filterInfo.query.accountingPeriodName"
                style="width: 100%"
                class="not-mongolia"
                type="input"
                :required="true"
                :disabled="true"
                placeholder="请选择会计期间"
              >
                <template #append>
                  <el-icon @click="openAccountingPeriodSelector"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="!!tableInfo.summaryFieldList?.length"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :check-box="false"
            highlightRow
            :pager="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <SelectTreeTableData
        v-if="periodInfo.visible"
        v-model:showDialog="periodInfo.visible"
        @callback="periodCallback"
    ></SelectTreeTableData>
    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
