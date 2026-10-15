<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  exportDetailListRegistrationSocialSecurityFund,
  pageDetailListRegistrationSocialSecurityFund
} from "@/api/business/registrationSocialSecurityFund";
import {requiredPageFilter} from "@/utils";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'registrationSocialSecurityFund'
const API = {
  query: pageDetailListRegistrationSocialSecurityFund,
  export: exportDetailListRegistrationSocialSecurityFund
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const filterRef = ref()
const filterInfo = reactive({
  query: {
    tradeTimeStart: defaultDate1,
    tradeTimeEnd: defaultDate2,
  },
  copyQuery: {},
  list: [
    { label: '交易开始日期', value: 'tradeTimeStart', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '交易结束日期', value: 'tradeTimeEnd', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'orderNo', type: 'input' },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot' },
    { label: '现金账户', value: 'cashAccountName', showLabel: true, type: 'slot' },
    { label: '摘要', value: 'remark', type: 'input' },
    { label: '收支项目', value: 'itemName', showLabel: true, type: 'slot' },
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
    { label: '单位名称', value: 'orgName' },
    { label: '单据号', value: 'orderNo', width: 155 },
    { label: '业务日期', value: 'orderTime', align: 'center', formatter: (row) => moment(row.orderTime).format('YYYY-MM-DD') },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '收付款类型', value: 'typeValue' },
    { label: '单位银行账户', value: 'bankAccountName' },
    { label: '单位现金账户', value: 'cashAccountName' },
    { label: '收支项目', value: 'itemName' },
    { label: '摘要', value: 'remark' },
    { label: '交易日期', value: 'tradeTime', align: 'center', formatter: (row) => moment(row.tradeTime).format('YYYY-MM-DD') },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '身份证号码', value: 'idCard' },
    { label: '任职科室', value: 'deptName' },
    { label: '登记金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '备注', value: 'remark' },
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
  title: '社保公积金登记',
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
  const time1 = filterInfo.query.tradeTimeStart;
  const time2 = filterInfo.query.tradeTimeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    tradeTimeStart: time1 ? time1 + ' 00:00:00' : '',
    tradeTimeEnd: time2 ? time2 + ' 23:59:59' : '',
    tradeTime: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    tradeTimeStart: defaultDate1,
    tradeTimeEnd: defaultDate2,}
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
  selectorInfo.type = 'inOutItem'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.itemId = data.id
    filterInfo.query.itemName = data.name
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div className="view-fill">
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
            <template #filter-itemName>
              <el-input
                  v-model="filterInfo.query.itemName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择收支项目"
              >
                <template #append>
                  <el-icon @click="selectItem"
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
