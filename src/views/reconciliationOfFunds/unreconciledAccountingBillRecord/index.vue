<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  exportUnreconciledAccountingBillRecord,
  queryUnreconciledAccountingBillRecord
} from "@/api/reconciliationOfFunds/unreconciledAccountingBillRecord";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'unreconciledAccountingBillRecord'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: queryUnreconciledAccountingBillRecord,
  export: exportUnreconciledAccountingBillRecord,
}

const {
  exportData,
} = useUpload(API)

const defaultDate = moment().format('YYYY-MM-DD 23:59:59')

const filterInfo = reactive({
  query: {
    type: 1,
    unreconciledDays: 30,
    endTime: defaultDate,
  },
  listTypeInfo: {
    type: [{ key: '单位未达账', value: 1 }, { key: '银行未达账', value: 2 }]
  },
  copyQuery: {},
  list: [
    { label: '账户名称', value: 'fundsCompareAccountName', showLabel: true, required: true, type: 'slot' },
    { label: '未达账类型', value: 'type', type: 'select', list: 'type', clearable: false, required: true },
    { label: '未达天数', value: 'unreconciledDays', type: 'number', min: 0, required: true },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => {
        if (!validateFilter()) return
        exportData(filterInfo.copyQuery)
      }, },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '账户信息', value: 'fundsCompareAccountName' },
    { label: '未达账类型', value: 'typeName' },
    { label: '摘要', value: 'summary' },
    { label: '业务日期/凭证日期', value: 'dateTime', width: 180, formatter: (val) => moment(val.dateTime).format('YYYY-MM-DD') },
    { label: '凭证号', value: 'certificateNum' },
    { label: '往来单位', value: 'tradeObj' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', formatter: (val) => moment(val.billDate).format('YYYY-MM-DD') },
    { label: '借方收款金额', value: 'inMoney', align: 'right' },
    { label: '贷方付款金额', value: 'outMoney', align: 'right' },
  ],
  data: [],
  summaryFieldList: [
  ],
  sectionRows: []
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  if (!validateFilter()) return
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    fundsCompareAccountName: undefined
  })
  tableInfo.refresh = Math.random()
}

function validateFilter() {
  if (!filterInfo.query.unreconciledDays) {
    proxy.$message.warning('请先输入未达天数')
  } else if (!filterInfo.query.fundsCompareAccountId) {
    proxy.$message.warning('请先选择对账账户')
  } else {
    return true
  }
  return false
}

// 重置查询
function reset() {
  filterInfo.query = {
    type: 1,
    unreconciledDays: 30,
    endTime: defaultDate,
  }
  tableInfo.data = []
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectFundsCompareAccount() {
  selectorInfo.type = 'fundsCompareAccount'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.fundsCompareAccountId = data.id
    filterInfo.query.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
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
              :listTypeInfo="filterInfo.listTypeInfo"
          >
            <template #filter-fundsCompareAccountName>
              <el-input
                  v-model="filterInfo.query.fundsCompareAccountName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择对账账户"
              >
                <template #append>
                  <el-icon @click="selectFundsCompareAccount"
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
            :pager="false"
            :checkBox="false"
            :field-list="tableInfo.fieldList"
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
