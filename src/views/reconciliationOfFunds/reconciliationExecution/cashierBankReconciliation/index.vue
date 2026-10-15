<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  autoCompareCashierBankReconciliation, cancelCompareCashierBankReconciliation, checkCompareCashierBankReconciliation,
  queryCashierBankReconciliation, saveCompareCashierBankReconciliation
} from "@/api/reconciliationOfFunds/cashierBankReconciliation";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'cashierBankReconciliation'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: queryCashierBankReconciliation,
  autoCompare: autoCompareCashierBankReconciliation,
  cancelCompare: cancelCompareCashierBankReconciliation,
  save: saveCompareCashierBankReconciliation,
  check: checkCompareCashierBankReconciliation
}

const DICT = {
  method: {
    '0': '按对账日期',
    '1': '按批次号'
  }
}

const isVertical = ref(false)

const filterInfo = reactive({
  query: {
    compareStatus: '0'
  },
  copyQuery: {},
  options: {
    activateList: [{ key: '未对账', value: '0' }, { key: '已对账', value: '1' }]
  },
  list: [
    { label: '对账账户', value: 'fundsCompareAccountName', showLabel: true, required: true, type: 'slot' },
    { label: '对账状态', value: 'compareStatus', type: 'select', clearable: false, required: true, list: 'activateList' },
    { label: '银行账开始日期', value: 'bankBillRecordTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '银行账结束日期', value: 'bankBillRecordTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '资金账开始日期', value: 'cashBillRecordTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '资金账结束日期', value: 'cashBillRecordTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '批次码', value: 'batchCode', type: 'input' },
    { label: '摘要', value: 'summary', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '自动对账', show: proxy.$permission(`${PERMISSION_CODE}:update`), event: () => autoCompareData(), },
    { type: 'button', label: '取消对账', show: proxy.$permission(`${PERMISSION_CODE}:update`), event: () => cancelCompareData(), },
    { type: 'button', label: '保存', show: proxy.$permission(`${PERMISSION_CODE}:update`), event: () => saveData(), },
    { type: 'button', label: '检查', show: proxy.$permission(`${PERMISSION_CODE}:check`), event: () => checkData(), },
    { type: 'button', label: '切换模式', event: () => isVertical.value = !isVertical.value, },
  ]
})
const tableInfo = reactive({
  title: '资金日记账',
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '交易日期', value: 'businessTime', align: 'center', formatter: (val) => moment(val.businessTime).format('YYYY-MM-DD') },
    { label: '摘要', value: 'summary' },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', formatter: (val) => moment(val.billDate).format('YYYY-MM-DD') },
    { label: '往来单位', value: 'businessPartners' },
    { label: '是否两清', value: 'isCheckValue' },
    { label: '批次码', value: 'batchCode', width: 150 },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: null,
  sectionRows: [],
  checkedRowList: []
})
const formInfo = reactive({
  data: {},
  fieldList: [
    { label: '收款金额', value: 'inMoney', span: 8, type: 'input', disabled: true },
    { label: '付款金额', value: 'outMoney', span: 8, type: 'input', disabled: true },
    { label: '净额', value: 'money', span: 8, type: 'input', disabled: true },
  ]
})
const tableRightInfo = reactive({
  title: '银行对账单',
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '交易日期', value: 'businessTime', align: 'center', formatter: (val) => moment(val.businessTime).format('YYYY-MM-DD') },
    { label: '摘要', value: 'summary' },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', formatter: (val) => moment(val.billDate).format('YYYY-MM-DD') },
    { label: '往来单位', value: 'businessPartners' },
    { label: '是否两清', value: 'isCheckValue' },
    { label: '批次码', value: 'batchCode', width: 150 },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: null,
  sectionRows: [],
  checkedRowList: []
})
const formRightInfo = reactive({
  data: {},
  fieldList: [
    { label: '收款金额', value: 'inMoney', span: 8, type: 'input', disabled: true },
    { label: '付款金额', value: 'outMoney', span: 8, type: 'input', disabled: true },
    { label: '净额', value: 'money', span: 8, type: 'input', disabled: true },
  ]
})
const autoCompareInfo = reactive({
  refObj: null,
  row: {},
  width: '600px',
  title: '自动对账',
  visible: false,
  fieldList: [
    { label: '按日期范围', value: 'isDateScope', span: 12, type: 'checkbox' },
    { label: '日期相差天数', value: 'differenceDay', span: 12, disabled: true, type: 'number' },
    { label: '结算方式', value: 'isSettlementMethod', span: 24, type: 'checkbox' },
    { label: '票据号', value: 'isBillNum', span: 24, type: 'checkbox' },
    { label: '票据日期', value: 'isBillDate', span: 24, type: 'checkbox' },
    { label: '往来单位', value: 'isBusinessPartners', span: 24, type: 'checkbox' },
    { label: '摘要', value: 'isSummary', span: 24, type: 'input' },
  ],
  rules: {
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => autoCompareInfo.visible = false},
    { label: '确定', type: 'primary', event: autoCompareConfirm }
  ]
})

