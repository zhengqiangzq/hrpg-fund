<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectData} from "@/hooks/useSelectData";
import {
  AccountControlRuleQueryBalanceWarn,
  AccountControlRuleQueryBalanceWarnExcel
} from "@/api/fundWarning/accountMaxBalanceWarning";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'accountMinBalanceWarning'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: AccountControlRuleQueryBalanceWarn,
  export: AccountControlRuleQueryBalanceWarnExcel,
}

const {
  exportData,
} = useUpload(API)

const filterInfo = reactive({
  query: {
    interType: 1
  },
  copyQuery: {},
  list: [
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
    { label: '账户信息', value: 'accountName' },
    { label: '最低余额', value: 'miniAmount', align: 'right' },
    { label: '余额', value: 'balance', align: 'right' },
    { label: '差额', value: 'difference', align: 'right' },
  ],
  data: [],
  summaryFieldList: [
    // { value: 'balance', formatter: proxy.$fn.TripartiteMethod },
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
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    interType: 1
  }
  getList()
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.bankAccountId = data.bankAccountId
    filterInfo.query.bankAccountName = data.bankAccountName
  }
  selectorInfo.visible = true
}

function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.cashAccountId = data.cashAccountId
    filterInfo.query.cashAccountName = data.cashAccountName
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
