<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectData} from "@/hooks/useSelectData";
import {allAccountDetail, exportAccountDetail} from "@/api/business/accountInquiry";
import moment from "moment";
import {requiredPageFilter} from "@/utils";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'accountDetailStatement'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: allAccountDetail,
  export: exportAccountDetail,
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
    type: 1
  },
  copyQuery: {},
  options: {
    type: [{ key: '现金账户', value: 1 }, { key: '银行账户', value: 2 }]
  },
  list: [
    { label: '业务开始日期', value: 'timeStart', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'timeEnd', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '账户类型', value: 'type', type: 'select', clearable: false, list: 'type', event: () => {
        filterInfo.query.bankAccountId = ''
        filterInfo.query.bankAccountName = ''
        filterInfo.query.cashAccountId = ''
        filterInfo.query.cashAccountName = ''
        const cashField = filterInfo.list.find(it => it.value === 'cashAccountName')
        const bankField = filterInfo.list.find(it => it.value === 'bankAccountName')
        cashField.show = filterInfo.query.type == 1
        bankField.show = filterInfo.query.type == 2
      }
    },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, required: true, type: 'slot', event: getList, show: false, },
    { label: '现金账户', value: 'cashAccountName', showLabel: true, required: true, type: 'slot', event: getList, show: true },
    { label: '交易对象户名', value: 'tradeObjectName', type: 'input' },
    { label: '摘要', value: 'remark', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => {
      if (!filterInfo.query.cashAccountId && !filterInfo.query.bankAccountId) {
        proxy.$message.warning('请先选择账户')
        return
      }
      exportData(filterInfo.copyQuery)
      },
    },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '账户信息', value: 'accountName' },
    { label: '交易日期', value: 'payTime' },
    { label: '摘要', value: 'remark' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'payBillNum' },
    { label: '收款', value: 'payoutMoney', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.payoutMoney) },
    { label: '付款', value: 'payMoney', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.payMoney) },
    { label: '余额', value: 'money', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.money) },
    { label: '业务单据号', value: 'orderNo' },
    { label: '交易对象户名', value: 'tradeObjectName' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime' },
    { label: '结算人', value: 'settlementUserName' },
  ],
  rowClassName: ({ row }) => {
    return row.classColor == '1' ? 'warning-style' : ''
  },
  data: [],
  summaryFieldList: [],
  handle: null,
  sectionRows: []
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  if (!filterInfo.query.cashAccountId && !filterInfo.query.bankAccountId) {
    proxy.$message.warning('请先选择账户')
    return
  }
  const time1 = filterInfo.query.timeStart;
  const time2 = filterInfo.query.timeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    timeStart: time1 ? time1 + ' 00:00:00' : '',
    timeEnd: time2 ? time2 + ' 23:59:59' : '',
    orderTime: undefined,
    type: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    timeStart: DEFAULT_TIME1,
    timeEnd: DEFAULT_TIME2,
    type: 1
  }
  tableInfo.data = []
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
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :listTypeInfo="filterInfo.options"
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
            :rowClassName="tableInfo.rowClassName"
            no-placeholder
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
:deep(.warning-style) {
  background: #F4D095 !important;
}
.error-style {
  color: #f56c6c;
}
</style>