const cancelCompareInfo = reactive({
  refObj: null,
  row: {},
  title: '取消对账',
  visible: false,
  listTypeInfo: {
    method: Object.keys(DICT.method).map(key => ({ key: DICT.method[key], value: key }))
  },
  fieldList: [
    { label: '取消方式', value: 'method', type: 'select', list: 'method', event: () => {
      const group = ['compareTime', 'bathCode']
        group.forEach(it => cancelCompareInfo.row[it] = undefined)
        const key = group[cancelCompareInfo.row.method]
        cancelCompareInfo.fieldList.filter(it => group.indexOf(it.value) !== -1).forEach(it => {
          it.show = it.value === key
        })
      }
    },
    { label: '对账日期', value: 'compareTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00', show: false },
    { label: '批次号', value: 'bathCode', type: 'input', show: false },
  ],
  rules: {
    method: [{ required: true, message: '请选择取消方式', trigger: 'change' }],
    compareTime: [{ required: true, message: '请选择对账日期', trigger: 'change' }],
    bathCode: [{ required: true, message: '请输入批次码', trigger: 'blur' }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => cancelCompareInfo.visible = false},
    { label: '确定', type: 'primary', event: cancelCompareConfirm }
  ]
})

const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()

watch(() => filterInfo.copyQuery.fundsCompareAccountId, (val) => {
  const btns = filterInfo.btnList
  const autoCompareBtn = btns.find(it => it.label === '自动对账'),
      cancelCompareBtn = btns.find(it => it.label === '取消对账')
  autoCompareBtn.disabled = !val
  cancelCompareBtn.disabled = !val
}, { immediate: true })
watch(() => [tableInfo.sectionRows, tableRightInfo.sectionRows], () => {
  const btns = filterInfo.btnList
  const saveBtn = btns.find(it => it.label === '保存'),
        checkBtn = btns.find(it => it.label === '检查')
  saveBtn.disabled = !tableInfo.sectionRows.length || !tableRightInfo.sectionRows.length
  checkBtn.disabled = !tableInfo.sectionRows.length || !tableRightInfo.sectionRows.length
}, { immediate: true })

watch(() => tableInfo.sectionRows, (target) => {
  const inFun = (prev, cur) => prev + Number(cur['inMoney'] || 0)
  const outFun = (prev, cur) => prev + Number(cur['outMoney'] || 0)
  formInfo.data = {
    inMoney: target.reduce(inFun, 0),
    outMoney: target.reduce(outFun, 0),
  }
  formInfo.data.money = formInfo.data.inMoney - formInfo.data.outMoney
}, { immediate: true, deep: true })
watch(() => tableRightInfo.sectionRows, (target) => {
  const inFun = (prev, cur) => prev + Number(cur['inMoney'] || 0)
  const outFun = (prev, cur) => prev + Number(cur['outMoney'] || 0)
  formRightInfo.data = {
    inMoney: target.reduce(inFun, 0),
    outMoney: target.reduce(outFun, 0),
  }
  formRightInfo.data.money = formRightInfo.data.inMoney - formRightInfo.data.outMoney
}, { immediate: true, deep: true })

watch(() => autoCompareInfo.row.isDateScope, (val) => {
  if(!val) {
    autoCompareInfo.row.differenceDay = null
  }
  autoCompareInfo.fieldList[1].disabled = !val
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  if (!filterInfo.query.fundsCompareAccountId) {
    proxy.$message.warning('请先选择对账账户')
    return
  }
  const time1 = filterInfo.query.bankBillRecordTimeStart;
  const time2 = filterInfo.query.bankBillRecordTimeEnd;
  const time3 = filterInfo.query.cashBillRecordTimeStart;
  const time4 = filterInfo.query.cashBillRecordTimeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...Object.keys(filterInfo.query).reduce((prev, cur) => {
      if (filterInfo.query[cur] !== '') {
        prev[cur] = filterInfo.query[cur]
      }
      return prev
    }, {}),
    cashBillRecordTimeStart: time3 ? time3 + ' 00:00:00' : '',
    cashBillRecordTimeEnd: time4 ? time4 + ' 23:59:59' : '',
    bankBillRecordTimeStart: time1 ? time1 + ' 00:00:00' : '',
    bankBillRecordTimeEnd: time2 ? time2 + ' 23:59:59' : '',
  })
  API.query(filterInfo.copyQuery).then(res => {
    tableInfo.data = res.data.cash
    tableRightInfo.data = res.data.bank
  })
}

