<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectData} from "@/hooks/useSelectData";
import {exportBalance, allBalance} from "@/api/business/accountInquiry";
import moment from "moment";
import {requiredPageFilter} from "@/utils";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'accountBalanceInquiry'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: allBalance,
  export: exportBalance,
}

const {
  exportData,
} = useUpload(API)

const DEFAULT_TIME1 = `${moment(new Date()).startOf('month').format('YYYY-MM-DD')}`
const DEFAULT_TIME2 = `${moment(new Date()).endOf('month').format('YYYY-MM-DD')}`

const filterInfo = reactive({
  query: {
    timeStart: DEFAULT_TIME1,
    timeEnd: DEFAULT_TIME2,
  },
  copyQuery: {},
  list: [
    { label: '业务开始日期', value: 'timeStart', clearable: false, type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'timeEnd', clearable: false, type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot', event: getList },
    { label: '现金账户', value: 'cashAccountName', showLabel: true, type: 'slot', event: getList },
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
    { label: '组织信息', value: 'orgName' },
    { label: '账户编码', value: 'accountCode' },
    { label: '账户名称', value: 'accountName' },
    { label: '期初金额', value: 'openingMoney', align: 'right' },
    { label: '本期收入', value: 'incomeMoney', align: 'right' },
    { label: '本期支出', value: 'payMoney', align: 'right' },
    { label: '期末金额', value: 'money', align: 'right' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'openingMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'incomeMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'payMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
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
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  const time1 = filterInfo.query.timeStart;
  const time2 = filterInfo.query.timeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    timeStart: time1 ? time1 + ' 00:00:00' : '',
    timeEnd: time2 ? time2 + ' 23:59:59' : '',
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    timeStart: DEFAULT_TIME1,
    timeEnd: DEFAULT_TIME2,
  }
  getList()
}

function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.cashAccountId = data.cashAccountId
    filterInfo.query.cashAccountName = data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.bankAccountId = data.bankAccountId
    filterInfo.query.bankAccountName = data.bankAccountName
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-cashAccountName>
              <el-input
                  v-model="filterInfo.query.cashAccountName"
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
            <template #filter-bankAccountName>
              <el-input
                  v-model="filterInfo.query.bankAccountName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择银行账户"
              >
                <template #append>
                  <el-icon @click="selectBankAccount"
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
            :pager="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
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
