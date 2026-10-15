<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  exportDetailPaymentAndSettlement,
  pageDetailPaymentAndSettlement
} from "@/api/directlyConnectBankAndHospital/paymentAndSettlement";
import {DetailPage, DetailPageName} from "@/views/detailPage";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'paymentAndSettlement'
const API = {
  query: pageDetailPaymentAndSettlement,
  export: exportDetailPaymentAndSettlement
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD 00:00:00')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD 23:59:59')}`

const filterRef = ref()
const filterInfo = reactive({
  query: {
    orderTimeStart: defaultDate1,
    orderTimeEnd: defaultDate2,
  },
  copyQuery: {},
  list: [
    { label: '业务开始日期', value: 'orderTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '业务结束日期', value: 'orderTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '单据号', value: 'orderNo', type: 'input' },
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot', event: getList },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot' },
    { label: '现金账户', value: 'cashAccountName', showLabel: true, type: 'slot' },
    { label: '支付状态', value: 'payStatus', type: 'select-model', code: 'funds_pay_status' },
    { label: '交易对象类型', value: 'tradeType', type: 'select-model', code: 'funds_trade_type', onlyShowOption: ['1', '2', '3', '4'], event: () => {
        filterInfo.query.tradeObjectId = ''
        filterInfo.query.tradeObjectName = ''
      }
    },
    { label: '交易对象', value: 'tradeObjectName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery) }
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '单据号', value: 'orderNo', width: 155 },
    { label: '业务日期', value: 'orderTime', align: 'center', formatter: (row) => moment(row.orderTime).format('YYYY-MM-DD') },
    { label: '经办人', value: 'createUserName' },
    { label: '职能部门', value: 'createUserDeptName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '是否网银', value: 'netPayName' },
    { label: '附件张数', value: 'attachCount' },
    { label: '网银开通状态', value: 'netBankOpenStatusName' },
    { label: '收付类型', value: 'typeValue' },
    { label: '请款单', value: 'payOutOrderNo' },
    { label: '摘要', value: 'remark' },
    { label: '支付日期', value: 'payTime', align: 'center', formatter: (row) => moment(row.payTime).format('YYYY-MM-DD') },
    { label: '金额', value: 'money', align: 'right' },
    { label: '收支项目', value: 'itemName' },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '卡类型', value: 'staffCardTypeValue' },
    { label: '交易对象银行类别', value: 'bankDocTypeName' },
    { label: '交易对象开户行', value: 'bankDocName' },
    { label: '交易对象联行号', value: 'interBankNum' },
    { label: '交易对象户名', value: 'tradeBankAccountName' },
    { label: '交易对象银行账号', value: 'accNum' },
    { label: '票据号', value: 'payBillNum' },
    { label: '汇票类型', value: 'billTypeName' },
    { label: '支付状态', value: 'payStatusValue' },
    { label: '业务类型', value: 'businessTypeValue' },
    { label: '业务来源', value: 'businessSource' },
    { label: '是否归集', value: 'isCollectionValue' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})

const detailsInfo = reactive({
  visible: false,
  title: '',
  id: null
})

const { selectorInfo, selectorRef } = useSelectData()

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    settlementMethodName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    orderTimeStart: defaultDate1,
    orderTimeEnd: defaultDate2,
  }
  getList()
}

function detail(row) {
  detailsInfo.id = row.id
  detailsInfo.component = DetailPage[row.orderType]
  detailsInfo.title = DetailPageName[row.orderType]
  detailsInfo.visible = true
}

function exportData() {
  API.export(filterInfo.query).then((resp) => {
    if (resp) {
      proxy.$fn.parseExcel(resp)
    }
  })
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
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.cashAccountId = data.cashAccountId
    filterInfo.query.cashAccountName = data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectSettlementMethod() {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.settlementMethod = data.id
    filterInfo.query.settlementMethodName = data.name
  }
  selectorInfo.visible = true
}
function selectTradeObject() {
  selectorInfo.type = ['', 'supplier', 'customer', 'staff', 'outsideStaff', ''][filterInfo.query.tradeType]
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.tradeObjectId = data.id
    filterInfo.query.tradeObjectName = data.name
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div class="view-fill">
    <div class="layui-card layui-col-md12" v-if="!detailsInfo.visible">
      <div class="layui-card-body">
        <div class="titleTab">
          <div class="tab otherTab" @click="showDialog = false">列表页</div>
          <div class="tab currentTab">明细页</div>
        </div>
        <div>
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
            <template #filter-tradeObjectName>
              <el-input
                  v-model="filterInfo.query.tradeObjectName"
                  style="width: 100%"
                  :class="{ 'not-mongolia': !!filterInfo.query.tradeType }"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择交易对象"
              >
                <template #append v-if="!!filterInfo.query.tradeType">
                  <el-icon @click="selectTradeObject"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-settlementMethodName>
              <el-input
                  v-model="filterInfo.query.settlementMethodName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择结算方式"
              >
                <template #append>
                  <el-icon @click="selectSettlementMethod"
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
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            :check-box="false"
            :summary="true"
            :summaryFieldList="tableInfo.summaryFieldList"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </table-container>
      </div>
    </div>
    <component
        :is="detailsInfo.component"
        v-if="detailsInfo.visible"
        :title="detailsInfo.title"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></component>
    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">

.layui-card {
  background-color: transparent;
  .layui-card-body {
    padding: 0;
  }
}
</style>