// 重置查询
function reset() {
  filterInfo.query = {
    compareStatus: '0'
  }
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

// 表格事件处理
const tableRightHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableRightInfo.sectionRows = raw
  }
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function autoCompareData() {
  if (!filterInfo.copyQuery.fundsCompareAccountId) {
    proxy.$message.warning('请先查询')
    return
  }
  autoCompareInfo.row = {
    isDirection: '1'
  }
  autoCompareInfo.visible = true
}
async function autoCompareConfirm() {
  let isValid = true
  await autoCompareInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const _row = {
    ...filterInfo.copyQuery,
    isDateScope: autoCompareInfo.row.isDateScope ? '1' : '0',
    isSettlementMethod: autoCompareInfo.row.isSettlementMethod ? '1' : '0',
    isBillNum: autoCompareInfo.row.isBillNum ? '1' : '0',
    isBillDate: autoCompareInfo.row.isBillDate ? '1' : '0',
    isSummary: autoCompareInfo.row.isSummary,
    differenceDay: autoCompareInfo.row.differenceDay,
  }
  API.autoCompare(_row).then(({ code, data }) => {
    if (code === 200) {
      autoCompareInfo.visible = false
      proxy.$message.success('对账成功')
      getList()
    }
  })
}

function cancelCompareData() {
  if (!filterInfo.copyQuery.fundsCompareAccountId) {
    proxy.$message.warning('请先查询')
    return
  }
  cancelCompareInfo.row = {
  }
  cancelCompareInfo.visible = true
}
async function cancelCompareConfirm() {
  let isValid = true
  await cancelCompareInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const _row = {
    ...filterInfo.copyQuery,
    ...cancelCompareInfo.row,
  }
  API.cancelCompare(_row).then(({ code, msg }) => {
    if (code === 200) {
      proxy.$message.success(msg || '保存成功')
      cancelCompareInfo.visible = false
      getList()
    }
  })
}

function checkData() {
  const _row = {
    cashBillRecordIdList: tableInfo.sectionRows.map(it => it.id),
    bankBillRecordIdList: tableRightInfo.sectionRows.map(it => it.id),
    ...filterInfo.copyQuery,
  }
  API.check(_row).then(({ code, msg }) => {
    if (code == 200) {
      proxy.$message.success(msg)
    }
  })
}

async function saveData() {
  const _row = {
    cashBillRecordIdList: tableInfo.sectionRows.map(it => it.id),
    bankBillRecordIdList: tableRightInfo.sectionRows.map(it => it.id),
    ...filterInfo.copyQuery,
  }
  API.save(_row).then(({ code }) => {
    if (code === 200) {
      autoCompareInfo.visible = false
      getList()
    }
  })
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
function selectSettlementMethod() {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.settlementMethodId = data.id
    filterInfo.query.settlementMethodName = data.name
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
              :listTypeInfo="filterInfo.options"
              :filter-btn="filterInfo.filterbtn"
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
        <div class="compare-flex-box" :class="{ vertical: isVertical }">
          <div class="compare-item">
            <div class="title">{{ tableInfo.title }}</div>
            <TableContainerVxe
                v-model:data="tableInfo.data"
                :summary="!!tableInfo.summaryFieldList?.length"
                :summaryFieldList="tableInfo.summaryFieldList"
                :tabIndex="true"
                :pager="false"
                :isDynamic="false"
                :addHeight="isVertical ? -20 : 20"
                :checkedRowList="tableInfo.checkedRowList"
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                @handleEvent="tableHandler"
            >
            </TableContainerVxe>
            <div style="margin-top: 6px">
              <ModifyForm no-title :form-info="formInfo" />
            </div>
          </div>
          <div class="compare-item">
            <div class="title">{{ tableRightInfo.title }}</div>
            <TableContainerVxe
                v-model:data="tableRightInfo.data"
                :summary="!!tableRightInfo.summaryFieldList?.length"
                :summaryFieldList="tableRightInfo.summaryFieldList"
                :tabIndex="true"
                :pager="false"
                :isDynamic="false"
                :addHeight="isVertical ? -20 : 20"
                :checkedRowList="tableRightInfo.checkedRowList"
                :field-list="tableRightInfo.fieldList"
                :handle="tableRightInfo.handle"
                @handleEvent="tableRightHandler"
            >
            </TableContainerVxe>
            <div style="margin-top: 6px">
              <ModifyForm no-title :form-info="formRightInfo" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <ModifyFormDialog :dialog-info="autoCompareInfo" />
    <ModifyFormDialog :dialog-info="cancelCompareInfo" />
    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
.layui-card, .layui-card-body {
  height: 100%;
}
.layui-card-body {
  display: flex;
  flex-direction: column;
}
.compare-flex-box {
  min-height: 0;
  flex: 1;
  display: flex;
  .compare-item {
    display: flex;
    flex-direction: column;
    width: 50%;
    min-height: 1px;
    flex: 1 1 50%;
    .title {
      background: #165DFF;
      color: #fff;
      text-align: center;
      line-height: 30px;
    }
    :deep(.order-model-formBox) {
      .flex_wrap_start_start {
        flex-wrap: nowrap;
        div.el-form-item {
          flex: 1;
          min-width: 1px;
        }
      }
    }
    :deep(.table-container) {
      flex: 1;
      min-height: 1px !important;
      height: unset !important;
      padding: 0 2px 8px !important;
    }
  }
}
.compare-flex-box.vertical {
  flex-direction: column;
  .compare-item {
    width: 100%;
    height: 50%;
  }
}
</style>
