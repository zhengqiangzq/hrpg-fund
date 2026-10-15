<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectData} from "@/hooks/useSelectData";
import {exportCashAccountJournal, listCashAccountJournal} from "@/api/statisticalStatement/cashAccountJournal";
import moment from "moment";
import {getMonthFrist, getMonthLast} from "@/utils/slp";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'cashAccountJournal'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: listCashAccountJournal,
  export: exportCashAccountJournal,
}

const {
  exportData,
} = useUpload(API)

const filterInfo = reactive({
  query: {
    startTime: getMonthFrist(),
    endTime: getMonthLast(),
  },
  copyQuery: {},
  list: [
    { label: '交易开始日期', value: 'startTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '交易结束日期', value: 'endTime', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '现金账户', value: 'accountName', showLabel: true, type: 'slot', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '单位信息', value: 'orgName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '交易日期', value: 'tradeDate', align: 'center', formatter: (row) => moment(row.tradeDate).format('YYYY-MM-DD') },
    { label: '业务类型', value: 'businessTypeValue' },
    { label: '结算单据号', value: 'orderNo' },
    { label: '收入金额', value: 'income', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.income) },
    { label: '支出金额', value: 'payment', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.payment) },
  ],
  data: [],
  summaryFieldList: [
    { value: 'income', formatter: proxy.$fn.TripartiteMethod },
    { value: 'payment', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  const time1 = filterInfo.query.startTime;
  const time2 = filterInfo.query.endTime;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    startTime: time1 ? time1 + ' 00:00:00' : '',
    endTime: time2 ? time2 + ' 23:59:59' : '',
    tradeTime: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.accountId = data.cashAccountId
    filterInfo.query.accountName = data.cashAccountName
  }
  selectorInfo.visible = true
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
            <template #filter-accountName>
              <el-input
                  v-model="filterInfo.query.accountName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择现金账户"
              >
                <template #append>
                  <el-icon @click="selectCashAccount"
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
            :check-box="false"
            :tabIndex="true"
            :pager="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
