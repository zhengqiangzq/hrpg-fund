<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  exportDetailListBusinessPaymentStatement,
  pageDetailListBusinessPaymentStatement
} from "@/api/business/businessPaymentStatement";
import {requiredPageFilter} from "@/utils";
import {useWujieTurnPage} from "@/hooks/useWujieTurnPage";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'businessPaymentStatement'
const API = {
  query: pageDetailListBusinessPaymentStatement,
  export: exportDetailListBusinessPaymentStatement
}

const filterRef = ref()
const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '业务开始日期', value: 'orderTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'orderTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', width: 155, value: 'orderNo', type: 'input' },
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot' },
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
    { label: '是否网银', value: 'netPayName' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '合同编号', value: 'contractNos', type: 'slot' },
    { label: '合同名称', value: 'contractName' },
    { label: '附件张数', value: 'attachCount' },
    { label: '网银开通状态', value: 'netBankOpenStatusName' },
    { label: '收付类型', value: 'typeValue' },
    { label: '请款单', value: 'payOrderNo' },
    { label: '摘要', value: 'remark' },
    { label: '金额', value: 'money', align: 'right' },
    { label: '收支项目', value: 'itemName' },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '卡类型', value: 'staffCardTypeValue' },
    { label: '交易对象银行类别', value: 'bankDocTypeName', width: 170 },
    { label: '交易对象开户行', value: 'bankDocName', width: 160 },
    { label: '交易对象联行号', value: 'interBankNum', width: 160 },
    { label: '交易对象户名', value: 'tradeBankAccountName' },
    { label: '交易对象银行账号', value: 'accNum', width: 170 },
    { label: '票据号', value: 'payBillNum' },
    { label: '汇票类型', value: 'billTypeName' },
    { label: '支付状态', value: 'payStatusValue' },
    { label: '支付日期', value: 'payTimeStr', align: 'center' },
    { label: '业务来源', value: 'businessSourceValue' },
    { label: '业务类型', value: 'businessType' },
    { label: '是否归集', value: 'isCollectionValue' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})
const modifyInfo = reactive({
  id: null,
  title: '业务付款结算单',
  batch: false,
  visible: false
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
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  const time1 = filterInfo.query.orderTimeStart;
  const time2 = filterInfo.query.orderTimeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    orderTimeStart: time1 ? time1 + ' 00:00:00' : '',
    orderTimeEnd: time2 ? time2 + ' 23:59:59' : '',
    tradeTime: undefined,
    settlementMethodName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
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
function selectItem() {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.settlementMethodId = data.id
    filterInfo.query.settlementMethodName = data.name
  }
  selectorInfo.visible = true
}
const { turnMessagePage } = useWujieTurnPage()
function turnToContractDetail(contractInfo) {
  const typeUrl = {
    1: '/contract/contractEntry/paymentContract',
    2: '/contract/contractEntry/collectionContract',
    3: '/contract/contractEntry/nonEconomicContract'
  }
  if(!contractInfo.contractIds) return;
  turnMessagePage({
    urlType: 'detail',
    businessId: contractInfo.contractIds,
    detailUrl: typeUrl[contractInfo.contractType],
    doNotSwitch: true
  })
}
</script>

<template>
  <div class="view-fill">
    <div class="app-container-flex">
    <div class="layui-card layui-col-md12" v-if="!modifyInfo.visible">
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
          <template #col-contractNos="{ row }">
            <template v-for="(contract, index) in row.contractNos?.split(',')"
                      :key="index">
                  <span class="slip-edit"
                        @click="turnToContractDetail({
                          contractIds: row.contractIds.split(',')[index],
                          contractType: row.contractType
                        })">{{ contract }}</span>
              <span v-if="index < row.contractNos?.split(',').length - 1">,</span>
            </template>
          </template>
        </table-container>
      </div>
    </div>
    <select-data ref="selectorRef" />
    <Modify
        v-if="modifyInfo.visible"
        v-model:visible="modifyInfo.visible"
        :id="modifyInfo.id"
        :batch="modifyInfo.batch"
        :title="modifyInfo.title"
        @returnModify="getList"
    />
  </div>
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
