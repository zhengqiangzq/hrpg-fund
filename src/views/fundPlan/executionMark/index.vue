<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ExecutionMarkDialog from './executionMarkDialog.vue'
import {useSelectData} from "@/hooks/useSelectData";
import {
  FundsPlanExecuteFlagpage,
  fundsPlanPrepareexportExecuteFlag
} from "@/api/fundPlan/executionMark";
import {requiredPageFilter} from "@/utils";
import {useUpload} from "@/hooks/useUpload";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'executionMark'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: FundsPlanExecuteFlagpage,
  export: fundsPlanPrepareexportExecuteFlag,
  executionMark: null,
}
const {
  exportData,
} = useUpload(API)

const { selectorInfo, selectorRef } = useSelectData()
const filterInfo = reactive({
  query: {
    type: '1'
  },
  copyQuery: {},
  options: {
    incomeType: [
      { key: '收款', value: '1' },
      { key: '付款', value: '2' },
    ],
    flagType: [
      { key: '未标记', value: '0' },
      { key: '已标记', value: '1' },
    ],
  },
  list: [
    { label: '计划期间', value: 'monthName', showLabel: true, type: 'slot', required: true },
    { label: '收支项目', value: 'itemName', showLabel: true, type: 'slot' },
    { label: '收付类型', value: 'type', type: 'select', list: 'incomeType', clearable: false, required: true },
    { label: '业务单号', value: 'businessNo', type: 'input' },
    { label: '交易对象', value: 'tradeObjName', type: 'input' },
    { label: '标记状态', value: 'flagStatus', type: 'select', list: 'flagType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList },
    { type: 'button', label: '重置', event: reset },
  ],
  btnList: [
    { type: 'button', label: '执行标记', show: proxy.$permission(`${PERMISSION_CODE}:mark`), event: () => openExecutionMark() },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => {
        const required = requiredPageFilter(filterInfo.list, filterInfo.query)
        if(!required) return
        exportData(filterInfo.copyQuery)
      } },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '业务单号', value: 'orderNo' },
    { label: '业务日期', value: 'businessDateName' },
    { label: '支付日期', value: 'payDateName' },
    { label: '业务来源', value: 'businessResource' },
    { label: '业务类型', value: 'businessType' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '收支项目', value: 'itemName' },
    { label: '收付类型', value: 'inPayTypeName' },
    { label: '金额', value: 'amount', align: 'right' },
    { label: '交易对象', value: 'tradeName' },
    { label: '交易对象户名', value: 'tradeAccountName' },
    { label: '交易对象账号', value: 'tradeAccountNum' },
    { label: '标记状态', value: 'flagStatus' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '120',
    btList: [
      {
        label: '执行标记',
        show: proxy.$permission(`${PERMISSION_CODE}:mark`),
        event: openExecutionMark,
        ifRender: (row) => row.flagStatus === '未标记'
      },
    ]
  },
  sectionRows: []
})

const dialogInfo = reactive({
  visible: false,
  title: '执行标记',
  rows: []
})

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const mark = btns.find(btn => btn.label === '执行标记')
  mark.disabled = !rows.length || !!rows.find(it => it.flagStatus !== '未标记')
}, { immediate: true })

function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return
  tableInfo.api = API.query
  filterInfo.copyQuery = { ...filterInfo.query }
  tableInfo.refresh = Math.random()
}

function reset() {
  filterInfo.query = {
    type: '1'
  }
  getList()
}

function openExecutionMark(row) {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return
  dialogInfo.rows = row ? [row] : tableInfo.sectionRows
  if (dialogInfo.rows.length === 0) {
    proxy.$message.warning('请选择要执行标记的数据')
    return
  }
  dialogInfo.visible = true
}


function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function dialogCallback(data) {
  dialogInfo.visible = false
  if(!data) return;
  getList()
}
function selectPlanPeriod() {
  selectorInfo.type = 'accountingPeriodMonth'
  selectorInfo.callback = (data) => {
    filterInfo.query.monthId = data.id
    filterInfo.query.monthName = data.periodYearAndMonth
  }
  selectorInfo.visible = true
}
function selectItem() {
  selectorInfo.type = 'inOutItem'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.itemId = data.id
    filterInfo.query.itemName = data.name;
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
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :listTypeInfo="filterInfo.options"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-monthName>
              <el-input
                  v-model="filterInfo.query.monthName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :disabled="true"
                  placeholder="请选择计划期间"
              >
                <template #append>
                  <el-icon @click="selectPlanPeriod"><Search /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-itemName>
              <el-input
                  v-model="filterInfo.query.itemName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :disabled="true"
                  placeholder="请选择收支项目"
              >
                <template #append>
                  <el-icon @click="selectItem"><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <TableContainer
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurPage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            rowKey="orderDetailId"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
        </TableContainer>
      </div>
    </div>
    <ExecutionMarkDialog
        v-if="dialogInfo.visible"
        v-model:visible="dialogInfo.visible"
        :title="dialogInfo.title"
        :rows="dialogInfo.rows"
        :params="filterInfo.copyQuery"
        @callback="dialogCallback"
    />
  <select-data ref="selectorRef" />
  </div>
</template>
