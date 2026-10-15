<script setup>
import {computed, getCurrentInstance, onMounted, reactive} from "vue";
import cloneDeep from "lodash/cloneDeep";
import Modify from './modify.vue';
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  exportDetailListCollectionBusiness,
  pageDetailListCollectionBusiness
} from "@/api/business/collectionBusiness";

const emits = defineEmits(['update:visible'])
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'collectionBusiness'
const API = {
  query: pageDetailListCollectionBusiness,
  export: exportDetailListCollectionBusiness
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const filterInfo = reactive({
  query: {
    orderTimeStart: defaultDate1,
    orderTimeEnd: defaultDate2,
  },
  copyQuery: {},
  list: [
    { label: '业务开始日期', value: 'orderTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'orderTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'orderNo', type: 'input' },
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot' },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot' },
    { label: '现金账户', value: 'cashAccountName', showLabel: true, type: 'slot' },
    { label: '交易对象户名', value: 'tradeObjectAccountName', type: 'input' },
    { label: '交易对象开户行', value: 'tradeObjectOpeningBank', type: 'input' },
    { label: '交易对象账号', value: 'tradeObjectNum', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', btType: 'primary', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: exportData }
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '单据号', value: 'orderNo', width: 155 },
    { label: '业务日期', value: 'orderTime', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '收付类型', value: 'remark' },
    { label: '摘要', value: 'remark' },
    { label: '收款日期', value: 'tradeTime', formatter: (val) => moment(val.tradeTime).format('YYYY-MM-DD') },
    { label: '金额', value: 'money', align: 'right' },
    { label: '收支项目', value: 'itemName' },
    { label: '交易对象户名', value: 'tradeObjectAccountName' },
    { label: '交易对象开户行', value: 'tradeObjectOpeningBank' },
    { label: '交易对象账号', value: 'tradeObjectNum' },
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
  title: '收款业务',
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
  const time1 = filterInfo.query.orderTimeStart;
  const time2 = filterInfo.query.orderTimeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    orderTimeStart: time1 ? time1 + ' 00:00:00' : '',
    orderTimeEnd: time2 ? time2 + ' 23:59:59' : '',
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
